-- Create validator test results table
CREATE TABLE public.validator_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.game_templates(id) ON DELETE CASCADE NOT NULL,
  sub_competency_id UUID REFERENCES public.sub_competencies(id) NOT NULL,
  tester_id UUID NOT NULL,
  test_version TEXT NOT NULL DEFAULT '1.0',
  template_type TEXT NOT NULL, -- 'ai_generated' or 'custom_upload'
  
  -- Phase 1: UX/UI Flow
  phase1_status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'passed', 'failed'
  phase1_notes TEXT,
  phase1_checklist JSONB DEFAULT '{}'::jsonb,
  
  -- Phase 2: Action Cue Validation
  phase2_status TEXT DEFAULT 'not_started',
  phase2_notes TEXT,
  backend_data_captured JSONB DEFAULT '{}'::jsonb,
  
  -- Phase 3: Score Formula
  phase3_status TEXT DEFAULT 'not_started',
  phase3_notes TEXT,
  phase3_test_runs JSONB DEFAULT '[]'::jsonb,
  
  -- Overall
  overall_status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'passed', 'failed', 'needs_review'
  tested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_for_publish BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.validator_test_results ENABLE ROW LEVEL SECURITY;

-- Creators can view test results for their own templates
CREATE POLICY "Creators can view own template tests"
ON public.validator_test_results
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.game_templates
    WHERE game_templates.id = validator_test_results.template_id
    AND game_templates.creator_id = auth.uid()
    AND has_role(auth.uid(), 'creator'::app_role)
  )
);

-- Creators can insert test results for their own templates
CREATE POLICY "Creators can create tests for own templates"
ON public.validator_test_results
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.game_templates
    WHERE game_templates.id = validator_test_results.template_id
    AND game_templates.creator_id = auth.uid()
    AND has_role(auth.uid(), 'creator'::app_role)
  )
);

-- Creators can update test results for their own templates
CREATE POLICY "Creators can update own template tests"
ON public.validator_test_results
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.game_templates
    WHERE game_templates.id = validator_test_results.template_id
    AND game_templates.creator_id = auth.uid()
    AND has_role(auth.uid(), 'creator'::app_role)
  )
);

-- Brands can view test results for validators they might use
CREATE POLICY "Brands can view published validator tests"
ON public.validator_test_results
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.game_templates
    WHERE game_templates.id = validator_test_results.template_id
    AND game_templates.is_published = true
  )
  AND has_role(auth.uid(), 'brand'::app_role)
);

-- Add updated_at trigger
CREATE TRIGGER update_validator_test_results_updated_at
BEFORE UPDATE ON public.validator_test_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster queries
CREATE INDEX idx_validator_test_results_template_id ON public.validator_test_results(template_id);
CREATE INDEX idx_validator_test_results_overall_status ON public.validator_test_results(overall_status);
CREATE INDEX idx_validator_test_results_tester_id ON public.validator_test_results(tester_id);