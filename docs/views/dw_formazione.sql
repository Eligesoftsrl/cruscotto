-- =====================================================================
--  public.dw_formazione — adapter Conti Annuali (ca.ft_formazione) -> app
--  Contratto: anno, categoria, causale, contratto, form_donne, form_uomini,
--    id, istituzione, ore_media_d, ore_media_u, qualifica
--  NB: la fonte Conti Annuali esprime la media in GIORNATE (FORM_MEDIA_*),
--      mappata su ore_media_d/u per rispettare il contratto app.
-- =====================================================================
DROP MATERIALIZED VIEW IF EXISTS public.dw_formazione CASCADE;
CREATE MATERIALIZED VIEW public.dw_formazione AS
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
  f."CAUSALE_ASSENZA"     AS causale,
  f."CONTRATTO"           AS contratto,
  f."FORM_DONNE"          AS form_donne,
  f."FORM_UOMINI"         AS form_uomini,
  m.id_ente              AS istituzione,
  f."FORM_MEDIA_DONNE"    AS ore_media_d,
  f."FORM_MEDIA_UOMINI"   AS ore_media_u,
  f."QUALIFICA"           AS qualifica
FROM ca.ft_formazione f
JOIN map m ON m.ist_code = f."ISTITUZIONE";
CREATE UNIQUE INDEX IF NOT EXISTS dw_formazione_id_idx ON public.dw_formazione (id);
CREATE INDEX IF NOT EXISTS dw_formazione_ist_idx ON public.dw_formazione (istituzione, anno);
-- GRANT SELECT ON public.dw_formazione TO anon, authenticated;
