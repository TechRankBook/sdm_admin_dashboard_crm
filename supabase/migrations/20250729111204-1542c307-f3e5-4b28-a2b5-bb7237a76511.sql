-- Let's also create some sample data to make sure analytics work
-- First, let's check if the get_user_role function is working properly

-- Add SET search_path to the get_user_role function for security
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
 RETURNS user_role_enum
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    user_role user_role_enum;
BEGIN
    SELECT role INTO user_role FROM public.users WHERE id = user_uuid;
    RETURN user_role;
END;
$function$;

-- Fix the update_admin_setting function with proper search path
CREATE OR REPLACE FUNCTION public.update_admin_setting(p_category text, p_setting_key text, p_setting_value jsonb, p_updated_by uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Check if user is admin
  IF get_user_role(p_updated_by) != 'admin'::user_role_enum THEN
    RAISE EXCEPTION 'Only admins can update settings';
  END IF;

  UPDATE public.admin_settings 
  SET 
    setting_value = p_setting_value,
    updated_at = now(),
    updated_by = p_updated_by
  WHERE category = p_category AND setting_key = p_setting_key;

  RETURN FOUND;
END;
$function$;

-- Fix the get_settings_by_category function with proper search path
CREATE OR REPLACE FUNCTION public.get_settings_by_category(category_name text)
 RETURNS TABLE(setting_key text, setting_value jsonb, setting_type text, display_name text, description text, is_active boolean)
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    s.setting_key,
    s.setting_value,
    s.setting_type,
    s.display_name,
    s.description,
    s.is_active
  FROM public.admin_settings s
  WHERE s.category = category_name AND s.is_active = true
  ORDER BY s.display_name;
END;
$function$;