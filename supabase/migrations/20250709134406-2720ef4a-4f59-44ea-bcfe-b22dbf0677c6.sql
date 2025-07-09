
-- Create settings table for storing admin configuration
CREATE TABLE public.admin_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL,
  setting_type text NOT NULL CHECK (setting_type IN ('boolean', 'number', 'string', 'json', 'array')),
  display_name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  UNIQUE(category, setting_key)
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "admin_settings_manage_admin" 
ON public.admin_settings 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role_enum)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role_enum);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.admin_settings (category, setting_key, setting_value, setting_type, display_name, description) VALUES
-- Business Rules
('business_rules', 'base_fare', '50', 'number', 'Base Fare Amount', 'Default base fare for rides in INR'),
('business_rules', 'per_km_rate', '10', 'number', 'Per KM Rate', 'Rate charged per kilometer in INR'),
('business_rules', 'surge_multiplier_max', '3.0', 'number', 'Maximum Surge Multiplier', 'Maximum surge pricing multiplier allowed'),
('business_rules', 'cancellation_window', '5', 'number', 'Free Cancellation Window', 'Minutes within which cancellation is free'),
('business_rules', 'driver_min_rating', '4.0', 'number', 'Minimum Driver Rating', 'Minimum rating required for drivers to accept rides'),
('business_rules', 'vehicle_max_age', '10', 'number', 'Maximum Vehicle Age', 'Maximum age of vehicles in years'),

-- Global Features
('features', 'real_time_tracking', 'true', 'boolean', 'Real-time Tracking', 'Enable live tracking of rides'),
('features', 'surge_pricing', 'true', 'boolean', 'Surge Pricing', 'Enable dynamic surge pricing'),
('features', 'shared_rides', 'true', 'boolean', 'Shared Rides', 'Allow ride sharing functionality'),
('features', 'scheduled_rides', 'true', 'boolean', 'Scheduled Rides', 'Allow advance booking of rides'),
('features', 'driver_ratings', 'true', 'boolean', 'Driver Ratings', 'Enable driver rating system'),
('features', 'customer_support_chat', 'true', 'boolean', 'Customer Support Chat', 'Enable in-app customer support'),

-- Operational Settings
('operations', 'auto_driver_assignment', 'true', 'boolean', 'Auto Driver Assignment', 'Automatically assign nearest available driver'),
('operations', 'booking_confirmation_required', 'false', 'boolean', 'Booking Confirmation Required', 'Require manual confirmation for bookings'),
('operations', 'service_radius_km', '50', 'number', 'Service Radius', 'Maximum service radius in kilometers'),
('operations', 'max_waiting_time', '15', 'number', 'Maximum Waiting Time', 'Maximum waiting time for driver in minutes'),
('operations', 'advance_booking_days', '7', 'number', 'Advance Booking Limit', 'Maximum days in advance for booking'),
('operations', 'driver_idle_timeout', '30', 'number', 'Driver Idle Timeout', 'Minutes before marking driver as inactive'),

-- Notifications
('notifications', 'booking_confirmations', 'true', 'boolean', 'Booking Confirmations', 'Send booking confirmation notifications'),
('notifications', 'ride_reminders', 'true', 'boolean', 'Ride Reminders', 'Send ride reminder notifications'),
('notifications', 'driver_alerts', 'true', 'boolean', 'Driver Alerts', 'Send alerts to drivers'),
('notifications', 'maintenance_reminders', 'true', 'boolean', 'Maintenance Reminders', 'Send vehicle maintenance reminders'),
('notifications', 'payment_confirmations', 'true', 'boolean', 'Payment Confirmations', 'Send payment confirmation notifications'),

-- Payment Settings
('payments', 'cash_payments', 'true', 'boolean', 'Cash Payments', 'Accept cash payments'),
('payments', 'card_payments', 'true', 'boolean', 'Card Payments', 'Accept card payments'),
('payments', 'wallet_payments', 'true', 'boolean', 'Wallet Payments', 'Accept digital wallet payments'),
('payments', 'upi_payments', 'true', 'boolean', 'UPI Payments', 'Accept UPI payments'),
('payments', 'auto_payment_retry', 'true', 'boolean', 'Auto Payment Retry', 'Automatically retry failed payments');

-- Create function to get settings by category
CREATE OR REPLACE FUNCTION public.get_settings_by_category(category_name text)
RETURNS TABLE(
  setting_key text,
  setting_value jsonb,
  setting_type text,
  display_name text,
  description text,
  is_active boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.setting_key,
    s.setting_value,
    s.setting_type,
    s.display_name,
    s.description,
    s.is_active
  FROM public.admin_settings s
  WHERE s.category = category_name AND s.is_active = true
  ORDER BY s.display_name;
END;
$$;

-- Create function to update setting
CREATE OR REPLACE FUNCTION public.update_admin_setting(
  p_category text,
  p_setting_key text,
  p_setting_value jsonb,
  p_updated_by uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF get_user_role(p_updated_by) != 'admin'::user_role_enum THEN
    RAISE EXCEPTION 'Only admins can update settings';
  END IF;

  UPDATE public.admin_settings 
  SET 
    setting_value = p_setting_value,
    updated_at = now(),
    updated_by = p_updated_by
  WHERE category = p_category AND setting_key = p_setting_key;

  RETURN FOUND;
END;
$$;
