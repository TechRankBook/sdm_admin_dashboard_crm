-- First create users for the drivers if they don't exist
INSERT INTO users (id, email, phone, role, full_name) VALUES 
  ('b123ef39-c3cc-4e67-80b3-bc0b8e45f52a', 'rahul.sharma@example.com', '+919876543210', 'driver', 'Rahul Sharma'),
  ('c234ef39-c3cc-4e67-80b3-bc0b8e45f53b', 'priya.singh@example.com', '+919876543211', 'driver', 'Priya Singh'),
  ('d345ef39-c3cc-4e67-80b3-bc0b8e45f54c', 'amit.kumar@example.com', '+919876543212', 'driver', 'Amit Kumar')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;

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

-- Update existing driver with coordinates if missing
UPDATE drivers 
SET 
  current_latitude = 28.6139,
  current_longitude = 77.2090,
  status = 'active'
WHERE current_latitude IS NULL OR current_longitude IS NULL;