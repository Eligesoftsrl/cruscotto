-- STUB (vuota) — public.dw_syllabus_partecipazioni
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_syllabus_partecipazioni CASCADE;
CREATE VIEW public.dw_syllabus_partecipazioni AS
SELECT
  NULL::integer AS anno,
  NULL::numeric AS anzianita_pa,
  NULL::text AS attivita_svolte,
  NULL::numeric AS durata_ore,
  NULL::text AS esito_finale,
  NULL::numeric AS eta,
  NULL::text AS fascia_eta,
  NULL::text AS genere,
  NULL::integer AS id,
  NULL::text AS id_competenza,
  NULL::integer AS id_corso,
  NULL::integer AS id_discente,
  NULL::integer AS id_pa,
  NULL::numeric AS livello_a,
  NULL::numeric AS livello_da,
  NULL::text AS qualifica,
  NULL::text AS tipo_contratto,
  NULL::text AS titolo_studio
WHERE false;
-- GRANT SELECT ON public.dw_syllabus_partecipazioni TO anon, authenticated;
