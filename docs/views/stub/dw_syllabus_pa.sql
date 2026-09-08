-- STUB (vuota) — public.dw_syllabus_pa
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_syllabus_pa CASCADE;
CREATE VIEW public.dw_syllabus_pa AS
SELECT
  NULL::integer AS anno_partecipazione,
  NULL::text AS categoria_ipa,
  NULL::text AS cfiscale,
  NULL::text AS comparto,
  NULL::text AS denominazione,
  NULL::integer AS id_pa_syllabus,
  NULL::text AS provincia,
  NULL::text AS regione,
  NULL::text AS tipologia,
  NULL::text AS tipologia_ipa
WHERE false;
-- GRANT SELECT ON public.dw_syllabus_pa TO anon, authenticated;
