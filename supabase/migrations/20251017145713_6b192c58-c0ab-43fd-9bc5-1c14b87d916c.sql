-- Add PlayOps fields to sub_competencies table
ALTER TABLE sub_competencies 
ADD COLUMN validator_type TEXT,
ADD COLUMN action_cue TEXT,
ADD COLUMN game_mechanic TEXT,
ADD COLUMN scoring_formula_level_1 TEXT,
ADD COLUMN scoring_formula_level_2 TEXT,
ADD COLUMN scoring_formula_level_3 TEXT;

-- Update Analytical Thinking sub-competencies with PlayOps data
UPDATE sub_competencies 
SET 
  validator_type = 'Scenario-Based Simulation',
  action_cue = 'Allocate resources within time and budget limits to reach optimal outcome.',
  game_mechanic = 'Timed multi-constraint puzzle',
  scoring_formula_level_1 = '<70%',
  scoring_formula_level_2 = '≥85%',
  scoring_formula_level_3 = '≥95% + edge case'
WHERE statement = 'Apply logical reasoning to multi-constraint business problems';

UPDATE sub_competencies 
SET 
  validator_type = 'Case Analysis',
  action_cue = 'Choose between multiple conflicting options under pressure.',
  game_mechanic = 'Decision tree / branching analysis',
  scoring_formula_level_1 = 'Misses ≥2 key factors',
  scoring_formula_level_2 = 'Balances ≥4',
  scoring_formula_level_3 = 'Justifies trade-offs w/ rationale'
WHERE statement = 'Identify and evaluate trade-offs in operational scenarios';

UPDATE sub_competencies 
SET 
  validator_type = 'Data Analysis',
  action_cue = 'Infer best solution when key data is missing or conflicting.',
  game_mechanic = 'Data filter puzzle / noise vs signal',
  scoring_formula_level_1 = 'Missed key inference',
  scoring_formula_level_2 = 'Correct inference w/ retries',
  scoring_formula_level_3 = 'First-pass correct inference'
WHERE statement = 'Distinguish valid solutions under incomplete or contradictory inputs';

UPDATE sub_competencies 
SET 
  validator_type = 'Scenario-Based Simulation',
  action_cue = 'Complete task while variables (rules) shift mid-round.',
  game_mechanic = 'Rule-flip timed simulation',
  scoring_formula_level_1 = 'Abandons task',
  scoring_formula_level_2 = 'Adjusts partially',
  scoring_formula_level_3 = 'Adapts successfully'
WHERE statement = 'Adapt reasoning under time pressure and stakeholder conflicts';

UPDATE sub_competencies 
SET 
  validator_type = 'Data Analysis',
  action_cue = 'Identify and label trends from data visualization.',
  game_mechanic = 'Pattern recognition mini-game',
  scoring_formula_level_1 = '<70% accuracy',
  scoring_formula_level_2 = '≥85%',
  scoring_formula_level_3 = '≥95% + handles anomalies'
WHERE statement = 'Interpret data patterns to support decision-making';

UPDATE sub_competencies 
SET 
  validator_type = 'Communication Product',
  action_cue = 'Write or select the summary that best aligns results to KPIs.',
  game_mechanic = 'Persuasion / clarity validator',
  scoring_formula_level_1 = '<70% match',
  scoring_formula_level_2 = '≥85%',
  scoring_formula_level_3 = '≥95% match to KPIs'
WHERE statement = 'Communicate conclusions aligned with defined KPIs';