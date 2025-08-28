-- Create per-zone copies of existing rental packages for Bangalore and Mysuru based on provided rate table
-- This script assumes existing packages are generic; it will duplicate into Bangalore and Mysuru with zone-specific prices.
-- Adjusts only known Sedan/SUV package names: '4hr / 40km', '8hr / 80km', '12hr / 120km'

WITH vt AS (
  SELECT id, name FROM public.vehicle_types
), base AS (
  SELECT id, name, vehicle_type, duration_hours, included_kilometers, is_active
  FROM public.rental_packages
  WHERE name IN ('4hr / 40km', '8hr / 80km', '12hr / 120km')
)
-- Insert Bangalore rows
INSERT INTO public.rental_packages (
  name, vehicle_type, duration_hours, included_kilometers,
  base_price, extra_km_rate, extra_hour_rate, cancellation_fee,
  no_show_fee, waiting_limit_minutes, is_active, zone
)
SELECT
  b.name,
  b.vehicle_type,
  b.duration_hours,
  b.included_kilometers,
  CASE
    WHEN b.vehicle_type ILIKE '%sedan%' AND b.name = '4hr / 40km' THEN 950
    WHEN b.vehicle_type ILIKE '%sedan%' AND b.name = '8hr / 80km' THEN 1700
    WHEN b.vehicle_type ILIKE '%sedan%' AND b.name = '12hr / 120km' THEN 2100
    WHEN b.vehicle_type ILIKE '%suv%'   AND b.name = '4hr / 40km' THEN 1900
    WHEN b.vehicle_type ILIKE '%suv%'   AND b.name = '8hr / 80km' THEN 2400
    WHEN b.vehicle_type ILIKE '%suv%'   AND b.name = '12hr / 120km' THEN 2800
  END AS base_price,
  CASE
    WHEN b.vehicle_type ILIKE '%sedan%' THEN 13
    WHEN b.vehicle_type ILIKE '%suv%'   THEN 16.5
  END AS extra_km_rate,
  CASE
    WHEN b.vehicle_type ILIKE '%sedan%' THEN 150
    WHEN b.vehicle_type ILIKE '%suv%'   THEN 200
  END AS extra_hour_rate,
  0 AS cancellation_fee,
  0 AS no_show_fee,
  5 AS waiting_limit_minutes,
  b.is_active,
  'Bangalore' AS zone
FROM base b
ON CONFLICT DO NOTHING;

-- Insert Mysuru rows
INSERT INTO public.rental_packages (
  name, vehicle_type, duration_hours, included_kilometers,
  base_price, extra_km_rate, extra_hour_rate, cancellation_fee,
  no_show_fee, waiting_limit_minutes, is_active, zone
)
SELECT
  b.name,
  b.vehicle_type,
  b.duration_hours,
  b.included_kilometers,
  CASE
    WHEN b.vehicle_type ILIKE '%sedan%' AND b.name = '4hr / 40km' THEN 800
    WHEN b.vehicle_type ILIKE '%sedan%' AND b.name = '8hr / 80km' THEN 1600
    WHEN b.vehicle_type ILIKE '%sedan%' AND b.name = '12hr / 120km' THEN 2200
    WHEN b.vehicle_type ILIKE '%suv%'   AND b.name = '4hr / 40km' THEN 1600
    WHEN b.vehicle_type ILIKE '%suv%'   AND b.name = '8hr / 80km' THEN 2200
    WHEN b.vehicle_type ILIKE '%suv%'   AND b.name = '12hr / 120km' THEN 3200
  END AS base_price,
  CASE
    WHEN b.vehicle_type ILIKE '%sedan%' THEN 12
    WHEN b.vehicle_type ILIKE '%suv%'   THEN 13.5
  END AS extra_km_rate,
  CASE
    WHEN b.vehicle_type ILIKE '%sedan%' THEN 125
    WHEN b.vehicle_type ILIKE '%suv%'   THEN 150
  END AS extra_hour_rate,
  0 AS cancellation_fee,
  0 AS no_show_fee,
  5 AS waiting_limit_minutes,
  b.is_active,
  'Mysuru' AS zone
FROM base b
ON CONFLICT DO NOTHING;