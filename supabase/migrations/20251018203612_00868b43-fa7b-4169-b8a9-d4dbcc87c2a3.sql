-- Clear existing sub_competencies data that's not in the new spreadsheet
-- We'll repopulate with the correct data from tabs 3 & 4

-- First, let's keep only the 4 competencies from the spreadsheet: Analytical Thinking, Creative Thinking, Critical Reasoning, Problem Solving
DELETE FROM sub_competencies 
WHERE competency_id NOT IN (
  SELECT id FROM master_competencies 
  WHERE name IN ('Analytical Thinking', 'Creative Thinking', 'Critical Reasoning', 'Problem Solving')
);

-- Now update the sub_competencies with detailed data from Page 3

-- Analytical Thinking Sub-Competencies
UPDATE sub_competencies SET
  action_cue = 'Allocate resources within time and budget limits to reach optimal outcome.',
  game_mechanic = 'Resource Allocation Puzzle (performance task)',
  game_loop = 'Input → Allocate resources → Rule Flip (edge case) → Adjust → Submit → Feedback',
  validator_type = 'Scenario-Based Simulation',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'accuracy_threshold', 90,
    'time_limit_seconds', 90,
    'edge_case_recovery_seconds', 10,
    'formula', 'Accuracy = % constraints met ≥ 90; Time ≤ 90 s; Edge = Rule Flip Recovered ≤ 10 s'
  ),
  backend_data_captured = jsonb_build_array('constraints_met_percent', 'completion_time_seconds', 'edge_case_recovered', 'resource_allocation_decisions')
WHERE statement = 'Apply logical reasoning to multi-constraint business problems';

UPDATE sub_competencies SET
  action_cue = 'Choose between multiple conflicting options under pressure.',
  game_mechanic = 'Ranking / Prioritization Game (analytical reasoning)',
  game_loop = 'Read scenario → Rank KPIs → Constraint Change → Re-rank → Submit → Feedback',
  validator_type = 'Case Analysis',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'accuracy_threshold', 90,
    'adjustment_time_seconds', 5,
    'edge_case_rerank_seconds', 5,
    'formula', 'Accuracy = % correct rank ≥ 90; Time ≤ 5 s to adjust; Edge = Re-rank after change ≤ 5 s'
  ),
  backend_data_captured = jsonb_build_array('ranking_accuracy_percent', 'adjustment_time_seconds', 'rerank_success', 'kpi_priorities')
WHERE statement = 'Identify and evaluate trade-offs in operational scenarios';

UPDATE sub_competencies SET
  action_cue = 'Infer best solution when key data is missing or conflicting.',
  game_mechanic = 'Error-Detection / Diagnosis Task (diagnostic assessment)',
  game_loop = 'Scan data → Flag issues → Select solution → Confirm → Feedback',
  validator_type = 'Data Analysis',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'missing_flags_threshold', 85,
    'time_limit_seconds', 90,
    'conflict_resolution_seconds', 8,
    'formula', 'Accuracy = % missing_flags correct ≥ 85 AND solution_valid = 1; Time ≤ 90 s; Edge = Conflict Resolved ≤ 8 s'
  ),
  backend_data_captured = jsonb_build_array('missing_flags_accuracy', 'solution_valid', 'completion_time_seconds', 'conflict_resolved')
WHERE statement = 'Distinguish valid solutions under incomplete or contradictory inputs';

UPDATE sub_competencies SET
  action_cue = 'Complete task while variables (rules) shift mid-round.',
  game_mechanic = 'Timed Decision-Tree Simulation (scenario simulation)',
  game_loop = 'Scenario intro → Select decision → Rule Flip mid-timer → Adjust → Submit → Feedback',
  validator_type = 'Scenario-Based Simulation',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'post_flip_accuracy_threshold', 85,
    'recovery_time_seconds', 10,
    'stakeholder_shift_seconds', 10,
    'formula', 'Accuracy = post_flip_accuracy ≥ 85; Time ≤ 10 s recovery; Edge = Stakeholder Shift Handled ≤ 10 s'
  ),
  backend_data_captured = jsonb_build_array('post_flip_accuracy', 'recovery_time_seconds', 'stakeholder_shift_handled', 'decision_tree_path')
WHERE statement = 'Adapt reasoning under time pressure and stakeholder conflicts';

UPDATE sub_competencies SET
  action_cue = 'Identify and label trends from data visualization.',
  game_mechanic = 'Pattern Recognition / Data Analysis Challenge (applied analysis)',
  game_loop = 'View chart → Highlight pattern → Select insight → Submit → Feedback',
  validator_type = 'Data Analysis',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'pattern_detection_threshold', 90,
    'time_limit_seconds', 60,
    'hidden_data_found', true,
    'formula', 'Accuracy = pattern_detected ≥ 90 % correct; Time ≤ 60 s; Edge = Hidden Data Found = 1'
  ),
  backend_data_captured = jsonb_build_array('pattern_detection_accuracy', 'completion_time_seconds', 'hidden_data_found', 'insights_selected')
WHERE statement = 'Interpret data patterns to support decision-making';

UPDATE sub_competencies SET
  action_cue = 'Write or select the summary that best aligns results to KPIs.',
  game_mechanic = 'Report-Builder / KPI Matching Mini-Game (reflective response)',
  game_loop = 'Read prompt → Select KPI → Compose summary → Submit → Feedback',
  validator_type = 'Communication Product',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'kpi_alignment_threshold', 85,
    'time_limit_seconds', 45,
    'summary_word_limit', 50,
    'formula', 'Accuracy = kpi_alignment ≥ 85 %; Time ≤ 45 s; Edge = Summary ≤ 50 words'
  ),
  backend_data_captured = jsonb_build_array('kpi_alignment_percent', 'completion_time_seconds', 'summary_word_count', 'kpi_selected')
WHERE statement = 'Communicate conclusions aligned with defined KPIs';

-- Creative Thinking Sub-Competencies
UPDATE sub_competencies SET
  action_cue = 'Produce three or more novel solutions within stated limits.',
  game_mechanic = 'Divergent Idea Builder (brainstorm simulation)',
  game_loop = 'Prompt → Ideate 3+ solutions → Time limit → Select best → Feedback',
  validator_type = 'Scenario-Based Simulation',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'viable_ideas_threshold', 3,
    'time_limit_seconds', 180,
    'constraint_flip_handled', true,
    'formula', 'Accuracy = # viable ideas ≥ 3; Time ≤ 180 s; Edge = Constraint Flip Handled = 1'
  ),
  backend_data_captured = jsonb_build_array('viable_ideas_count', 'completion_time_seconds', 'constraint_flip_handled', 'ideas_generated')
WHERE statement = 'Generate multiple innovative ideas under defined constraints';

UPDATE sub_competencies SET
  action_cue = 'Redefine the given challenge using "how-might-we" phrasing.',
  game_mechanic = 'Concept Remix Puzzle (association task)',
  game_loop = 'Input → Drag/Match elements → Preview → Confirm → Feedback',
  validator_type = 'Case Analysis',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'valid_combinations_threshold', 85,
    'time_limit_seconds', 120,
    'new_element_response_seconds', 10,
    'formula', 'Accuracy = % valid combinations ≥ 85; Time ≤ 120 s; Edge = New element added ≤ 10 s response'
  ),
  backend_data_captured = jsonb_build_array('valid_combinations_percent', 'completion_time_seconds', 'new_element_response_time', 'reframes_created')
WHERE statement = 'Reframe problems from new perspectives';

UPDATE sub_competencies SET
  action_cue = 'Link two unrelated inputs to create a workable concept.',
  game_mechanic = 'Prototype Refinement Loop (iterative design task)',
  game_loop = 'Draft → Receive auto-feedback → Revise → Resubmit → Feedback',
  validator_type = 'Project / Product Artifact',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'revision_score_threshold', 90,
    'time_limit_seconds', 150,
    'feedback_rounds', 1,
    'formula', 'Accuracy = revision_score ≥ 90; Time ≤ 150 s; Edge = Auto-feedback applied ≤ 1 round'
  ),
  backend_data_captured = jsonb_build_array('revision_score', 'completion_time_seconds', 'feedback_rounds_used', 'concept_combinations')
WHERE statement = 'Combine unrelated concepts to form new solutions';

UPDATE sub_competencies SET
  action_cue = 'Rank generated ideas by practicality and potential outcome.',
  game_mechanic = 'Constraint Challenge Game (convergent thinking)',
  game_loop = 'Review brief → Adjust idea to fit budget/time → Submit → Feedback',
  validator_type = 'Case Analysis',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'constraints_met_threshold', 90,
    'time_limit_seconds', 120,
    'adjustment_seconds', 8,
    'formula', 'Accuracy = idea_meets_constraints ≥ 90 %; Time ≤ 120 s; Edge = Budget/Time change adjusted ≤ 8 s'
  ),
  backend_data_captured = jsonb_build_array('constraints_met_percent', 'completion_time_seconds', 'adjustment_time', 'feasibility_rankings')
WHERE statement = 'Evaluate creative options against feasibility and impact';

UPDATE sub_competencies SET
  action_cue = 'Adjust design after simulated feedback rounds.',
  game_mechanic = 'Pattern Transfer Exercise (application scenario)',
  game_loop = 'Study example → Apply method to new context → Submit → Feedback',
  validator_type = 'Project / Product Artifact',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'transfer_success_threshold', 85,
    'time_limit_seconds', 90,
    'first_try_success', true,
    'formula', 'Accuracy = transfer_success ≥ 85 %; Time ≤ 90 s; Edge = Cross-context applied first try = 1'
  ),
  backend_data_captured = jsonb_build_array('transfer_success_percent', 'completion_time_seconds', 'first_try_success', 'iterations_count')
WHERE statement = 'Iterate and improve upon initial prototypes';

UPDATE sub_competencies SET
  action_cue = 'Explain the reasoning behind a chosen creative path.',
  game_mechanic = 'Storyboard / Pitch Builder (reflective presentation)',
  game_loop = 'Outline → Arrange slides / frames → Submit → Feedback',
  validator_type = 'Communication Product',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'clarity_threshold', 90,
    'time_limit_seconds', 180,
    'recovery_seconds', 10,
    'formula', 'Accuracy = storyboard_clarity ≥ 90; Time ≤ 180 s; Edge = Missing slide recovered ≤ 10 s'
  ),
  backend_data_captured = jsonb_build_array('storyboard_clarity_score', 'completion_time_seconds', 'missing_slide_recovered', 'rationale_quality')
WHERE statement = 'Communicate creative rationale and process clearly';

-- Critical Reasoning Sub-Competencies
UPDATE sub_competencies SET
  action_cue = 'Highlight hidden assumptions in argument text',
  game_mechanic = 'Logic Scenario Simulator (argument evaluation)',
  game_loop = 'Read claim → Identify fallacy / support → Select valid response → Feedback',
  validator_type = 'Case Analysis',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'valid_argument_threshold', 90,
    'time_limit_seconds', 90,
    'contradiction_resolution_seconds', 10,
    'formula', 'Accuracy = valid_argument ≥ 90 %; Time ≤ 90 s; Edge = Contradictory evidence resolved ≤ 10 s'
  ),
  backend_data_captured = jsonb_build_array('valid_argument_percent', 'completion_time_seconds', 'contradiction_resolved', 'assumptions_identified')
WHERE statement = 'Identify assumptions underlying an argument';

UPDATE sub_competencies SET
  action_cue = 'Sort statements into categories under timer',
  game_mechanic = 'Bias Detector Game (diagnostic analysis)',
  game_loop = 'Review text → Flag bias → Confirm reason → Submit → Feedback',
  validator_type = 'Scenario-Based Simulation',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'bias_flags_threshold', 85,
    'time_limit_seconds', 60,
    'hidden_bias_seconds', 8,
    'formula', 'Accuracy = bias_flags correct ≥ 85 %; Time ≤ 60 s; Edge = Hidden bias found ≤ 8 s'
  ),
  backend_data_captured = jsonb_build_array('bias_flags_accuracy', 'completion_time_seconds', 'hidden_bias_found', 'categorizations')
WHERE statement = 'Distinguish fact, inference, and opinion';

UPDATE sub_competencies SET
  action_cue = 'Rank sources and justify ranking choices',
  game_mechanic = 'Evidence Weighing Mini-Case (performance task)',
  game_loop = 'Gather evidence → Rank credibility → Choose conclusion → Feedback',
  validator_type = 'Case Analysis',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'evidence_weighting_threshold', 90,
    'time_limit_seconds', 90,
    'adjustment_seconds', 10,
    'formula', 'Accuracy = evidence_weighting ≥ 90 %; Time ≤ 90 s; Edge = New evidence adjust ≤ 10 s'
  ),
  backend_data_captured = jsonb_build_array('evidence_weighting_accuracy', 'completion_time_seconds', 'new_evidence_adjusted', 'source_rankings')
WHERE statement = 'Evaluate evidence quality and relevance';

UPDATE sub_competencies SET
  action_cue = 'Identify flawed logic within multi-step argument',
  game_mechanic = 'Causal Mapping Puzzle (concept mapping)',
  game_loop = 'Connect nodes → Validate logic path → Submit → Feedback',
  validator_type = 'Scenario-Based Simulation',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'logic_path_threshold', 90,
    'time_limit_seconds', 120,
    'node_addition_seconds', 8,
    'formula', 'Accuracy = logic_path valid ≥ 90 %; Time ≤ 120 s; Edge = Extra node added ≤ 8 s'
  ),
  backend_data_captured = jsonb_build_array('logic_path_validity', 'completion_time_seconds', 'extra_node_added', 'fallacies_detected')
WHERE statement = 'Detect logical fallacies in complex reasoning';

UPDATE sub_competencies SET
  action_cue = 'Select best conclusion when data is missing',
  game_mechanic = 'Adaptive Logic Loop (rule-flip scenario)',
  game_loop = 'Initial decision → New data appears → Revise → Resubmit → Feedback',
  validator_type = 'Data Analysis',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'revised_decision_threshold', 85,
    'response_time_seconds', 10,
    'reevaluation_attempts', 1,
    'formula', 'Accuracy = revised_decision ≥ 85 %; Time ≤ 10 s after new data; Edge = Re-evaluation ≤ 1 try'
  ),
  backend_data_captured = jsonb_build_array('revised_decision_accuracy', 'response_time_seconds', 'reevaluation_attempts', 'conclusions_drawn')
WHERE statement = 'Draw valid conclusions from incomplete data';

UPDATE sub_competencies SET
  action_cue = 'Craft concise summary aligning facts to argument',
  game_mechanic = 'Debate Response Builder (communication assessment)',
  game_loop = 'Read prompt → Select stance → Write / record summary → Feedback',
  validator_type = 'Communication Product',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'judgment_clarity_threshold', 90,
    'time_limit_seconds', 90,
    'cross_question_response_seconds', 5,
    'formula', 'Accuracy = judgment_clarity ≥ 90 %; Time ≤ 90 s; Edge = Cross-question response ≤ 5 s'
  ),
  backend_data_captured = jsonb_build_array('judgment_clarity_score', 'completion_time_seconds', 'cross_question_response_time', 'argument_alignment')
WHERE statement = 'Communicate logical reasoning clearly and persuasively';

-- Problem Solving Sub-Competencies
UPDATE sub_competencies SET
  action_cue = 'Map inputs to root causes using limited clues',
  game_mechanic = 'Systems Mapping Puzzle (root-cause analysis)',
  game_loop = 'View system map → Select key node → Submit → Feedback',
  validator_type = 'Case Analysis',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'root_cause_identified', true,
    'time_limit_seconds', 90,
    'hidden_factor_seconds', 10,
    'formula', 'Accuracy = root_cause_identified = 1; Time ≤ 90 s; Edge = Hidden factor found ≤ 10 s'
  ),
  backend_data_captured = jsonb_build_array('root_cause_identified', 'completion_time_seconds', 'hidden_factor_found', 'causal_map')
WHERE statement = 'Define problems clearly and identify root causes';

UPDATE sub_competencies SET
  action_cue = 'Produce 3 possible solutions and select best fit',
  game_mechanic = 'Solution Generator (simulation task)',
  game_loop = 'Problem brief → List 3+ solutions → Select best fit → Feedback',
  validator_type = 'Scenario-Based Simulation',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'solutions_count_threshold', 3,
    'best_fit_selected', true,
    'time_limit_seconds', 180,
    'constraint_adaptation_seconds', 8,
    'formula', 'Accuracy = # solutions ≥ 3 AND best_fit = 1; Time ≤ 180 s; Edge = Constraint change adapted ≤ 8 s'
  ),
  backend_data_captured = jsonb_build_array('solutions_count', 'best_fit_selected', 'completion_time_seconds', 'constraint_adapted', 'solutions_generated')
WHERE statement = 'Generate and compare alternative solutions';

UPDATE sub_competencies SET
  action_cue = 'Choose and apply correct tool for problem type',
  game_mechanic = 'Criteria Scoring Mini-Game (performance rating)',
  game_loop = 'Review options → Score vs criteria → Submit → Feedback',
  validator_type = 'Performance Demonstration',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'criteria_match_threshold', 90,
    'time_limit_seconds', 90,
    'weight_adjust_seconds', 5,
    'formula', 'Accuracy = criteria_match ≥ 90 %; Time ≤ 90 s; Edge = Weight re-adjust ≤ 5 s'
  ),
  backend_data_captured = jsonb_build_array('criteria_match_percent', 'completion_time_seconds', 'weight_adjusted', 'methods_selected')
WHERE statement = 'Apply appropriate methods to reach a solution';

UPDATE sub_competencies SET
  action_cue = 'Execute solution sequence under time pressure',
  game_mechanic = 'Execution Simulation (task management game)',
  game_loop = 'Plan → Execute → Track KPIs → Adjust → Feedback',
  validator_type = 'Project / Artifact',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'execution_success_threshold', 85,
    'time_limit_seconds', 120,
    'realtime_adjust_seconds', 10,
    'formula', 'Accuracy = execution_success ≥ 85 %; Time ≤ 120 s; Edge = Realtime adjust ≤ 10 s'
  ),
  backend_data_captured = jsonb_build_array('execution_success_percent', 'completion_time_seconds', 'realtime_adjustments', 'kpi_tracked')
WHERE statement = 'Implement solutions effectively';

UPDATE sub_competencies SET
  action_cue = 'Track results and adjust plan in real time',
  game_mechanic = 'Adaptive Fix-Flow Simulation (rule-flip task)',
  game_loop = 'Apply solution → Unexpected failure → Adjust → Resubmit → Feedback',
  validator_type = 'Portfolio / Reflection',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'fix_applied_threshold', 90,
    'response_time_seconds', 8,
    'second_attempt_success', true,
    'formula', 'Accuracy = fix_applied ≥ 90 %; Time ≤ 8 s after failure; Edge = Second attempt success = 1'
  ),
  backend_data_captured = jsonb_build_array('fix_applied_percent', 'response_time_seconds', 'second_attempt_success', 'outcomes_monitored')
WHERE statement = 'Monitor and evaluate outcomes for continuous improvement';

UPDATE sub_competencies SET
  action_cue = 'Write or speak a 150-word summary matching metrics',
  game_mechanic = 'Retrospective Builder (reflective task)',
  game_loop = 'Review steps → Select lesson → Submit → Feedback',
  validator_type = 'Communication Product',
  scoring_formula_level_1 = '<80',
  scoring_formula_level_2 = '80–94',
  scoring_formula_level_3 = '≥95 + Edge',
  scoring_logic = jsonb_build_object(
    'reflection_quality_threshold', 85,
    'time_limit_seconds', 90,
    'lesson_logged', true,
    'formula', 'Accuracy = reflection_quality ≥ 85 %; Time ≤ 90 s; Edge = Lesson logged = 1'
  ),
  backend_data_captured = jsonb_build_array('reflection_quality_score', 'completion_time_seconds', 'lesson_logged', 'solutions_communicated')
WHERE statement = 'Communicate solutions and results clearly';