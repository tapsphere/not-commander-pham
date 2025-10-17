-- Insert all sub-competencies for Creative Thinking, Critical Reasoning, and Problem Solving

DO $$
DECLARE
  creative_thinking_id uuid;
  critical_reasoning_id uuid;
  problem_solving_id uuid;
BEGIN
  -- Get competency IDs
  SELECT id INTO creative_thinking_id FROM master_competencies WHERE name = 'Creative Thinking';
  SELECT id INTO critical_reasoning_id FROM master_competencies WHERE name = 'Critical Reasoning';
  SELECT id INTO problem_solving_id FROM master_competencies WHERE name = 'Problem Solving';

  -- Delete existing sub-competencies for these competencies
  DELETE FROM sub_competencies WHERE competency_id IN (creative_thinking_id, critical_reasoning_id, problem_solving_id);

  -- ============= CREATIVE THINKING (6 sub-competencies) =============
  
  INSERT INTO sub_competencies (competency_id, statement, action_cue, game_mechanic, game_loop, validator_type, display_order, scoring_formula_level_1, scoring_formula_level_2, scoring_formula_level_3) VALUES
  (creative_thinking_id, 'Generate multiple innovative ideas under defined constraints', 'Produce three or more novel solutions within stated limits.', 'Divergent Idea Builder (brainstorm simulation)', 'Prompt → Ideate 3+ solutions → Time limit → Select best → Feedback', 'Scenario-Based Simulation', 1, '<80', '80–94', '≥95 + Edge'),
  (creative_thinking_id, 'Reframe problems from new perspectives', 'Redefine the given challenge using "how-might-we" phrasing.', 'Concept Remix Puzzle (association task)', 'Input → Drag/Match elements → Preview → Confirm → Feedback', 'Case Analysis', 2, '<80', '80–94', '≥95 + Edge'),
  (creative_thinking_id, 'Combine unrelated concepts to form new solutions', 'Link two unrelated inputs to create a workable concept.', 'Prototype Refinement Loop (iterative design task)', 'Draft → Receive auto-feedback → Revise → Resubmit → Feedback', 'Project / Product Artifact', 3, '<80', '80–94', '≥95 + Edge'),
  (creative_thinking_id, 'Evaluate creative options against feasibility and impact', 'Rank generated ideas by practicality and potential outcome.', 'Constraint Challenge Game (convergent thinking)', 'Review brief → Adjust idea to fit budget/time → Submit → Feedback', 'Case Analysis', 4, '<80', '80–94', '≥95 + Edge'),
  (creative_thinking_id, 'Iterate and improve upon initial prototypes', 'Adjust design after simulated feedback rounds.', 'Pattern Transfer Exercise (application scenario)', 'Study example → Apply method to new context → Submit → Feedback', 'Project / Product Artifact', 5, '<80', '80–94', '≥95 + Edge'),
  (creative_thinking_id, 'Communicate creative rationale and process clearly', 'Explain the reasoning behind a chosen creative path.', 'Storyboard / Pitch Builder (reflective presentation)', 'Outline → Arrange slides / frames → Submit → Feedback', 'Communication Product', 6, '<80', '80–94', '≥95 + Edge');

  -- ============= CRITICAL REASONING (6 sub-competencies) =============
  
  INSERT INTO sub_competencies (competency_id, statement, action_cue, game_mechanic, game_loop, validator_type, display_order, scoring_formula_level_1, scoring_formula_level_2, scoring_formula_level_3) VALUES
  (critical_reasoning_id, 'Identify assumptions underlying an argument', 'Highlight hidden assumptions in argument text', 'Logic Scenario Simulator (argument evaluation)', 'Read claim → Identify fallacy / support → Select valid response → Feedback', 'Case Analysis', 1, '<80', '80–94', '≥95 + Edge'),
  (critical_reasoning_id, 'Distinguish fact, inference, opinion', 'Sort statements into categories under timer', 'Bias Detector Game (diagnostic analysis)', 'Review text → Flag bias → Confirm reason → Submit → Feedback', 'Scenario-Based Simulation', 2, '<80', '80–94', '≥95 + Edge'),
  (critical_reasoning_id, 'Evaluate evidence quality and relevance', 'Rank sources and justify ranking choices', 'Evidence Weighing Mini-Case (performance task)', 'Gather evidence → Rank credibility → Choose conclusion → Feedback', 'Case Analysis', 3, '<80', '80–94', '≥95 + Edge'),
  (critical_reasoning_id, 'Detect logical fallacies in reasoning', 'Identify flawed logic within multi-step argument', 'Causal Mapping Puzzle (concept mapping)', 'Connect nodes → Validate logic path → Submit → Feedback', 'Scenario-Based Simulation', 4, '<80', '80–94', '≥95 + Edge'),
  (critical_reasoning_id, 'Draw valid conclusions from incomplete data', 'Select best conclusion when data is missing', 'Adaptive Logic Loop (rule-flip scenario)', 'Initial decision → New data appears → Revise → Resubmit → Feedback', 'Data Analysis', 5, '<80', '80–94', '≥95 + Edge'),
  (critical_reasoning_id, 'Communicate logical reasoning clearly and persuasively', 'Craft concise summary aligning facts to argument', 'Debate Response Builder (communication assessment)', 'Read prompt → Select stance → Write / record summary → Feedback', 'Communication Product', 6, '<80', '80–94', '≥95 + Edge');

  -- ============= PROBLEM SOLVING (6 sub-competencies) =============
  
  INSERT INTO sub_competencies (competency_id, statement, action_cue, game_mechanic, game_loop, validator_type, display_order, scoring_formula_level_1, scoring_formula_level_2, scoring_formula_level_3) VALUES
  (problem_solving_id, 'Define problems clearly and identify root causes', 'Map inputs to root causes using limited clues', 'Systems Mapping Puzzle (root-cause analysis)', 'View system map → Select key node → Submit → Feedback', 'Case Analysis', 1, '<80', '80–94', '≥95 + Edge'),
  (problem_solving_id, 'Generate and compare alternative solutions', 'Produce 3 possible solutions and select best fit', 'Solution Generator (simulation task)', 'Problem brief → List 3+ solutions → Select best fit → Feedback', 'Scenario-Based Simulation', 2, '<80', '80–94', '≥95 + Edge'),
  (problem_solving_id, 'Apply appropriate methods to reach a solution', 'Choose and apply correct tool for problem type', 'Criteria Scoring Mini-Game (performance rating)', 'Review options → Score vs criteria → Submit → Feedback', 'Performance Demonstration', 3, '<80', '80–94', '≥95 + Edge'),
  (problem_solving_id, 'Implement solutions effectively', 'Execute solution sequence under time pressure', 'Execution Simulation (task management game)', 'Plan → Execute → Track KPIs → Adjust → Feedback', 'Project / Artifact', 4, '<80', '80–94', '≥95 + Edge'),
  (problem_solving_id, 'Monitor and evaluate outcomes', 'Track results and adjust plan in real time', 'Adaptive Fix-Flow Simulation (rule-flip task)', 'Apply solution → Unexpected failure → Adjust → Resubmit → Feedback', 'Portfolio / Reflection', 5, '<80', '80–94', '≥95 + Edge'),
  (problem_solving_id, 'Communicate solutions and results clearly', 'Write or speak a 150-word summary matching metrics', 'Retrospective Builder (reflective task)', 'Review steps → Select lesson → Submit → Feedback', 'Communication Product', 6, '<80', '80–94', '≥95 + Edge');

END $$;