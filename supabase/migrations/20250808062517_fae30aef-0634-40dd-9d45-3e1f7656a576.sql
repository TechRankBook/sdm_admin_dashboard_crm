-- Fix relationship ambiguity issues by checking existing constraints first

-- Check existing foreign key constraints
SELECT 
    tc.constraint_name, 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
AND tc.table_name IN ('drivers', 'customers', 'admins', 'bookings', 'vehicles')
ORDER BY tc.table_name;

-- Remove specific duplicate constraints that are causing ambiguity
ALTER TABLE public.drivers DROP CONSTRAINT IF EXISTS fk_drivers_user;
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS fk_customers_user;
ALTER TABLE public.admins DROP CONSTRAINT IF EXISTS fk_admins_user;

-- Ensure we have proper constraints (only add if they don't exist)
DO $$ 
BEGIN
    -- Add drivers constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'drivers_user_id_fkey' 
        AND table_name = 'drivers'
    ) THEN
        ALTER TABLE public.drivers 
        ADD CONSTRAINT drivers_user_id_fkey 
        FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- Add customers constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'customers_user_id_fkey' 
        AND table_name = 'customers'
    ) THEN
        ALTER TABLE public.customers 
        ADD CONSTRAINT customers_user_id_fkey 
        FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- Add admins constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'admins_user_id_fkey' 
        AND table_name = 'admins'
    ) THEN
        ALTER TABLE public.admins 
        ADD CONSTRAINT admins_user_id_fkey 
        FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- Add vehicles constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'vehicles_assigned_driver_fkey' 
        AND table_name = 'vehicles'
    ) THEN
        ALTER TABLE public.vehicles 
        ADD CONSTRAINT vehicles_assigned_driver_fkey 
        FOREIGN KEY (assigned_driver_id) REFERENCES public.drivers(id) ON DELETE SET NULL;
    END IF;

    -- Add bookings driver constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookings_driver_id_fkey' 
        AND table_name = 'bookings'
    ) THEN
        ALTER TABLE public.bookings 
        ADD CONSTRAINT bookings_driver_id_fkey 
        FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE SET NULL;
    END IF;

    -- Add bookings vehicle constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookings_vehicle_id_fkey' 
        AND table_name = 'bookings'
    ) THEN
        ALTER TABLE public.bookings 
        ADD CONSTRAINT bookings_vehicle_id_fkey 
        FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE SET NULL;
    END IF;
END $$;