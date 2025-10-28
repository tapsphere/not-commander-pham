-- Update "Actively engages with team members and builds relationships" with correct action cue
UPDATE sub_competencies
SET 
  action_cue = 'Match each scenario to best communication channel (Teams, Chat, Email).',
  game_mechanic = 'Scenario-Based Matching',
  validator_type = 'Communication Simulation',
  game_loop = 'Input → Match → Feedback → Adjust',
  scoring_formula_level_1 = 'matches≥3 accuracy>0.70',
  scoring_formula_level_2 = 'matches≥4 accuracy≥0.85',
  scoring_formula_level_3 = 'matches≥5 accuracy≥0.95',
  player_action = 'Match'
WHERE id = '3b32ec7f-cd5b-46f4-9afd-3fbbb9deaf24';

-- Update "Reflects on learning experiences and progress" with correct action cue  
UPDATE sub_competencies
SET 
  action_cue = 'Choose correct feedback action after performance review.',
  game_mechanic = 'Decision-Point Challenge',
  validator_type = 'Feedback Response Simulation',
  game_loop = 'Input → Decide → Submit → Reflect',
  scoring_formula_level_1 = 'decisions≥3 appropriateness>0.70',
  scoring_formula_level_2 = 'decisions≥4 appropriateness≥0.85',
  scoring_formula_level_3 = 'decisions≥5 appropriateness≥0.95 t≤60',
  player_action = 'Decide'
WHERE id = '2770bfcc-d4a9-4ca1-8617-2c2647142745';