-- Analytics and Reporting Functions

-- Function to get revenue analytics
CREATE OR REPLACE FUNCTION public.get_revenue_analytics(
  start_date timestamp with time zone DEFAULT (CURRENT_DATE - INTERVAL '30 days'),
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
AS $$
DECLARE
  prev_period_revenue numeric;
  current_period_revenue numeric;
BEGIN
  -- Get current period revenue
  SELECT COALESCE(SUM(b.fare_amount), 0) INTO current_period_revenue
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
    (SELECT COUNT(*) FROM bookings WHERE status = 'completed' AND created_at >= start_date AND created_at <= end_date) as completed_bookings,
    CASE 
      WHEN (SELECT COUNT(*) FROM bookings WHERE status = 'completed' AND created_at >= start_date AND created_at <= end_date) > 0 
      THEN current_period_revenue / (SELECT COUNT(*) FROM bookings WHERE status = 'completed' AND created_at >= start_date AND created_at <= end_date)
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
$$;

-- Function to get booking analytics
CREATE OR REPLACE FUNCTION public.get_booking_analytics(
  start_date timestamp with time zone DEFAULT (CURRENT_DATE - INTERVAL '30 days'),
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
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM bookings WHERE created_at >= start_date AND created_at <= end_date) as total_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'completed' AND created_at >= start_date AND created_at <= end_date) as completed_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'cancelled' AND created_at >= start_date AND created_at <= end_date) as cancelled_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'pending' AND created_at >= start_date AND created_at <= end_date) as pending_bookings,
    CASE 
      WHEN (SELECT COUNT(*) FROM bookings WHERE created_at >= start_date AND created_at <= end_date) > 0
      THEN ((SELECT COUNT(*) FROM bookings WHERE status = 'completed' AND created_at >= start_date AND created_at <= end_date)::numeric / 
            (SELECT COUNT(*) FROM bookings WHERE created_at >= start_date AND created_at <= end_date)::numeric) * 100
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
$$;

-- Function to get driver performance analytics
CREATE OR REPLACE FUNCTION public.get_driver_performance_analytics(
  start_date timestamp with time zone DEFAULT (CURRENT_DATE - INTERVAL '30 days'),
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
AS $$
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
$$;

-- Function to get customer analytics
CREATE OR REPLACE FUNCTION public.get_customer_analytics(
  start_date timestamp with time zone DEFAULT (CURRENT_DATE - INTERVAL '30 days'),
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
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM customers) as total_customers,
    (SELECT COUNT(*) FROM customers WHERE created_at >= start_date AND created_at <= end_date) as new_customers,
    (
      SELECT COUNT(DISTINCT user_id) 
      FROM bookings 
      WHERE created_at >= start_date 
        AND created_at <= end_date
        AND user_id IN (
          SELECT user_id 
          FROM bookings 
          WHERE created_at < start_date
        )
    ) as repeat_customers,
    CASE 
      WHEN (SELECT COUNT(*) FROM customers WHERE created_at < start_date) > 0
      THEN (
        (SELECT COUNT(DISTINCT user_id) 
         FROM bookings 
         WHERE created_at >= start_date 
           AND created_at <= end_date
           AND user_id IN (
             SELECT user_id 
             FROM bookings 
             WHERE created_at < start_date
           ))::numeric / 
        (SELECT COUNT(*) FROM customers WHERE created_at < start_date)::numeric
      ) * 100
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
$$;

-- Function to get service performance analytics
CREATE OR REPLACE FUNCTION public.get_service_performance_analytics(
  start_date timestamp with time zone DEFAULT (CURRENT_DATE - INTERVAL '30 days'),
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
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (
      SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (end_time - start_time))/60), 0)
      FROM bookings 
      WHERE status = 'completed' 
        AND start_time IS NOT NULL 
        AND end_time IS NOT NULL
        AND created_at >= start_date 
        AND created_at <= end_date
    ) as average_trip_duration,
    (
      SELECT COALESCE(AVG(distance_km), 0)
      FROM bookings 
      WHERE status = 'completed' 
        AND distance_km IS NOT NULL
        AND created_at >= start_date 
        AND created_at <= end_date
    ) as average_distance,
    (
      SELECT CASE 
        WHEN COUNT(*) > 0 
        THEN (COUNT(*) FILTER (WHERE status = 'completed')::numeric / COUNT(*)::numeric) * 100
        ELSE 0 
      END
      FROM bookings 
      WHERE created_at >= start_date AND created_at <= end_date
    ) as service_efficiency_score,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'route', pickup_address || ' → ' || dropoff_address,
          'frequency', route_count,
          'avg_fare', avg_fare
        )
      )
      FROM (
        SELECT 
          pickup_address,
          dropoff_address,
          COUNT(*) as route_count,
          AVG(fare_amount) as avg_fare
        FROM bookings
        WHERE status = 'completed' 
          AND pickup_address IS NOT NULL 
          AND dropoff_address IS NOT NULL
          AND created_at >= start_date 
          AND created_at <= end_date
        GROUP BY pickup_address, dropoff_address
        HAVING COUNT(*) >= 3
        ORDER BY route_count DESC
        LIMIT 10
      ) routes
    ) as popular_routes,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'vehicle_id', v.id,
          'vehicle_model', v.model,
          'total_trips', trip_count,
          'utilization_percentage', utilization_rate
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
        FROM vehicles v
        LEFT JOIN bookings b ON v.id = b.vehicle_id 
          AND b.status = 'completed'
          AND b.created_at >= start_date 
          AND b.created_at <= end_date
        GROUP BY v.id, v.model
        ORDER BY trip_count DESC
        LIMIT 15
      ) v
    ) as vehicle_utilization,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'total_maintenance_cost', total_cost,
          'maintenance_frequency', maintenance_count,
          'avg_cost_per_service', avg_cost
        )
      )
      FROM (
        SELECT 
          COALESCE(SUM(cost), 0) as total_cost,
          COUNT(*) as maintenance_count,
          COALESCE(AVG(cost), 0) as avg_cost
        FROM vehicle_maintenance_logs
        WHERE maintenance_date >= start_date::date 
          AND maintenance_date <= end_date::date
      ) maintenance
    ) as maintenance_insights;
END;
$$;