-- =====================================================================
--  public.dw_qualifiche — lookup qualifiche (schema ca)
--  Contratto (types.ts): categoria, cod_contratto, descrizione, id,
--    macrocategoria
--
--  Scopo: tradurre il codice QUALIFICA delle viste occupazione in ruolo
--  per esteso. Join validato:
--    dw_occupazione.qualifica = dw_qualifiche.categoria
--    AND dw_occupazione.contratto = dw_qualifiche.cod_contratto
--  (occupazione.QUALIFICA corrisponde a CODI_QUALIFICA, non a CODI_CATEGORIA).
--
--  NB: per rispettare il contratto app (che non prevede una colonna esplicita
--  "cod_qualifica"), la colonna `categoria` contiene il CODICE QUALIFICA
--  (chiave di join), mentre `descrizione` = descrizione estesa del ruolo.
--
--  Sorgente: ca.lk_comparti_categorie_contratti
-- =====================================================================
DROP MATERIALIZED VIEW IF EXISTS public.dw_qualifiche CASCADE;
CREATE MATERIALIZED VIEW public.dw_qualifiche AS
WITH src AS (
  SELECT DISTINCT
    q."CODI_CONTRATTO"                               AS cod_contratto,
    q."CODI_QUALIFICA"                               AS categoria,      -- codice qualifica (join key)
    trim(both '"' FROM trim(q."DESC_QUALIFICA"))     AS descrizione,    -- ruolo per esteso
    trim(both '"' FROM trim(q."DESC_MACROCATEGORIA")) AS macrocategoria
  FROM ca.lk_comparti_categorie_contratti q
)
SELECT
  ROW_NUMBER() OVER (ORDER BY cod_contratto, categoria) AS id,
  categoria,
  cod_contratto,
  descrizione,
  macrocategoria
FROM src;
CREATE UNIQUE INDEX IF NOT EXISTS dw_qualifiche_id_idx ON public.dw_qualifiche (id);
CREATE INDEX IF NOT EXISTS dw_qualifiche_join_idx ON public.dw_qualifiche (cod_contratto, categoria);
-- GRANT SELECT ON public.dw_qualifiche TO anon, authenticated;
