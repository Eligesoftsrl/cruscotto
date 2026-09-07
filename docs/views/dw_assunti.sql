-- =====================================================================
--  public.dw_assunti — adapter Conti Annuali (ca.ft_assunzioni) -> app
--  Contratto: anno, categoria, causale, contratto, donne, id,
--    istituzione, qualifica, uomini
-- =====================================================================
DROP MATERIALIZED VIEW IF EXISTS public.dw_assunti CASCADE;
CREATE MATERIALIZED VIEW public.dw_assunti AS
WITH map AS (
  SELECT DISTINCT ON (i."istituzione_id") i."istituzione_id" AS ist_code, qe.id AS id_ente
  FROM ca.lk_istituzioni i
  JOIN dwh.lk_questionari_enti qe ON qe.codice_fiscale_ente = i."CODI_FISCALE"
  ORDER BY i."istituzione_id", qe.id
)
SELECT
  ROW_NUMBER() OVER ()   AS id,
  f.anno                 AS anno,
  f."CATEGORIA"           AS categoria,
  f."CAUSALE_ASSUNZIONE"  AS causale,
  f."CONTRATTO"           AS contratto,
  f."DONNE"               AS donne,
  m.id_ente              AS istituzione,
  f."QUALIFICA"           AS qualifica,
  f."UOMINI"              AS uomini
FROM ca.ft_assunzioni f
JOIN map m ON m.ist_code = f."ISTITUZIONE";
CREATE UNIQUE INDEX IF NOT EXISTS dw_assunti_id_idx ON public.dw_assunti (id);
CREATE INDEX IF NOT EXISTS dw_assunti_ist_idx ON public.dw_assunti (istituzione, anno);
-- GRANT SELECT ON public.dw_assunti TO anon, authenticated;
