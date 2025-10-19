-- Make creator_id nullable temporarily for demo templates
ALTER TABLE game_templates 
ALTER COLUMN creator_id DROP NOT NULL;

-- Create sample game templates for validators
-- Template 1: Mood Mapper
INSERT INTO game_templates (
  id,
  creator_id,
  name,
  description,
  template_type,
  base_prompt,
  preview_image,
  is_published,
  game_config
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  NULL, -- demo template
  'Mood Mapper',
  'Identify and interpret emotional states from facial expressions and scenarios to demonstrate emotional intelligence.',
  'ai_generated',
  'Interactive emotion identification game that tests emotional awareness and interpretation skills.',
  '/validator-previews/data-pattern-detective.jpg',
  true,
  '{
    "validator_type": "Mood Mapper",
    "competency_focus": "Emotional Intelligence",
    "difficulty_levels": ["novice", "intermediate", "expert"]
  }'::jsonb
);

-- Template 2: Crisis Communication
INSERT INTO game_templates (
  id,
  creator_id,
  name,
  description,
  template_type,
  base_prompt,
  preview_image,
  is_published,
  game_config
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  NULL,
  'Crisis Communication',
  'Navigate high-pressure communication scenarios and make critical decisions under stress.',
  'ai_generated',
  'Crisis management game testing communication skills, decision-making, and conflict resolution.',
  '/validator-previews/crisis-communication.jpg',
  true,
  '{
    "validator_type": "Crisis Communication",
    "competency_focus": "Communication & Leadership",
    "difficulty_levels": ["novice", "intermediate", "expert"]
  }'::jsonb
);

-- Template 3: Tone Match Game
INSERT INTO game_templates (
  id,
  creator_id,
  name,
  description,
  template_type,
  base_prompt,
  preview_image,
  is_published,
  game_config
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  NULL,
  'Tone Match Game',
  'Listen carefully and identify the intended tone and emotional content of spoken messages.',
  'ai_generated',
  'Active listening game that tests tone recognition and message interpretation skills.',
  '/validator-previews/narrative-builder.jpg',
  true,
  '{
    "validator_type": "Tone Match Game",
    "competency_focus": "Active Listening",
    "difficulty_levels": ["novice", "intermediate", "expert"]
  }'::jsonb
);

-- Template 4: Empathy Scenario
INSERT INTO game_templates (
  id,
  creator_id,
  name,
  description,
  template_type,
  base_prompt,
  preview_image,
  is_published,
  game_config
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  NULL,
  'Empathy Scenario',
  'Demonstrate understanding and compassion by responding appropriately to others emotional states.',
  'ai_generated',
  'Empathy-building game testing perspective-taking and compassionate response skills.',
  '/validator-previews/budget-allocation.jpg',
  true,
  '{
    "validator_type": "Empathy Scenario",
    "competency_focus": "Empathy & Compassion",
    "difficulty_levels": ["novice", "intermediate", "expert"]
  }'::jsonb
);

-- Template 5: Narrative Builder
INSERT INTO game_templates (
  id,
  creator_id,
  name,
  description,
  template_type,
  base_prompt,
  preview_image,
  is_published,
  game_config
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  NULL,
  'Narrative Builder',
  'Construct clear, concise, and impactful messages that effectively communicate ideas.',
  'ai_generated',
  'Message crafting game testing clarity, conciseness, and persuasive communication.',
  '/validator-previews/narrative-builder.jpg',
  true,
  '{
    "validator_type": "Narrative Builder",
    "competency_focus": "Verbal Communication",
    "difficulty_levels": ["novice", "intermediate", "expert"]
  }'::jsonb
);