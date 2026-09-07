-- =====================================================================
--  public.dw_ente  —  vista di compatibilità dal DB reale (schema dwh)
--  Riproduce il contratto atteso dai grafici a partire da:
--    dwh.lk_questionari_enti  (anagrafica ente reale)
--    dwh.lk_comuni            (per regione/provincia via codice ISTAT comune)
--
--  Chiave ente reale = CODICE FISCALE (cf_ente nei fatti). Qui id_ente è un
--  surrogato = lk_questionari_enti.id; le viste dei fatti mapperanno cf_ente -> id_ente.
--
--  Eseguire nel NUOVO progetto Supabase, schema public.
--  Campi con TODO: da affinare con la matrice di mapping (Fase B).
-- =====================================================================
DROP MATERIALIZED VIEW IF EXISTS public.dw_ente CASCADE;

CREATE MATERIALIZED VIEW public.dw_ente AS
SELECT
    e.id::int                        AS id_ente,
    e.codice_fiscale_ente            AS cfiscale,
    e.codice_ipa                     AS codice_ipa,
    e.denominazione_ente             AS denominazione,
    e.tipologia                      AS tipo_istituzione,
    e.codice_categoria               AS cod_tipo,
    NULL::text                       AS comparto,               -- TODO: derivare (progetto/tipologia)
    NULL::text                       AS cod_comparto,           -- TODO
    NULL::text                       AS contratto,              -- TODO
    NULL::text                       AS cod_contratto,          -- TODO
    c."Regione"                      AS regione,
    e.tipologia                      AS classe_amministrazione, -- TODO: confermare
    e.classe_di_popolazione          AS categoria_cruscotto,    -- TODO: confermare mapping
    NULL::text                       AS profilo_prestazionale,  -- TODO
    NULL::int                        AS organico_2023,          -- TODO: da ft_questionari_globale (elemento organico)
    1                                AS stato
FROM dwh.lk_questionari_enti e
LEFT JOIN dwh.lk_comuni c
       ON c."IstatID" = e.codice_comune_istat;

CREATE UNIQUE INDEX IF NOT EXISTS dw_ente_id_ente_idx ON public.dw_ente (id_ente);

-- Esposizione a PostgREST/Supabase:
-- GRANT SELECT ON public.dw_ente TO anon, authenticated;
