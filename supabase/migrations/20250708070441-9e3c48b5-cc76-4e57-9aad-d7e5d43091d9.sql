-- Create service types table
CREATE TABLE public.service_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default service types
INSERT INTO public.service_types (name, display_name, description) VALUES
('city_ride', 'City Ride', 'Regular city transportation with advance scheduling up to 48 hours'),
('car_rental', 'Car Rental', 'Hourly packages with unlimited halts and flexible stops'),
('airport', 'Airport Taxi', 'Airport pickup and drop services with instant booking'),
('outstation', 'Outstation', 'One-way or round-trip bookings for out-of-city travel'),
('sharing', 'Sharing Ride', 'Shared rides with fare splitting among passengers');

-- Create pricing rules table
CREATE TABLE public.pricing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type_id UUID NOT NULL REFERENCES public.service_types(id),
  vehicle_type TEXT NOT NULL,
  base_fare DECIMAL(10,2) NOT NULL DEFAULT 0,
  per_km_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  per_minute_rate DECIMAL(10,2) DEFAULT 0,
  minimum_fare DECIMAL(10,2) NOT NULL DEFAULT 0,
  surge_multiplier DECIMAL(3,2) DEFAULT 1.0,
  cancellation_fee DECIMAL(10,2) DEFAULT 0,
  no_show_fee DECIMAL(10,2) DEFAULT 0,
  waiting_charges_per_minute DECIMAL(10,2) DEFAULT 0,
  free_waiting_time_minutes INTEGER DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  effective_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rental packages table
CREATE TABLE public.rental_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  duration_hours INTEGER NOT NULL,
  included_kilometers INTEGER NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  extra_km_rate DECIMAL(10,2) NOT NULL,
  extra_hour_rate DECIMAL(10,2) NOT NULL,
  cancellation_fee DECIMAL(10,2) DEFAULT 50,
  no_show_fee DECIMAL(10,2) DEFAULT 100,
  waiting_limit_minutes INTEGER DEFAULT 20,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default rental packages
INSERT INTO public.rental_packages (name, vehicle_type, duration_hours, included_kilometers, base_price, extra_km_rate, extra_hour_rate) VALUES
('Classic 4 Hours', 'sedan', 4, 40, 1200, 12, 200),
('Classic 8 Hours', 'sedan', 8, 80, 2200, 12, 200),
('Classic 12 Hours', 'sedan', 12, 120, 3000, 12, 200),
('Premium 4 Hours', 'suv', 4, 40, 1600, 15, 300),
('Premium 8 Hours', 'suv', 8, 80, 2800, 15, 300),
('Premium 12 Hours', 'suv', 12, 120, 3800, 15, 300);

-- Create zone pricing table for airport and outstation
CREATE TABLE public.zone_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type_id UUID NOT NULL REFERENCES public.service_types(id),
  zone_name TEXT NOT NULL,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  fixed_price DECIMAL(10,2),
  base_price DECIMAL(10,2),
  per_km_rate DECIMAL(10,2),
  estimated_distance_km DECIMAL(8,2),
  estimated_duration_minutes INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Extend bookings table with service-specific fields
ALTER TABLE public.bookings 
ADD COLUMN service_type_id UUID REFERENCES public.service_types(id),
ADD COLUMN rental_package_id UUID REFERENCES public.rental_packages(id),
ADD COLUMN zone_pricing_id UUID REFERENCES public.zone_pricing(id),
ADD COLUMN scheduled_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_scheduled BOOLEAN DEFAULT false,
ADD COLUMN is_shared BOOLEAN DEFAULT false,
ADD COLUMN sharing_group_id UUID,
ADD COLUMN total_stops INTEGER DEFAULT 0,
ADD COLUMN package_hours INTEGER,
ADD COLUMN included_km INTEGER,
ADD COLUMN extra_km_used DECIMAL(8,2) DEFAULT 0,
ADD COLUMN extra_hours_used DECIMAL(4,2) DEFAULT 0,
ADD COLUMN waiting_time_minutes INTEGER DEFAULT 0,
ADD COLUMN cancellation_reason TEXT,
ADD COLUMN no_show_reason TEXT,
ADD COLUMN upgrade_charges DECIMAL(10,2) DEFAULT 0;

-- Create booking stops table for rentals
CREATE TABLE public.booking_stops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  estimated_duration_minutes INTEGER DEFAULT 15,
  actual_arrival_time TIMESTAMP WITH TIME ZONE,
  actual_departure_time TIMESTAMP WITH TIME ZONE,
  stop_type TEXT DEFAULT 'intermediate', -- 'pickup', 'intermediate', 'dropoff'
  is_completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shared bookings table
CREATE TABLE public.shared_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sharing_group_id UUID NOT NULL,
  primary_booking_id UUID NOT NULL REFERENCES public.bookings(id),
  passenger_booking_id UUID NOT NULL REFERENCES public.bookings(id),
  shared_fare_amount DECIMAL(10,2) NOT NULL,
  fare_split_percentage DECIMAL(5,2) NOT NULL,
  pickup_sequence INTEGER NOT NULL,
  dropoff_sequence INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create booking schedules table
CREATE TABLE public.booking_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  time_slot_start TIMESTAMP WITH TIME ZONE NOT NULL,
  time_slot_end TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_sent BOOLEAN DEFAULT false,
  driver_assigned_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'cancelled', 'completed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_schedules ENABLE ROW LEVEL SECURITY;

-- Service types policies (read-only for all, manage by admin)
CREATE POLICY "service_types_select_all" ON public.service_types FOR SELECT USING (true);
CREATE POLICY "service_types_manage_admin" ON public.service_types FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role_enum);

-- Pricing rules policies
CREATE POLICY "pricing_rules_select_all" ON public.pricing_rules FOR SELECT USING (is_active = true);
CREATE POLICY "pricing_rules_manage_admin" ON public.pricing_rules FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role_enum);

-- Rental packages policies
CREATE POLICY "rental_packages_select_all" ON public.rental_packages FOR SELECT USING (is_active = true);
CREATE POLICY "rental_packages_manage_admin" ON public.rental_packages FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role_enum);

-- Zone pricing policies
CREATE POLICY "zone_pricing_select_all" ON public.zone_pricing FOR SELECT USING (is_active = true);
CREATE POLICY "zone_pricing_manage_admin" ON public.zone_pricing FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role_enum);

-- Booking stops policies
CREATE POLICY "booking_stops_select_related" ON public.booking_stops FOR SELECT 
USING (
  booking_id IN (
    SELECT id FROM public.bookings 
    WHERE user_id = auth.uid() OR driver_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role_enum
  )
);
CREATE POLICY "booking_stops_manage_related" ON public.booking_stops FOR ALL 
USING (
  booking_id IN (
    SELECT id FROM public.bookings 
    WHERE user_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role_enum
  )
);

-- Shared bookings policies
CREATE POLICY "shared_bookings_select_related" ON public.shared_bookings FOR SELECT 
USING (
  primary_booking_id IN (
    SELECT id FROM public.bookings 
    WHERE user_id = auth.uid() OR driver_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role_enum
  ) OR 
  passenger_booking_id IN (
    SELECT id FROM public.bookings 
    WHERE user_id = auth.uid() OR driver_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role_enum
  )
);

-- Booking schedules policies
CREATE POLICY "booking_schedules_select_related" ON public.booking_schedules FOR SELECT 
USING (
  booking_id IN (
    SELECT id FROM public.bookings 
    WHERE user_id = auth.uid() OR driver_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role_enum
  )
);
CREATE POLICY "booking_schedules_manage_related" ON public.booking_schedules FOR ALL 
USING (
  booking_id IN (
    SELECT id FROM public.bookings 
    WHERE user_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role_enum
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_service_types_updated_at BEFORE UPDATE ON public.service_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON public.pricing_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rental_packages_updated_at BEFORE UPDATE ON public.rental_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_zone_pricing_updated_at BEFORE UPDATE ON public.zone_pricing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_booking_stops_updated_at BEFORE UPDATE ON public.booking_stops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shared_bookings_updated_at BEFORE UPDATE ON public.shared_bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_booking_schedules_updated_at BEFORE UPDATE ON public.booking_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();