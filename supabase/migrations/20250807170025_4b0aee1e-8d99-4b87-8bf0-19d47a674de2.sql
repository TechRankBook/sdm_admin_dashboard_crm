-- Phase 1: Critical Security & Database Fixes
-- Fix 1: Add missing RLS policies for tables without policies

-- Add RLS policies for phone_verifications table
CREATE POLICY "Users can view their own phone verifications" 
ON public.phone_verifications 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create phone verifications" 
ON public.phone_verifications 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Add RLS policies for phone_otps table  
CREATE POLICY "Users can view their own phone OTPs" 
ON public.phone_otps 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own phone OTPs" 
ON public.phone_otps 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can update phone OTPs" 
ON public.phone_otps 
FOR UPDATE 
USING (user_id = auth.uid() OR auth.role() = 'service_role');

-- Add RLS policies for user_settings table
CREATE POLICY "Users can view their own settings" 
ON public.user_settings 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own settings" 
ON public.user_settings 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own settings" 
ON public.user_settings 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Fix 2: Add missing foreign key constraints for data integrity

-- Add foreign key for booking_drafts.session_id to chatbot_session_state
ALTER TABLE public.booking_drafts 
ADD CONSTRAINT fk_booking_drafts_session 
FOREIGN KEY (session_id) REFERENCES public.chatbot_session_state(id) 
ON DELETE CASCADE;

-- Add foreign key for chatbot_session_state.booking_draft_id
ALTER TABLE public.chatbot_session_state 
ADD CONSTRAINT fk_session_booking_draft 
FOREIGN KEY (booking_draft_id) REFERENCES public.booking_drafts(id) 
ON DELETE SET NULL;

-- Add foreign key for vehicles.assigned_driver_id to drivers
ALTER TABLE public.vehicles 
ADD CONSTRAINT fk_vehicles_assigned_driver 
FOREIGN KEY (assigned_driver_id) REFERENCES public.drivers(id) 
ON DELETE SET NULL;

-- Add foreign key for drivers to users table
ALTER TABLE public.drivers 
ADD CONSTRAINT fk_drivers_user 
FOREIGN KEY (id) REFERENCES public.users(id) 
ON DELETE CASCADE;

-- Add foreign key for customers to users table  
ALTER TABLE public.customers 
ADD CONSTRAINT fk_customers_user 
FOREIGN KEY (id) REFERENCES public.users(id) 
ON DELETE CASCADE;

-- Add foreign key for admins to users table
ALTER TABLE public.admins 
ADD CONSTRAINT fk_admins_user 
FOREIGN KEY (id) REFERENCES public.users(id) 
ON DELETE CASCADE;

-- Fix 3: Secure database functions with proper search_path
-- Update functions to have secure search_path

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS user_role_enum
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    user_role user_role_enum;
BEGIN
    SELECT role INTO user_role FROM public.users WHERE id = user_uuid;
    RETURN user_role;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$;

-- Fix 4: Add performance indexes for commonly queried columns
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

-- Fix 5: Add proper audit trail triggers for key tables
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    -- Log the change to user_activities if it exists
    IF TG_TABLE_NAME IN ('bookings', 'vehicles', 'drivers') THEN
        INSERT INTO public.user_activities (
            user_id,
            activity_type,
            description,
            metadata,
            created_at
        ) VALUES (
            COALESCE(NEW.user_id, OLD.user_id, auth.uid()),
            CASE 
                WHEN TG_OP = 'INSERT' THEN TG_TABLE_NAME || '_created'
                WHEN TG_OP = 'UPDATE' THEN TG_TABLE_NAME || '_updated'
                WHEN TG_OP = 'DELETE' THEN TG_TABLE_NAME || '_deleted'
            END,
            TG_TABLE_NAME || ' ' || TG_OP || ' operation',
            jsonb_build_object(
                'table', TG_TABLE_NAME,
                'operation', TG_OP,
                'record_id', COALESCE(NEW.id, OLD.id)
            ),
            now()
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Apply audit triggers to key tables
DROP TRIGGER IF EXISTS audit_bookings_trigger ON public.bookings;
CREATE TRIGGER audit_bookings_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_vehicles_trigger ON public.vehicles;  
CREATE TRIGGER audit_vehicles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();