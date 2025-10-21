-- Fix the handle_new_user trigger to not insert a default role
-- The signup flow will handle role assignment instead
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  
  -- Role will be inserted by the signup flow, not here
  -- This prevents duplicate key violations
  
  RETURN NEW;
END;
$$;