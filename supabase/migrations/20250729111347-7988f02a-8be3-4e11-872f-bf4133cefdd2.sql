-- Create some sample data for analytics testing if none exists
DO $$
DECLARE
    sample_customer_id uuid;
    sample_driver_id uuid;
    sample_vehicle_id uuid;
    sample_admin_id uuid;
BEGIN
    -- Check if we have any users, if not create some sample data
    IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'customer' LIMIT 1) THEN
        -- Create a sample customer user
        INSERT INTO users (id, role, email, phone_no, full_name, status, created_at)
        VALUES (gen_random_uuid(), 'customer'::user_role_enum, 'customer@example.com', '9876543210', 'Sample Customer', 'active', now() - interval '10 days')
        RETURNING id INTO sample_customer_id;
        
        -- Create customer record
        INSERT INTO customers (id, created_at, loyalty_points)
        VALUES (sample_customer_id, now() - interval '10 days', 150);
    ELSE
        SELECT id INTO sample_customer_id FROM users WHERE role = 'customer' LIMIT 1;
    END IF;
    
    -- Check if we have any drivers, if not create some sample data
    IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'driver' LIMIT 1) THEN
        -- Create a sample driver user
        INSERT INTO users (id, role, email, phone_no, full_name, status, created_at)
        VALUES (gen_random_uuid(), 'driver'::user_role_enum, 'driver@example.com', '9876543211', 'Sample Driver', 'active', now() - interval '15 days')
        RETURNING id INTO sample_driver_id;
        
        -- Create driver record
        INSERT INTO drivers (id, license_number, rating, status, total_rides, created_at)
        VALUES (sample_driver_id, 'DL123456789', 4.5, 'active'::driver_status_enum, 25, now() - interval '15 days');
    ELSE
        SELECT id INTO sample_driver_id FROM users WHERE role = 'driver' LIMIT 1;
    END IF;
    
    -- Check if we have any vehicles, if not create some sample data
    IF NOT EXISTS (SELECT 1 FROM vehicles LIMIT 1) THEN
        INSERT INTO vehicles (id, make, model, year, license_plate, type, status, created_at)
        VALUES (gen_random_uuid(), 'Honda', 'City', 2022, 'MH01AB1234', 'sedan'::vehicle_type_enum, 'active'::vehicle_status_enum, now() - interval '20 days')
        RETURNING id INTO sample_vehicle_id;
    ELSE
        SELECT id INTO sample_vehicle_id FROM vehicles LIMIT 1;
    END IF;
    
    -- Create some sample bookings for analytics if none exist
    IF NOT EXISTS (SELECT 1 FROM bookings LIMIT 1) THEN
        -- Create completed bookings
        INSERT INTO bookings (
            id, user_id, driver_id, vehicle_id, 
            pickup_address, dropoff_address,
            pickup_latitude, pickup_longitude,
            dropoff_latitude, dropoff_longitude,
            fare_amount, distance_km, status, payment_status,
            start_time, end_time, created_at
        ) VALUES 
        (gen_random_uuid(), sample_customer_id, sample_driver_id, sample_vehicle_id,
         'Sample Pickup Location', 'Sample Dropoff Location',
         28.6139, 77.2090, 28.5355, 77.3910,
         350.00, 15.5, 'completed'::booking_status_enum, 'paid'::payment_status_enum,
         now() - interval '5 days', now() - interval '5 days' + interval '30 minutes',
         now() - interval '5 days'
        ),
        (gen_random_uuid(), sample_customer_id, sample_driver_id, sample_vehicle_id,
         'Another Pickup', 'Another Dropoff',
         28.7041, 77.1025, 28.4595, 77.0266,
         280.00, 12.0, 'completed'::booking_status_enum, 'paid'::payment_status_enum,
         now() - interval '3 days', now() - interval '3 days' + interval '25 minutes',
         now() - interval '3 days'
        ),
        (gen_random_uuid(), sample_customer_id, sample_driver_id, sample_vehicle_id,
         'Third Pickup', 'Third Dropoff',
         28.5355, 77.3910, 28.6139, 77.2090,
         420.00, 18.0, 'completed'::booking_status_enum, 'paid'::payment_status_enum,
         now() - interval '1 day', now() - interval '1 day' + interval '35 minutes',
         now() - interval '1 day'
        );
        
        RAISE NOTICE 'Sample data created successfully';
    END IF;
END $$;