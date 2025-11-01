-- Create storage bucket for framework files
INSERT INTO storage.buckets (id, name, public)
VALUES ('framework-files', 'framework-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to framework files
CREATE POLICY "Public read access for framework files"
ON storage.objects FOR SELECT
USING (bucket_id = 'framework-files');