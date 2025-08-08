BEGIN;
DROP VIEW IF EXISTS public.vehicles_with_driver_details CASCADE;

CREATE VIEW public.vehicles_with_driver_details AS
SELECT
  v.id,
  v.make,
  v.model,
  v.license_plate,
  v.type,
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

NOTIFY pgrst, 'reload schema';
COMMIT;