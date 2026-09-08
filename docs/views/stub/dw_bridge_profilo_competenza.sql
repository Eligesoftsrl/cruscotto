-- STUB (vuota) — public.dw_bridge_profilo_competenza
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_bridge_profilo_competenza CASCADE;
CREATE VIEW public.dw_bridge_profilo_competenza AS
SELECT
  NULL::text AS cfiscale_ente,
  NULL::text AS cod_competenza,
  NULL::text AS cod_profilo_di_ruolo,
  NULL::numeric AS dipendenti_totali_profilo,
  NULL::numeric AS dipendenti_valutati,
  NULL::integer AS id,
  NULL::integer AS id_ente,
  NULL::numeric AS livello_target,
  NULL::numeric AS livello_valutato_medio
WHERE false;
-- GRANT SELECT ON public.dw_bridge_profilo_competenza TO anon, authenticated;
