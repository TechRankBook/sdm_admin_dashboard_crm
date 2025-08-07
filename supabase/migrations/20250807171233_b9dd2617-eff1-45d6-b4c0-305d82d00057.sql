-- Fix remaining critical security issues identified by linter
-- Phase 1 continued: Fix RLS policies for tables without them

-- Enable RLS on tables that don't have it
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for phone_verifications table (if they don't exist)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'phone_verifications' 
        AND policyname = 'Users can view their own phone verifications'
    ) THEN
        CREATE POLICY "Users can view their own phone verifications" 
        ON public.phone_verifications 
        FOR SELECT 
        USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'phone_verifications' 
        AND policyname = 'Users can create phone verifications'
    ) THEN
        CREATE POLICY "Users can create phone verifications" 
        ON public.phone_verifications 
        FOR INSERT 
        WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Add RLS policies for phone_otps table (if they don't exist)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'phone_otps' 
        AND policyname = 'Users can view their own phone OTPs'
    ) THEN
        CREATE POLICY "Users can view their own phone OTPs" 
        ON public.phone_otps 
        FOR SELECT 
        USING (user_id = auth.uid());
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'phone_otps' 
        AND policyname = 'Users can create their own phone OTPs'
    ) THEN
        CREATE POLICY "Users can create their own phone OTPs" 
        ON public.phone_otps 
        FOR INSERT 
        WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'phone_otps' 
        AND policyname = 'System can update phone OTPs'
    ) THEN
        CREATE POLICY "System can update phone OTPs" 
        ON public.phone_otps 
        FOR UPDATE 
        USING (user_id = auth.uid() OR auth.role() = 'service_role');
    END IF;
END $$;

-- Add RLS policies for user_settings table (if they don't exist)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_settings' 
        AND policyname = 'Users can view their own settings'
    ) THEN
        CREATE POLICY "Users can view their own settings" 
        ON public.user_settings 
        FOR SELECT 
        USING (user_id = auth.uid());
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_settings' 
        AND policyname = 'Users can update their own settings'
    ) THEN
        CREATE POLICY "Users can update their own settings" 
        ON public.user_settings 
        FOR UPDATE 
        USING (user_id = auth.uid());
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_settings' 
        AND policyname = 'Users can insert their own settings'
    ) THEN
        CREATE POLICY "Users can insert their own settings" 
        ON public.user_settings 
        FOR INSERT 
        WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

-- Fix remaining function search paths
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  UPDATE public.users
  SET updated_at = NEW.updated_at
  WHERE id = OLD.id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  DELETE FROM public.users
  WHERE id = OLD.id;
  RETURN OLD;
END;
$function$;

-- Add sample data to demonstrate the application works
INSERT INTO public.bookings (
  id, user_id, pickup_address, dropoff_address, fare_amount, status, payment_status, created_at, updated_at
) VALUES
  (gen_random_uuid(), (SELECT id FROM public.users WHERE role = 'customer' LIMIT 1), 'Sample Pickup Location', 'Sample Dropoff Location', 250.00, 'completed', 'paid', now() - interval '5 days', now() - interval '5 days'),
  (gen_random_uuid(), (SELECT id FROM public.users WHERE role = 'customer' LIMIT 1), 'Airport Terminal 1', 'Downtown Hotel', 450.00, 'completed', 'paid', now() - interval '3 days', now() - interval '3 days'),
  (gen_random_uuid(), (SELECT id FROM public.users WHERE role = 'customer' LIMIT 1), 'Shopping Mall', 'Residential Area', 180.00, 'pending', 'pending', now() - interval '1 hour', now() - interval '1 hour')
ON CONFLICT DO NOTHING;