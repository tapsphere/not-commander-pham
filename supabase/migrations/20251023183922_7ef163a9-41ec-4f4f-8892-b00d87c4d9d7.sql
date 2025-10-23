-- Populate sub_competencies with PlayOps Framework Tab 3 data
-- Source: CBEN_PlayOps_Framework_Finale.xlsx - Page 3

-- Update Analytical Thinking sub-competencies
UPDATE sub_competencies SET
  action_cue = 'Select the correct resource allocation plan within 90 s.',
  game_mechanic = 'Run Resource Allocation Puzzle (performance task) (Scenario-Based Simulation)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Scenario-Based Simulation',
  player_action = 'Select',
  backend_data_captured = '["accuracy", "time_s", "decisions", "allocation_choices"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>90',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤90',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤75 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">90", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=90", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=75", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Apply logical reasoning to multi-constraint business problems';

UPDATE sub_competencies SET
  action_cue = 'Choose the best trade-off option for the stated objective within 90 s.',
  game_mechanic = 'Run Ranking / Prioritization Game (analytical reasoning) (Case Analysis)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Case Analysis',
  player_action = 'Choose',
  backend_data_captured = '["accuracy", "time_s", "trade_off_selection", "rationale"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>90',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤90',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤75 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">90", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=90", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=75", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Identify and evaluate trade-offs in operational scenarios';

UPDATE sub_competencies SET
  action_cue = 'Select the valid solution under missing / contradictory data within 60 s.',
  game_mechanic = 'Run Error-Detection / Diagnosis Task (diagnostic assessment) (Data Analysis)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Data Analysis',
  player_action = 'Select',
  backend_data_captured = '["accuracy", "time_s", "solution_validity", "data_gaps_identified"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>60',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤60',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤45 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">60", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=60", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=45", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Distinguish valid solutions under incomplete or contradictory inputs';

UPDATE sub_competencies SET
  action_cue = 'Select the correct decision after a rule change within 90 s.',
  game_mechanic = 'Run Timed Decision-Tree Simulation (scenario simulation) (Scenario-Based Simulation)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Scenario-Based Simulation',
  player_action = 'Select',
  backend_data_captured = '["accuracy", "time_s", "adaptation_speed", "rule_changes_handled"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>90',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤90',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤75 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">90", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=90", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=75", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Adapt reasoning under time pressure and stakeholder conflicts';

UPDATE sub_competencies SET
  action_cue = 'Identify the outlier or pattern match within 60 s.',
  game_mechanic = 'Run Pattern Recognition / Data Analysis Challenge (Data Analysis)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Data Analysis',
  player_action = 'Identify',
  backend_data_captured = '["accuracy", "time_s", "patterns_identified", "outliers_flagged"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>60',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤60',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤45 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">60", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=60", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=45", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Interpret data patterns to support decision-making';

UPDATE sub_competencies SET
  action_cue = 'Select KPI deltas, headline, and 3 support bullets within 120 s.',
  game_mechanic = 'Run Report-Builder / KPI Matching Mini-Game (Communication Product)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Communication Product',
  player_action = 'Select',
  backend_data_captured = '["accuracy", "time_s", "kpi_alignment", "communication_clarity"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>120',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤120',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤100 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">120", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=120", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=100", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Communicate conclusions aligned with defined KPIs';

-- Creative Thinking sub-competencies
UPDATE sub_competencies SET
  action_cue = 'Select three original solutions that fit the prompt within 90 s.',
  game_mechanic = 'Run Divergent Idea Builder (brainstorm simulation) (Scenario-Based Simulation)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Scenario-Based Simulation',
  player_action = 'Select',
  backend_data_captured = '["accuracy", "time_s", "ideas_generated", "originality_score"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>90',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤90',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤75 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">90", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=90", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=75", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Generate multiple innovative ideas under defined constraints';

UPDATE sub_competencies SET
  action_cue = 'Choose the alternative view that reveals a new solution within 90 s.',
  game_mechanic = 'Run Concept Remix Puzzle (association task) (Case Analysis)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Case Analysis',
  player_action = 'Choose',
  backend_data_captured = '["accuracy", "time_s", "reframes_generated", "perspective_shifts"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>90',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤90',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤75 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">90", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=90", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=75", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Reframe problems from new perspectives';

UPDATE sub_competencies SET
  action_cue = 'Match two unrelated concepts to create a viable idea within 120 s.',
  game_mechanic = 'Run Prototype Refinement Loop (iterative design test) (Project / Artifact)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Project / Artifact',
  player_action = 'Match',
  backend_data_captured = '["accuracy", "time_s", "concepts_combined", "synthesis_quality"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>120',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤120',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤100 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">120", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=120", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=100", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Combine unrelated concepts to form new solutions';

UPDATE sub_competencies SET
  action_cue = 'Choose the concept meeting both impact and feasibility criteria within 90 s.',
  game_mechanic = 'Run Constraint Challenge Game (convergent thinking) (Case Analysis)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Case Analysis',
  player_action = 'Choose',
  backend_data_captured = '["accuracy", "time_s", "evaluation_criteria", "option_rankings"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>90',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤90',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤75 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">90", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=90", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=75", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Evaluate creative options against feasibility and impact';

UPDATE sub_competencies SET
  action_cue = 'Select the revision that improves performance within 120 s.',
  game_mechanic = 'Run Pattern Transfer Exercise (application scenario) (Scenario-Based Simulation)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Scenario-Based Simulation',
  player_action = 'Select',
  backend_data_captured = '["accuracy", "time_s", "iterations_made", "improvement_delta"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>120',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤120',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤100 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">120", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=120", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=100", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Iterate and improve upon initial prototypes';

UPDATE sub_competencies SET
  action_cue = 'Select KPI deltas, headline, and 3 support bullets within 120 s.',
  game_mechanic = 'Run Storyboard / Pitch Builder (reflective presentation) (Communication Product)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Communication Product',
  player_action = 'Select',
  backend_data_captured = '["accuracy", "time_s", "presentation_clarity", "rationale_quality"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>120',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤120',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤100 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">120", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=120", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=100", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Communicate creative rationale and process clearly';

-- Critical Reasoning sub-competencies  
UPDATE sub_competencies SET
  action_cue = 'Select the hidden assumption supporting the claim within 90 s.',
  game_mechanic = 'Run Logic Scenario Simulator (argument evaluation) (Case Analysis)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Case Analysis',
  player_action = 'Select',
  backend_data_captured = '["accuracy", "time_s", "assumptions_identified", "logic_quality"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>90',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤90',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤75 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">90", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=90", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=75", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Identify assumptions underlying an argument';

UPDATE sub_competencies SET
  action_cue = 'Classify each statement as fact, inference, or opinion within 90 s.',
  game_mechanic = 'Run Bias Detector Game (diagnostic analysis) (Scenario-Based Simulation)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Scenario-Based Simulation',
  player_action = 'Classify',
  backend_data_captured = '["accuracy", "time_s", "classifications_made", "reasoning_clarity"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>90',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤90',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤75 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">90", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=90", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=75", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Distinguish fact, inference, and opinion';

UPDATE sub_competencies SET
  action_cue = 'Choose the evidence best supporting the claim within 90 s.',
  game_mechanic = 'Run Evidence Weighing Mini-Case (performance task) (Case Analysis)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Case Analysis',
  player_action = 'Choose',
  backend_data_captured = '["accuracy", "time_s", "evidence_evaluation", "credibility_scores"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>90',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤90',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤75 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">90", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=90", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=75", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Evaluate evidence quality and relevance';

UPDATE sub_competencies SET
  action_cue = 'Identify the fallacy present in the argument within 90 s.',
  game_mechanic = 'Run Causal Mapping Puzzle (concept mapping) (Scenario-Based Simulation)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Scenario-Based Simulation',
  player_action = 'Identify',
  backend_data_captured = '["accuracy", "time_s", "fallacies_detected", "logic_tree_quality"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>90',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤90',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤75 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">90", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=90", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=75", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Detect logical fallacies in complex reasoning';

UPDATE sub_competencies SET
  action_cue = 'Select the valid solution under missing / contradictory data within 60 s.',
  game_mechanic = 'Run Adaptive Logic Loop (rule-flip scenario) (Data Analysis)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Data Analysis',
  player_action = 'Select',
  backend_data_captured = '["accuracy", "time_s", "inference_quality", "data_gaps_handled"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>60',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤60',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤45 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">60", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=60", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=45", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Draw valid conclusions from incomplete data';

UPDATE sub_competencies SET
  action_cue = 'Select KPI deltas, headline, and 3 support bullets within 120 s.',
  game_mechanic = 'Run Debate Response Builder (communication assessment) (Communication Product)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Communication Product',
  player_action = 'Select',
  backend_data_captured = '["accuracy", "time_s", "argument_clarity", "persuasion_score"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>120',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤120',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤100 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">120", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=120", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=100", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Communicate logical reasoning clearly and persuasively';

-- Problem Solving sub-competencies
UPDATE sub_competencies SET
  action_cue = 'Select the primary problem statement from data within 90 s.',
  game_mechanic = 'Run Systems Mapping Puzzle (root-cause analysis) (Case Analysis)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Case Analysis',
  player_action = 'Select',
  backend_data_captured = '["accuracy", "time_s", "root_causes_identified", "problem_definition_quality"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>90',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤90',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤75 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">90", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=90", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=75", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Define problems clearly and identify root causes';

UPDATE sub_competencies SET
  action_cue = 'Select the most effective solution from options within 90 s.',
  game_mechanic = 'Run Solution Generator (simulation task) (Scenario-Based Simulation)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Scenario-Based Simulation',
  player_action = 'Select',
  backend_data_captured = '["accuracy", "time_s", "solutions_evaluated", "selection_rationale"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>90',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤90',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤75 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">90", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=90", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=75", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Generate and compare alternative solutions';

UPDATE sub_competencies SET
  action_cue = 'Choose the correct procedure sequence within 120 s.',
  game_mechanic = 'Run Criteria Scoring Mini-Game (performance rating) (Performance Demonstration)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Performance Demonstration',
  player_action = 'Choose',
  backend_data_captured = '["accuracy", "time_s", "method_selection", "procedure_correctness"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>120',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤120',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤100 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">120", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=120", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=100", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Apply appropriate methods to reach a solution';

UPDATE sub_competencies SET
  action_cue = 'Complete the implementation task within 120 s.',
  game_mechanic = 'Run Execution Simulation (task management game) (Project / Artifact)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Project / Artifact',
  player_action = 'Complete',
  backend_data_captured = '["accuracy", "time_s", "execution_quality", "target_criteria_met"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>120',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤120',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤100 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">120", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=120", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=100", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Implement solutions effectively';

UPDATE sub_competencies SET
  action_cue = 'Identify variance between expected and actual results within 90 s.',
  game_mechanic = 'Run Adaptive Fix-Flow Simulation (rule-flip test) (Portfolio / Reflection)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Portfolio / Reflection',
  player_action = 'Identify',
  backend_data_captured = '["accuracy", "time_s", "variance_detection", "improvement_areas"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>90',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤90',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤75 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">90", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=90", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=75", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Monitor and evaluate outcomes for continuous improvement';

UPDATE sub_competencies SET
  action_cue = 'Select KPI deltas, headline, and 3 support bullets within 120 s.',
  game_mechanic = 'Run Retrospective Builder (reflective task) (Communication Product)',
  game_loop = 'Input → Action → Feedback → Submit',
  validator_type = 'Communication Product',
  player_action = 'Select',
  backend_data_captured = '["accuracy", "time_s", "communication_quality", "results_clarity"]'::jsonb,
  scoring_formula_level_1 = 'L1 acc<0.85 or t>120',
  scoring_formula_level_2 = 'L2 acc≥0.90 t≤120',
  scoring_formula_level_3 = 'L3 acc≥0.95 t≤100 edge≥0.80 sess≥3',
  scoring_logic = '{"L1": {"accuracy": "<0.85", "time": ">120", "xp": 100}, "L2": {"accuracy": ">=0.90", "time": "<=120", "xp": 250}, "L3": {"accuracy": ">=0.95", "time": "<=100", "edge": ">=0.80", "sessions": ">=3", "xp": 500}}'::jsonb
WHERE statement = 'Communicate solutions and results clearly';