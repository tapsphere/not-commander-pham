-- Update Initiative sub-competency
UPDATE sub_competencies
SET 
  action_cue = 'Choose correct pre-day tasks to prepare new hire workspace.',
  game_mechanic = 'Task Sequencing / Checklist Challenge',
  validator_type = 'Scenario Simulation',
  game_loop = 'Input → Action → Feedback → Submit',
  scoring_formula_level_1 = 'acc<0.85',
  scoring_formula_level_2 = 'acc≥0.90',
  scoring_formula_level_3 = 'acc≥0.95 t≤90',
  player_action = 'Choose'
WHERE statement = 'Takes proactive steps without direct instruction';

-- Update Team Connection sub-competency
UPDATE sub_competencies
SET 
  action_cue = 'Match each scenario to best communication channel (Teams, Chat, Email).',
  game_mechanic = 'Role-Based Scenario Game',
  validator_type = 'Case Simulation',
  game_loop = 'Input → Choice → Feedback → Re-attempt',
  scoring_formula_level_1 = 'acc<0.85',
  scoring_formula_level_2 = 'acc≥0.90',
  scoring_formula_level_3 = 'acc≥0.95 t≤60',
  player_action = 'Match'
WHERE statement = 'Participates in team activities and collaborates effectively';

-- Update Coaching & Mentorship sub-competency
UPDATE sub_competencies
SET 
  action_cue = 'Identify which support resource best helps the new hire.',
  game_mechanic = 'Decision-Tree Challenge',
  validator_type = 'Mentorship Simulation',
  game_loop = 'Input → Select → Feedback → Iterate',
  scoring_formula_level_1 = 'acc<0.80',
  scoring_formula_level_2 = 'acc≥0.90',
  scoring_formula_level_3 = 'acc≥0.95 t≤75',
  player_action = 'Identify'
WHERE statement = 'Guides peers through structured mentorship activities';

-- Update Feedback & Reflection sub-competency
UPDATE sub_competencies
SET 
  action_cue = 'Choose correct feedback action after performance review.',
  game_mechanic = 'Scenario Response Game',
  validator_type = 'Feedback Simulation',
  game_loop = 'Input → Choice → Feedback → Submit',
  scoring_formula_level_1 = 'acc<0.80',
  scoring_formula_level_2 = 'acc≥0.90',
  scoring_formula_level_3 = 'acc≥0.95 t≤75',
  player_action = 'Choose'
WHERE statement = 'Provides and receives constructive feedback openly';