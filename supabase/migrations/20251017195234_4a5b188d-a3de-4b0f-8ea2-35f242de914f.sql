-- Update Analytical Thinking sub-competencies with correct data from spreadsheet

-- Get the competency_id for Analytical Thinking
DO $$
DECLARE
  analytical_thinking_id uuid;
BEGIN
  SELECT id INTO analytical_thinking_id
  FROM master_competencies
  WHERE name = 'Analytical Thinking';

  -- Update each sub-competency with the correct data
  
  -- 1. Apply logical reasoning to multi-constraint business problems
  UPDATE sub_competencies
  SET 
    action_cue = 'Allocate resources within time and budget limits to reach optimal outcome.',
    game_mechanic = 'Resource Allocation Puzzle (performance task)',
    game_loop = 'Input → Allocate resources → Rule Flip (edge case) → Adjust → Submit → Feedback',
    validator_type = 'Scenario-Based Simulation',
    display_order = 1
  WHERE competency_id = analytical_thinking_id
    AND statement = 'Apply logical reasoning to multi-constraint business problems';

  -- 2. Identify and evaluate trade-offs in operational scenarios
  UPDATE sub_competencies
  SET 
    action_cue = 'Choose between multiple conflicting options under pressure.',
    game_mechanic = 'Ranking / Prioritization Game (analytical reasoning)',
    game_loop = 'Read scenario → Rank KPIs → Constraint Change → Re-rank → Submit → Feedback',
    validator_type = 'Case Analysis',
    display_order = 2
  WHERE competency_id = analytical_thinking_id
    AND statement = 'Identify and evaluate trade-offs in operational scenarios';

  -- 3. Distinguish valid solutions under incomplete or contradictory inputs
  UPDATE sub_competencies
  SET 
    action_cue = 'Infer best solution when key data is missing or conflicting.',
    game_mechanic = 'Error-Detection / Diagnosis Task (diagnostic assessment)',
    game_loop = 'Scan data → Flag issues → Select solution → Confirm → Feedback',
    validator_type = 'Data Analysis',
    display_order = 3
  WHERE competency_id = analytical_thinking_id
    AND statement = 'Distinguish valid solutions under incomplete or contradictory inputs';

  -- 4. Adapt reasoning under time pressure and stakeholder conflicts
  UPDATE sub_competencies
  SET 
    action_cue = 'Complete task while variables (rules) shift mid-round.',
    game_mechanic = 'Timed Decision-Tree Simulation (scenario simulation)',
    game_loop = 'Scenario intro → Select decision → Rule Flip mid-timer → Adjust → Submit → Feedback',
    validator_type = 'Scenario-Based Simulation',
    display_order = 4
  WHERE competency_id = analytical_thinking_id
    AND statement = 'Adapt reasoning under time pressure and stakeholder conflicts';

  -- 5. Interpret data patterns to support decision-making
  UPDATE sub_competencies
  SET 
    action_cue = 'Identify and label trends from data visualization.',
    game_mechanic = 'Pattern Recognition / Data Analysis Challenge (applied analysis)',
    game_loop = 'View chart → Highlight pattern → Select insight → Submit → Feedback',
    validator_type = 'Data Analysis',
    display_order = 5
  WHERE competency_id = analytical_thinking_id
    AND statement = 'Interpret data patterns to support decision-making';

  -- 6. Communicate conclusions aligned with defined KPIs
  UPDATE sub_competencies
  SET 
    action_cue = 'Write or select the summary that best aligns results to KPIs.',
    game_mechanic = 'Report-Builder / KPI Matching Mini-Game (reflective response)',
    game_loop = 'Read prompt → Select KPI → Compose summary → Submit → Feedback',
    validator_type = 'Communication Product',
    display_order = 6
  WHERE competency_id = analytical_thinking_id
    AND statement = 'Communicate conclusions aligned with defined KPIs';

END $$;