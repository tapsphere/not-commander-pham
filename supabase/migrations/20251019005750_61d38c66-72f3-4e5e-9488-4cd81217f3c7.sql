-- Create table for course uploads and analysis
CREATE TABLE public.course_gamification (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id uuid NOT NULL,
  course_name text NOT NULL,
  course_description text,
  file_url text,
  file_type text,
  analysis_results jsonb DEFAULT '{}'::jsonb,
  competency_mappings jsonb DEFAULT '[]'::jsonb,
  recommended_validators jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.course_gamification ENABLE ROW LEVEL SECURITY;

-- Brands can view their own course analyses
CREATE POLICY "Brands can view own course analyses"
ON public.course_gamification
FOR SELECT
USING (brand_id = auth.uid() AND has_role(auth.uid(), 'brand'::app_role));

-- Brands can create course analyses
CREATE POLICY "Brands can create course analyses"
ON public.course_gamification
FOR INSERT
WITH CHECK (brand_id = auth.uid() AND has_role(auth.uid(), 'brand'::app_role));

-- Brands can update their own course analyses
CREATE POLICY "Brands can update own course analyses"
ON public.course_gamification
FOR UPDATE
USING (brand_id = auth.uid() AND has_role(auth.uid(), 'brand'::app_role));

-- Brands can delete their own course analyses
CREATE POLICY "Brands can delete own course analyses"
ON public.course_gamification
FOR DELETE
USING (brand_id = auth.uid() AND has_role(auth.uid(), 'brand'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_course_gamification_updated_at
BEFORE UPDATE ON public.course_gamification
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();