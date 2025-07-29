-- Fix the analytics functions to work with the current database schema

-- 1. Fix get_driver_performance_analytics function
CREATE OR REPLACE FUNCTION public.get_driver_performance_analytics(start_date timestamp with time zone DEFAULT (CURRENT_DATE - '30 days'::interval), end_date timestamp with time zone DEFAULT CURRENT_DATE)
 RETURNS TABLE(total_active_drivers bigint, average_rating numeric, top_drivers jsonb, driver_status_distribution jsonb, driver_earnings jsonb)
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
          u.full_name,
          d.rating,
          COUNT(b.id) as ride_count,
          COALESCE(SUM(b.fare_amount), 0) as total_earnings
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
          u.full_name,
          COALESCE(SUM(b.fare_amount), 0) as total_earnings,
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
$function$;

-- 2. Fix get_customer_analytics function
CREATE OR REPLACE FUNCTION public.get_customer_analytics(start_date timestamp with time zone DEFAULT (CURRENT_DATE - '30 days'::interval), end_date timestamp with time zone DEFAULT CURRENT_DATE)
 RETURNS TABLE(total_customers bigint, new_customers bigint, repeat_customers bigint, customer_retention_rate numeric, top_customers jsonb, customer_acquisition_trend jsonb)
 LANGUAGE plpgsql
AS $function$
DECLARE
  total_customer_count bigint;
  new_customer_count bigint;
  repeat_customer_count bigint;
  previous_period_customers bigint;
BEGIN
  -- Get customer counts
  SELECT COUNT(*) INTO total_customer_count FROM customers;
  
  SELECT COUNT(*) INTO new_customer_count 
  FROM customers 
  WHERE created_at >= start_date AND created_at <= end_date;
  
  SELECT COUNT(DISTINCT user_id) INTO repeat_customer_count
  FROM bookings 
  WHERE created_at >= start_date 
    AND created_at <= end_date
    AND user_id IN (
      SELECT user_id 
      FROM bookings 
      WHERE created_at < start_date
    );
    
  SELECT COUNT(*) INTO previous_period_customers 
  FROM customers 
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
          'id', c.id,
          'name', u.full_name,
          'total_bookings', booking_count,
          'total_spent', total_spent,
          'loyalty_points', c.loyalty_points
        )
      )
      FROM (
        SELECT 
          c.id,
          c.loyalty_points,
          u.full_name,
          COUNT(b.id) as booking_count,
          COALESCE(SUM(b.fare_amount), 0) as total_spent
        FROM customers c
        LEFT JOIN public.users u ON c.id = u.id
        LEFT JOIN bookings b ON c.id = b.user_id 
          AND b.status = 'completed' 
          AND b.created_at >= start_date 
          AND b.created_at <= end_date
        GROUP BY c.id, u.full_name, c.loyalty_points
        ORDER BY booking_count DESC, total_spent DESC
        LIMIT 10
      ) c
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
        FROM customers
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      ) daily
    ) as customer_acquisition_trend;
END;
$function$;