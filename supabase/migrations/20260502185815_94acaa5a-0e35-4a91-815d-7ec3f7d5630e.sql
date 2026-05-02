CREATE POLICY "Authenticated users can read beta signups"
ON public.beta_signups
FOR SELECT
TO authenticated
USING (true);