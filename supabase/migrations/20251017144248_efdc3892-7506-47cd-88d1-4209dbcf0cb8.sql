-- Fix RLS policy for sub_competencies to allow public access like master_competencies
DROP POLICY IF EXISTS "Anyone can view sub-competencies" ON sub_competencies;

CREATE POLICY "Anyone can view sub-competencies"
  ON sub_competencies
  FOR SELECT
  TO public
  USING (true);