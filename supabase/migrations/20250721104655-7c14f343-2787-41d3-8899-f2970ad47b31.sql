-- Fix remaining analytics functions with nested aggregate issues

-- Fix get_driver_performance_analytics function
DROP FUNCTION IF EXISTS public.get_driver_performance_analytics(timestamp with time zone, timestamp with time zone);

CREATE OR REPLACE FUNCTION public.get_driver_performance_analytics(
  start_date timestamp with time zone DEFAULT (CURRENT_DATE - '30 days'::interval), 
  end_date timestamp with time zone DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  total_active_drivers bigint, 
  average_rating numeric, 
  top_drivers jsonb, 
  driver_status_distribution jsonb, 
  driver_earnings jsonb
)
LANGUAGE plpgsql
SET search_path = ''
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
          d.full_name,
          d.rating,
          COUNT(b.id) as ride_count,
          COALESCE(SUM(b.fare_amount), 0) as total_earnings
        FROM public.drivers d
        LEFT JOIN public.bookings b ON d.id = b.driver_id 
          AND b.status = 'completed' 
          AND b.created_at >= start_date 
          AND b.created_at <= end_date
        GROUP BY d.id, d.full_name, d.rating
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
          d.full_name,
          COALESCE(SUM(b.fare_amount), 0) as total_earnings,
          COUNT(b.id) as rides_count
        FROM public.drivers d
        LEFT JOIN public.bookings b ON d.id = b.driver_id 
          AND b.status = 'completed' 
          AND b.created_at >= start_date 
          AND b.created_at <= end_date
        GROUP BY d.id, d.full_name
        HAVING COUNT(b.id) > 0
        ORDER BY SUM(b.fare_amount) DESC
        LIMIT 20
      ) earnings_data
    ) as driver_earnings;
END;
$function$;

-- Fix get_service_performance_analytics function
DROP FUNCTION IF EXISTS public.get_service_performance_analytics(timestamp with time zone, timestamp with time zone);

CREATE OR REPLACE FUNCTION public.get_service_performance_analytics(
  start_date timestamp with time zone DEFAULT (CURRENT_DATE - '30 days'::interval), 
  end_date timestamp with time zone DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  average_trip_duration numeric, 
  average_distance numeric, 
  service_efficiency_score numeric, 
  popular_routes jsonb, 
  vehicle_utilization jsonb, 
  maintenance_insights jsonb
)
LANGUAGE plpgsql
SET search_path = ''
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
        HAVING COUNT(*) >= 3
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