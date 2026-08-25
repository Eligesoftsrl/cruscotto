
DROP POLICY IF EXISTS "read_dw_inpa_bandi" ON public.dw_inpa_bandi;
CREATE POLICY "read_dw_inpa_bandi" ON public.dw_inpa_bandi FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "read_dw_lp_graduatorie" ON public.dw_lp_graduatorie;
CREATE POLICY "read_dw_lp_graduatorie" ON public.dw_lp_graduatorie FOR SELECT TO anon, authenticated USING (true);
