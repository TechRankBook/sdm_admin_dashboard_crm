-- First, add the missing vehicle_type column to pricing_rules table
ALTER TABLE pricing_rules ADD COLUMN IF NOT EXISTS vehicle_type TEXT;

-- Update existing records to populate vehicle_type from vehicle_types table
UPDATE pricing_rules 
SET vehicle_type = vt.name
FROM vehicle_types vt
WHERE pricing_rules.vehicle_type_id = vt.id
AND pricing_rules.vehicle_type IS NULL;

-- Create a view for vehicles with complete driver information
DROP VIEW IF EXISTS vehicles_with_driver_details;
CREATE VIEW vehicles_with_driver_details AS
SELECT 
    v.id,
    v.make,
    v.model,
    v.year,
    v.license_plate,
    v.type,
    v.status,
    v.color,
    v.assigned_driver_id,
    v.vendor_id,
    v.created_at,
    v.updated_at,
    -- Driver information
    d.id as driver_id,
    d.license_number,
    d.status as driver_status,
    d.rating as driver_rating,
    d.total_rides,
    d.current_latitude,
    d.current_longitude,
    d.kyc_status,
    -- User information for the driver
    u.full_name as driver_name,
    u.phone_no as driver_phone,
    u.email as driver_email,
    u.profile_picture_url as driver_profile_picture,
    u.status as driver_user_status
FROM vehicles v
LEFT JOIN drivers d ON v.assigned_driver_id = d.id
LEFT JOIN users u ON d.id = u.id;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_assigned_driver ON vehicles(assigned_driver_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_vehicle_type ON pricing_rules(vehicle_type);

-- Update RLS policies for the new view
DROP POLICY IF EXISTS "vehicles_with_driver_details_select" ON vehicles_with_driver_details;

-- Note: Views inherit RLS from underlying tables, so we rely on existing vehicle policies