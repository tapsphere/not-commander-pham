-- Add game mascot and particle effect defaults to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS game_avatar_url text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS default_particle_effect text DEFAULT 'sparkles';

COMMENT ON COLUMN public.profiles.game_avatar_url IS 'Default mascot/avatar image that appears inside games (animals, characters, icons)';
COMMENT ON COLUMN public.profiles.default_particle_effect IS 'Default particle effect for games: sparkles, coins, stars, hearts, confetti, lightning';