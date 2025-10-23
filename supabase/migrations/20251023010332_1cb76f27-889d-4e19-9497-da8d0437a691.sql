-- Add RLS policies for validators_runtime table

-- Allow creators to insert runtime validators for their own templates
CREATE POLICY "Creators can insert runtime validators for their templates"
ON validators_runtime
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM game_templates
    WHERE game_templates.id = validators_runtime.template_id
    AND game_templates.creator_id = auth.uid()
  )
);

-- Allow creators to update runtime validators for their own templates
CREATE POLICY "Creators can update runtime validators for their templates"
ON validators_runtime
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM game_templates
    WHERE game_templates.id = validators_runtime.template_id
    AND game_templates.creator_id = auth.uid()
  )
);

-- Allow everyone to read validators_runtime (needed for playing games)
CREATE POLICY "Anyone can read validators_runtime"
ON validators_runtime
FOR SELECT
USING (true);