-- Phase 1: Critical Security & Database Fixes

-- Add missing RLS policies for tables that have RLS enabled but no policies
CREATE POLICY "phone_verifications_insert_authenticated" ON public.phone_verifications
FOR INSERT TO authenticated 
WITH CHECK (true);

CREATE POLICY "phone_verifications_select_own" ON public.phone_verifications
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "phone_otps_insert_authenticated" ON public.phone_otps
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "phone_otps_select_own" ON public.phone_otps
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "user_settings_manage_own" ON public.user_settings
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fix security definer functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_revenue_analytics(start_date timestamp with time zone DEFAULT (CURRENT_DATE - '30 days'::interval), end_date timestamp with time zone DEFAULT CURRENT_DATE)
RETURNS TABLE(total_revenue numeric, completed_bookings bigint, average_fare numeric, revenue_growth_percentage numeric, daily_revenue jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  prev_period_revenue numeric;
  current_period_revenue numeric;
  completed_booking_count bigint;
BEGIN
  -- Get current period revenue and completed bookings
  SELECT 
    COALESCE(SUM(b.fare_amount), 0),
    COUNT(*)
  INTO current_period_revenue, completed_booking_count
  FROM public.bookings b
  WHERE b.status = 'completed' 
    AND b.created_at >= start_date 
    AND b.created_at <= end_date;

  -- Get previous period revenue for growth calculation
  SELECT COALESCE(SUM(b.fare_amount), 0) INTO prev_period_revenue
  FROM public.bookings b
  WHERE b.status = 'completed' 
    AND b.created_at >= (start_date - (end_date - start_date))
    AND b.created_at < start_date;

  RETURN QUERY
  SELECT 
    current_period_revenue as total_revenue,
    completed_booking_count as completed_bookings,
    CASE 
      WHEN completed_booking_count > 0 
      THEN current_period_revenue / completed_booking_count
      ELSE 0 
    END as average_fare,
    CASE 
      WHEN prev_period_revenue > 0 
      THEN ((current_period_revenue - prev_period_revenue) / prev_period_revenue) * 100
      ELSE 0 
    END as revenue_growth_percentage,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', daily.date,
          'revenue', daily.revenue
        ) ORDER BY daily.date
      )
      FROM (
        SELECT 
          DATE(b.created_at) as date,
          COALESCE(SUM(b.fare_amount), 0) as revenue
        FROM public.bookings b
        WHERE b.status = 'completed' 
          AND b.created_at >= start_date 
          AND b.created_at <= end_date
        GROUP BY DATE(b.created_at)
        ORDER BY DATE(b.created_at)
      ) daily
    ) as daily_revenue;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_booking_analytics(start_date timestamp with time zone DEFAULT (CURRENT_DATE - '30 days'::interval), end_date timestamp with time zone DEFAULT CURRENT_DATE)
RETURNS TABLE(total_bookings bigint, completed_bookings bigint, cancelled_bookings bigint, pending_bookings bigint, completion_rate numeric, booking_trends jsonb, ride_type_distribution jsonb, hourly_distribution jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  total_count bigint;
  completed_count bigint;
  cancelled_count bigint;
  pending_count bigint;
BEGIN
  -- Get booking counts
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'cancelled'),
    COUNT(*) FILTER (WHERE status = 'pending')
  INTO total_count, completed_count, cancelled_count, pending_count
  FROM public.bookings 
  WHERE created_at >= start_date AND created_at <= end_date;

  RETURN QUERY
  SELECT 
    total_count as total_bookings,
    completed_count as completed_bookings,
    cancelled_count as cancelled_bookings,
    pending_count as pending_bookings,
    CASE 
      WHEN total_count > 0
      THEN (completed_count::numeric / total_count::numeric) * 100
      ELSE 0
    END as completion_rate,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', daily.date,
          'bookings', daily.bookings
        ) ORDER BY daily.date
      )
      FROM (
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as bookings
        FROM public.bookings
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      ) daily
    ) as booking_trends,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'ride_type', COALESCE(ride_type::text, 'standard'),
          'count', type_count
        )
      )
      FROM (
        SELECT COALESCE(ride_type::text, 'standard') as ride_type, COUNT(*) as type_count
        FROM public.bookings
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY ride_type
      ) types
    ) as ride_type_distribution,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'hour', hourly.hour,
          'bookings', hourly.bookings
        ) ORDER BY hourly.hour
      )
      FROM (
        SELECT 
          EXTRACT(HOUR FROM created_at) as hour,
          COUNT(*) as bookings
        FROM public.bookings
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY EXTRACT(HOUR FROM created_at)
        ORDER BY EXTRACT(HOUR FROM created_at)
      ) hourly
    ) as hourly_distribution;
END;
$$;

-- Fix driver performance analytics function
CREATE OR REPLACE FUNCTION public.get_driver_performance_analytics(start_date timestamp with time zone DEFAULT (CURRENT_DATE - '30 days'::interval), end_date timestamp with time zone DEFAULT CURRENT_DATE)
RETURNS TABLE(total_active_drivers bigint, average_rating numeric, top_drivers jsonb, driver_status_distribution jsonb, driver_earnings jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  active_drivers_count bigint;
  avg_driver_rating numeric;
BEGIN
  -- Get active drivers count
  SELECT COUNT(*) INTO active_drivers_count 
  FROM public.drivers WHERE status = 'active';
  
  -- Get average rating
  SELECT COALESCE(AVG(rating), 0) INTO avg_driver_rating 
  FROM public.drivers WHERE rating IS NOT NULL;

  RETURN QUERY
  SELECT 
    active_drivers_count as total_active_drivers,
    avg_driver_rating as average_rating,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', driver_data.id,
          'name', driver_data.full_name,
          'rides', driver_data.ride_count,
          'earnings', driver_data.total_earnings,
          'rating', driver_data.rating
        )
      )
      FROM (
        SELECT 
          d.id,
          COALESCE(u.full_name, 'Unknown Driver') as full_name,
          d.rating,
          COUNT(b.id) as ride_count,
          COALESCE(SUM(b.fare_amount * 0.8), 0) as total_earnings
        FROM public.drivers d
        LEFT JOIN public.users u ON d.id = u.id
        LEFT JOIN public.bookings b ON d.id = b.driver_id 
          AND b.status = 'completed' 
          AND b.created_at >= start_date 
          AND b.created_at <= end_date
        GROUP BY d.id, u.full_name, d.rating
        ORDER BY COUNT(b.id) DESC, SUM(b.fare_amount) DESC
        LIMIT 10
      ) driver_data
    ) as top_drivers,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'status', status_data.status,
          'count', status_data.status_count
        )
      )
      FROM (
        SELECT status, COUNT(*) as status_count
        FROM public.drivers
        GROUP BY status
      ) status_data
    ) as driver_status_distribution,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'driver_name', earnings_data.full_name,
          'total_earnings', earnings_data.total_earnings,
          'rides_completed', earnings_data.rides_count
        )
      )
      FROM (
        SELECT 
          COALESCE(u.full_name, 'Unknown Driver') as full_name,
          COALESCE(SUM(b.fare_amount * 0.8), 0) as total_earnings,
          COUNT(b.id) as rides_count
        FROM public.drivers d
        LEFT JOIN public.users u ON d.id = u.id
        LEFT JOIN public.bookings b ON d.id = b.driver_id 
          AND b.status = 'completed' 
          AND b.created_at >= start_date 
          AND b.created_at <= end_date
        GROUP BY d.id, u.full_name
        HAVING COUNT(b.id) > 0
        ORDER BY SUM(b.fare_amount) DESC
        LIMIT 20
      ) earnings_data
    ) as driver_earnings;
END;
$$;

-- Fix customer analytics function
CREATE OR REPLACE FUNCTION public.get_customer_analytics(start_date timestamp with time zone DEFAULT (CURRENT_DATE - '30 days'::interval), end_date timestamp with time zone DEFAULT CURRENT_DATE)
RETURNS TABLE(total_customers bigint, new_customers bigint, repeat_customers bigint, customer_retention_rate numeric, top_customers jsonb, customer_acquisition_trend jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  total_customer_count bigint;
  new_customer_count bigint;
  repeat_customer_count bigint;
  previous_period_customers bigint;
BEGIN
  -- Get customer counts
  SELECT COUNT(*) INTO total_customer_count FROM public.customers;
  
  SELECT COUNT(*) INTO new_customer_count 
  FROM public.customers 
  WHERE created_at >= start_date AND created_at <= end_date;
  
  SELECT COUNT(DISTINCT user_id) INTO repeat_customer_count
  FROM public.bookings 
  WHERE created_at >= start_date 
    AND created_at <= end_date
    AND user_id IN (
      SELECT user_id 
      FROM public.bookings 
      WHERE created_at < start_date
    );
    
  SELECT COUNT(*) INTO previous_period_customers 
  FROM public.customers 
  WHERE created_at < start_date;

  RETURN QUERY
  SELECT 
    total_customer_count as total_customers,
    new_customer_count as new_customers,
    repeat_customer_count as repeat_customers,
    CASE 
      WHEN previous_period_customers > 0
      THEN (repeat_customer_count::numeric / previous_period_customers::numeric) * 100
      ELSE 0
    END as customer_retention_rate,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', customer_data.id,
          'name', customer_data.full_name,
          'total_bookings', customer_data.booking_count,
          'total_spent', customer_data.total_spent,
          'loyalty_points', customer_data.loyalty_points
        )
      )
      FROM (
        SELECT 
          c.id,
          c.loyalty_points,
          COALESCE(u.full_name, 'Unknown Customer') as full_name,
          COUNT(b.id) as booking_count,
          COALESCE(SUM(b.fare_amount), 0) as total_spent
        FROM public.customers c
        LEFT JOIN public.users u ON c.id = u.id
        LEFT JOIN public.bookings b ON c.id = b.user_id 
          AND b.status = 'completed' 
          AND b.created_at >= start_date 
          AND b.created_at <= end_date
        GROUP BY c.id, u.full_name, c.loyalty_points
        ORDER BY COUNT(b.id) DESC, SUM(b.fare_amount) DESC
        LIMIT 10
      ) customer_data
    ) as top_customers,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', daily.date,
          'new_customers', daily.new_customers
        ) ORDER BY daily.date
      )
      FROM (
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as new_customers
        FROM public.customers
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      ) daily
    ) as customer_acquisition_trend;
END;
$$;