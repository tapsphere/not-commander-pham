-- Update Initiative sub-competency (Takes proactive steps to learn new systems and processes)
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
WHERE id = '00a6dd00-5d35-451e-a137-46626c6ac3d9';

-- Update Team Connection sub-competency (Participates in team activities and collaborates effectively) 
-- This one is already correct, but updating to ensure consistency
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
WHERE id = '652d7e14-942d-40fc-9214-2b169739064f';

-- Update Coaching & Mentorship sub-competency (Seeks guidance from mentors and managers when needed)
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
WHERE id = 'd77074ec-0868-4fdd-8e68-893055e3f84f';

-- Update Feedback & Reflection sub-competency (Provides and receives constructive feedback openly)
-- This one is already correct, but updating to ensure consistency
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
WHERE id = 'ab64d5d4-1503-4429-b9e5-ee73af59b9fd';