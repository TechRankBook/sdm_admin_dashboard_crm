-- First create users for the drivers if they don't exist
INSERT INTO users (id, email, phone, role, name) VALUES 
  ('b123ef39-c3cc-4e67-80b3-bc0b8e45f52a', 'rahul.sharma@example.com', '+919876543210', 'driver', 'Rahul Sharma'),
  ('c234ef39-c3cc-4e67-80b3-bc0b8e45f53b', 'priya.singh@example.com', '+919876543211', 'driver', 'Priya Singh'),
  ('d345ef39-c3cc-4e67-80b3-bc0b8e45f54c', 'amit.kumar@example.com', '+919876543212', 'driver', 'Amit Kumar')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  name = EXCLUDED.name;

-- Then create/update drivers with coordinates
INSERT INTO drivers (
  id, full_name, phone_no, email, license_number, 
  current_latitude, current_longitude, status, rating
) VALUES 
  (
    'b123ef39-c3cc-4e67-80b3-bc0b8e45f52a', 
    'Rahul Sharma', 
    '+91-9876543210', 
    'rahul.sharma@example.com', 
    'DL123456789',
    28.6129, 77.2295, 'active', 4.5
  ),
  (
    'c234ef39-c3cc-4e67-80b3-bc0b8e45f53b', 
    'Priya Singh', 
    '+91-9876543211', 
    'priya.singh@example.com', 
    'DL987654321',
    28.6519, 77.2315, 'active', 4.7
  ),
  (
    'd345ef39-c3cc-4e67-80b3-bc0b8e45f54c', 
    'Amit Kumar', 
    '+91-9876543212', 
    'amit.kumar@example.com', 
    'DL456789123',
    28.5355, 77.3910, 'active', 4.3
  )
ON CONFLICT (id) DO UPDATE SET
  current_latitude = EXCLUDED.current_latitude,
  current_longitude = EXCLUDED.current_longitude,
  status = EXCLUDED.status,
  rating = EXCLUDED.rating;

-- Add demo bookings with proper coordinates  
INSERT INTO bookings (
  id, user_id, driver_id, 
  pickup_address, dropoff_address,
  pickup_latitude, pickup_longitude,
  dropoff_latitude, dropoff_longitude,
  fare_amount, status, created_at
) VALUES 
  (
    'e456ef39-c3cc-4e67-80b3-bc0b8e45f55d',
    (SELECT id FROM users WHERE role = 'customer' LIMIT 1), -- Get first customer
    'b123ef39-c3cc-4e67-80b3-bc0b8e45f52a', -- Rahul Sharma
    'Connaught Place, New Delhi', 
    'India Gate, New Delhi',
    28.6315, 77.2167,
    28.6129, 77.2295,
    250.00, 'started', now() - interval '15 minutes'
  ),
  (
    'f567ef39-c3cc-4e67-80b3-bc0b8e45f56e',
    (SELECT id FROM users WHERE role = 'customer' LIMIT 1),
    'c234ef39-c3cc-4e67-80b3-bc0b8e45f53b', -- Priya Singh
    'Karol Bagh, New Delhi', 
    'Lajpat Nagar, New Delhi',
    28.6519, 77.1908,
    28.5677, 77.2431,
    180.00, 'accepted', now() - interval '5 minutes'
  ),
  (
    'g678ef39-c3cc-4e67-80b3-bc0b8e45f57f',
    (SELECT id FROM users WHERE role = 'customer' LIMIT 1),
    'd345ef39-c3cc-4e67-80b3-bc0b8e45f54c', -- Amit Kumar
    'Dwarka, New Delhi', 
    'Gurgaon Sector 29',
    28.5921, 77.0460,
    28.4595, 77.0266,
    450.00, 'started', now() - interval '30 minutes'
  )
ON CONFLICT (id) DO UPDATE SET
  pickup_latitude = EXCLUDED.pickup_latitude,
  pickup_longitude = EXCLUDED.pickup_longitude,
  dropoff_latitude = EXCLUDED.dropoff_latitude,
  dropoff_longitude = EXCLUDED.dropoff_longitude;

-- Update existing driver with coordinates if missing
UPDATE drivers 
SET 
  current_latitude = 28.6139,
  current_longitude = 77.2090,
  status = 'active'
WHERE current_latitude IS NULL OR current_longitude IS NULL;