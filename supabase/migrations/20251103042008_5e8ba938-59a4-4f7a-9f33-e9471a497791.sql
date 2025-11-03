-- Create custom-games storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('custom-games', 'custom-games', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload demo templates
CREATE POLICY "Allow authenticated users to upload custom games"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'custom-games');

-- Allow public read access to custom games
CREATE POLICY "Allow public read access to custom games"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'custom-games');