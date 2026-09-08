-- STUB (vuota) — public.dw_inpa_bandi
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_inpa_bandi CASCADE;
CREATE VIEW public.dw_inpa_bandi AS
SELECT
  NULL::integer AS anno,
  NULL::text AS categoria_ipa,
  NULL::text AS cfiscale_pa,
  NULL::text AS codice,
  NULL::text AS data_pubblicazione,
  NULL::text AS data_scadenza,
  NULL::text AS fascia_retributiva,
  NULL::text AS figura_ricercata,
  NULL::integer AS id,
  NULL::integer AS id_ente,
  NULL::numeric AS num_candidature_submitted,
  NULL::numeric AS num_posti,
  NULL::text AS provincia,
  NULL::text AS regione,
  NULL::text AS settore_pubblicazione,
  NULL::text AS stato_bando,
  NULL::text AS tipo_procedura,
  NULL::text AS tipologia_ipa
WHERE false;
-- GRANT SELECT ON public.dw_inpa_bandi TO anon, authenticated;
