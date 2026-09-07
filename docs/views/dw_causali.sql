-- =====================================================================
--  public.dw_causali — lookup causali assunzione/cessazione (schema ca)
--  Contratto (types.ts): cod_alfa, descrizione, id, is_ti, tipo
--  Usata live da assuntiService/cessatiService: .select("cod_alfa, descrizione")
--    join: dw_assunti.causale / dw_cessati.causale = dw_causali.cod_alfa
--
--  Sorgente: viste pronte ca.vw_lk_causali_assunzione / _cessazione, che
--  espongono `causale_id` = codice PREFISSATO (A23, C01, ...) IDENTICO ai
--  valori presenti nei fatti (CAUSALE_ASSUNZIONE 'A23', CAUSALE_CESSAZIONE 'C01').
--  Il prefisso A/C risolve anche l'ambiguità del codice '28' (A28 != C28).
--  NB: `causale_id` nella fonte ha spazi di padding -> TRIM.
-- =====================================================================
DROP MATERIALIZED VIEW IF EXISTS public.dw_causali CASCADE;
CREATE MATERIALIZED VIEW public.dw_causali AS
WITH src AS (
  SELECT DISTINCT
    trim(v."causale_id")                        AS cod_alfa,
    trim(both '"' FROM trim(v."DESC_CAUSALE"))  AS descrizione,
    v."TIPO_CAUSALE"                            AS tipo
  FROM ca.vw_lk_causali_assunzione v
  UNION
  SELECT DISTINCT
    trim(v."causale_id"),
    trim(both '"' FROM trim(v."DESC_CAUSALE")),
    v."TIPO_CAUSALE"
  FROM ca.vw_lk_causali_cessazione v
)
SELECT
  ROW_NUMBER() OVER (ORDER BY tipo, cod_alfa) AS id,
  cod_alfa,
  descrizione,
  NULL::int   AS is_ti,   -- flag tempo indeterminato non presente in fonte
  tipo
FROM src;
CREATE UNIQUE INDEX IF NOT EXISTS dw_causali_id_idx ON public.dw_causali (id);
CREATE INDEX IF NOT EXISTS dw_causali_cod_idx ON public.dw_causali (cod_alfa);
-- GRANT SELECT ON public.dw_causali TO anon, authenticated;
