-- Fix nested aggregate function issues in analytics functions

-- Drop and recreate get_revenue_analytics function with fixed nested aggregates
DROP FUNCTION IF EXISTS public.get_revenue_analytics(timestamp with time zone, timestamp with time zone);

CREATE OR REPLACE FUNCTION public.get_revenue_analytics(
  start_date timestamp with time zone DEFAULT (CURRENT_DATE - '30 days'::interval), 
  end_date timestamp with time zone DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  total_revenue numeric, 
  completed_bookings bigint, 
  average_fare numeric, 
  revenue_growth_percentage numeric, 
  daily_revenue jsonb
)
LANGUAGE plpgsql
AS $function$
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
  FROM bookings b
  WHERE b.status = 'completed' 
    AND b.created_at >= start_date 
    AND b.created_at <= end_date;

  -- Get previous period revenue for growth calculation
  SELECT COALESCE(SUM(b.fare_amount), 0) INTO prev_period_revenue
  FROM bookings b
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
        FROM bookings b
        WHERE b.status = 'completed' 
          AND b.created_at >= start_date 
          AND b.created_at <= end_date
        GROUP BY DATE(b.created_at)
        ORDER BY DATE(b.created_at)
      ) daily
    ) as daily_revenue;
END;
$function$;

-- Fix get_booking_analytics function with corrected nested aggregates
DROP FUNCTION IF EXISTS public.get_booking_analytics(timestamp with time zone, timestamp with time zone);

CREATE OR REPLACE FUNCTION public.get_booking_analytics(
  start_date timestamp with time zone DEFAULT (CURRENT_DATE - '30 days'::interval), 
  end_date timestamp with time zone DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  total_bookings bigint, 
  completed_bookings bigint, 
  cancelled_bookings bigint, 
  pending_bookings bigint, 
  completion_rate numeric, 
  booking_trends jsonb, 
  ride_type_distribution jsonb, 
  hourly_distribution jsonb
)
LANGUAGE plpgsql
AS $function$
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
  FROM bookings 
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
        FROM bookings
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      ) daily
    ) as booking_trends,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'ride_type', COALESCE(ride_type::text, 'unknown'),
          'count', type_count
        )
      )
      FROM (
        SELECT ride_type, COUNT(*) as type_count
        FROM bookings
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
        FROM bookings
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY EXTRACT(HOUR FROM created_at)
        ORDER BY EXTRACT(HOUR FROM created_at)
      ) hourly
    ) as hourly_distribution;
END;
$function$;

-- Fix get_customer_analytics function
DROP FUNCTION IF EXISTS public.get_customer_analytics(timestamp with time zone, timestamp with time zone);

CREATE OR REPLACE FUNCTION public.get_customer_analytics(
  start_date timestamp with time zone DEFAULT (CURRENT_DATE - '30 days'::interval), 
  end_date timestamp with time zone DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  total_customers bigint, 
  new_customers bigint, 
  repeat_customers bigint, 
  customer_retention_rate numeric, 
  top_customers jsonb, 
  customer_acquisition_trend jsonb
)
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
          'name', c.full_name,
          'total_bookings', booking_count,
          'total_spent', total_spent,
          'loyalty_points', c.loyalty_points
        )
      )
      FROM (
        SELECT 
          c.id,
          c.full_name,
          c.loyalty_points,
          COUNT(b.id) as booking_count,
          COALESCE(SUM(b.fare_amount), 0) as total_spent
        FROM customers c
        LEFT JOIN bookings b ON c.id = b.user_id 
          AND b.status = 'completed' 
          AND b.created_at >= start_date 
          AND b.created_at <= end_date
        GROUP BY c.id, c.full_name, c.loyalty_points
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