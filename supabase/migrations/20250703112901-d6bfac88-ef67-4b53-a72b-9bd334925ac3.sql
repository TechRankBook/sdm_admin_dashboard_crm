
-- Add missing columns to vehicles table for driver assignment
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS current_driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL;

-- Create vehicle_maintenance_logs table if it doesn't exist (referenced in migrations)
CREATE TABLE IF NOT EXISTS public.vehicle_maintenance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  maintenance_date DATE NOT NULL,
  description TEXT,
  cost NUMERIC(10,2),
  performed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on vehicle_maintenance_logs if not already enabled
ALTER TABLE public.vehicle_maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vehicle_maintenance_logs table if they don't exist
CREATE POLICY IF NOT EXISTS "maintenance_logs_select_all" ON public.vehicle_maintenance_logs
FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "maintenance_logs_insert_admin" ON public.vehicle_maintenance_logs
FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY IF NOT EXISTS "maintenance_logs_update_admin" ON public.vehicle_maintenance_logs
FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY IF NOT EXISTS "maintenance_logs_delete_admin" ON public.vehicle_maintenance_logs
FOR DELETE USING (get_user_role(auth.uid()) = 'admin');
