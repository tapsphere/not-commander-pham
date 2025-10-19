-- Update the handle_new_user function to assign a default 'creator' role
-- This ensures new signups can create templates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Player')
  );
  
  -- Create default work preferences
  INSERT INTO public.work_preferences (user_id, work_type, preferred_industries)
  VALUES (
    NEW.id,
    ARRAY['remote', 'in-person', 'hybrid'],
    ARRAY['technology', 'marketing', 'operations']
  );
  
  -- Assign default creator role so users can create templates
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'creator'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$function$;