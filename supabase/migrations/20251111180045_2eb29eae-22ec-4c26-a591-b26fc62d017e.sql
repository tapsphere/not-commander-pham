-- Create design elements table for tracking designer-uploaded assets
CREATE TABLE public.design_elements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  element_type TEXT NOT NULL, -- mascot, background, ui_pack, effect, audio, decorative
  element_subtype TEXT, -- animated, static, 3d, lottie, sprite
  name TEXT NOT NULL,
  description TEXT,
  
  -- File references
  file_url TEXT NOT NULL,
  preview_url TEXT,
  thumbnail_url TEXT,
  
  -- Placement rules (where this element can be used)
  allowed_zones TEXT[] NOT NULL DEFAULT '{}',
  
  -- Technical specifications stored as JSON
  specs JSONB DEFAULT '{}',
  
  -- Publishing and approval
  is_published BOOLEAN DEFAULT false,
  review_status TEXT DEFAULT 'pending_review', -- pending_review, approved, rejected
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Usage tracking for future royalty payouts
  usage_count INTEGER DEFAULT 0,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  file_size_bytes INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to track element usage by brands (for royalty calculations)
CREATE TABLE public.element_usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  element_id UUID NOT NULL REFERENCES public.design_elements(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL,
  customization_id UUID REFERENCES public.brand_customizations(id) ON DELETE CASCADE,
  placement_zone TEXT NOT NULL,
  
  -- Custom configuration for this usage
  custom_config JSONB DEFAULT '{}',
  
  -- Tracking when element was added
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.design_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.element_usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for design_elements

-- Creators can view their own elements (published or not)
CREATE POLICY "Creators can view own elements"
ON public.design_elements
FOR SELECT
USING (
  creator_id = auth.uid() AND has_role(auth.uid(), 'creator'::app_role)
);

-- Creators can create elements
CREATE POLICY "Creators can create elements"
ON public.design_elements
FOR INSERT
WITH CHECK (
  creator_id = auth.uid() AND has_role(auth.uid(), 'creator'::app_role)
);

-- Creators can update own unpublished elements
CREATE POLICY "Creators can update own elements"
ON public.design_elements
FOR UPDATE
USING (
  creator_id = auth.uid() AND has_role(auth.uid(), 'creator'::app_role)
);

-- Creators can delete own unpublished elements
CREATE POLICY "Creators can delete own elements"
ON public.design_elements
FOR DELETE
USING (
  creator_id = auth.uid() AND 
  has_role(auth.uid(), 'creator'::app_role) AND 
  is_published = false
);

-- Brands can view published elements
CREATE POLICY "Brands can view published elements"
ON public.design_elements
FOR SELECT
USING (
  is_published = true AND 
  review_status = 'approved' AND
  has_role(auth.uid(), 'brand'::app_role)
);

-- RLS Policies for element_usage_tracking

-- Brands can track their own usage
CREATE POLICY "Brands can track element usage"
ON public.element_usage_tracking
FOR INSERT
WITH CHECK (
  brand_id = auth.uid() AND has_role(auth.uid(), 'brand'::app_role)
);

-- Brands can view their own usage
CREATE POLICY "Brands can view own usage"
ON public.element_usage_tracking
FOR SELECT
USING (
  brand_id = auth.uid() AND has_role(auth.uid(), 'brand'::app_role)
);

-- Creators can view usage of their elements (for royalty tracking)
CREATE POLICY "Creators can view usage of their elements"
ON public.element_usage_tracking
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.design_elements
    WHERE design_elements.id = element_usage_tracking.element_id
    AND design_elements.creator_id = auth.uid()
  ) AND has_role(auth.uid(), 'creator'::app_role)
);

-- Create function to increment usage count
CREATE OR REPLACE FUNCTION public.increment_element_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.design_elements
  SET usage_count = usage_count + 1
  WHERE id = NEW.element_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-increment usage count
CREATE TRIGGER increment_element_usage_trigger
AFTER INSERT ON public.element_usage_tracking
FOR EACH ROW
EXECUTE FUNCTION public.increment_element_usage();

-- Create trigger for updated_at
CREATE TRIGGER update_design_elements_updated_at
BEFORE UPDATE ON public.design_elements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_design_elements_creator ON public.design_elements(creator_id);
CREATE INDEX idx_design_elements_type ON public.design_elements(element_type);
CREATE INDEX idx_design_elements_published ON public.design_elements(is_published, review_status);
CREATE INDEX idx_element_usage_element ON public.element_usage_tracking(element_id);
CREATE INDEX idx_element_usage_brand ON public.element_usage_tracking(brand_id);