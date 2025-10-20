-- Add design settings to game templates for per-game customization
ALTER TABLE public.game_templates 
ADD COLUMN IF NOT EXISTS design_settings jsonb DEFAULT NULL;

COMMENT ON COLUMN public.game_templates.design_settings IS 'Optional per-game design overrides (colors, font, avatar). If null, uses creator profile defaults';