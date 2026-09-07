-- =====================================================================
--  public.dw_kpi_rilevazione — vista di compatibilità (adapter EAV -> app)
-- ---------------------------------------------------------------------
--  Riproduce il contratto atteso dal frontend (src/integrations/supabase/
--  types.ts -> dw_kpi_rilevazione) a partire dal DB reale EAV (schema dwh),
--  RIUSANDO il pivot base public.v_kpi_ente_wide.
--
--  SORGENTE: campagna piu' recente e completa allineata al dizionario
--  dwh.lk_questionari_elements (2025-04):
--      progetto    = 'progetto_gru'
--      rilevazione = '2025-12'
--  (una riga per ente monitorato).
--
--  REGOLE DI MAPPATURA
--  - Binari Si/No: dal valore_num (1 -> 'Si' con accento, altrimenti 'No').
--  - q1_1_adozione_modello: 1 -> 'Formalmente' (l'app conta solo "Formalmente").
--  - Campi numerici: valore_num castato a TEXT (il contratto app e' text).
--  - Alcune colonne del prototipo (posti vacanti, % donne agile) NON hanno un
--    raw_element sorgente: sono lasciate NULL e marcate con TODO.
--  - Colonne "totali/denominatore" derivate per somma dei sotto-elementi.
--
--  DIPENDENZE: public.v_kpi_ente_wide, public.dw_ente
--  Eseguire nel NUOVO progetto Supabase, schema public.
-- =====================================================================
DROP MATERIALIZED VIEW IF EXISTS public.dw_kpi_rilevazione CASCADE;

CREATE MATERIALIZED VIEW public.dw_kpi_rilevazione AS
WITH w AS (
    SELECT *
    FROM public.v_kpi_ente_wide
    WHERE progetto = 'progetto_gru'
      AND rilevazione = '2025-12'
)
SELECT
    -- ---- metadati ------------------------------------------------------
    w.id_ente                                   AS id,
    w.id_ente                                   AS id_ente,
    w.cfiscale                                  AS cfiscale,
    de.denominazione                            AS denominazione,
    de.regione                                  AS regione,
    de.tipo_istituzione                         AS tipologia_amm,
    de.categoria_cruscotto                      AS dimensione_amm,
    NULL::text                                  AS segmento,        -- TODO: definire segmentazione
    w.rilevazione                               AS semestre,
    NULL::text                                  AS status,

    -- ============================ D1 ===================================
    CASE WHEN w."q_1_1" = 1 THEN 'Formalmente' ELSE 'No' END            AS q1_1_adozione_modello,     -- raw 1.1
    CASE WHEN w."q_1_3" = 1 THEN 'Sì' ELSE 'No' END                     AS q1_2_library_processi,     -- raw 1.3
    CASE WHEN w."q_1_4" = 1 THEN 'Sì' ELSE 'No' END                     AS q1_3_dizionario_competenze,-- raw 1.4
    w."q_1_5"::text                                                     AS q1_5_n_profili_definiti,   -- raw 1.5
    w."q_1_6"::text                                                     AS q1_6_n_profili_competenze, -- raw 1.6
    w."q_1_5"::text                                                     AS q1_profili_totali,         -- raw 1.5 (denominatore)

    -- ============================ D2 ===================================
    w."q_2_2"::text                                                     AS q2_1_assunti_under35,      -- raw 2.2
    w."q_2_6"::text                                                     AS q2_1_assunzioni_turnover,  -- raw 2.6
    w."q_2_1"::text                                                     AS q2_2_assunti_ti,           -- raw 2.1
    w."q_2_4"::text                                                     AS q2_2_eq_ep_assunti,        -- raw 2.4
    w."q_2_3"::text                                                     AS q2_3_assunzioni_prog,      -- raw 2.3
    w."q_2_6"::text                                                     AS q2_4_assunzioni_turnover_tot, -- raw 2.6
    CASE WHEN w."q_2_5" = 1 THEN 'Sì' ELSE 'No' END                     AS q2_5_assessment,           -- raw 2.5
    w."q_2_1"::text                                                     AS q2_5_assunzioni_su_prog,   -- raw 2.1
    w."q_2_1"::text                                                     AS q2_assunzioni_totali,      -- raw 2.1

    -- ============================ D3 ===================================
    w."q_3_4"::text                                                     AS q3_1_concorsi_comp_trasv,  -- raw 3.4
    CASE WHEN w."q_3_5" = 1 THEN 'Sì' ELSE 'No' END                     AS q3_2_onboarding,           -- raw 3.5
    CASE WHEN w."q_3_6" = 1 THEN 'Sì' ELSE 'No' END                     AS q3_3_apprendistato,        -- raw 3.6
    w."q_3_2"::text                                                     AS q3_4_concorsi_profili_cb,  -- raw 3.2
    w."q_3_3"::text                                                     AS q3_5_concorsi_dizionario,  -- raw 3.3
    w."q_3_1"::text                                                     AS q3_concorsi_totali,        -- raw 3.1

    -- ============================ D4 ===================================
    CASE WHEN w."q_4_1" = 1 THEN 'Sì' ELSE 'No' END                     AS q4_1_rilevazione_gap,      -- raw 4.1
    CASE WHEN COALESCE(w."q_4_3",0) > 0 THEN 'Sì' ELSE 'No' END         AS q4_2_formazione_trasv,     -- raw 4.3 (count->bin)
    w."q_4_2"::text                                                     AS q4_percorsi_totali,        -- raw 4.2

    -- ============================ D5 ===================================
    CASE WHEN w."q_5_1" = 1 THEN 'Sì' ELSE 'No' END                     AS q5_1_integrazione_performance, -- raw 5.1
    CASE WHEN w."q_5_2" = 1 THEN 'Sì' ELSE 'No' END                     AS q5_2_incentivazione_non_mon,   -- raw 5.2
    CASE WHEN COALESCE(w."q_5_3",0) > 0 THEN 'Sì' ELSE 'No' END         AS q5_3_convenzioni_universita,   -- raw 5.3 (count->bin)

    -- ============================ D6 ===================================
    w."q_6_2"::text                                                     AS q6_1_processi_semplificati, -- raw 6.2
    NULL::text                                                          AS q6_12_donne_agile_pct,      -- TODO: nessun raw_element sorgente
    (COALESCE(w."q_6_20_a",0)+COALESCE(w."q_6_20_b",0)
     +COALESCE(w."q_6_20_c",0)+COALESCE(w."q_6_20_d",0))::text          AS q6_13_sw_hr_nuovi,          -- raw 6.20.a-d
    w."q_6_14_a"::text                                                  AS q6_14_progressioni_oriz,    -- raw 6.14.a
    w."q_6_14_b"::text                                                  AS q6_14_progressioni_vert,    -- raw 6.14.b
    w."q_6_8"::text                                                     AS q6_15_eq_ep_under35,        -- raw 6.8
    w."q_6_16_a"::text                                                  AS q6_16_donne_agile,          -- raw 6.16.a
    w."q_6_10"::text                                                    AS q6_16_mobilita_out,         -- raw 6.10 (comandati OUT)
    w."q_6_16_b"::text                                                  AS q6_16_uomini_agile,         -- raw 6.16.b
    w."q_6_17"::text                                                    AS q6_17_gg_agile_donne,       -- raw 6.17 (gg agile)
    w."q_6_11"::text                                                    AS q6_17_mobilita_in,          -- raw 6.11 (comandati IN)
    w."q_6_4_a"::text                                                   AS q6_18_donne_dirigenti,      -- raw 6.4.a (TI dir donne)
    w."q_6_18"::text                                                    AS q6_18_gg_totali,            -- raw 6.18 (gg totali)
    CASE WHEN (COALESCE(w."q_6_19_a",0)+COALESCE(w."q_6_19_b",0)
              +COALESCE(w."q_6_19_c",0)+COALESCE(w."q_6_19_d",0)) > 0
         THEN 'Sì' ELSE 'No' END                                       AS q6_19_strumenti_ict,        -- raw 6.19.a-d
    w."q_6_13_a"::text                                                  AS q6_20_entrati_mobilita,     -- raw 6.13.a
    w."q_6_3_a"::text                                                   AS q6_3_dirigente,             -- raw 6.3.a
    w."q_6_3_b"::text                                                   AS q6_3_non_dirigente,         -- raw 6.3.b
    NULL::text                                                          AS q6_4_posti_vacanti_nondir,  -- TODO: nessun raw_element
    w."q_6_4_a"::text                                                   AS q6_4_ti_dir_donne,          -- raw 6.4.a
    w."q_6_4_b"::text                                                   AS q6_4_ti_dir_uomini,         -- raw 6.4.b
    w."q_6_4_c"::text                                                   AS q6_4_ti_nondir_donne,       -- raw 6.4.c
    w."q_6_4_d"::text                                                   AS q6_4_ti_nondir_uomini,      -- raw 6.4.d
    NULL::text                                                          AS q6_5_posti_vacanti_dir,     -- TODO: nessun raw_element
    w."q_6_5_a"::text                                                   AS q6_5_td_dir_donne,          -- raw 6.5.a
    w."q_6_5_b"::text                                                   AS q6_5_td_dir_uomini,         -- raw 6.5.b
    w."q_6_6"::text                                                     AS q6_6_under35,               -- raw 6.6
    w."q_6_7"::text                                                     AS q6_7_eq_ep,                 -- raw 6.7
    w."q_6_8"::text                                                     AS q6_8_eq_ep_under45,         -- raw 6.8
    w."q_6_15"::text                                                    AS q6_9_lavoro_flessibile,     -- raw 6.15
    w."q_6_11"::text                                                    AS q6_comandati_in,            -- raw 6.11
    w."q_6_10"::text                                                    AS q6_comandati_out,           -- raw 6.10
    w."q_6_15"::text                                                    AS q6_dip_flessibili,          -- raw 6.15
    w."q_6_12_a"::text                                                  AS q6_entrati,                 -- raw 6.12.a
    (COALESCE(w."q_6_4_a",0)+COALESCE(w."q_6_4_b",0)
     +COALESCE(w."q_6_4_c",0)+COALESCE(w."q_6_4_d",0))::text            AS q6_organico_medio,          -- somma TI
    w."q_6_3_a"::text                                                   AS q6_pianta_organica_dir,     -- raw 6.3.a
    w."q_6_3_b"::text                                                   AS q6_pianta_organica_nondir,  -- raw 6.3.b
    w."q_6_1"::text                                                     AS q6_processi_totali,         -- raw 6.1
    (COALESCE(w."q_6_19_a",0)+COALESCE(w."q_6_19_b",0)
     +COALESCE(w."q_6_19_c",0)+COALESCE(w."q_6_19_d",0))::text          AS q6_sw_hr_totali,            -- raw 6.19.a-d
    (COALESCE(w."q_6_4_a",0)+COALESCE(w."q_6_4_b",0)
     +COALESCE(w."q_6_4_c",0)+COALESCE(w."q_6_4_d",0))::text            AS q6_tep_personale,           -- somma TI (personale eff.)
    w."q_6_3_a"::text                                                   AS q6_totale_dirigenti,        -- raw 6.3.a
    (COALESCE(w."q_6_4_a",0)+COALESCE(w."q_6_4_c",0))::text             AS q6_totale_donne,            -- TI donne (dir+nondir)
    w."q_6_12_b"::text                                                  AS q6_usciti                   -- raw 6.12.b
FROM w
LEFT JOIN public.dw_ente de ON de.id_ente = w.id_ente;

CREATE UNIQUE INDEX IF NOT EXISTS dw_kpi_rilevazione_id_idx ON public.dw_kpi_rilevazione (id);

-- Esposizione PostgREST/Supabase:
-- GRANT SELECT ON public.dw_kpi_rilevazione TO anon, authenticated;
