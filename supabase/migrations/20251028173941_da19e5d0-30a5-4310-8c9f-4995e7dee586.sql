
-- Update the "Actively engages with team members and builds relationships" sub-competency
-- This is the one the AI actually selects for Team Connection
UPDATE sub_competencies
SET 
  action_cue = 'Proactively connect with team members during onboarding sessions',
  game_mechanic = 'Social Connection Map',
  validator_type = 'Team Integration Simulation',
  game_loop = 'Input → Engage → Track → Feedback',
  scoring_formula_level_1 = 'connections≥3 engagement>0.75',
  scoring_formula_level_2 = 'connections≥5 engagement≥0.85',
  scoring_formula_level_3 = 'connections≥7 engagement≥0.95',
  player_action = 'Connect'
WHERE id = '3b32ec7f-cd5b-46f4-9afd-3fbbb9deaf24';

-- Update the "Reflects on learning experiences and progress" sub-competency
-- This is the one the AI actually selects for Feedback & Reflection
UPDATE sub_competencies
SET 
  action_cue = 'Ask for feedback from mentors or peers after initial tasks',
  game_mechanic = 'Feedback Loop Tracker',
  validator_type = 'Reflection & Feedback Simulation',
  game_loop = 'Input → Request → Receive → Reflect',
  scoring_formula_level_1 = 'feedback_requests≥2 reflection_depth>0.70',
  scoring_formula_level_2 = 'feedback_requests≥3 reflection_depth≥0.85',
  scoring_formula_level_3 = 'feedback_requests≥4 reflection_depth≥0.95 t≤60',
  player_action = 'Request'
WHERE id = '2770bfcc-d4a9-4ca1-8617-2c2647142745';
