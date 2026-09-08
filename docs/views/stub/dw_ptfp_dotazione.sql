-- STUB (vuota) — public.dw_ptfp_dotazione
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_ptfp_dotazione CASCADE;
CREATE VIEW public.dw_ptfp_dotazione AS
SELECT
  NULL::text AS categoria_giuridica,
  NULL::text AS cfiscale_amm,
  NULL::integer AS id,
  NULL::numeric AS n_teste_dotazione,
  NULL::numeric AS spesa_massima,
  NULL::text AS triennio,
  NULL::numeric AS valore_economico
WHERE false;
-- GRANT SELECT ON public.dw_ptfp_dotazione TO anon, authenticated;
