-- Delete incorrect sub-competencies and insert correct ones from spreadsheet

DO $$
DECLARE
  analytical_thinking_id uuid;
BEGIN
  -- Get the competency_id for Analytical Thinking
  SELECT id INTO analytical_thinking_id
  FROM master_competencies
  WHERE name = 'Analytical Thinking';

  -- Delete all existing sub-competencies for Analytical Thinking
  DELETE FROM sub_competencies
  WHERE competency_id = analytical_thinking_id;

  -- Insert the 6 correct sub-competencies from the spreadsheet
  
  -- 1. Apply logical reasoning to multi-constraint business problems
  INSERT INTO sub_competencies (
    competency_id, 
    statement, 
    action_cue, 
    game_mechanic, 
    game_loop, 
    validator_type,
    display_order,
    scoring_formula_level_1,
    scoring_formula_level_2,
    scoring_formula_level_3
  ) VALUES (
    analytical_thinking_id,
    'Apply logical reasoning to multi-constraint business problems',
    'Allocate resources within time and budget limits to reach optimal outcome.',
    'Resource Allocation Puzzle (performance task)',
    'Input → Allocate resources → Rule Flip (edge case) → Adjust → Submit → Feedback',
    'Scenario-Based Simulation',
    1,
    '<80',
    '80–94',
    '≥95 + Edge'
  );

  -- 2. Identify and evaluate trade-offs in operational scenarios
  INSERT INTO sub_competencies (
    competency_id, 
    statement, 
    action_cue, 
    game_mechanic, 
    game_loop, 
    validator_type,
    display_order,
    scoring_formula_level_1,
    scoring_formula_level_2,
    scoring_formula_level_3
  ) VALUES (
    analytical_thinking_id,
    'Identify and evaluate trade-offs in operational scenarios',
    'Choose between multiple conflicting options under pressure.',
    'Ranking / Prioritization Game (analytical reasoning)',
    'Read scenario → Rank KPIs → Constraint Change → Re-rank → Submit → Feedback',
    'Case Analysis',
    2,
    '<80',
    '80–94',
    '≥95 + Edge'
  );

  -- 3. Distinguish valid solutions under incomplete or contradictory inputs
  INSERT INTO sub_competencies (
    competency_id, 
    statement, 
    action_cue, 
    game_mechanic, 
    game_loop, 
    validator_type,
    display_order,
    scoring_formula_level_1,
    scoring_formula_level_2,
    scoring_formula_level_3
  ) VALUES (
    analytical_thinking_id,
    'Distinguish valid solutions under incomplete or contradictory inputs',
    'Infer best solution when key data is missing or conflicting.',
    'Error-Detection / Diagnosis Task (diagnostic assessment)',
    'Scan data → Flag issues → Select solution → Confirm → Feedback',
    'Data Analysis',
    3,
    '<80',
    '80–94',
    '≥95 + Edge'
  );

  -- 4. Adapt reasoning under time pressure and stakeholder conflicts
  INSERT INTO sub_competencies (
    competency_id, 
    statement, 
    action_cue, 
    game_mechanic, 
    game_loop, 
    validator_type,
    display_order,
    scoring_formula_level_1,
    scoring_formula_level_2,
    scoring_formula_level_3
  ) VALUES (
    analytical_thinking_id,
    'Adapt reasoning under time pressure and stakeholder conflicts',
    'Complete task while variables (rules) shift mid-round.',
    'Timed Decision-Tree Simulation (scenario simulation)',
    'Scenario intro → Select decision → Rule Flip mid-timer → Adjust → Submit → Feedback',
    'Scenario-Based Simulation',
    4,
    '<80',
    '80–94',
    '≥95 + Edge'
  );

  -- 5. Interpret data patterns to support decision-making
  INSERT INTO sub_competencies (
    competency_id, 
    statement, 
    action_cue, 
    game_mechanic, 
    game_loop, 
    validator_type,
    display_order,
    scoring_formula_level_1,
    scoring_formula_level_2,
    scoring_formula_level_3
  ) VALUES (
    analytical_thinking_id,
    'Interpret data patterns to support decision-making',
    'Identify and label trends from data visualization.',
    'Pattern Recognition / Data Analysis Challenge (applied analysis)',
    'View chart → Highlight pattern → Select insight → Submit → Feedback',
    'Data Analysis',
    5,
    '<80',
    '80–94',
    '≥95 + Edge'
  );

  -- 6. Communicate conclusions aligned with defined KPIs
  INSERT INTO sub_competencies (
    competency_id, 
    statement, 
    action_cue, 
    game_mechanic, 
    game_loop, 
    validator_type,
    display_order,
    scoring_formula_level_1,
    scoring_formula_level_2,
    scoring_formula_level_3
  ) VALUES (
    analytical_thinking_id,
    'Communicate conclusions aligned with defined KPIs',
    'Write or select the summary that best aligns results to KPIs.',
    'Report-Builder / KPI Matching Mini-Game (reflective response)',
    'Read prompt → Select KPI → Compose summary → Submit → Feedback',
    'Communication Product',
    6,
    '<80',
    '80–94',
    '≥95 + Edge'
  );

END $$;