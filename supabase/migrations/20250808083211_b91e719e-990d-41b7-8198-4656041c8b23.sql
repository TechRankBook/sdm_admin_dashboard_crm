-- Fix previous failure: recreate unified view to avoid column mismatch errors
BEGIN;

-- 1) Ensure pricing_rules has vehicle_type for pricing updates
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

CREATE INDEX IF NOT EXISTS idx_pricing_rules_vehicle_type
  ON public.pricing_rules (vehicle_type);

-- 2) Recreate vehicles_with_driver_details to include ALL vehicles and driver metadata
DROP VIEW IF EXISTS public.vehicles_with_driver_details CASCADE;

CREATE VIEW public.vehicles_with_driver_details AS
SELECT
  v.id,                              -- keep canonical vehicle id name for compatibility
  v.make,
  v.model,
  v.license_plate,
  v.status            AS vehicle_status,
  v.assigned_driver_id,
  d.id                AS driver_id,
  d.status            AS driver_status,
  d.rating,
  d.total_rides,
  u.full_name         AS driver_name,
  u.phone_no          AS driver_phone,
  u.email             AS driver_email,
  u.profile_picture_url AS driver_profile_picture_url,
  (v.status = 'active' AND v.assigned_driver_id IS NULL) AS is_available
FROM public.vehicles v
LEFT JOIN public.drivers d ON d.id = v.assigned_driver_id
LEFT JOIN public.users   u ON u.id = d.id;

-- 3) Reload PostgREST schema cache so the new column and view are available immediately
NOTIFY pgrst, 'reload schema';

COMMIT;