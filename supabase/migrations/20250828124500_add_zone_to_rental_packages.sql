-- Add zone column to rental_packages and migrate existing data into per-zone rows
BEGIN;

-- 1) Add column if not exists
ALTER TABLE public.rental_packages
  ADD COLUMN IF NOT EXISTS zone TEXT;

-- 2) Select base rows that currently have no zone and are Sedan/SUV
WITH base AS (
  SELECT * FROM public.rental_packages WHERE zone IS NULL AND lower(vehicle_type) IN ('sedan','suv')
)
-- 2a) Mark existing base rows as Mysuru and normalize their values per screenshot
UPDATE public.rental_packages rp
SET zone = 'Mysuru',
    base_price = CASE
      WHEN lower(rp.vehicle_type) = 'sedan' AND rp.duration_hours = 4 THEN 800
      WHEN lower(rp.vehicle_type) = 'sedan' AND rp.duration_hours = 8 THEN 1600
      WHEN lower(rp.vehicle_type) = 'sedan' AND rp.duration_hours = 12 THEN 2200
      WHEN lower(rp.vehicle_type) = 'suv'   AND rp.duration_hours = 4 THEN 1600
      WHEN lower(rp.vehicle_type) = 'suv'   AND rp.duration_hours = 8 THEN 2200
      WHEN lower(rp.vehicle_type) = 'suv'   AND rp.duration_hours = 12 THEN 3200
      ELSE rp.base_price
    END,
    extra_km_rate = CASE
      WHEN lower(rp.vehicle_type) = 'sedan' THEN 12
      WHEN lower(rp.vehicle_type) = 'suv'   THEN 13.5
      ELSE rp.extra_km_rate
    END,
    extra_hour_rate = CASE
      WHEN lower(rp.vehicle_type) = 'sedan' THEN 125
      WHEN lower(rp.vehicle_type) = 'suv'   THEN 150
      ELSE rp.extra_hour_rate
    END,
    waiting_limit_minutes = 5,
    updated_at = now()
FROM base b
WHERE rp.id = b.id;

-- 2b) Create Bangalore copies from the same base set with Bangalore values
INSERT INTO public.rental_packages (
  name, vehicle_type, duration_hours, included_kilometers, base_price, extra_km_rate, extra_hour_rate,
  cancellation_fee, no_show_fee, waiting_limit_minutes, is_active, created_at, updated_at, zone
)
SELECT
  b.name,
  b.vehicle_type,
  b.duration_hours,
  b.included_kilometers,
  -- base_price by mapping
  CASE
    WHEN lower(b.vehicle_type) = 'sedan' AND b.duration_hours = 4 THEN 950
    WHEN lower(b.vehicle_type) = 'sedan' AND b.duration_hours = 8 THEN 1700
    WHEN lower(b.vehicle_type) = 'sedan' AND b.duration_hours = 12 THEN 2100
    WHEN lower(b.vehicle_type) = 'suv'   AND b.duration_hours = 4 THEN 1900
    WHEN lower(b.vehicle_type) = 'suv'   AND b.duration_hours = 8 THEN 2400
    WHEN lower(b.vehicle_type) = 'suv'   AND b.duration_hours = 12 THEN 2800
    ELSE b.base_price
  END AS base_price,
  CASE
    WHEN lower(b.vehicle_type) = 'sedan' THEN 13
    WHEN lower(b.vehicle_type) = 'suv'   THEN 16.5
    ELSE b.extra_km_rate
  END AS extra_km_rate,
  CASE
    WHEN lower(b.vehicle_type) = 'sedan' THEN 150
    WHEN lower(b.vehicle_type) = 'suv'   THEN 200
    ELSE b.extra_hour_rate
  END AS extra_hour_rate,
  b.cancellation_fee,
  b.no_show_fee,
  5, -- waiting_limit_minutes per screenshot
  b.is_active,
  now(),
  now(),
  'Bangalore' AS zone
FROM base b;

COMMIT;