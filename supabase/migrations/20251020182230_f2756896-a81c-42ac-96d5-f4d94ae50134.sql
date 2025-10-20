-- Add design preference columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS design_palette jsonb DEFAULT '{
  "primary": "#C8DBDB",
  "secondary": "#6C8FA4",
  "accent": "#2D5556",
  "background": "#F5EDD3",
  "highlight": "#F0C7A0",
  "text": "#2D5556",
  "font": "Inter, sans-serif"
}'::jsonb;

COMMENT ON COLUMN public.profiles.design_palette IS 'Stores creator color palette and font preferences for their games';