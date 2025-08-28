-- Seed pricing_rules for Airport Taxi and City Ride (ride_later) with zone-based values
BEGIN;

-- Map service IDs
WITH svc AS (
  SELECT id, name FROM public.service_types WHERE name IN ('airport','ride_later')
),
vals AS (
  SELECT * FROM (
    VALUES
      -- Sedan (Tata XpressT EV)
      ('sedan','Bangalore', 99::numeric, 14::numeric, 1.50::numeric, 299::numeric, 1.0::numeric, 100::numeric, 150::numeric, 2.0::numeric, 5::int),
      ('sedan','Mysuru',   99,           12,           1.20,           249,           1.0,           70,            120,          1.5,           5),
      -- SUV (BYD EMAX 7 EV)
      ('suv',  'Bangalore',119,          19,           2.00,           369,           1.0,           125,           175,          2.5,           5),
      ('suv',  'Mysuru',  109,          18,           1.75,           319,           1.0,           100,           140,          2.0,           5)
  ) AS t(vehicle_type, zone, base_fare, per_km_rate, per_minute_rate, minimum_fare, surge_multiplier, cancellation_fee, no_show_fee, waiting_charges_per_minute, free_waiting_time_minutes)
)
INSERT INTO public.pricing_rules (
  service_type_id, vehicle_type, zone, base_fare, per_km_rate, per_minute_rate,
  minimum_fare, surge_multiplier, cancellation_fee, no_show_fee,
  waiting_charges_per_minute, free_waiting_time_minutes, is_active, created_at, updated_at
)
SELECT s.id, v.vehicle_type, v.zone, v.base_fare, v.per_km_rate, v.per_minute_rate,
       v.minimum_fare, v.surge_multiplier, v.cancellation_fee, v.no_show_fee,
       v.waiting_charges_per_minute, v.free_waiting_time_minutes, true, now(), now()
FROM svc s
CROSS JOIN vals v
ON CONFLICT DO NOTHING;

COMMIT;