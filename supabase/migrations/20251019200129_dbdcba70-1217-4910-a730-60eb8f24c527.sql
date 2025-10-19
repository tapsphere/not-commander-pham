-- Add industry/context field to course_gamification table
ALTER TABLE course_gamification 
ADD COLUMN IF NOT EXISTS industry TEXT;