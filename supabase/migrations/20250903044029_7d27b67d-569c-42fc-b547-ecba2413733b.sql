-- Create missing admin record for existing admin user
-- This should have been created automatically but seems to be missing

INSERT INTO public.admins (
    id,
    can_approve_bookings,
    assigned_region,
    created_at,
    updated_at
) VALUES (
    'ddbd883a-3998-4ce4-a436-a9634c94b08f',
    true,
    'All Regions',
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

-- Also ensure any other admin users have corresponding admin records
INSERT INTO public.admins (id, can_approve_bookings, assigned_region, created_at, updated_at)
SELECT 
    u.id,
    true as can_approve_bookings,
    'All Regions' as assigned_region,
    u.created_at,
    u.updated_at
FROM public.users u
WHERE u.role = 'admin' 
AND NOT EXISTS (SELECT 1 FROM public.admins a WHERE a.id = u.id)
ON CONFLICT (id) DO NOTHING;