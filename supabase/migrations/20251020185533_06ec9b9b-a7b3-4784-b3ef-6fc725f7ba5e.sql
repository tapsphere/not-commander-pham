-- Add animation type tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS mascot_animation_type text DEFAULT 'static' CHECK (mascot_animation_type IN ('static', 'gif', 'lottie', 'sprite'));