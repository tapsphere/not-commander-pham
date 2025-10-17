-- Drop existing policy and recreate properly
DROP POLICY IF EXISTS "Anyone can view competencies" ON public.master_competencies;

-- Create a proper policy that works for both authenticated and anonymous users
CREATE POLICY "Enable read access for all users"
ON public.master_competencies
FOR SELECT
TO public
USING (true);