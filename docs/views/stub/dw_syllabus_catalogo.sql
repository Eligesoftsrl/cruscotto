-- STUB (vuota) — public.dw_syllabus_catalogo
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_syllabus_catalogo CASCADE;
CREATE VIEW public.dw_syllabus_catalogo AS
SELECT
  NULL::text AS categoria_syllabus,
  NULL::text AS competenza,
  NULL::text AS denominazione_corso,
  NULL::numeric AS durata_ore,
  NULL::text AS famiglia_livelli,
  NULL::integer AS id,
  NULL::integer AS id_corso,
  NULL::integer AS id_programma,
  NULL::text AS livello,
  NULL::text AS programma,
  NULL::text AS tipologia
WHERE false;
-- GRANT SELECT ON public.dw_syllabus_catalogo TO anon, authenticated;
