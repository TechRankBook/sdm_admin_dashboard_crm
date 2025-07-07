
-- Add missing columns to vehicles table that are referenced in the code
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS current_driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS insurance_document_url TEXT,
ADD COLUMN IF NOT EXISTS registration_document_url TEXT,
ADD COLUMN IF NOT EXISTS pollution_certificate_url TEXT,
ADD COLUMN IF NOT EXISTS last_service_date DATE,
ADD COLUMN IF NOT EXISTS next_service_due_date DATE,
ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL;

-- Update vehicle status enum to match frontend expectations
ALTER TYPE vehicle_status_enum ADD VALUE IF NOT EXISTS 'in_maintenance';
ALTER TYPE vehicle_status_enum ADD VALUE IF NOT EXISTS 'unavailable';

-- Create vehicle_maintenance_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.vehicle_maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  maintenance_date DATE NOT NULL,
  description TEXT,
  cost NUMERIC(10,2),
  performed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on vehicle_maintenance_logs
ALTER TABLE public.vehicle_maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for vehicles table
DROP POLICY IF EXISTS "vehicles_select_all" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_insert_admin" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_update_admin" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_delete_admin" ON public.vehicles;

CREATE POLICY "vehicles_select_all" ON public.vehicles
FOR SELECT USING (true);

CREATE POLICY "vehicles_insert_admin" ON public.vehicles
FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "vehicles_update_admin" ON public.vehicles
FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "vehicles_delete_admin" ON public.vehicles
FOR DELETE USING (get_user_role(auth.uid()) = 'admin');

-- Create RLS policies for vehicle_maintenance_logs
CREATE POLICY IF NOT EXISTS "maintenance_logs_select_all" ON public.vehicle_maintenance_logs
FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "maintenance_logs_insert_admin" ON public.vehicle_maintenance_logs
FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY IF NOT EXISTS "maintenance_logs_update_admin" ON public.vehicle_maintenance_logs
FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY IF NOT EXISTS "maintenance_logs_delete_admin" ON public.vehicle_maintenance_logs
FOR DELETE USING (get_user_role(auth.uid()) = 'admin');

-- Create storage buckets for vehicle files if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('vehicle-images', 'vehicle-images', true),
  ('vehicle-documents', 'vehicle-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for vehicle files
CREATE POLICY IF NOT EXISTS "Allow public read access to vehicle images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'vehicle-images');

CREATE POLICY IF NOT EXISTS "Allow authenticated upload to vehicle images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'vehicle-images' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated update to vehicle images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'vehicle-images' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated delete from vehicle images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'vehicle-images' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow public read access to vehicle documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'vehicle-documents');

CREATE POLICY IF NOT EXISTS "Allow authenticated upload to vehicle documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'vehicle-documents' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated update to vehicle documents" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'vehicle-documents' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated delete from vehicle documents" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'vehicle-documents' AND auth.role() = 'authenticated');
