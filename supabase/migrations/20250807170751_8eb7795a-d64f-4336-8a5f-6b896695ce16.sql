-- Phase 1: Critical Security & Database Fixes (Fixed version)
-- Fix 1: Add missing foreign key constraints for data integrity

-- Add foreign key for vehicles.assigned_driver_id to drivers (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_vehicles_assigned_driver'
    ) THEN
        ALTER TABLE public.vehicles 
        ADD CONSTRAINT fk_vehicles_assigned_driver 
        FOREIGN KEY (assigned_driver_id) REFERENCES public.drivers(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key for drivers to users table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_drivers_user'
    ) THEN
        ALTER TABLE public.drivers 
        ADD CONSTRAINT fk_drivers_user 
        FOREIGN KEY (id) REFERENCES public.users(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key for customers to users table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_customers_user'
    ) THEN
        ALTER TABLE public.customers 
        ADD CONSTRAINT fk_customers_user 
        FOREIGN KEY (id) REFERENCES public.users(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key for admins to users table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_admins_user'
    ) THEN
        ALTER TABLE public.admins 
        ADD CONSTRAINT fk_admins_user 
        FOREIGN KEY (id) REFERENCES public.users(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Fix 2: Add performance indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON public.bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON public.bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_status_created_at ON public.bookings(status, created_at);

CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_assigned_driver ON public.vehicles(assigned_driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_vendor ON public.vehicles(vendor_id);

CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_location ON public.drivers(current_latitude, current_longitude) WHERE current_latitude IS NOT NULL AND current_longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Fix 3: Add proper data validation constraints
-- Ensure required fields are not null for critical tables
ALTER TABLE public.bookings ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN pickup_address SET NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN dropoff_address SET NOT NULL;

-- Add check constraints for valid statuses and amounts
ALTER TABLE public.bookings ADD CONSTRAINT check_positive_fare 
    CHECK (fare_amount IS NULL OR fare_amount >= 0);

ALTER TABLE public.vehicles ADD CONSTRAINT check_valid_year 
    CHECK (year IS NULL OR (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1));

-- Fix 4: Update analytics functions to handle edge cases better
CREATE OR REPLACE FUNCTION public.get_revenue_analytics(start_date timestamp with time zone DEFAULT (CURRENT_DATE - '30 days'::interval), end_date timestamp with time zone DEFAULT CURRENT_DATE)
RETURNS TABLE(total_revenue numeric, completed_bookings bigint, average_fare numeric, revenue_growth_percentage numeric, daily_revenue jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  prev_period_revenue numeric := 0;
  current_period_revenue numeric := 0;
  completed_booking_count bigint := 0;
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
      ELSE 0::numeric 
    END as average_fare,
    CASE 
      WHEN prev_period_revenue > 0 
      THEN ((current_period_revenue - prev_period_revenue) / prev_period_revenue) * 100
      ELSE 0::numeric 
    END as revenue_growth_percentage,
    COALESCE((
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
    ), '[]'::jsonb) as daily_revenue;
END;
$function$;