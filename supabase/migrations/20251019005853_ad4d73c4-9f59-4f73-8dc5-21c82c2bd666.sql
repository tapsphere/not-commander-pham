-- Create storage bucket for course files
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-files', 'course-files', false)
ON CONFLICT (id) DO NOTHING;

-- Allow brands to upload their own course files
CREATE POLICY "Brands can upload own course files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'course-files' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  has_role(auth.uid(), 'brand'::app_role)
);

-- Allow brands to view their own course files
CREATE POLICY "Brands can view own course files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'course-files' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  has_role(auth.uid(), 'brand'::app_role)
);

-- Allow brands to delete their own course files
CREATE POLICY "Brands can delete own course files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'course-files' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  has_role(auth.uid(), 'brand'::app_role)
);