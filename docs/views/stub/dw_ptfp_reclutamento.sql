-- STUB (vuota) — public.dw_ptfp_reclutamento
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_ptfp_reclutamento CASCADE;
CREATE VIEW public.dw_ptfp_reclutamento AS
SELECT
  NULL::integer AS anno_piano,
  NULL::text AS area_giuridica,
  NULL::text AS cfiscale_amm,
  NULL::integer AS id,
  NULL::text AS procedura_selettiva,
  NULL::text AS profilo_di_ruolo,
  NULL::text AS tipologia,
  NULL::numeric AS totale_impegnato,
  NULL::text AS triennio,
  NULL::numeric AS ula_da_assumere,
  NULL::numeric AS valore_economico
WHERE false;
-- GRANT SELECT ON public.dw_ptfp_reclutamento TO anon, authenticated;
