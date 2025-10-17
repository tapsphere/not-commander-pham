-- Update Analytical Thinking sub-competencies with new Excel data
-- This replaces old data with the new formulas and structure from the Excel sheet

-- Sub-competency 1: Ability to identify and analyze KPIs
UPDATE public.sub_competencies
SET 
  validator_type = 'Data Pattern Detective',
  action_cue = 'Unexpected change in a key performance indicator (KPI)',
  player_action = 'Identify the outlier and suggest a corrective action',
  game_mechanic = 'Drag-and-Drop or Click Selection',
  game_loop = 'Present multiple data sets or scenarios. Player identifies outliers and selects corrective actions.',
  backend_data_captured = '["time_to_identify", "accuracy_of_identification", "quality_of_corrective_action"]'::jsonb,
  scoring_logic = '{"level_1": "Identifies outlier correctly", "level_2": "Identifies outlier + suggests basic action", "level_3": "Identifies outlier + proposes data-driven solution"}'::jsonb,
  scoring_formula_level_1 = 'IF time_to_identify < 30s AND accuracy = 100% THEN Level 1',
  scoring_formula_level_2 = 'IF Level 1 AND quality_of_corrective_action = "basic" THEN Level 2',
  scoring_formula_level_3 = 'IF Level 1 AND quality_of_corrective_action = "data-driven" THEN Level 3'
WHERE statement = 'Ability to identify and analyze KPIs for organizational impact.';

-- Sub-competency 2: Skill in recognizing patterns across multiple data sources
UPDATE public.sub_competencies
SET 
  validator_type = 'Data Pattern Detective',
  action_cue = 'Multiple data sources showing conflicting trends',
  player_action = 'Identify the pattern and reconcile the data',
  game_mechanic = 'Drag-and-Drop or Click Selection',
  game_loop = 'Present conflicting data. Player analyzes patterns and reconciles information.',
  backend_data_captured = '["time_to_reconcile", "pattern_recognition_accuracy", "reconciliation_quality"]'::jsonb,
  scoring_logic = '{"level_1": "Identifies basic pattern", "level_2": "Recognizes complex pattern + basic reconciliation", "level_3": "Full pattern analysis + comprehensive reconciliation"}'::jsonb,
  scoring_formula_level_1 = 'IF pattern_recognition_accuracy >= 70% THEN Level 1',
  scoring_formula_level_2 = 'IF Level 1 AND reconciliation_quality = "basic" THEN Level 2',
  scoring_formula_level_3 = 'IF Level 1 AND reconciliation_quality = "comprehensive" THEN Level 3'
WHERE statement = 'Skill in recognizing patterns, trends, and anomalies across multiple data sources to derive actionable insights.';

-- Sub-competency 3: Capability to prioritize actions based on data-driven insights
UPDATE public.sub_competencies
SET 
  validator_type = 'Crisis Communication Simulator',
  action_cue = 'Time-sensitive situation requiring prioritization',
  player_action = 'Rank actions by priority based on data',
  game_mechanic = 'Ranking/Sorting Interface',
  game_loop = 'Present multiple actions. Player ranks by priority using data insights.',
  backend_data_captured = '["time_to_complete", "prioritization_accuracy", "data_usage_quality"]'::jsonb,
  scoring_logic = '{"level_1": "Basic prioritization completed", "level_2": "Data-informed prioritization", "level_3": "Optimal data-driven prioritization with justification"}'::jsonb,
  scoring_formula_level_1 = 'IF prioritization_accuracy >= 60% THEN Level 1',
  scoring_formula_level_2 = 'IF Level 1 AND data_usage_quality = "informed" THEN Level 2',
  scoring_formula_level_3 = 'IF Level 1 AND data_usage_quality = "optimal" AND justification_provided = true THEN Level 3'
WHERE statement = 'Capability to prioritize actions based on data-driven insights and potential organizational impact.';

-- Sub-competency 4: Proficiency in synthesizing information
UPDATE public.sub_competencies
SET 
  validator_type = 'Narrative Builder',
  action_cue = 'Scattered information needs to be synthesized into a coherent narrative',
  player_action = 'Synthesize key points into a brief summary',
  game_mechanic = 'Text Input or Multiple Choice Selection',
  game_loop = 'Present scattered data. Player synthesizes into summary or selects best synthesis.',
  backend_data_captured = '["synthesis_time", "completeness_score", "coherence_score"]'::jsonb,
  scoring_logic = '{"level_1": "Basic synthesis with key points", "level_2": "Coherent synthesis with context", "level_3": "Comprehensive synthesis with insights and implications"}'::jsonb,
  scoring_formula_level_1 = 'IF completeness_score >= 60% THEN Level 1',
  scoring_formula_level_2 = 'IF Level 1 AND coherence_score >= 70% THEN Level 2',
  scoring_formula_level_3 = 'IF Level 2 AND insight_quality = "high" THEN Level 3'
WHERE statement = 'Proficiency in synthesizing complex information from various sources into coherent, actionable recommendations.';

-- Sub-competency 5: Competence in leveraging digital tools
UPDATE public.sub_competencies
SET 
  validator_type = 'Data Pattern Detective',
  action_cue = 'Large dataset requiring tool-based analysis',
  player_action = 'Use provided tools to analyze and extract insights',
  game_mechanic = 'Interactive Dashboard Simulation',
  game_loop = 'Simulate digital tools. Player uses tools to analyze data and extract insights.',
  backend_data_captured = '["tool_proficiency", "insight_accuracy", "time_efficiency"]'::jsonb,
  scoring_logic = '{"level_1": "Basic tool usage", "level_2": "Effective tool usage with insights", "level_3": "Advanced tool usage with comprehensive insights"}'::jsonb,
  scoring_formula_level_1 = 'IF tool_proficiency >= 50% THEN Level 1',
  scoring_formula_level_2 = 'IF Level 1 AND insight_accuracy >= 70% THEN Level 2',
  scoring_formula_level_3 = 'IF Level 2 AND time_efficiency = "high" THEN Level 3'
WHERE statement = 'Competence in leveraging digital tools and analytics platforms to streamline data interpretation and decision-making.';

-- Sub-competency 6: Aptitude for connecting analytical findings to strategic goals
UPDATE public.sub_competencies
SET 
  validator_type = 'Budget Allocation Challenge',
  action_cue = 'Analytical findings need to be connected to strategic objectives',
  player_action = 'Map findings to strategic goals and justify connections',
  game_mechanic = 'Connection/Mapping Interface',
  game_loop = 'Present findings and goals. Player maps connections and provides justifications.',
  backend_data_captured = '["mapping_accuracy", "justification_quality", "strategic_alignment"]'::jsonb,
  scoring_logic = '{"level_1": "Basic connection made", "level_2": "Clear connection with justification", "level_3": "Strategic connection with comprehensive business impact"}'::jsonb,
  scoring_formula_level_1 = 'IF mapping_accuracy >= 60% THEN Level 1',
  scoring_formula_level_2 = 'IF Level 1 AND justification_quality = "clear" THEN Level 2',
  scoring_formula_level_3 = 'IF Level 2 AND strategic_alignment = "comprehensive" THEN Level 3'
WHERE statement = 'Aptitude for connecting analytical findings to broader strategic goals and articulating their business implications.';
