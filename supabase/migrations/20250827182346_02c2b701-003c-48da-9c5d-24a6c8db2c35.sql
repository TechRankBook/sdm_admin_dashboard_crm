-- Update existing service type from city_ride to ride_later
UPDATE public.service_types 
SET 
  name = 'ride_later',
  display_name = 'Ride Later'
WHERE name = 'city_ride';

-- Update any existing bookings that reference city_ride
UPDATE public.bookings 
SET service_type = 'ride_later' 
WHERE service_type = 'city_ride';

-- Update any existing pricing rules
UPDATE public.pricing_rules 
SET service_type_id = (SELECT id FROM public.service_types WHERE name = 'ride_later')
WHERE service_type_id = (SELECT id FROM public.service_types WHERE name = 'city_ride');

-- Update any existing zone pricing
UPDATE public.zone_pricing 
SET service_type_id = (SELECT id FROM public.service_types WHERE name = 'ride_later')
WHERE service_type_id = (SELECT id FROM public.service_types WHERE name = 'city_ride');

-- Update any existing rental packages
UPDATE public.rental_packages 
SET service_type_id = (SELECT id FROM public.service_types WHERE name = 'ride_later')
WHERE service_type_id = (SELECT id FROM public.service_types WHERE name = 'city_ride');