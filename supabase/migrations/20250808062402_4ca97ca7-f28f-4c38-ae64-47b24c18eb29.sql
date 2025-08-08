-- Fix relationship ambiguity issues by removing duplicate constraints and fixing queries

-- First, let's check and remove duplicate foreign key constraints that are causing the relationship ambiguity
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Remove duplicate foreign key constraints that are causing issues
    FOR r IN (
        SELECT constraint_name, table_name 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
        AND table_schema = 'public'
        AND constraint_name LIKE '%_fkey%'
        AND table_name IN ('drivers', 'customers', 'admins', 'vehicles')
    ) LOOP
        BEGIN
            EXECUTE 'ALTER TABLE public.' || r.table_name || ' DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
        EXCEPTION 
            WHEN OTHERS THEN
                -- Continue if constraint doesn't exist
                NULL;
        END;
    END LOOP;
END $$;

-- Add proper foreign key constraints with clear naming
ALTER TABLE public.drivers 
ADD CONSTRAINT drivers_user_id_fkey 
FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.customers 
ADD CONSTRAINT customers_user_id_fkey 
FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.admins 
ADD CONSTRAINT admins_user_id_fkey 
FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add missing foreign key constraints for vehicles
ALTER TABLE public.vehicles 
ADD CONSTRAINT vehicles_assigned_driver_fkey 
FOREIGN KEY (assigned_driver_id) REFERENCES public.drivers(id) ON DELETE SET NULL;

-- Add missing foreign key constraints for bookings
ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_driver_id_fkey 
FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE SET NULL;

ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_vehicle_id_fkey 
FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE SET NULL;

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_rating ON public.drivers(rating);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at);

-- Create a view for complete driver information to avoid relationship ambiguity
CREATE OR REPLACE VIEW public.drivers_with_user_info AS
SELECT 
    d.*,
    u.full_name,
    u.email,
    u.phone_no,
    u.profile_picture_url,
    u.created_at as user_created_at,
    u.status as user_status
FROM public.drivers d
JOIN public.users u ON d.id = u.id;

-- Create a view for complete customer information
CREATE OR REPLACE VIEW public.customers_with_user_info AS
SELECT 
    c.*,
    u.full_name,
    u.email,
    u.phone_no,
    u.profile_picture_url,
    u.created_at as user_created_at,
    u.status as user_status
FROM public.customers c
JOIN public.users u ON c.id = u.id;

-- Create a view for complete admin information
CREATE OR REPLACE VIEW public.admins_with_user_info AS
SELECT 
    a.*,
    u.full_name,
    u.email,
    u.phone_no,
    u.profile_picture_url,
    u.created_at as user_created_at,
    u.status as user_status
FROM public.admins a
JOIN public.users u ON a.id = u.id;

-- Grant select permissions on views
GRANT SELECT ON public.drivers_with_user_info TO authenticated, anon;
GRANT SELECT ON public.customers_with_user_info TO authenticated, anon;
GRANT SELECT ON public.admins_with_user_info TO authenticated, anon;

-- Add RLS policies for the views
ALTER VIEW public.drivers_with_user_info SET (security_barrier = true);
ALTER VIEW public.customers_with_user_info SET (security_barrier = true);  
ALTER VIEW public.admins_with_user_info SET (security_barrier = true);