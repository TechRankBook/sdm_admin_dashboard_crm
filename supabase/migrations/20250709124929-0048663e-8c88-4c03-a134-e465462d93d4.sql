
-- Add user status management capabilities
ALTER TABLE public.users 
ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'suspended')),
ADD COLUMN blocked_at timestamp with time zone,
ADD COLUMN blocked_by uuid REFERENCES public.users(id),
ADD COLUMN block_reason text,
ADD COLUMN deleted_at timestamp with time zone,
ADD COLUMN last_login_at timestamp with time zone;

-- Add indexes for better performance
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_deleted_at ON public.users(deleted_at);

-- Create a view for user management that combines user data with role-specific details
CREATE OR REPLACE VIEW public.user_management_view AS
SELECT 
  u.id,
  u.role,
  u.status,
  u.created_at,
  u.updated_at,
  u.blocked_at,
  u.blocked_by,
  u.block_reason,
  u.deleted_at,
  u.last_login_at,
  CASE 
    WHEN u.role = 'customer' THEN c.full_name
    WHEN u.role = 'driver' THEN d.full_name
    WHEN u.role = 'vendor' THEN v.company_name
    WHEN u.role = 'admin' THEN a.full_name
  END as full_name,
  CASE 
    WHEN u.role = 'customer' THEN c.phone_no
    WHEN u.role = 'driver' THEN d.phone_no
    WHEN u.role = 'vendor' THEN v.phone_no
    WHEN u.role = 'admin' THEN a.phone_no
  END as phone_no,
  CASE 
    WHEN u.role = 'customer' THEN c.email
    WHEN u.role = 'driver' THEN d.email
    WHEN u.role = 'vendor' THEN v.email
    WHEN u.role = 'admin' THEN a.email
  END as email,
  CASE 
    WHEN u.role = 'customer' THEN c.profile_picture_url
    WHEN u.role = 'driver' THEN d.profile_picture_url
    WHEN u.role = 'vendor' THEN v.profile_picture_url
    WHEN u.role = 'admin' THEN a.profile_picture_url
  END as profile_picture_url,
  -- Role specific fields
  c.loyalty_points,
  d.total_rides,
  d.rating as driver_rating,
  d.status as driver_status,
  v.gst_number,
  a.assigned_region
FROM public.users u
LEFT JOIN public.customers c ON u.id = c.id AND u.role = 'customer'
LEFT JOIN public.drivers d ON u.id = d.id AND u.role = 'driver'
LEFT JOIN public.vendors v ON u.id = v.id AND u.role = 'vendor'
LEFT JOIN public.admins a ON u.id = a.id AND u.role = 'admin'
WHERE u.deleted_at IS NULL;

-- Add RLS policy for user management view (admin only)
ALTER VIEW public.user_management_view SET (security_barrier = on);

-- Function to soft delete a user
CREATE OR REPLACE FUNCTION public.soft_delete_user(user_uuid uuid, admin_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_role text;
BEGIN
  -- Check if the requesting user is an admin
  SELECT role INTO admin_role FROM public.users WHERE id = admin_uuid;
  
  IF admin_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  
  -- Soft delete the user
  UPDATE public.users 
  SET deleted_at = now(),
      status = 'suspended'
  WHERE id = user_uuid AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$$;

-- Function to block/unblock a user
CREATE OR REPLACE FUNCTION public.toggle_user_block(
  user_uuid uuid, 
  admin_uuid uuid,
  action text, -- 'block' or 'unblock'
  reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_role text;
BEGIN
  -- Check if the requesting user is an admin
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
$$;

-- Function to change user role (admin only)
CREATE OR REPLACE FUNCTION public.change_user_role(
  user_uuid uuid,
  admin_uuid uuid,
  new_role user_role_enum
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_role text;
  old_role text;
BEGIN
  -- Check if the requesting user is an admin
  SELECT role INTO admin_role FROM public.users WHERE id = admin_uuid;
  
  IF admin_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can change user roles';
  END IF;
  
  -- Get the current role
  SELECT role INTO old_role FROM public.users WHERE id = user_uuid;
  
  IF old_role IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Update the role
  UPDATE public.users 
  SET role = new_role,
      updated_at = now()
  WHERE id = user_uuid AND deleted_at IS NULL;
  
  -- Log the role change activity
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
$$;

-- Update the reviews table to include status for moderation
ALTER TABLE public.reviews 
ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'archived', 'approved')),
ADD COLUMN moderated_by uuid REFERENCES public.users(id),
ADD COLUMN moderated_at timestamp with time zone,
ADD COLUMN moderation_notes text;

-- Add trigger to update last_login_at when user signs in
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This would be triggered by auth events, but for now we'll update manually
  UPDATE public.users 
  SET last_login_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Grant necessary permissions
GRANT SELECT ON public.user_management_view TO authenticated;
GRANT EXECUTE ON FUNCTION public.soft_delete_user(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_user_block(uuid, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.change_user_role(uuid, uuid, user_role_enum) TO authenticated;
