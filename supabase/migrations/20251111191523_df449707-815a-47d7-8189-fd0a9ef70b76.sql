-- Create storage bucket for design elements
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-elements', 'design-elements', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for design-elements bucket

-- Creators can upload their own design elements
CREATE POLICY "Creators can upload design elements"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'design-elements' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Creators can view their own design elements
CREATE POLICY "Creators can view own design elements"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'design-elements' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Anyone can view published design elements (public access)
CREATE POLICY "Public can view design elements"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'design-elements');

-- Creators can delete their own unpublished elements
CREATE POLICY "Creators can delete own design elements"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'design-elements' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);