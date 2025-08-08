-- Add the unified profile function and optimize views
-- (Skip constraint creation as they already exist)

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