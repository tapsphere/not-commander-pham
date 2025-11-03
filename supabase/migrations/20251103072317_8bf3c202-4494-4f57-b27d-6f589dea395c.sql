-- Create custom-games storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('custom-games', 'custom-games', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow authenticated users to upload to custom-games bucket
CREATE POLICY "Authenticated users can upload custom games"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'custom-games');

-- Allow authenticated users to update their custom games
CREATE POLICY "Authenticated users can update custom games"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'custom-games');

-- Allow everyone to read from custom-games bucket (public access)
CREATE POLICY "Public read access to custom games"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'custom-games');

-- Allow authenticated users to delete their custom games
CREATE POLICY "Authenticated users can delete custom games"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'custom-games');