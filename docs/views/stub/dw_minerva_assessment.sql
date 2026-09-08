-- STUB (vuota) — public.dw_minerva_assessment
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_minerva_assessment CASCADE;
CREATE VIEW public.dw_minerva_assessment AS
SELECT
  NULL::integer AS anno,
  NULL::text AS ciclo,
  NULL::text AS created_at,
  NULL::text AS data_fine,
  NULL::text AS data_inizio,
  NULL::numeric AS gap_max,
  NULL::numeric AS gap_medio,
  NULL::integer AS id,
  NULL::integer AS id_ente,
  NULL::numeric AS nr_competenze_valutate,
  NULL::numeric AS nr_dipendenti_totali,
  NULL::numeric AS nr_dipendenti_valutati,
  NULL::numeric AS nr_profili_coinvolti,
  NULL::text AS stato
WHERE false;
-- GRANT SELECT ON public.dw_minerva_assessment TO anon, authenticated;
