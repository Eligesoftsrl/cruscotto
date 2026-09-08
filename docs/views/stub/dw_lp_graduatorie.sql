-- STUB (vuota) — public.dw_lp_graduatorie
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_lp_graduatorie CASCADE;
CREATE VIEW public.dw_lp_graduatorie AS
SELECT
  NULL::integer AS anno,
  NULL::text AS categoria,
  NULL::text AS cfiscale_amm,
  NULL::text AS contratto,
  NULL::text AS data_approvazione_graduatoria,
  NULL::text AS data_pubblicazione_bando_gu,
  NULL::text AS denominazione,
  NULL::text AS famiglia_professionale,
  NULL::integer AS id,
  NULL::integer AS id_ente,
  NULL::numeric AS num_idonei,
  NULL::numeric AS num_idonei_assunti,
  NULL::numeric AS num_idonei_disponibili,
  NULL::numeric AS num_posti_banditi,
  NULL::numeric AS num_vincitori_assunti,
  NULL::numeric AS num_vincitori_da_assumere,
  NULL::text AS profilo,
  NULL::text AS qualifica,
  NULL::text AS stato_graduatoria,
  NULL::numeric AS tcp_giorni,
  NULL::text AS tipologia
WHERE false;
-- GRANT SELECT ON public.dw_lp_graduatorie TO anon, authenticated;
