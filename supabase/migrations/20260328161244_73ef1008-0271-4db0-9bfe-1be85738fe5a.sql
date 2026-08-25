CREATE POLICY "Allow anon read on minerva_adozione_profili"
ON public.minerva_adozione_profili
FOR SELECT
TO anon
USING (true);