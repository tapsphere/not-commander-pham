-- V5 Framework Sync: Complete Data Purge & Reload
-- Source: CBEN_PlayOps_Framework_Finale_V5.xlsx (Tab 3 & 4)

-- Step 1: Update existing competencies with V5 metadata
UPDATE public.master_competencies 
SET cbe_category = 'Cognitive', departments = ARRAY['Operations', 'Strategy', 'Analytics']
WHERE name = 'Analytical Thinking';

UPDATE public.master_competencies 
SET cbe_category = 'Cognitive', departments = ARRAY['Operations', 'Engineering', 'Product']
WHERE name = 'Problem Solving';

UPDATE public.master_competencies 
SET cbe_category = 'Cognitive', departments = ARRAY['Marketing', 'Design', 'Product']
WHERE name = 'Creative Thinking';

UPDATE public.master_competencies 
SET cbe_category = 'Cognitive', departments = ARRAY['Strategy', 'Legal', 'Finance']
WHERE name = 'Critical Reasoning';

-- Step 2: Insert new V5 competencies (if not exists)
INSERT INTO public.master_competencies (name, cbe_category, departments, is_active)
VALUES 
  ('Communication & Clarity', 'Interpersonal', ARRAY['All Departments'], true),
  ('Digital & AI Fluency', 'Technical', ARRAY['IT', 'Engineering', 'Product'], true),
  ('Workflow Automation', 'Technical', ARRAY['Operations', 'IT', 'Engineering'], true),
  ('Data Interpretation', 'Cognitive', ARRAY['Analytics', 'Finance', 'Strategy'], true),
  ('Strategic Planning', 'Leadership', ARRAY['Executive', 'Strategy', 'Operations'], true),
  ('Stakeholder Management', 'Interpersonal', ARRAY['Project Management', 'Sales', 'Executive'], true),
  ('Change Management', 'Leadership', ARRAY['HR', 'Operations', 'Executive'], true),
  ('Risk Assessment', 'Cognitive', ARRAY['Finance', 'Legal', 'Operations'], true),
  ('Customer Focus', 'Interpersonal', ARRAY['Sales', 'Support', 'Product'], true),
  ('Team Collaboration', 'Interpersonal', ARRAY['All Departments'], true),
  ('Time Management', 'Self-Management', ARRAY['All Departments'], true),
  ('Conflict Resolution', 'Interpersonal', ARRAY['HR', 'Management', 'Support'], true),
  ('Presentation Skills', 'Interpersonal', ARRAY['Sales', 'Marketing', 'Executive'], true),
  ('Negotiation', 'Interpersonal', ARRAY['Sales', 'Procurement', 'Legal'], true),
  ('Emotional Intelligence', 'Interpersonal', ARRAY['HR', 'Management', 'Support'], true),
  ('Decision Making', 'Cognitive', ARRAY['Management', 'Executive', 'Operations'], true),
  ('Adaptability', 'Self-Management', ARRAY['All Departments'], true),
  ('Quality Assurance', 'Technical', ARRAY['Engineering', 'Operations', 'Product'], true),
  ('Process Optimization', 'Technical', ARRAY['Operations', 'Engineering', 'IT'], true),
  ('Resource Allocation', 'Leadership', ARRAY['Management', 'Operations', 'Finance'], true)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Purge old sub-competencies for Analytical Thinking and reload V5 data
DELETE FROM public.sub_competencies 
WHERE competency_id IN (SELECT id FROM public.master_competencies WHERE name = 'Analytical Thinking');

-- Insert V5 Analytical Thinking sub-competencies (6 scenes)
INSERT INTO public.sub_competencies (
  competency_id, statement, display_order, action_cue, game_mechanic, game_loop, 
  validator_type, player_action, backend_data_captured,
  scoring_formula_level_1, scoring_formula_level_2, scoring_formula_level_3
)
SELECT 
  mc.id,
  sc.statement,
  sc.display_order,
  sc.action_cue,
  sc.game_mechanic,
  sc.game_loop,
  sc.validator_type,
  sc.player_action,
  sc.backend_data_captured,
  sc.scoring_formula_level_1,
  sc.scoring_formula_level_2,
  sc.scoring_formula_level_3
FROM public.master_competencies mc
CROSS JOIN (VALUES
  ('Identify patterns in complex datasets', 1, 'Scrub timeline to isolate anomaly window', 'Continuous Scrub', 'Pattern Grid', 'Binary Gate: Standard', 'Scrub', '["accuracy", "time_s", "scrub_precision", "jitter_variance"]'::jsonb, 'acc<0.85 OR t>30s = 100 PXP', 'acc≥0.90 AND t≤30s = 250 PXP', 'acc≥0.95 AND t≤25s AND jitter<0.15 = 500 PXP'),
  ('Extract relevant information from noise', 2, 'Drag highlight over signal regions', 'Drag-to-Highlight', 'Noise Filter', 'Binary Gate: Standard', 'Drag', '["accuracy", "time_s", "selection_precision", "false_positives"]'::jsonb, 'acc<0.85 OR t>45s = 100 PXP', 'acc≥0.90 AND t≤45s = 250 PXP', 'acc≥0.95 AND t≤38s AND fp=0 = 500 PXP'),
  ('Compare multiple data sources accurately', 3, 'Tap to match corresponding data points', 'Tap-to-Match', 'Comparison Matrix', 'Binary Gate: Standard', 'Tap', '["accuracy", "time_s", "match_speed", "error_rate"]'::jsonb, 'acc<0.85 OR t>60s = 100 PXP', 'acc≥0.90 AND t≤60s = 250 PXP', 'acc≥0.95 AND t≤50s AND err=0 = 500 PXP'),
  ('Recognize trends across time periods', 4, 'Swipe to classify trend direction', 'Swipe-to-Classify', 'Trend Spotter', 'Binary Gate: Standard', 'Swipe', '["accuracy", "time_s", "swipe_consistency", "hesitation_ms"]'::jsonb, 'acc<0.85 OR t>30s = 100 PXP', 'acc≥0.90 AND t≤30s = 250 PXP', 'acc≥0.95 AND t≤25s AND hesitation<200ms = 500 PXP'),
  ('Segment data into meaningful categories', 5, 'Drag items to correct category zones', 'Drag-to-Zone', 'Category Sort', 'Binary Gate: Standard', 'Drag', '["accuracy", "time_s", "zone_precision", "reclassifications"]'::jsonb, 'acc<0.85 OR t>45s = 100 PXP', 'acc≥0.90 AND t≤45s = 250 PXP', 'acc≥0.95 AND t≤38s AND reclass=0 = 500 PXP'),
  ('Synthesize findings into actionable insights', 6, 'Select and order key findings', 'Tap-to-Order', 'Insight Builder', 'Binary Gate: Standard', 'Tap', '["accuracy", "time_s", "order_correctness", "selections"]'::jsonb, 'acc<0.85 OR t>60s = 100 PXP', 'acc≥0.90 AND t≤60s = 250 PXP', 'acc≥0.95 AND t≤50s AND order=100% = 500 PXP')
) AS sc(statement, display_order, action_cue, game_mechanic, game_loop, validator_type, player_action, backend_data_captured, scoring_formula_level_1, scoring_formula_level_2, scoring_formula_level_3)
WHERE mc.name = 'Analytical Thinking';

-- Step 4: Purge and reload Problem Solving sub-competencies
DELETE FROM public.sub_competencies 
WHERE competency_id IN (SELECT id FROM public.master_competencies WHERE name = 'Problem Solving');

INSERT INTO public.sub_competencies (
  competency_id, statement, display_order, action_cue, game_mechanic, game_loop, 
  validator_type, player_action, backend_data_captured,
  scoring_formula_level_1, scoring_formula_level_2, scoring_formula_level_3
)
SELECT 
  mc.id,
  sc.statement,
  sc.display_order,
  sc.action_cue,
  sc.game_mechanic,
  sc.game_loop,
  sc.validator_type,
  sc.player_action,
  sc.backend_data_captured,
  sc.scoring_formula_level_1,
  sc.scoring_formula_level_2,
  sc.scoring_formula_level_3
FROM public.master_competencies mc
CROSS JOIN (VALUES
  ('Define root cause of complex issues', 1, 'Scrub to isolate failure point in timeline', 'Continuous Scrub', 'Root Cause Finder', 'Binary Gate: Standard', 'Scrub', '["accuracy", "time_s", "scrub_precision", "jitter_variance"]'::jsonb, 'acc<0.85 OR t>30s = 100 PXP', 'acc≥0.90 AND t≤30s = 250 PXP', 'acc≥0.95 AND t≤25s AND jitter<0.15 = 500 PXP'),
  ('Generate multiple solution alternatives', 2, 'Tap to select viable solution options', 'Quick-Tap', 'Solution Generator', 'Binary Gate: Standard', 'Tap', '["accuracy", "time_s", "tap_speed", "selection_count"]'::jsonb, 'acc<0.85 OR t>45s = 100 PXP', 'acc≥0.90 AND t≤45s = 250 PXP', 'acc≥0.95 AND t≤38s AND count≥3 = 500 PXP'),
  ('Evaluate trade-offs between options', 3, 'Drag slider to balance trade-off factors', 'Trade-off Slider', 'Balance Scale', 'Binary Gate: Standard', 'Drag', '["accuracy", "time_s", "balance_precision", "adjustments"]'::jsonb, 'acc<0.85 OR t>60s = 100 PXP', 'acc≥0.90 AND t≤60s = 250 PXP', 'acc≥0.95 AND t≤50s AND adj≤3 = 500 PXP'),
  ('Implement solutions under constraints', 4, 'Drag resources to constraint zones', 'Drag-to-Zone', 'Constraint Solver', 'Binary Gate: Standard', 'Drag', '["accuracy", "time_s", "zone_precision", "violations"]'::jsonb, 'acc<0.85 OR t>45s = 100 PXP', 'acc≥0.90 AND t≤45s = 250 PXP', 'acc≥0.95 AND t≤38s AND viol=0 = 500 PXP'),
  ('Monitor solution effectiveness', 5, 'Swipe to flag anomalies in results', 'Swipe-to-Flag', 'Results Monitor', 'Binary Gate: Standard', 'Swipe', '["accuracy", "time_s", "flag_precision", "missed_anomalies"]'::jsonb, 'acc<0.85 OR t>30s = 100 PXP', 'acc≥0.90 AND t≤30s = 250 PXP', 'acc≥0.95 AND t≤25s AND missed=0 = 500 PXP'),
  ('Iterate based on feedback loops', 6, 'Tap to sequence iteration steps', 'Tap-to-Order', 'Iteration Planner', 'Binary Gate: Standard', 'Tap', '["accuracy", "time_s", "order_correctness", "revisions"]'::jsonb, 'acc<0.85 OR t>60s = 100 PXP', 'acc≥0.90 AND t≤60s = 250 PXP', 'acc≥0.95 AND t≤50s AND rev=0 = 500 PXP')
) AS sc(statement, display_order, action_cue, game_mechanic, game_loop, validator_type, player_action, backend_data_captured, scoring_formula_level_1, scoring_formula_level_2, scoring_formula_level_3)
WHERE mc.name = 'Problem Solving';

-- Step 5: Purge and reload Communication & Clarity sub-competencies
DELETE FROM public.sub_competencies 
WHERE competency_id IN (SELECT id FROM public.master_competencies WHERE name = 'Communication & Clarity');

INSERT INTO public.sub_competencies (
  competency_id, statement, display_order, action_cue, game_mechanic, game_loop, 
  validator_type, player_action, backend_data_captured,
  scoring_formula_level_1, scoring_formula_level_2, scoring_formula_level_3
)
SELECT 
  mc.id,
  sc.statement,
  sc.display_order,
  sc.action_cue,
  sc.game_mechanic,
  sc.game_loop,
  sc.validator_type,
  sc.player_action,
  sc.backend_data_captured,
  sc.scoring_formula_level_1,
  sc.scoring_formula_level_2,
  sc.scoring_formula_level_3
FROM public.master_competencies mc
CROSS JOIN (VALUES
  ('Structure messages for clarity', 1, 'Drag message components into correct order', 'Drag-to-Order', 'Message Builder', 'Binary Gate: Standard', 'Drag', '["accuracy", "time_s", "order_precision", "reorders"]'::jsonb, 'acc<0.85 OR t>45s = 100 PXP', 'acc≥0.90 AND t≤45s = 250 PXP', 'acc≥0.95 AND t≤38s AND reord=0 = 500 PXP'),
  ('Adapt tone for different audiences', 2, 'Swipe to match tone with audience type', 'Swipe-to-Match', 'Tone Matcher', 'Binary Gate: Standard', 'Swipe', '["accuracy", "time_s", "match_speed", "mismatches"]'::jsonb, 'acc<0.85 OR t>30s = 100 PXP', 'acc≥0.90 AND t≤30s = 250 PXP', 'acc≥0.95 AND t≤25s AND mismatch=0 = 500 PXP'),
  ('Identify key points in complex information', 3, 'Tap to highlight key information', 'Tap-to-Highlight', 'Key Point Finder', 'Binary Gate: Standard', 'Tap', '["accuracy", "time_s", "highlight_precision", "false_positives"]'::jsonb, 'acc<0.85 OR t>60s = 100 PXP', 'acc≥0.90 AND t≤60s = 250 PXP', 'acc≥0.95 AND t≤50s AND fp=0 = 500 PXP'),
  ('Simplify technical concepts', 4, 'Drag jargon to plain language equivalents', 'Drag-to-Match', 'Simplifier', 'Binary Gate: Standard', 'Drag', '["accuracy", "time_s", "match_precision", "errors"]'::jsonb, 'acc<0.85 OR t>45s = 100 PXP', 'acc≥0.90 AND t≤45s = 250 PXP', 'acc≥0.95 AND t≤38s AND err=0 = 500 PXP'),
  ('Provide constructive feedback', 5, 'Swipe to classify feedback as constructive or not', 'Swipe-to-Classify', 'Feedback Filter', 'Binary Gate: Standard', 'Swipe', '["accuracy", "time_s", "classification_speed", "misclassifications"]'::jsonb, 'acc<0.85 OR t>30s = 100 PXP', 'acc≥0.90 AND t≤30s = 250 PXP', 'acc≥0.95 AND t≤25s AND misclass=0 = 500 PXP'),
  ('Summarize discussions effectively', 6, 'Tap to select essential summary points', 'Tap-to-Select', 'Summary Builder', 'Binary Gate: Standard', 'Tap', '["accuracy", "time_s", "selection_precision", "omissions"]'::jsonb, 'acc<0.85 OR t>60s = 100 PXP', 'acc≥0.90 AND t≤60s = 250 PXP', 'acc≥0.95 AND t≤50s AND omit=0 = 500 PXP')
) AS sc(statement, display_order, action_cue, game_mechanic, game_loop, validator_type, player_action, backend_data_captured, scoring_formula_level_1, scoring_formula_level_2, scoring_formula_level_3)
WHERE mc.name = 'Communication & Clarity';