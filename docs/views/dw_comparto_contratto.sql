-- =====================================================================
--  public.dw_comparto_contratto — lookup comparto/contratto (schema ca)
--  Contratto (types.ts): cod_comparto, cod_contratto, desc_comparto,
--    desc_contratto, id
--  Sorgente: ca.lk_mappa_comparti_contratti
--    (CODI_COMPARTO, DESC_COMPARTO, CODI_CONTRATTO, DESC_CONTRATTO)
-- =====================================================================
DROP MATERIALIZED VIEW IF EXISTS public.dw_comparto_contratto CASCADE;
CREATE MATERIALIZED VIEW public.dw_comparto_contratto AS
WITH src AS (
  SELECT DISTINCT
    m."CODI_COMPARTO"    AS cod_comparto,
    m."CODI_CONTRATTO"   AS cod_contratto,
    trim(both '"' FROM m."DESC_COMPARTO")   AS desc_comparto,
    trim(both '"' FROM m."DESC_CONTRATTO")  AS desc_contratto
  FROM ca.lk_mappa_comparti_contratti m
)
SELECT
  ROW_NUMBER() OVER (ORDER BY cod_comparto, cod_contratto) AS id,
  cod_comparto,
  cod_contratto,
  desc_comparto,
  desc_contratto
FROM src;
CREATE UNIQUE INDEX IF NOT EXISTS dw_comparto_contratto_id_idx ON public.dw_comparto_contratto (id);
-- GRANT SELECT ON public.dw_comparto_contratto TO anon, authenticated;
