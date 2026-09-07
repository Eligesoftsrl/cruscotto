-- =====================================================================
--  public.dw_passaggi_qualifica — adapter Conti Annuali -> app
--  Contratto (types.ts): anno, cat_arrivo, cat_partenza, contratto, id,
--    istituzione, numero_passaggi, qual_arrivo, qual_partenza, tipo_passaggio
--  Usata live da progressioniService: .select("anno, tipo_passaggio, numero_passaggi")
--  Sorgente: ca.ft_passaggi_qualifica
--  NB: TIPO_PASSAGGIO reale = 'V'/'O'. Il frontend distingue i verticali con
--      /vert/i: traduciamo qui 'V'->'Verticale', 'O'->'Orizzontale' (adapter).
--  Chiave ente: istituzione = dw_ente.id_ente (vedi _ca_map_note.md)
-- =====================================================================
DROP MATERIALIZED VIEW IF EXISTS public.dw_passaggi_qualifica CASCADE;
CREATE MATERIALIZED VIEW public.dw_passaggi_qualifica AS
WITH map AS (
  SELECT DISTINCT ON (i."istituzione_id") i."istituzione_id" AS ist_code, qe.id AS id_ente
  FROM ca.lk_istituzioni i
  JOIN dwh.lk_questionari_enti qe ON qe.codice_fiscale_ente = i."CODI_FISCALE"
  ORDER BY i."istituzione_id", qe.id
)
SELECT
  ROW_NUMBER() OVER ()          AS id,
  f.anno                        AS anno,
  f."CATEGORIA_ARRIVO"          AS cat_arrivo,
  f."CATEGORIA_PARTENZA"        AS cat_partenza,
  f."CONTRATTO"                 AS contratto,
  m.id_ente                     AS istituzione,
  f."NUMERO_PASSAGGI"           AS numero_passaggi,
  f."QUALIFICA_ARRIVO"          AS qual_arrivo,
  f."QUALIFICA_PARTENZA"        AS qual_partenza,
  CASE f."TIPO_PASSAGGIO"
       WHEN 'V' THEN 'Verticale'
       WHEN 'O' THEN 'Orizzontale'
       ELSE f."TIPO_PASSAGGIO" END AS tipo_passaggio
FROM ca.ft_passaggi_qualifica f
JOIN map m ON m.ist_code = f."ISTITUZIONE";
CREATE UNIQUE INDEX IF NOT EXISTS dw_passaggi_qualifica_id_idx ON public.dw_passaggi_qualifica (id);
CREATE INDEX IF NOT EXISTS dw_passaggi_qualifica_ist_idx ON public.dw_passaggi_qualifica (istituzione, anno);
-- GRANT SELECT ON public.dw_passaggi_qualifica TO anon, authenticated;
