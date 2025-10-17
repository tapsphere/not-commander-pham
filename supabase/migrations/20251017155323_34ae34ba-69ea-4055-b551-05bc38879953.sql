-- Add game_loop column to sub_competencies table to store the evidence cycle separately from game_mechanic
ALTER TABLE public.sub_competencies
ADD COLUMN game_loop text;