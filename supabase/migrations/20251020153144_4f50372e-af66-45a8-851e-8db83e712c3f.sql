-- Add accent and background color columns to brand_customizations table
ALTER TABLE public.brand_customizations
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#FF5722',
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#1A1A1A';