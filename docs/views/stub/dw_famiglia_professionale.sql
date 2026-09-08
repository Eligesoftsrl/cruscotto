-- STUB (vuota) — public.dw_famiglia_professionale
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_famiglia_professionale CASCADE;
CREATE VIEW public.dw_famiglia_professionale AS
SELECT
  NULL::text AS codice,
  NULL::text AS comparto,
  NULL::text AS dimensione_professionale,
  NULL::text AS titolo
WHERE false;
-- GRANT SELECT ON public.dw_famiglia_professionale TO anon, authenticated;
