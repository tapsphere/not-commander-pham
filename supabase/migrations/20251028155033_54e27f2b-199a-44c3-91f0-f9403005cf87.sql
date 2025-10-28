-- Update Initiative sub-competencies with action_cue, game_mechanic, and backend_data_captured
UPDATE public.sub_competencies 
SET 
  action_cue = 'Demonstrate proactive behavior in learning new systems',
  game_mechanic = 'Task Completion Tracker',
  backend_data_captured = '["task_completion_time", "help_requests_count", "self_guided_actions"]'::jsonb
WHERE statement = 'Takes proactive steps to learn new systems and processes';

UPDATE public.sub_competencies 
SET 
  action_cue = 'Show initiative in seeking information',
  game_mechanic = 'Resource Discovery Challenge',
  backend_data_captured = '["resources_found", "independent_searches", "documentation_views"]'::jsonb
WHERE statement = 'Seeks out resources and information independently';

-- Update Team Connection sub-competencies
UPDATE public.sub_competencies 
SET 
  action_cue = 'Engage with team members during onboarding',
  game_mechanic = 'Relationship Building Network',
  backend_data_captured = '["interactions_count", "team_members_met", "conversation_depth"]'::jsonb
WHERE statement = 'Actively engages with team members and builds relationships';

UPDATE public.sub_competencies 
SET 
  action_cue = 'Collaborate on group activities',
  game_mechanic = 'Team Activity Tracker',
  backend_data_captured = '["collaborative_tasks", "team_contributions", "participation_rate"]'::jsonb
WHERE statement = 'Participates in team activities and collaborative tasks';

-- Update Coaching & Mentorship sub-competencies
UPDATE public.sub_competencies 
SET 
  action_cue = 'Seek guidance when needed',
  game_mechanic = 'Mentor Connection Flow',
  backend_data_captured = '["mentor_meetings", "questions_asked", "guidance_followed"]'::jsonb
WHERE statement = 'Seeks guidance from mentors and managers when needed';

UPDATE public.sub_competencies 
SET 
  action_cue = 'Apply mentor feedback',
  game_mechanic = 'Feedback Application Meter',
  backend_data_captured = '["feedback_received", "actions_taken", "improvement_rate"]'::jsonb
WHERE statement = 'Applies feedback and coaching to improve performance';

-- Update Feedback & Reflection sub-competencies
UPDATE public.sub_competencies 
SET 
  action_cue = 'Reflect on learning experiences',
  game_mechanic = 'Reflection Journal Tracker',
  backend_data_captured = '["reflections_logged", "insights_captured", "self_awareness_score"]'::jsonb
WHERE statement = 'Reflects on learning experiences and progress';

UPDATE public.sub_competencies 
SET 
  action_cue = 'Provide feedback on onboarding process',
  game_mechanic = 'Feedback Survey System',
  backend_data_captured = '["feedback_submissions", "improvement_suggestions", "satisfaction_rating"]'::jsonb
WHERE statement = 'Provides feedback on the onboarding experience';