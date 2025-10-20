-- Add cover photo fields to tables
ALTER TABLE public.brand_customizations
ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

ALTER TABLE public.game_templates
ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- Add comment for recommended size
COMMENT ON COLUMN public.brand_customizations.cover_photo_url IS 'Cover photo for game. Recommended size: 1200x630px (16:9 aspect ratio)';
COMMENT ON COLUMN public.game_templates.cover_photo_url IS 'Cover photo for template. Recommended size: 1200x630px (16:9 aspect ratio)';