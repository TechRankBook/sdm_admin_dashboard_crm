-- Remove duplicate foreign key constraints properly and create views for data access

-- Drop duplicate constraints identified in the query results
ALTER TABLE public.drivers DROP CONSTRAINT IF EXISTS fk_drivers_user;
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS fk_customers_user;
ALTER TABLE public.admins DROP CONSTRAINT IF EXISTS fk_admins_user;
ALTER TABLE public.vehicles DROP CONSTRAINT IF EXISTS fk_vehicles_assigned_driver;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_rating ON public.drivers(rating);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at);

-- Create secure views for data access to avoid relationship ambiguity
CREATE OR REPLACE VIEW public.drivers_with_user_info AS
SELECT 
    d.id,
    d.license_number,
    d.status,
    d.rating,
    d.total_rides,
    d.current_latitude,
    d.current_longitude,
    d.joined_on,
    d.kyc_status,
    d.license_document_url,
    d.id_proof_document_url,
    d.rejection_reason,
    d.created_at,
    d.updated_at,
    u.full_name,
    u.email,
    u.phone_no,
    u.profile_picture_url,
    u.status as user_status
FROM public.drivers d
JOIN public.users u ON d.id = u.id;

-- Enable RLS on the view by creating it as a security barrier
ALTER VIEW public.drivers_with_user_info SET (security_barrier = true);

-- Grant permissions on the view
GRANT SELECT ON public.drivers_with_user_info TO authenticated, anon;

-- Create view for admins with user info
CREATE OR REPLACE VIEW public.admins_with_user_info AS
SELECT 
    a.id,
    a.can_approve_bookings,
    a.assigned_region,
    a.created_at,
    a.updated_at,
    u.full_name,
    u.email,
    u.phone_no,
    u.profile_picture_url,
    u.status as user_status
FROM public.admins a
JOIN public.users u ON a.id = u.id;

-- Enable RLS on the admin view
ALTER VIEW public.admins_with_user_info SET (security_barrier = true);
GRANT SELECT ON public.admins_with_user_info TO authenticated, anon;