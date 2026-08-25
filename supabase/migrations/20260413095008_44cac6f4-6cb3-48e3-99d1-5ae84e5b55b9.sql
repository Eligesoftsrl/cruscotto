DROP POLICY IF EXISTS "read_dw_kpi_rilevazione" ON public.dw_kpi_rilevazione;
CREATE POLICY "read_dw_kpi_rilevazione" ON public.dw_kpi_rilevazione FOR SELECT TO authenticated, anon USING (true);