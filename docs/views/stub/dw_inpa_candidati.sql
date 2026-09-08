-- STUB (vuota) — public.dw_inpa_candidati
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_inpa_candidati CASCADE;
CREATE VIEW public.dw_inpa_candidati AS
SELECT
  NULL::integer AS anno,
  NULL::text AS area_geografica,
  NULL::text AS fascia_eta,
  NULL::text AS genere,
  NULL::integer AS id,
  NULL::integer AS id_bando,
  NULL::numeric AS num_candidature,
  NULL::text AS regione,
  NULL::text AS titolo_studio
WHERE false;
-- GRANT SELECT ON public.dw_inpa_candidati TO anon, authenticated;
