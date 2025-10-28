-- Add the 4 custom onboarding competencies
INSERT INTO public.master_competencies (name, cbe_category, departments, is_active)
VALUES 
  ('Initiative', '5. Onboarding & Integration', ARRAY['all'], true),
  ('Team Connection', '5. Onboarding & Integration', ARRAY['all'], true),
  ('Coaching & Mentorship', '5. Onboarding & Integration', ARRAY['all'], true),
  ('Feedback & Reflection', '5. Onboarding & Integration', ARRAY['all'], true)
ON CONFLICT DO NOTHING;

-- Add sub-competencies for Initiative
INSERT INTO public.sub_competencies (competency_id, statement, display_order)
SELECT mc.id, 'Takes proactive steps to learn new systems and processes', 1
FROM master_competencies mc WHERE mc.name = 'Initiative'
ON CONFLICT DO NOTHING;

INSERT INTO public.sub_competencies (competency_id, statement, display_order)
SELECT mc.id, 'Seeks out resources and information independently', 2
FROM master_competencies mc WHERE mc.name = 'Initiative'
ON CONFLICT DO NOTHING;

-- Add sub-competencies for Team Connection
INSERT INTO public.sub_competencies (competency_id, statement, display_order)
SELECT mc.id, 'Actively engages with team members and builds relationships', 1
FROM master_competencies mc WHERE mc.name = 'Team Connection'
ON CONFLICT DO NOTHING;

INSERT INTO public.sub_competencies (competency_id, statement, display_order)
SELECT mc.id, 'Participates in team activities and collaborates effectively', 2
FROM master_competencies mc WHERE mc.name = 'Team Connection'
ON CONFLICT DO NOTHING;

-- Add sub-competencies for Coaching & Mentorship
INSERT INTO public.sub_competencies (competency_id, statement, display_order)
SELECT mc.id, 'Seeks guidance from mentors and managers when needed', 1
FROM master_competencies mc WHERE mc.name = 'Coaching & Mentorship'
ON CONFLICT DO NOTHING;

INSERT INTO public.sub_competencies (competency_id, statement, display_order)
SELECT mc.id, 'Applies feedback and coaching to improve performance', 2
FROM master_competencies mc WHERE mc.name = 'Coaching & Mentorship'
ON CONFLICT DO NOTHING;

-- Add sub-competencies for Feedback & Reflection
INSERT INTO public.sub_competencies (competency_id, statement, display_order)
SELECT mc.id, 'Reflects on learning experiences and progress', 1
FROM master_competencies mc WHERE mc.name = 'Feedback & Reflection'
ON CONFLICT DO NOTHING;

INSERT INTO public.sub_competencies (competency_id, statement, display_order)
SELECT mc.id, 'Provides and receives constructive feedback openly', 2
FROM master_competencies mc WHERE mc.name = 'Feedback & Reflection'
ON CONFLICT DO NOTHING;