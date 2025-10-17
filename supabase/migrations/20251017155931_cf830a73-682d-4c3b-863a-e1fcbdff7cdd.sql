-- Update Analytical Thinking sub-competencies with separated game_mechanic and game_loop
-- First sub-competency
UPDATE public.sub_competencies
SET 
  game_mechanic = 'Resource Allocation Puzzle (performance task)',
  game_loop = 'Input → Allocate resources → Rule Flip (edge case) → Adjust → Submit → Feedback'
WHERE statement = 'Apply logical reasoning to multi-constraint business problems';

-- Second sub-competency
UPDATE public.sub_competencies
SET 
  game_mechanic = 'Ranking / Prioritization Game (analytical reasoning)',
  game_loop = 'Read scenario → Rank KPIs → Constraint Change → Re-rank → Submit → Feedback'
WHERE statement = 'Identify and evaluate trade-offs in operational scenarios';

-- Third sub-competency
UPDATE public.sub_competencies
SET 
  game_mechanic = 'Error-Detection / Diagnosis Task (diagnostic assessment)',
  game_loop = 'Scan data → Flag issues → Select solution → Confirm → Feedback'
WHERE statement = 'Distinguish valid solutions under incomplete or contradictory inputs';

-- Fourth sub-competency
UPDATE public.sub_competencies
SET 
  game_mechanic = 'Timed Decision-Tree Simulation (scenario simulation)',
  game_loop = 'Scenario intro → Select decision → Rule Flip mid-timer → Adjust → Submit → Feedback'
WHERE statement = 'Adapt reasoning under time pressure and stakeholder conflicts';

-- Fifth sub-competency
UPDATE public.sub_competencies
SET 
  game_mechanic = 'Pattern Recognition / Data Analysis Challenge (applied analysis)',
  game_loop = 'View chart → Highlight pattern → Select insight → Submit → Feedback'
WHERE statement = 'Interpret data patterns to support decision-making';

-- Sixth sub-competency
UPDATE public.sub_competencies
SET 
  game_mechanic = 'Report-Builder / KPI Matching Mini-Game (reflective response)',
  game_loop = 'Read prompt → Select KPI → Compose summary → Submit → Feedback'
WHERE statement = 'Communicate conclusions aligned with defined KPIs';