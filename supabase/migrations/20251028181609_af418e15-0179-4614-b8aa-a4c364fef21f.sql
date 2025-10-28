-- Update Team Connection sub-competency with correct game mechanic
UPDATE sub_competencies
SET 
  game_mechanic = 'Role-Based Scenario Game',
  action_cue = 'Match each scenario to best communication channel (Teams, Chat, Email).'
WHERE id = '3b32ec7f-cd5b-46f4-9afd-3fbbb9deaf24';