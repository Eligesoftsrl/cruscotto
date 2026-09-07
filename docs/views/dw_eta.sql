-- =====================================================================
--  public.dw_eta — adapter Conti Annuali (ca.ft_eta) -> app
--  Contratto: anno, contratto, donne, fascia_eta, id, istituzione, uomini
-- =====================================================================
DROP MATERIALIZED VIEW IF EXISTS public.dw_eta CASCADE;
CREATE MATERIALIZED VIEW public.dw_eta AS
WITH map AS (
  SELECT DISTINCT ON (i."istituzione_id") i."istituzione_id" AS ist_code, qe.id AS id_ente
  FROM ca.lk_istituzioni i
  JOIN dwh.lk_questionari_enti qe ON qe.codice_fiscale_ente = i."CODI_FISCALE"
  ORDER BY i."istituzione_id", qe.id
)
SELECT
  ROW_NUMBER() OVER ()   AS id,
  f.anno                 AS anno,
  f."CONTRATTO"           AS contratto,
  f."DONNE"               AS donne,
  f."Fascia_Eta"          AS fascia_eta,
  m.id_ente              AS istituzione,
  f."UOMINI"              AS uomini
FROM ca.ft_eta f
JOIN map m ON m.ist_code = f."ISTITUZIONE";
CREATE UNIQUE INDEX IF NOT EXISTS dw_eta_id_idx ON public.dw_eta (id);
CREATE INDEX IF NOT EXISTS dw_eta_ist_idx ON public.dw_eta (istituzione, anno);
-- GRANT SELECT ON public.dw_eta TO anon, authenticated;
