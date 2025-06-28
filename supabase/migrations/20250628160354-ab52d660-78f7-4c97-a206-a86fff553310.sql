
-- First, let's ensure we have the proper structure for driver documents
-- Add KYC status and document URLs to drivers table if not already present
ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS kyc_status text DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected', 'resubmission_requested')),
ADD COLUMN IF NOT EXISTS license_document_url text,
ADD COLUMN IF NOT EXISTS id_proof_document_url text,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Create storage buckets for driver-related files
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('drivers-profile-pictures', 'drivers-profile-pictures', true),
  ('drivers-kyc-documents', 'drivers-kyc-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage buckets
CREATE POLICY "Allow public read access to driver profile pictures" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'drivers-profile-pictures');

CREATE POLICY "Allow authenticated users to upload driver profile pictures" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'drivers-profile-pictures' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update driver profile pictures" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'drivers-profile-pictures' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete driver profile pictures" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'drivers-profile-pictures' AND auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to driver KYC documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'drivers-kyc-documents');

CREATE POLICY "Allow authenticated users to upload driver KYC documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'drivers-kyc-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update driver KYC documents" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'drivers-kyc-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete driver KYC documents" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'drivers-kyc-documents' AND auth.role() = 'authenticated');

-- Enable realtime for drivers table to sync status changes
ALTER TABLE public.drivers REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;

-- Create a function to get driver's ride history
CREATE OR REPLACE FUNCTION public.get_driver_rides(driver_uuid uuid)
RETURNS TABLE (
  id uuid,
  pickup_address text,
  dropoff_address text,
  fare_amount numeric,
  status booking_status_enum,
  created_at timestamp with time zone,
  start_time timestamp with time zone,
  end_time timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.pickup_address,
    b.dropoff_address,
    b.fare_amount,
    b.status,
    b.created_at,
    b.start_time,
    b.end_time
  FROM public.bookings b
  WHERE b.driver_id = driver_uuid
  ORDER BY b.created_at DESC;
END;
$$;
