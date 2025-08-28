-- Add zone column to pricing_rules and seed airport & ride_later data per zones
BEGIN;

-- 1) Add column
ALTER TABLE public.pricing_rules
  ADD COLUMN IF NOT EXISTS zone TEXT;

-- 2) Ensure index for fast lookups (optional but useful)
CREATE INDEX IF NOT EXISTS idx_pricing_rules_service_vehicle_zone
  ON public.pricing_rules (service_type_id, vehicle_type, zone);

-- 3) Seed/Upsert rules for Airport and City Ride (ride_later) for Sedan and SUV with Bangalore/Mysuru
-- Fetch service ids
WITH svc AS (
  SELECT id, name FROM public.service_types WHERE name IN ('airport','ride_later')
),
seed AS (
  SELECT
    s.id AS service_type_id,
    v.vehicle_type,
    z.zone,
    v.base_fare,
    v.per_km_rate,
    v.per_minute_rate,
    v.minimum_fare,
    v.surge_min,
    v.surge_max,
    v.cancellation_fee,
    v.no_show_fee,
    v.waiting_charges_per_minute,
    v.free_waiting_time_minutes
  FROM svc s
  CROSS JOIN (
    VALUES
      -- Sedan (Tata XpressT EV)
      ('sedan','Bangalore', 99, 14, 1.50, 299, 1.0, 1.7, 100, 150, 2.00, 5),
      ('sedan','Mysuru',   99, 12, 1.20, 249, 1.0, 1.5,  70, 120, 1.50, 5),
      -- SUV (BYD EMAX 7 EV)
      ('suv',  'Bangalore',119, 19, 2.00, 369, 1.0, 1.7, 125, 175, 2.50, 5),
      ('suv',  'Mysuru',  109, 18, 1.75, 319, 1.0, 1.5, 100, 140, 2.00, 5)
  ) AS v(vehicle_type, zone, base_fare, per_km_rate, per_minute_rate, minimum_fare, surge_min, surge_max, cancellation_fee, no_show_fee, waiting_charges_per_minute, free_waiting_time_minutes)
)
INSERT INTO public.pricing_rules (
  service_type_id, vehicle_type, zone, base_fare, per_km_rate, per_minute_rate,
  minimum_fare, surge_multiplier, cancellation_fee, no_show_fee,
  waiting_charges_per_minute, free_waiting_time_minutes, is_active, created_at, updated_at
)
SELECT
  service_type_id,
  vehicle_type,
  zone,
  base_fare,
  per_km_rate,
  per_minute_rate,
  minimum_fare,
  surge_min, -- store min of the surge range as default multiplier
  cancellation_fee,
  no_show_fee,
  waiting_charges_per_minute,
  free_waiting_time_minutes,
  true,
  now(),
  now()
FROM seed
ON CONFLICT DO NOTHING;

COMMIT;