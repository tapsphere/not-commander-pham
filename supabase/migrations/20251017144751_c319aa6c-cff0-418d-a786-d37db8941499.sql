-- Update existing competency to just "Analytical Thinking"
UPDATE master_competencies 
SET name = 'Analytical Thinking'
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Add the other 3 competencies
INSERT INTO master_competencies (id, name, cbe_category, departments)
VALUES 
  ('b2c3d4e5-f6a7-8901-bcde-f23456789012', 'Creative Thinking', 'Critical Thinking & Problem Solving', ARRAY['Operations','Data/BI','Strategy','Product','Finance']),
  ('c3d4e5f6-a7b8-9012-cdef-234567890123', 'Critical Reasoning', 'Critical Thinking & Problem Solving', ARRAY['Operations','Data/BI','Strategy','Product','Finance']),
  ('d4e5f6a7-b8c9-0123-def2-345678901234', 'Problem Solving', 'Critical Thinking & Problem Solving', ARRAY['Operations','Data/BI','Strategy','Product','Finance']);

-- Delete the other competencies
DELETE FROM master_competencies 
WHERE id IN (
  'f41a62e0-6cbd-4284-92c7-dfcdcb0d67c5',
  '85615225-88ee-4395-8a62-327412a23b6d',
  '89af2614-9650-4f60-a040-c9051c60e048',
  '2b152a70-ae7e-4d52-be27-ebd42f4079b1'
);