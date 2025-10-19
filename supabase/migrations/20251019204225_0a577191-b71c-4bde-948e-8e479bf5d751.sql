-- Delete user lian@metahug.io and all associated data
DO $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Find the user ID
  SELECT id INTO user_uuid FROM auth.users WHERE email = 'lian@metahug.io';
  
  IF user_uuid IS NOT NULL THEN
    -- Delete from public tables first (cascade will handle most)
    DELETE FROM public.profiles WHERE user_id = user_uuid;
    DELETE FROM public.user_roles WHERE user_id = user_uuid;
    DELETE FROM public.work_preferences WHERE user_id = user_uuid;
    DELETE FROM public.aria_conversations WHERE user_id = user_uuid;
    
    -- Finally delete the auth user (this will cascade to identities, sessions, etc.)
    DELETE FROM auth.users WHERE id = user_uuid;
    
    RAISE NOTICE 'User deleted successfully: %', user_uuid;
  ELSE
    RAISE NOTICE 'User not found: lian@metahug.io';
  END IF;
END $$;