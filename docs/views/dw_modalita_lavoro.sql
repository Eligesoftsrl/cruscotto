-- =====================================================================
--  public.dw_modalita_lavoro — adapter Conti Annuali
--    (ca.ft_modalita_lavoro_flessibile) -> app
--  Contratto: anno, categoria, contratto, id, istituzione,
--    lavoro_agile_d/u, macrocat, reperibilita_d/u, telelavoro_d/u,
--    turnazione_d/u
-- =====================================================================
DROP MATERIALIZED VIEW IF EXISTS public.dw_modalita_lavoro CASCADE;
CREATE MATERIALIZED VIEW public.dw_modalita_lavoro AS
WITH map AS (
  SELECT DISTINCT ON (i."istituzione_id") i."istituzione_id" AS ist_code, qe.id AS id_ente
  FROM ca.lk_istituzioni i
  JOIN dwh.lk_questionari_enti qe ON qe.codice_fiscale_ente = i."CODI_FISCALE"
  ORDER BY i."istituzione_id", qe.id
)
SELECT
  ROW_NUMBER() OVER ()              AS id,
  f.anno                           AS anno,
  f."CATEGORIA"                     AS categoria,
  f."CONTRATTO"                     AS contratto,
  m.id_ente                        AS istituzione,
  f."PERS_LAVORO_AGILE_D"           AS lavoro_agile_d,
  f."PERS_LAVORO_AGILE_U"           AS lavoro_agile_u,
  f."MACROCATEGORIA"                AS macrocat,
  f."SOGGETTI_REPERIBILITA_DONNE"   AS reperibilita_d,
  f."SOGGETTI_REPERIBILITA_UOMINI"  AS reperibilita_u,
  f."TELE_LAVORO_DONNE"             AS telelavoro_d,
  f."TELE_LAVORO_UOMINI"            AS telelavoro_u,
  f."SOGGETTI_TURNAZIONE_DONNE"     AS turnazione_d,
  f."SOGGETTI_TURNAZIONE_UOMINI"    AS turnazione_u
FROM ca.ft_modalita_lavoro_flessibile f
JOIN map m ON m.ist_code = f."ISTITUZIONE";
CREATE UNIQUE INDEX IF NOT EXISTS dw_modalita_lavoro_id_idx ON public.dw_modalita_lavoro (id);
CREATE INDEX IF NOT EXISTS dw_modalita_lavoro_ist_idx ON public.dw_modalita_lavoro (istituzione, anno);
-- GRANT SELECT ON public.dw_modalita_lavoro TO anon, authenticated;
