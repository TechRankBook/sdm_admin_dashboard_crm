-- Fix the SQL error in the customer analytics function
CREATE OR REPLACE FUNCTION public.get_customer_analytics(start_date timestamp with time zone DEFAULT (CURRENT_DATE - '30 days'::interval), end_date timestamp with time zone DEFAULT CURRENT_DATE)
 RETURNS TABLE(total_customers bigint, new_customers bigint, repeat_customers bigint, customer_retention_rate numeric, top_customers jsonb, customer_acquisition_trend jsonb)
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$;

-- Also fix service performance analytics function
CREATE OR REPLACE FUNCTION public.get_service_performance_analytics(start_date timestamp with time zone DEFAULT (CURRENT_DATE - '30 days'::interval), end_date timestamp with time zone DEFAULT CURRENT_DATE)
 RETURNS TABLE(average_trip_duration numeric, average_distance numeric, service_efficiency_score numeric, popular_routes jsonb, vehicle_utilization jsonb, maintenance_insights jsonb)
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  avg_trip_duration numeric;
  avg_distance numeric;
  efficiency_score numeric;
BEGIN
  -- Calculate average trip duration
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (end_time - start_time))/60), 0)
  INTO avg_trip_duration
  FROM public.bookings 
  WHERE status = 'completed' 
    AND start_time IS NOT NULL 
    AND end_time IS NOT NULL
    AND created_at >= start_date 
    AND created_at <= end_date;

  -- Calculate average distance
  SELECT COALESCE(AVG(distance_km), 0)
  INTO avg_distance
  FROM public.bookings 
  WHERE status = 'completed' 
    AND distance_km IS NOT NULL
    AND created_at >= start_date 
    AND created_at <= end_date;

  -- Calculate service efficiency score
  SELECT CASE 
    WHEN COUNT(*) > 0 
    THEN (COUNT(*) FILTER (WHERE status = 'completed')::numeric / COUNT(*)::numeric) * 100
    ELSE 0 
  END
  INTO efficiency_score
  FROM public.bookings 
  WHERE created_at >= start_date AND created_at <= end_date;

  RETURN QUERY
  SELECT 
    avg_trip_duration as average_trip_duration,
    avg_distance as average_distance,
    efficiency_score as service_efficiency_score,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'route', route_data.route_name,
          'frequency', route_data.route_count,
          'avg_fare', route_data.avg_fare
        )
      )
      FROM (
        SELECT 
          (pickup_address || ' → ' || dropoff_address) as route_name,
          COUNT(*) as route_count,
          AVG(fare_amount) as avg_fare
        FROM public.bookings
        WHERE status = 'completed' 
          AND pickup_address IS NOT NULL 
          AND dropoff_address IS NOT NULL
          AND created_at >= start_date 
          AND created_at <= end_date
        GROUP BY pickup_address, dropoff_address
        HAVING COUNT(*) >= 2
        ORDER BY COUNT(*) DESC
        LIMIT 10
      ) route_data
    ) as popular_routes,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'vehicle_id', util_data.id,
          'vehicle_model', util_data.model,
          'total_trips', util_data.trip_count,
          'utilization_percentage', util_data.utilization_rate
        )
      )
      FROM (
        SELECT 
          v.id,
          v.model,
          COUNT(b.id) as trip_count,
          CASE 
            WHEN EXTRACT(DAY FROM (end_date - start_date)) > 0
            THEN (COUNT(b.id)::numeric / EXTRACT(DAY FROM (end_date - start_date))::numeric) * 10
            ELSE 0
          END as utilization_rate
        FROM public.vehicles v
        LEFT JOIN public.bookings b ON v.id = b.vehicle_id 
          AND b.status = 'completed'
          AND b.created_at >= start_date 
          AND b.created_at <= end_date
        GROUP BY v.id, v.model
        ORDER BY COUNT(b.id) DESC
        LIMIT 15
      ) util_data
    ) as vehicle_utilization,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'total_maintenance_cost', maint_data.total_cost,
          'maintenance_frequency', maint_data.maintenance_count,
          'avg_cost_per_service', maint_data.avg_cost
        )
      )
      FROM (
        SELECT 
          COALESCE(SUM(cost), 0) as total_cost,
          COUNT(*) as maintenance_count,
          COALESCE(AVG(cost), 0) as avg_cost
        FROM public.vehicle_maintenance_logs
        WHERE maintenance_date >= start_date::date 
          AND maintenance_date <= end_date::date
      ) maint_data
    ) as maintenance_insights;
END;
$function$;