-- =====================================================================
--  MATERIALIZED VIEWS — Scheletro per il Cruscotto HR
--  Scopo: ricreare, sul DB sorgente reale, delle MV con NOME e COLONNE
--  identici alle tabelle attese dal frontend React (così l'app non cambia).
--
--  ISTRUZIONI:
--   1) Ogni MV deve chiamarsi ESATTAMENTE come indicato.
--   2) Deve esporre le colonne elencate (stesso nome). Completare la parte
--      "SELECT ... FROM <sorgente_reale>" con la logica/join del DB reale.
--   3) MANTENERE la colonna "chiave ente" con lo stesso nome, altrimenti
--      i filtri per ente si rompono.
--   4) Dove indicato "SELECT *": esporre TUTTE le colonne della tabella
--      originale (vedi schema completo / documento MAPPATURA_TABELLE_GRAFICI).
--   5) Tipi: nel DW attuale molte colonne q* di dw_kpi_rilevazione sono TEXT.
--      Se nel DB reale sono numeriche, castarle a text (::text) nella MV.
--   6) Refresh: REFRESH MATERIALIZED VIEW [CONCURRENTLY] <nome>;
-- =====================================================================



-- ---------------------------------------------------------------------
-- Tabella/MV: dw_assunti
-- Chiave ente: istituzione
DROP MATERIALIZED VIEW IF EXISTS dw_assunti CASCADE;
CREATE MATERIALIZED VIEW dw_assunti AS
SELECT
    istituzione,
    anno,
    causale,
    donne,
    uomini
FROM <sorgente_reale_per_dw_assunti>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_bridge_profilo_competenza
-- Chiave ente: id_ente
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS dw_bridge_profilo_competenza CASCADE;
CREATE MATERIALIZED VIEW dw_bridge_profilo_competenza AS
SELECT
    id_ente,
    cod_competenza,
    cod_profilo_di_ruolo,
    dipendenti_totali_profilo,
    dipendenti_valutati,
    livello_target,
    livello_valutato_medio
    -- , <tutte le altre colonne originali>
FROM <sorgente_reale_per_dw_bridge_profilo_competenza>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_causali
-- Chiave ente: tabella di lookup (nessuna chiave ente)
DROP MATERIALIZED VIEW IF EXISTS dw_causali CASCADE;
CREATE MATERIALIZED VIEW dw_causali AS
SELECT
    cod_alfa,
    descrizione,
    anno
FROM <sorgente_reale_per_dw_causali>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_cessati
-- Chiave ente: istituzione
DROP MATERIALIZED VIEW IF EXISTS dw_cessati CASCADE;
CREATE MATERIALIZED VIEW dw_cessati AS
SELECT
    istituzione,
    anno,
    causale,
    donne,
    uomini
FROM <sorgente_reale_per_dw_cessati>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_competenza
-- Chiave ente: tabella di lookup (nessuna chiave ente)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS dw_competenza CASCADE;
CREATE MATERIALIZED VIEW dw_competenza AS
SELECT *  -- includere tutte le colonne originali
FROM <sorgente_reale_per_dw_competenza>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_ente
-- Chiave ente: id_ente
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS dw_ente CASCADE;
CREATE MATERIALIZED VIEW dw_ente AS
SELECT
    id_ente,
    categoria_cruscotto,
    comparto,
    denominazione,
    organico_2023,
    regione
    -- , <tutte le altre colonne originali>
FROM <sorgente_reale_per_dw_ente>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_eta
-- Chiave ente: istituzione
DROP MATERIALIZED VIEW IF EXISTS dw_eta CASCADE;
CREATE MATERIALIZED VIEW dw_eta AS
SELECT
    istituzione,
    anno,
    donne,
    fascia_eta,
    uomini
FROM <sorgente_reale_per_dw_eta>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_famiglia_professionale
-- Chiave ente: tabella di lookup (nessuna chiave ente)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS dw_famiglia_professionale CASCADE;
CREATE MATERIALIZED VIEW dw_famiglia_professionale AS
SELECT *  -- includere tutte le colonne originali
FROM <sorgente_reale_per_dw_famiglia_professionale>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_fascia_eta
-- Chiave ente: tabella di lookup (nessuna chiave ente)
DROP MATERIALIZED VIEW IF EXISTS dw_fascia_eta CASCADE;
CREATE MATERIALIZED VIEW dw_fascia_eta AS
SELECT
    classe,
    codice,
    eta_min
FROM <sorgente_reale_per_dw_fascia_eta>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_formazione
-- Chiave ente: istituzione
DROP MATERIALIZED VIEW IF EXISTS dw_formazione CASCADE;
CREATE MATERIALIZED VIEW dw_formazione AS
SELECT
    istituzione,
    anno,
    form_donne,
    form_uomini,
    ore_media_d,
    ore_media_u
FROM <sorgente_reale_per_dw_formazione>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_inpa_bandi
-- Chiave ente: id_ente
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS dw_inpa_bandi CASCADE;
CREATE MATERIALIZED VIEW dw_inpa_bandi AS
SELECT
    id_ente,
    anno,
    num_candidature_submitted,
    num_posti,
    regione,
    settore_pubblicazione,
    stato_bando,
    tipo_procedura,
    data_pubblicazione
    -- , <tutte le altre colonne originali>
FROM <sorgente_reale_per_dw_inpa_bandi>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_inpa_candidati
-- Chiave ente: tabella di lookup (nessuna chiave ente)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS dw_inpa_candidati CASCADE;
CREATE MATERIALIZED VIEW dw_inpa_candidati AS
SELECT *  -- includere tutte le colonne originali
FROM <sorgente_reale_per_dw_inpa_candidati>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_kpi_rilevazione
-- Chiave ente: id_ente
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS dw_kpi_rilevazione CASCADE;
CREATE MATERIALIZED VIEW dw_kpi_rilevazione AS
SELECT
    id_ente,
    denominazione,
    q1_1_adozione_modello,
    q1_5_n_profili_definiti,
    q1_6_n_profili_competenze,
    q2_5_assessment,
    q6_tep_personale
    -- , <tutte le altre colonne originali>
FROM <sorgente_reale_per_dw_kpi_rilevazione>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_lp_graduatorie
-- Chiave ente: id_ente
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS dw_lp_graduatorie CASCADE;
CREATE MATERIALIZED VIEW dw_lp_graduatorie AS
SELECT
    id_ente,
    num_posti_banditi,
    num_vincitori_assunti,
    tcp_giorni
    -- , <tutte le altre colonne originali>
FROM <sorgente_reale_per_dw_lp_graduatorie>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_minerva_assessment
-- Chiave ente: id_ente
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS dw_minerva_assessment CASCADE;
CREATE MATERIALIZED VIEW dw_minerva_assessment AS
SELECT
    id_ente
    -- , <tutte le altre colonne originali>
FROM <sorgente_reale_per_dw_minerva_assessment>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_modalita_lavoro
-- Chiave ente: istituzione
DROP MATERIALIZED VIEW IF EXISTS dw_modalita_lavoro CASCADE;
CREATE MATERIALIZED VIEW dw_modalita_lavoro AS
SELECT
    istituzione,
    anno,
    lavoro_agile_d,
    lavoro_agile_u,
    reperibilita_d,
    reperibilita_u,
    telelavoro_d,
    telelavoro_u,
    turnazione_d,
    turnazione_u
FROM <sorgente_reale_per_dw_modalita_lavoro>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_occupazione
-- Chiave ente: istituzione
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS dw_occupazione CASCADE;
CREATE MATERIALIZED VIEW dw_occupazione AS
SELECT
    istituzione,
    anno,
    pt_inf50_d,
    pt_inf50_u,
    pt_sup50_d,
    pt_sup50_u,
    qualifica,
    tp_donne,
    tp_uomini
    -- , <tutte le altre colonne originali>
FROM <sorgente_reale_per_dw_occupazione>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_passaggi_qualifica
-- Chiave ente: istituzione
DROP MATERIALIZED VIEW IF EXISTS dw_passaggi_qualifica CASCADE;
CREATE MATERIALIZED VIEW dw_passaggi_qualifica AS
SELECT
    istituzione,
    anno,
    numero_passaggi,
    tipo_passaggio
FROM <sorgente_reale_per_dw_passaggi_qualifica>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_profilo_di_ruolo
-- Chiave ente: id_ente
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS dw_profilo_di_ruolo CASCADE;
CREATE MATERIALIZED VIEW dw_profilo_di_ruolo AS
SELECT
    id_ente
    -- , <tutte le altre colonne originali>
FROM <sorgente_reale_per_dw_profilo_di_ruolo>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_ptfp_dotazione
-- Chiave ente: cfiscale_amm
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS dw_ptfp_dotazione CASCADE;
CREATE MATERIALIZED VIEW dw_ptfp_dotazione AS
SELECT
    cfiscale_amm
    -- , <tutte le altre colonne originali>
FROM <sorgente_reale_per_dw_ptfp_dotazione>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_ptfp_reclutamento
-- Chiave ente: cfiscale_amm
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS dw_ptfp_reclutamento CASCADE;
CREATE MATERIALIZED VIEW dw_ptfp_reclutamento AS
SELECT
    cfiscale_amm
    -- , <tutte le altre colonne originali>
FROM <sorgente_reale_per_dw_ptfp_reclutamento>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_syllabus_catalogo
-- Chiave ente: tabella di lookup (nessuna chiave ente)
DROP MATERIALIZED VIEW IF EXISTS dw_syllabus_catalogo CASCADE;
CREATE MATERIALIZED VIEW dw_syllabus_catalogo AS
SELECT *  -- includere tutte le colonne originali
FROM <sorgente_reale_per_dw_syllabus_catalogo>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_syllabus_pa
-- Chiave ente: cfiscale
DROP MATERIALIZED VIEW IF EXISTS dw_syllabus_pa CASCADE;
CREATE MATERIALIZED VIEW dw_syllabus_pa AS
SELECT
    cfiscale
FROM <sorgente_reale_per_dw_syllabus_pa>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: dw_syllabus_partecipazioni
-- Chiave ente: tabella di lookup (nessuna chiave ente)
DROP MATERIALIZED VIEW IF EXISTS dw_syllabus_partecipazioni CASCADE;
CREATE MATERIALIZED VIEW dw_syllabus_partecipazioni AS
SELECT *  -- includere tutte le colonne originali
FROM <sorgente_reale_per_dw_syllabus_partecipazioni>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: ft_sipo_criticita_processi
-- Chiave ente: (via ft_sipo_processi.ente_id)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS ft_sipo_criticita_processi CASCADE;
CREATE MATERIALIZED VIEW ft_sipo_criticita_processi AS
SELECT *  -- includere tutte le colonne originali
FROM <sorgente_reale_per_ft_sipo_criticita_processi>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: ft_sipo_criticita_uo
-- Chiave ente: (via ft_sipo_uo.ente_id)
DROP MATERIALIZED VIEW IF EXISTS ft_sipo_criticita_uo CASCADE;
CREATE MATERIALIZED VIEW ft_sipo_criticita_uo AS
SELECT
    criticita_id,
    uo_id
FROM <sorgente_reale_per_ft_sipo_criticita_uo>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: ft_sipo_fasi
-- Chiave ente: (via ft_sipo_processi.ente_id)
DROP MATERIALIZED VIEW IF EXISTS ft_sipo_fasi CASCADE;
CREATE MATERIALIZED VIEW ft_sipo_fasi AS
SELECT
    fase_id,
    in_outsourcing,
    lavoro_agile,
    lavoro_agile_id,
    livello_digitalizzazione_id,
    outsourcing_id,
    processo_id
FROM <sorgente_reale_per_ft_sipo_fasi>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: ft_sipo_fasi_uo_partecipanti
-- Chiave ente: (via ft_sipo_fasi)
DROP MATERIALIZED VIEW IF EXISTS ft_sipo_fasi_uo_partecipanti CASCADE;
CREATE MATERIALIZED VIEW ft_sipo_fasi_uo_partecipanti AS
SELECT
    fase_id,
    uo_partecipante_id
FROM <sorgente_reale_per_ft_sipo_fasi_uo_partecipanti>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: ft_sipo_organizzazione
-- Chiave ente: ente_id
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS ft_sipo_organizzazione CASCADE;
CREATE MATERIALIZED VIEW ft_sipo_organizzazione AS
SELECT
    ente_id,
    organizzazione_id
    -- , <tutte le altre colonne originali>
FROM <sorgente_reale_per_ft_sipo_organizzazione>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: ft_sipo_processi
-- Chiave ente: ente_id
DROP MATERIALIZED VIEW IF EXISTS ft_sipo_processi CASCADE;
CREATE MATERIALIZED VIEW ft_sipo_processi AS
SELECT
    ente_id,
    coinvolgimento_amministrazioni,
    denominazione,
    giorni_previsti,
    grado_rilevanza_id,
    obiettivo_strategico_id,
    picchi_frequenza_id,
    picchi_intensita_id,
    picchi_stagionali,
    presidio_continuativo,
    processo_id,
    processo_semplificazione_id,
    tempo_medio_effettivo,
    tipologia_id,
    data_fine
FROM <sorgente_reale_per_ft_sipo_processi>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: ft_sipo_profili_di_ruolo_fasi
-- Chiave ente: (via ft_sipo_fasi)
DROP MATERIALIZED VIEW IF EXISTS ft_sipo_profili_di_ruolo_fasi CASCADE;
CREATE MATERIALIZED VIEW ft_sipo_profili_di_ruolo_fasi AS
SELECT
    fase_id,
    fte_assegnati,
    fte_programmati,
    profilo_fase_id,
    sipo_profilo_di_ruolo_id
FROM <sorgente_reale_per_ft_sipo_profili_di_ruolo_fasi>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: ft_sipo_provvedimenti_organizzazione
-- Chiave ente: (via ft_sipo_organizzazione)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS ft_sipo_provvedimenti_organizzazione CASCADE;
CREATE MATERIALIZED VIEW ft_sipo_provvedimenti_organizzazione AS
SELECT *  -- includere tutte le colonne originali
FROM <sorgente_reale_per_ft_sipo_provvedimenti_organizzazione>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: ft_sipo_uo
-- Chiave ente: ente_id
DROP MATERIALIZED VIEW IF EXISTS ft_sipo_uo CASCADE;
CREATE MATERIALIZED VIEW ft_sipo_uo AS
SELECT
    ente_id,
    denominazione,
    livello_gerarchico,
    livello_resp_id,
    lk_sipo_livelli_resp_uo,
    risorse_dotazione,
    risorse_servizio_tempo_ind,
    uo_id,
    data_fine_validita
FROM <sorgente_reale_per_ft_sipo_uo>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: lk_enti
-- Chiave ente: ente_id
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS lk_enti CASCADE;
CREATE MATERIALIZED VIEW lk_enti AS
SELECT
    ente_id,
    denominazione
    -- , <tutte le altre colonne originali>
FROM <sorgente_reale_per_lk_enti>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: lk_minerva_ambito_ruolo
-- Chiave ente: tabella di lookup (nessuna chiave ente)
DROP MATERIALIZED VIEW IF EXISTS lk_minerva_ambito_ruolo CASCADE;
CREATE MATERIALIZED VIEW lk_minerva_ambito_ruolo AS
SELECT
    descrizione,
    id
FROM <sorgente_reale_per_lk_minerva_ambito_ruolo>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: lk_minerva_area_contrattuale
-- Chiave ente: tabella di lookup (nessuna chiave ente)
DROP MATERIALIZED VIEW IF EXISTS lk_minerva_area_contrattuale CASCADE;
CREATE MATERIALIZED VIEW lk_minerva_area_contrattuale AS
SELECT
    descrizione,
    id
FROM <sorgente_reale_per_lk_minerva_area_contrattuale>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: lk_minerva_famiglia_professionale
-- Chiave ente: tabella di lookup (nessuna chiave ente)
DROP MATERIALIZED VIEW IF EXISTS lk_minerva_famiglia_professionale CASCADE;
CREATE MATERIALIZED VIEW lk_minerva_famiglia_professionale AS
SELECT
    descrizione,
    id
FROM <sorgente_reale_per_lk_minerva_famiglia_professionale>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: lk_picchi_frequenza_annuale_processi
-- Chiave ente: tabella di lookup (nessuna chiave ente)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS lk_picchi_frequenza_annuale_processi CASCADE;
CREATE MATERIALIZED VIEW lk_picchi_frequenza_annuale_processi AS
SELECT *  -- includere tutte le colonne originali
FROM <sorgente_reale_per_lk_picchi_frequenza_annuale_processi>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: lk_picchi_intensita_processi
-- Chiave ente: tabella di lookup (nessuna chiave ente)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS lk_picchi_intensita_processi CASCADE;
CREATE MATERIALIZED VIEW lk_picchi_intensita_processi AS
SELECT *  -- includere tutte le colonne originali
FROM <sorgente_reale_per_lk_picchi_intensita_processi>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: lk_sipo_copertura_profili_di_ruolo
-- Chiave ente: tabella di lookup (nessuna chiave ente)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS lk_sipo_copertura_profili_di_ruolo CASCADE;
CREATE MATERIALIZED VIEW lk_sipo_copertura_profili_di_ruolo AS
SELECT *  -- includere tutte le colonne originali
FROM <sorgente_reale_per_lk_sipo_copertura_profili_di_ruolo>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: lk_sipo_criticita_processi
-- Chiave ente: tabella di lookup (nessuna chiave ente)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS lk_sipo_criticita_processi CASCADE;
CREATE MATERIALIZED VIEW lk_sipo_criticita_processi AS
SELECT *  -- includere tutte le colonne originali
FROM <sorgente_reale_per_lk_sipo_criticita_processi>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: lk_sipo_criticita_uo
-- Chiave ente: tabella di lookup (nessuna chiave ente)
DROP MATERIALIZED VIEW IF EXISTS lk_sipo_criticita_uo CASCADE;
CREATE MATERIALIZED VIEW lk_sipo_criticita_uo AS
SELECT
    categoria,
    criticita_id,
    descrizione
FROM <sorgente_reale_per_lk_sipo_criticita_uo>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: lk_sipo_grado_rilevanza_processi
-- Chiave ente: tabella di lookup (nessuna chiave ente)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS lk_sipo_grado_rilevanza_processi CASCADE;
CREATE MATERIALIZED VIEW lk_sipo_grado_rilevanza_processi AS
SELECT *  -- includere tutte le colonne originali
FROM <sorgente_reale_per_lk_sipo_grado_rilevanza_processi>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: lk_sipo_lavoro_agile_fasi
-- Chiave ente: tabella di lookup (nessuna chiave ente)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS lk_sipo_lavoro_agile_fasi CASCADE;
CREATE MATERIALIZED VIEW lk_sipo_lavoro_agile_fasi AS
SELECT *  -- includere tutte le colonne originali
FROM <sorgente_reale_per_lk_sipo_lavoro_agile_fasi>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: lk_sipo_livello_digitalizzazione_fasi
-- Chiave ente: tabella di lookup (nessuna chiave ente)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS lk_sipo_livello_digitalizzazione_fasi CASCADE;
CREATE MATERIALIZED VIEW lk_sipo_livello_digitalizzazione_fasi AS
SELECT *  -- includere tutte le colonne originali
FROM <sorgente_reale_per_lk_sipo_livello_digitalizzazione_fasi>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: lk_sipo_obiettivi_strategici_processi
-- Chiave ente: tabella di lookup (nessuna chiave ente)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS lk_sipo_obiettivi_strategici_processi CASCADE;
CREATE MATERIALIZED VIEW lk_sipo_obiettivi_strategici_processi AS
SELECT *  -- includere tutte le colonne originali
FROM <sorgente_reale_per_lk_sipo_obiettivi_strategici_processi>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: lk_sipo_outsourcing_fasi
-- Chiave ente: tabella di lookup (nessuna chiave ente)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS lk_sipo_outsourcing_fasi CASCADE;
CREATE MATERIALIZED VIEW lk_sipo_outsourcing_fasi AS
SELECT *  -- includere tutte le colonne originali
FROM <sorgente_reale_per_lk_sipo_outsourcing_fasi>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: lk_sipo_profili_di_ruolo
-- Chiave ente: ente_id
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS lk_sipo_profili_di_ruolo CASCADE;
CREATE MATERIALIZED VIEW lk_sipo_profili_di_ruolo AS
SELECT
    ente_id,
    id_ambito_ruolo,
    id_area_contrattuale,
    id_famiglia_professionale,
    id_minerva_profilo_professionale,
    profilo_ruolo,
    profilo_ruolo_id,
    data_eliminazione
    -- , <tutte le altre colonne originali>
FROM <sorgente_reale_per_lk_sipo_profili_di_ruolo>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: lk_sipo_semplificazione_processi
-- Chiave ente: tabella di lookup (nessuna chiave ente)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS lk_sipo_semplificazione_processi CASCADE;
CREATE MATERIALIZED VIEW lk_sipo_semplificazione_processi AS
SELECT *  -- includere tutte le colonne originali
FROM <sorgente_reale_per_lk_sipo_semplificazione_processi>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: lk_sipo_stato_organizzazione
-- Chiave ente: tabella di lookup (nessuna chiave ente)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS lk_sipo_stato_organizzazione CASCADE;
CREATE MATERIALIZED VIEW lk_sipo_stato_organizzazione AS
SELECT *  -- includere tutte le colonne originali
FROM <sorgente_reale_per_lk_sipo_stato_organizzazione>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: lk_sipo_tipologia_funzione
-- Chiave ente: tabella di lookup (nessuna chiave ente)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS lk_sipo_tipologia_funzione CASCADE;
CREATE MATERIALIZED VIEW lk_sipo_tipologia_funzione AS
SELECT *  -- includere tutte le colonne originali
FROM <sorgente_reale_per_lk_sipo_tipologia_funzione>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: user_journey_step_indicators
-- Chiave ente: tabella di lookup (nessuna chiave ente)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS user_journey_step_indicators CASCADE;
CREATE MATERIALIZED VIEW user_journey_step_indicators AS
SELECT
    step_id
    -- , <tutte le altre colonne originali>
FROM <sorgente_reale_per_user_journey_step_indicators>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: user_journey_steps
-- Chiave ente: tabella di lookup (nessuna chiave ente)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS user_journey_steps CASCADE;
CREATE MATERIALIZED VIEW user_journey_steps AS
SELECT
    id,
    journey_id,
    step_order
    -- , <tutte le altre colonne originali>
FROM <sorgente_reale_per_user_journey_steps>;   -- TODO: mappare sorgente/join


-- ---------------------------------------------------------------------
-- Tabella/MV: user_journeys
-- Chiave ente: tabella di lookup (nessuna chiave ente)
-- NB: il codice usa SELECT * -> includere TUTTE le colonne originali.
DROP MATERIALIZED VIEW IF EXISTS user_journeys CASCADE;
CREATE MATERIALIZED VIEW user_journeys AS
SELECT
    id,
    created_at
    -- , <tutte le altre colonne originali>
FROM <sorgente_reale_per_user_journeys>;   -- TODO: mappare sorgente/join
