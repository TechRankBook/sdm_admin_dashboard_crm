-- Phase 1: Enable RLS on all vulnerable tables
ALTER TABLE public.booking_cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_session_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for booking_cancellations
CREATE POLICY "Users can view cancellations for their bookings" 
ON public.booking_cancellations 
FOR SELECT 
USING (
  booking_id IN (
    SELECT id FROM bookings 
    WHERE user_id = auth.uid() OR driver_id = auth.uid()
  ) OR get_user_role(auth.uid()) = 'admin'::user_role_enum
);

CREATE POLICY "Users can create cancellations for their bookings" 
ON public.booking_cancellations 
FOR INSERT 
WITH CHECK (
  booking_id IN (
    SELECT id FROM bookings 
    WHERE user_id = auth.uid() OR driver_id = auth.uid()
  ) AND user_id = auth.uid()
);

-- Create RLS policies for emergency_contacts
CREATE POLICY "Users can manage their own emergency contacts" 
ON public.emergency_contacts 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all emergency contacts" 
ON public.emergency_contacts 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role_enum);

-- Create RLS policies for faq_options (public read)
CREATE POLICY "Anyone can read FAQ options" 
ON public.faq_options 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage FAQ options" 
ON public.faq_options 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role_enum)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role_enum);

-- Create RLS policies for faq_views
CREATE POLICY "Users can create their own FAQ views" 
ON public.faq_views 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own FAQ views" 
ON public.faq_views 
FOR SELECT 
USING (user_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role_enum);

-- Create RLS policies for feedback_actions
CREATE POLICY "Users can create their own feedback actions" 
ON public.feedback_actions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own feedback actions" 
ON public.feedback_actions 
FOR SELECT 
USING (user_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role_enum);

-- Create RLS policies for promo_codes
CREATE POLICY "Anyone can read active promo codes" 
ON public.promo_codes 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage promo codes" 
ON public.promo_codes 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role_enum)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role_enum);

-- Create RLS policies for ride_passes
CREATE POLICY "Users can view their own ride passes" 
ON public.ride_passes 
FOR SELECT 
USING (user_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role_enum);

CREATE POLICY "Admins can manage ride passes" 
ON public.ride_passes 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role_enum)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role_enum);

-- Create RLS policies for chatbot_session_state
CREATE POLICY "Users can manage their own chatbot sessions" 
ON public.chatbot_session_state 
FOR ALL 
USING (user_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role_enum)
WITH CHECK (user_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role_enum);

-- Create RLS policy for table_name (seems like a test table, restrict access)
CREATE POLICY "Only admins can access table_name" 
ON public.table_name 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role_enum)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role_enum);

-- Phase 2: Fix database functions security by adding search_path protection
CREATE OR REPLACE FUNCTION public.get_driver_rides(driver_uuid uuid)
RETURNS TABLE(id uuid, pickup_address text, dropoff_address text, fare_amount numeric, status booking_status_enum, created_at timestamp with time zone, start_time timestamp with time zone, end_time timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.pickup_address,
    b.dropoff_address,
    b.fare_amount,
    b.status,
    b.created_at,
    b.start_time,
    b.end_time
  FROM public.bookings b
  WHERE b.driver_id = driver_uuid
  ORDER BY b.created_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
DECLARE
  ticket_num TEXT;
  counter INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO counter
  FROM public.support_tickets
  WHERE DATE(created_at) = CURRENT_DATE;
  
  ticket_num := TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') || '-' || LPAD(counter::TEXT, 3, '0');
  
  RETURN ticket_num;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := public.generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_thread_last_message()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
  UPDATE public.communication_threads 
  SET last_message_at = NEW.created_at
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.send_notification(p_user_id uuid, p_channel notification_channel_enum, p_title text, p_message text, p_template_id uuid DEFAULT NULL::uuid, p_campaign_id uuid DEFAULT NULL::uuid, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    channel,
    title,
    message,
    template_id,
    campaign_id,
    delivery_status,
    metadata
  ) VALUES (
    p_user_id,
    p_channel,
    p_title,
    p_message,
    p_template_id,
    p_campaign_id,
    'pending',
    p_metadata
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_notification_analytics(start_date timestamp with time zone DEFAULT (CURRENT_DATE - '30 days'::interval), end_date timestamp with time zone DEFAULT CURRENT_DATE)
RETURNS TABLE(total_sent bigint, total_delivered bigint, total_failed bigint, delivery_rate numeric, channel_breakdown jsonb, daily_stats jsonb)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.notifications WHERE created_at BETWEEN start_date AND end_date AND delivery_status != 'pending') as total_sent,
    (SELECT COUNT(*) FROM public.notifications WHERE created_at BETWEEN start_date AND end_date AND delivery_status = 'delivered') as total_delivered,
    (SELECT COUNT(*) FROM public.notifications WHERE created_at BETWEEN start_date AND end_date AND delivery_status = 'failed') as total_failed,
    (
      CASE 
        WHEN (SELECT COUNT(*) FROM public.notifications WHERE created_at BETWEEN start_date AND end_date AND delivery_status != 'pending') > 0
        THEN (SELECT COUNT(*)::numeric FROM public.notifications WHERE created_at BETWEEN start_date AND end_date AND delivery_status = 'delivered') * 100.0 / 
             (SELECT COUNT(*) FROM public.notifications WHERE created_at BETWEEN start_date AND end_date AND delivery_status != 'pending')
        ELSE 0
      END
    ) as delivery_rate,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'channel', channel,
          'count', count(*),
          'delivered', SUM(CASE WHEN delivery_status = 'delivered' THEN 1 ELSE 0 END),
          'failed', SUM(CASE WHEN delivery_status = 'failed' THEN 1 ELSE 0 END)
        )
      )
      FROM public.notifications 
      WHERE created_at BETWEEN start_date AND end_date 
      GROUP BY channel
    ) as channel_breakdown,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', date,
          'sent', sent_count,
          'delivered', delivered_count
        ) ORDER BY date
      )
      FROM (
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as sent_count,
          SUM(CASE WHEN delivery_status = 'delivered' THEN 1 ELSE 0 END) as delivered_count
        FROM public.notifications
        WHERE created_at BETWEEN start_date AND end_date
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      ) daily
    ) as daily_stats;
END;
$function$;