-- Add zone column to rental_packages and backfill existing data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rental_packages' AND column_name = 'zone'
  ) THEN
    ALTER TABLE public.rental_packages ADD COLUMN zone TEXT;
  END IF;
END $$;

-- Helpful index for filtering by zone
CREATE INDEX IF NOT EXISTS idx_rental_packages_zone ON public.rental_packages (zone);

-- RLS remains unchanged (table already has RLS enabled elsewhere)