-- Remove duplicate sub-competencies for Analytical Thinking / Critical Reasoning
-- Keep only one of each unique statement

DELETE FROM sub_competencies 
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id, 
      ROW_NUMBER() OVER (PARTITION BY statement, competency_id ORDER BY created_at ASC) as rn
    FROM sub_competencies
    WHERE competency_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  ) t
  WHERE rn > 1
);