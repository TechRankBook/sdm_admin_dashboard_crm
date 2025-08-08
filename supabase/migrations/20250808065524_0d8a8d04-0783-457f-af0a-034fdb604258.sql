-- Fix all remaining database relationship issues and optimize queries

-- Ensure the driver-user relationships are properly cleaned up
-- Remove any conflicting foreign keys first
ALTER TABLE public.drivers DROP CONSTRAINT IF EXISTS drivers_id_fkey CASCADE;
ALTER TABLE public.drivers DROP CONSTRAINT IF EXISTS fk_drivers_user CASCADE;
ALTER TABLE public.drivers DROP CONSTRAINT IF EXISTS drivers_user_id_fkey CASCADE;

-- Add single, clear foreign key relationship for drivers
ALTER TABLE public.drivers 
ADD CONSTRAINT drivers_user_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Do the same for admins
ALTER TABLE public.admins DROP CONSTRAINT IF EXISTS admins_id_fkey CASCADE;
ALTER TABLE public.admins DROP CONSTRAINT IF EXISTS fk_admins_user CASCADE;

-- Add single, clear foreign key relationship for admins
ALTER TABLE public.admins 
ADD CONSTRAINT admins_user_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Recreate the secure views with proper joins
DROP VIEW IF EXISTS public.drivers_with_user_info CASCADE;
CREATE VIEW public.drivers_with_user_info AS
SELECT 
    d.*,
    u.full_name,
    u.email,
    u.phone_no,
    u.profile_picture_url,
    u.status as user_status
FROM public.drivers d
INNER JOIN public.users u ON d.id = u.id;

DROP VIEW IF EXISTS public.admins_with_user_info CASCADE;
CREATE VIEW public.admins_with_user_info AS
SELECT 
    a.*,
    u.full_name,
    u.email,
    u.phone_no,
    u.profile_picture_url,
    u.status as user_status
FROM public.admins a
INNER JOIN public.users u ON a.id = u.id;

-- Create a customers with user info view for consistency
DROP VIEW IF EXISTS public.customers_with_user_info CASCADE;
CREATE VIEW public.customers_with_user_info AS
SELECT 
    c.*,
    u.full_name,
    u.email,
    u.phone_no,
    u.profile_picture_url,
    u.status as user_status
FROM public.customers c
INNER JOIN public.users u ON c.id = u.id;

-- Add RLS policies for the new views
DROP POLICY IF EXISTS "drivers_with_user_info_select" ON public.drivers_with_user_info;
DROP POLICY IF EXISTS "admins_with_user_info_select" ON public.admins_with_user_info;
DROP POLICY IF EXISTS "customers_with_user_info_select" ON public.customers_with_user_info;

-- Note: Views inherit RLS from their underlying tables, so we don't need separate policies

-- Optimize indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON public.drivers(id);
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON public.admins(id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON public.bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Add function to get unified user profile data
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT jsonb_build_object(
    'id', u.id,
    'full_name', u.full_name,
    'email', u.email,
    'phone_no', u.phone_no,
    'profile_picture_url', u.profile_picture_url,
    'role', u.role,
    'status', u.status,
    'created_at', u.created_at,
    'updated_at', u.updated_at,
    'admin_data', CASE 
      WHEN u.role = 'admin' THEN jsonb_build_object(
        'can_approve_bookings', a.can_approve_bookings,
        'assigned_region', a.assigned_region
      )
      ELSE null
    END,
    'customer_data', CASE 
      WHEN u.role = 'customer' THEN jsonb_build_object(
        'loyalty_points', c.loyalty_points,
        'dob', c.dob,
        'preferred_payment_method', c.preferred_payment_method,
        'referral_code', c.referral_code
      )
      ELSE null
    END,
    'driver_data', CASE 
      WHEN u.role = 'driver' THEN jsonb_build_object(
        'license_number', d.license_number,
        'status', d.status,
        'rating', d.rating,
        'total_rides', d.total_rides,
        'current_latitude', d.current_latitude,
        'current_longitude', d.current_longitude,
        'kyc_status', d.kyc_status,
        'joined_on', d.joined_on
      )
      ELSE null
    END
  )
  FROM public.users u
  LEFT JOIN public.admins a ON u.id = a.id AND u.role = 'admin'
  LEFT JOIN public.customers c ON u.id = c.id AND u.role = 'customer'
  LEFT JOIN public.drivers d ON u.id = d.id AND u.role = 'driver'
  WHERE u.id = user_uuid;
$$;