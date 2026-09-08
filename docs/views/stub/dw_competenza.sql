-- STUB (vuota) — public.dw_competenza
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_competenza CASCADE;
CREATE VIEW public.dw_competenza AS
SELECT
  NULL::text AS area,
  NULL::text AS codice,
  NULL::text AS tipo,
  NULL::text AS titolo
WHERE false;
-- GRANT SELECT ON public.dw_competenza TO anon, authenticated;
