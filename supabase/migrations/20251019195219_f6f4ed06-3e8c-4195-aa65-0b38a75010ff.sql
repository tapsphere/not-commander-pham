-- Add is_active field to master_competencies
ALTER TABLE master_competencies 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Mark the 8 official competencies as active
UPDATE master_competencies 
SET is_active = true 
WHERE name IN (
  'Analytical Thinking',
  'Creative Thinking',
  'Critical Reasoning',
  'Problem Solving',
  'Emotional Intelligence & Self-Management',
  'Communication & Interpersonal Fluency',
  'Adaptive Mindset & Resilience',
  'Ethical & Purpose-Driven Leadership'
);

-- Mark all others as archived/inactive
UPDATE master_competencies 
SET is_active = false 
WHERE name NOT IN (
  'Analytical Thinking',
  'Creative Thinking',
  'Critical Reasoning',
  'Problem Solving',
  'Emotional Intelligence & Self-Management',
  'Communication & Interpersonal Fluency',
  'Adaptive Mindset & Resilience',
  'Ethical & Purpose-Driven Leadership'
);