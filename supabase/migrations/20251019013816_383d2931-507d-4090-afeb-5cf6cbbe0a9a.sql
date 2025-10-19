-- Allow brands to insert master competencies if they don't exist
CREATE POLICY "Brands can insert master competencies"
ON public.master_competencies
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'brand'::app_role));

-- Allow brands to insert sub-competencies if they don't exist
CREATE POLICY "Brands can insert sub competencies"
ON public.sub_competencies
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.master_competencies
    WHERE id = competency_id
  )
  AND has_role(auth.uid(), 'brand'::app_role)
);