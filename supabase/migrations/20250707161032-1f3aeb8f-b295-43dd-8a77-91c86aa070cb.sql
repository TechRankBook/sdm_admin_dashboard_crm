-- Create vehicle_documents table for managing various vehicle documents
CREATE TABLE public.vehicle_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('registration', 'insurance', 'pollution_certificate', 'fitness_certificate')),
  document_url text,
  issue_date date,
  expiry_date date,
  verified boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create vehicle_performance table for tracking mileage and performance
CREATE TABLE public.vehicle_performance (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  recorded_date date NOT NULL DEFAULT CURRENT_DATE,
  odometer_reading integer, -- in km
  fuel_consumed numeric(8,2), -- in liters
  distance_traveled numeric(8,2), -- in km
  fuel_economy numeric(5,2), -- km/l
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create vehicle_alerts table for maintenance reminders and alerts
CREATE TABLE public.vehicle_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('service_due', 'document_expiry', 'insurance_expiry', 'pollution_expiry', 'fitness_expiry', 'custom')),
  title text NOT NULL,
  description text,
  due_date date,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_resolved boolean DEFAULT false,
  resolved_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add missing columns to vehicle_maintenance_logs for enhanced service tracking
ALTER TABLE public.vehicle_maintenance_logs 
ADD COLUMN IF NOT EXISTS service_type text DEFAULT 'regular',
ADD COLUMN IF NOT EXISTS odometer_reading integer,
ADD COLUMN IF NOT EXISTS next_service_due_date date,
ADD COLUMN IF NOT EXISTS next_service_due_km integer,
ADD COLUMN IF NOT EXISTS work_performed text,
ADD COLUMN IF NOT EXISTS service_center text,
ADD COLUMN IF NOT EXISTS bill_document_url text;

-- Add missing columns to vehicles table for enhanced tracking
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS current_odometer integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_fuel_economy numeric(5,2),
ADD COLUMN IF NOT EXISTS monthly_distance numeric(8,2);

-- Enable Row Level Security
ALTER TABLE public.vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vehicle_documents
CREATE POLICY "vehicle_documents_select_all" ON public.vehicle_documents FOR SELECT USING (true);
CREATE POLICY "vehicle_documents_manage_admin" ON public.vehicle_documents FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role_enum);

-- Create RLS policies for vehicle_performance
CREATE POLICY "vehicle_performance_select_all" ON public.vehicle_performance FOR SELECT USING (true);
CREATE POLICY "vehicle_performance_manage_admin" ON public.vehicle_performance FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role_enum);

-- Create RLS policies for vehicle_alerts
CREATE POLICY "vehicle_alerts_select_all" ON public.vehicle_alerts FOR SELECT USING (true);
CREATE POLICY "vehicle_alerts_manage_admin" ON public.vehicle_alerts FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role_enum);

-- Create indexes for better performance
CREATE INDEX idx_vehicle_documents_vehicle_id ON public.vehicle_documents(vehicle_id);
CREATE INDEX idx_vehicle_documents_expiry ON public.vehicle_documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_vehicle_performance_vehicle_id ON public.vehicle_performance(vehicle_id);
CREATE INDEX idx_vehicle_alerts_vehicle_id ON public.vehicle_alerts(vehicle_id);
CREATE INDEX idx_vehicle_alerts_due_date ON public.vehicle_alerts(due_date) WHERE due_date IS NOT NULL;

-- Create function to automatically create alerts for expiring documents
CREATE OR REPLACE FUNCTION public.create_document_expiry_alerts()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete existing alert for this document type
  DELETE FROM public.vehicle_alerts 
  WHERE vehicle_id = NEW.vehicle_id 
  AND alert_type = (NEW.document_type || '_expiry')::text;
  
  -- Create new alert if expiry date exists and is in the future
  IF NEW.expiry_date IS NOT NULL AND NEW.expiry_date > CURRENT_DATE THEN
    INSERT INTO public.vehicle_alerts (
      vehicle_id,
      alert_type,
      title,
      description,
      due_date,
      priority
    ) VALUES (
      NEW.vehicle_id,
      (NEW.document_type || '_expiry')::text,
      INITCAP(REPLACE(NEW.document_type, '_', ' ')) || ' Expiry',
      INITCAP(REPLACE(NEW.document_type, '_', ' ')) || ' expires on ' || NEW.expiry_date::text,
      NEW.expiry_date,
      CASE 
        WHEN NEW.expiry_date - CURRENT_DATE <= 30 THEN 'critical'
        WHEN NEW.expiry_date - CURRENT_DATE <= 90 THEN 'high'
        ELSE 'medium'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for document expiry alerts
CREATE TRIGGER trigger_document_expiry_alerts
  AFTER INSERT OR UPDATE ON public.vehicle_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.create_document_expiry_alerts();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_vehicle_documents_updated_at
  BEFORE UPDATE ON public.vehicle_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicle_performance_updated_at
  BEFORE UPDATE ON public.vehicle_performance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicle_alerts_updated_at
  BEFORE UPDATE ON public.vehicle_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();