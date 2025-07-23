-- Fix security issues by enabling RLS on missing tables

-- Enable RLS on tables that need it
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Check which other tables need RLS - let me check what specific tables are missing RLS
-- Based on the error, we need to find which tables don't have RLS enabled
-- Let me enable RLS on core tables that might be missing it

-- Enable RLS on any other tables that might be missing it
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t
        LEFT JOIN pg_class c ON c.relname = t.table_name
        WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        AND c.relrowsecurity = false
        AND t.table_name NOT IN ('_realtime_schema_migrations')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    END LOOP;
END $$;