-- Ensure custom-games bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'custom-games';

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Create RLS policy to allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'custom-games');