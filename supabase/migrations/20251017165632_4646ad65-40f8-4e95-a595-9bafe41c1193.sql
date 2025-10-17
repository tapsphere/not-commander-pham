-- Delete old Analytical Thinking sub-competencies
-- Keeping only the 6 updated from the Excel sheet

DELETE FROM public.sub_competencies
WHERE statement IN (
  'Apply logical reasoning to multi-constraint business problems',
  'Identify and evaluate trade-offs in operational scenarios',
  'Distinguish valid solutions under incomplete or contradictory inputs',
  'Adapt reasoning under time pressure and stakeholder conflicts',
  'Interpret data patterns to support decision-making',
  'Communicate conclusions aligned with defined KPIs'
);