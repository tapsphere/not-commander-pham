-- Add avatar and particle effect columns to brand_customizations
ALTER TABLE public.brand_customizations
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS particle_effect text DEFAULT 'sparkles';