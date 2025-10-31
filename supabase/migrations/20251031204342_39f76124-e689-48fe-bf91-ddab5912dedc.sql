-- Add brand color fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#0078D4',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#50E6FF';

COMMENT ON COLUMN public.profiles.primary_color IS 'Primary brand color for games and demos';
COMMENT ON COLUMN public.profiles.secondary_color IS 'Secondary brand color for games and demos';