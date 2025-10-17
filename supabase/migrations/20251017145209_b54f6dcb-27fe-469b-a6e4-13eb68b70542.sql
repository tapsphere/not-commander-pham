-- Add display_order column to sub_competencies
ALTER TABLE sub_competencies ADD COLUMN display_order INTEGER;

-- Set the correct order for Analytical Thinking sub-competencies
UPDATE sub_competencies SET display_order = 1 WHERE statement = 'Apply logical reasoning to multi-constraint business problems';
UPDATE sub_competencies SET display_order = 2 WHERE statement = 'Identify and evaluate trade-offs in operational scenarios';
UPDATE sub_competencies SET display_order = 3 WHERE statement = 'Distinguish valid solutions under incomplete or contradictory inputs';
UPDATE sub_competencies SET display_order = 4 WHERE statement = 'Adapt reasoning under time pressure and stakeholder conflicts';
UPDATE sub_competencies SET display_order = 5 WHERE statement = 'Interpret data patterns to support decision-making';
UPDATE sub_competencies SET display_order = 6 WHERE statement = 'Communicate conclusions aligned with defined KPIs';