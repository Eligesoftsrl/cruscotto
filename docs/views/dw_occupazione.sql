-- =====================================================================
--  public.dw_occupazione — adapter Conti Annuali (ca.ft_occupazione) -> app
--  Contratto (types.ts): anno, contratto, id, istituzione, macrocat,
--    pt_inf50_d/u, pt_sup50_d/u, qualifica, tp_donne, tp_uomini
--  Chiave ente app: istituzione = dw_ente.id_ente (vedi _ca_map_note.md)
-- =====================================================================
DROP MATERIALIZED VIEW IF EXISTS public.dw_occupazione CASCADE;
CREATE MATERIALIZED VIEW public.dw_occupazione AS
WITH map AS (
  SELECT DISTINCT ON (i."istituzione_id") i."istituzione_id" AS ist_code, qe.id AS id_ente
  FROM ca.lk_istituzioni i
  JOIN dwh.lk_questionari_enti qe ON qe.codice_fiscale_ente = i."CODI_FISCALE"
  ORDER BY i."istituzione_id", qe.id
)
SELECT
  ROW_NUMBER() OVER ()                 AS id,
  f.anno                               AS anno,
  f."CONTRATTO"                         AS contratto,
  m.id_ente                            AS istituzione,
  NULL::text                           AS macrocat,           -- non presente in ft_occupazione
  f."PART_TIME_INF50__DONNE"            AS pt_inf50_d,
  f."PART_TIME_INF50__UOMINI"           AS pt_inf50_u,
  f."PART_TIME_SUP50__DONNE"            AS pt_sup50_d,
  f."PART_TIME_SUP50__UOMINI"           AS pt_sup50_u,
  f."QUALIFICA"                         AS qualifica,
  f."PERSONALE_TEMPO_PIENO_DONNE"       AS tp_donne,
  f."PERSONALE_TEMPO_PIENO_UOMINI"      AS tp_uomini
FROM ca.ft_occupazione f
JOIN map m ON m.ist_code = f."ISTITUZIONE";
CREATE UNIQUE INDEX IF NOT EXISTS dw_occupazione_id_idx ON public.dw_occupazione (id);
CREATE INDEX IF NOT EXISTS dw_occupazione_ist_idx ON public.dw_occupazione (istituzione, anno);
-- GRANT SELECT ON public.dw_occupazione TO anon, authenticated;
