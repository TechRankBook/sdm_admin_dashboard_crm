-- Ensure vehicle_type column exists on pricing_rules for pricing updates by vehicle type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pricing_rules'
      AND column_name = 'vehicle_type'
  ) THEN
    ALTER TABLE public.pricing_rules
      ADD COLUMN vehicle_type text;
  END IF;
END $$;

-- Helpful index for filtering by vehicle_type
CREATE INDEX IF NOT EXISTS idx_pricing_rules_vehicle_type
  ON public.pricing_rules (vehicle_type);

-- Unified view for vehicles with optional assigned driver and their user details
-- Includes ALL vehicles (assigned and unassigned) and key driver metadata
CREATE OR REPLACE VIEW public.vehicles_with_driver_details AS
SELECT
  v.id                         AS vehicle_id,
  v.make,
  v.model,
  v.license_plate,
  v.status                     AS vehicle_status,
  v.assigned_driver_id,
  d.id                         AS driver_id,
  d.status                     AS driver_status,
  d.rating,
  d.total_rides,
  u.full_name                  AS driver_name,
  u.phone_no                   AS driver_phone,
  u.email                      AS driver_email,
  u.profile_picture_url        AS driver_profile_picture_url,
  (v.status = 'active' AND v.assigned_driver_id IS NULL) AS is_available
FROM public.vehicles v
LEFT JOIN public.drivers d ON d.id = v.assigned_driver_id
LEFT JOIN public.users   u ON u.id = d.id;

-- Force PostgREST to reload schema so new column and view are immediately available
NOTIFY pgrst, 'reload schema';