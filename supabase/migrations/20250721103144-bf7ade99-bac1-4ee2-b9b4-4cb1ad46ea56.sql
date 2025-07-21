-- Continue fixing remaining database functions with search_path protection
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  UPDATE public.users 
  SET last_login_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.soft_delete_user(user_uuid uuid, admin_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  admin_role text;
BEGIN
  SELECT role INTO admin_role FROM public.users WHERE id = admin_uuid;
  
  IF admin_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  
  UPDATE public.users 
  SET deleted_at = now(),
      status = 'suspended'
  WHERE id = user_uuid AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_document_expiry_alerts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
  DELETE FROM public.vehicle_alerts 
  WHERE vehicle_id = NEW.vehicle_id 
  AND alert_type = (NEW.document_type || '_expiry')::text;
  
  IF NEW.expiry_date IS NOT NULL AND NEW.expiry_date > CURRENT_DATE THEN
    INSERT INTO public.vehicle_alerts (
      vehicle_id,
      alert_type,
      title,
      description,
      due_date,
      priority
    ) VALUES (
      NEW.vehicle_id,
      (NEW.document_type || '_expiry')::text,
      INITCAP(REPLACE(NEW.document_type, '_', ' ')) || ' Expiry',
      INITCAP(REPLACE(NEW.document_type, '_', ' ')) || ' expires on ' || NEW.expiry_date::text,
      NEW.expiry_date,
      CASE 
        WHEN NEW.expiry_date - CURRENT_DATE <= 30 THEN 'critical'
        WHEN NEW.expiry_date - CURRENT_DATE <= 90 THEN 'high'
        ELSE 'medium'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.toggle_user_block(user_uuid uuid, admin_uuid uuid, action text, reason text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  admin_role text;
BEGIN
  SELECT role INTO admin_role FROM public.users WHERE id = admin_uuid;
  
  IF admin_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can block/unblock users';
  END IF;
  
  IF action = 'block' THEN
    UPDATE public.users 
    SET status = 'blocked',
        blocked_at = now(),
        blocked_by = admin_uuid,
        block_reason = reason
    WHERE id = user_uuid AND deleted_at IS NULL;
  ELSIF action = 'unblock' THEN
    UPDATE public.users 
    SET status = 'active',
        blocked_at = NULL,
        blocked_by = NULL,
        block_reason = NULL
    WHERE id = user_uuid AND deleted_at IS NULL;
  ELSE
    RAISE EXCEPTION 'Invalid action. Use "block" or "unblock"';
  END IF;
  
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.change_user_role(user_uuid uuid, admin_uuid uuid, new_role user_role_enum)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  admin_role text;
  old_role text;
BEGIN
  SELECT role INTO admin_role FROM public.users WHERE id = admin_uuid;
  
  IF admin_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can change user roles';
  END IF;
  
  SELECT role INTO old_role FROM public.users WHERE id = user_uuid;
  
  IF old_role IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  UPDATE public.users 
  SET role = new_role,
      updated_at = now()
  WHERE id = user_uuid AND deleted_at IS NULL;
  
  INSERT INTO public.user_activities (
    user_id,
    activity_type,
    description,
    created_by,
    metadata
  ) VALUES (
    user_uuid,
    'role_change',
    'User role changed from ' || old_role || ' to ' || new_role,
    admin_uuid,
    jsonb_build_object('old_role', old_role, 'new_role', new_role)
  );
  
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Continue with analytics functions
CREATE OR REPLACE FUNCTION public.get_driver_performance_analytics(start_date timestamp with time zone DEFAULT (CURRENT_DATE - '30 days'::interval), end_date timestamp with time zone DEFAULT CURRENT_DATE)
RETURNS TABLE(total_active_drivers bigint, average_rating numeric, top_drivers jsonb, driver_status_distribution jsonb, driver_earnings jsonb)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM drivers WHERE status = 'active') as total_active_drivers,
    (SELECT COALESCE(AVG(rating), 0) FROM drivers WHERE rating IS NOT NULL) as average_rating,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', d.id,
          'name', d.full_name,
          'rides', ride_count,
          'earnings', total_earnings,
          'rating', d.rating
        )
      )
      FROM (
        SELECT 
          d.id,
          d.full_name,
          d.rating,
          COUNT(b.id) as ride_count,
          COALESCE(SUM(b.fare_amount), 0) as total_earnings
        FROM drivers d
        LEFT JOIN bookings b ON d.id = b.driver_id 
          AND b.status = 'completed' 
          AND b.created_at >= start_date 
          AND b.created_at <= end_date
        GROUP BY d.id, d.full_name, d.rating
        ORDER BY ride_count DESC, total_earnings DESC
        LIMIT 10
      ) d
    ) as top_drivers,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'status', status,
          'count', status_count
        )
      )
      FROM (
        SELECT status, COUNT(*) as status_count
        FROM drivers
        GROUP BY status
      ) statuses
    ) as driver_status_distribution,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'driver_name', d.full_name,
          'total_earnings', COALESCE(SUM(b.fare_amount), 0),
          'rides_completed', COUNT(b.id)
        )
      )
      FROM drivers d
      LEFT JOIN bookings b ON d.id = b.driver_id 
        AND b.status = 'completed' 
        AND b.created_at >= start_date 
        AND b.created_at <= end_date
      GROUP BY d.id, d.full_name
      HAVING COUNT(b.id) > 0
      ORDER BY SUM(b.fare_amount) DESC
      LIMIT 20
    ) as driver_earnings;
END;
$function$;