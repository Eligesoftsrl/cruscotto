
-- ============================================================
-- 1. CONTO ANNUALE: Lookup tables
-- ============================================================

CREATE TABLE IF NOT EXISTS ca_lk_contratti (
  contratto_id serial PRIMARY KEY,
  codice varchar(20) NOT NULL UNIQUE,
  descrizione varchar(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS ca_lk_categorie (
  categoria_id serial PRIMARY KEY,
  codice varchar(20) NOT NULL,
  descrizione varchar(200) NOT NULL,
  contratto_id int REFERENCES ca_lk_contratti(contratto_id)
);

CREATE TABLE IF NOT EXISTS ca_lk_qualifiche (
  qualifica_id serial PRIMARY KEY,
  codice varchar(20) NOT NULL,
  descrizione varchar(200) NOT NULL,
  categoria_id int REFERENCES ca_lk_categorie(categoria_id)
);

CREATE TABLE IF NOT EXISTS ca_lk_causali_assunzione (
  causale_id serial PRIMARY KEY,
  codice varchar(20) NOT NULL UNIQUE,
  descrizione varchar(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS ca_lk_causali_cessazione (
  causale_id serial PRIMARY KEY,
  codice varchar(20) NOT NULL UNIQUE,
  descrizione varchar(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS ca_lk_fasce_eta (
  fascia_id serial PRIMARY KEY,
  codice varchar(10) NOT NULL UNIQUE,
  descrizione varchar(50) NOT NULL,
  eta_min int,
  eta_max int
);

CREATE TABLE IF NOT EXISTS ca_lk_fasce_anzianita (
  fascia_id serial PRIMARY KEY,
  codice varchar(10) NOT NULL UNIQUE,
  descrizione varchar(50) NOT NULL,
  anni_min int,
  anni_max int
);

CREATE TABLE IF NOT EXISTS ca_lk_titoli_studio (
  titolo_id serial PRIMARY KEY,
  codice varchar(20) NOT NULL UNIQUE,
  descrizione varchar(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS ca_lk_causali_assenza (
  causale_id serial PRIMARY KEY,
  codice varchar(20) NOT NULL UNIQUE,
  descrizione varchar(200) NOT NULL
);

-- ============================================================
-- 2. CONTO ANNUALE: Fact tables
-- ============================================================

CREATE TABLE IF NOT EXISTS ca_occupazione (
  id serial PRIMARY KEY,
  istituzione_id int NOT NULL REFERENCES lk_enti(ente_id),
  contratto_id int REFERENCES ca_lk_contratti(contratto_id),
  categoria_id int REFERENCES ca_lk_categorie(categoria_id),
  qualifica_id int REFERENCES ca_lk_qualifiche(qualifica_id),
  anno int NOT NULL DEFAULT 2023,
  personale_tempo_pieno_uomini int DEFAULT 0,
  personale_tempo_pieno_donne int DEFAULT 0,
  part_time_inf50_uomini int DEFAULT 0,
  part_time_inf50_donne int DEFAULT 0,
  part_time_sup50_uomini int DEFAULT 0,
  part_time_sup50_donne int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ca_assunti (
  id serial PRIMARY KEY,
  istituzione_id int NOT NULL REFERENCES lk_enti(ente_id),
  contratto_id int REFERENCES ca_lk_contratti(contratto_id),
  categoria_id int REFERENCES ca_lk_categorie(categoria_id),
  qualifica_id int REFERENCES ca_lk_qualifiche(qualifica_id),
  causale_id int REFERENCES ca_lk_causali_assunzione(causale_id),
  anno int NOT NULL DEFAULT 2023,
  uomini int DEFAULT 0,
  donne int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ca_cessati (
  id serial PRIMARY KEY,
  istituzione_id int NOT NULL REFERENCES lk_enti(ente_id),
  contratto_id int REFERENCES ca_lk_contratti(contratto_id),
  categoria_id int REFERENCES ca_lk_categorie(categoria_id),
  qualifica_id int REFERENCES ca_lk_qualifiche(qualifica_id),
  causale_id int REFERENCES ca_lk_causali_cessazione(causale_id),
  anno int NOT NULL DEFAULT 2023,
  uomini int DEFAULT 0,
  donne int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ca_eta (
  id serial PRIMARY KEY,
  istituzione_id int NOT NULL REFERENCES lk_enti(ente_id),
  contratto_id int REFERENCES ca_lk_contratti(contratto_id),
  categoria_id int REFERENCES ca_lk_categorie(categoria_id),
  qualifica_id int REFERENCES ca_lk_qualifiche(qualifica_id),
  fascia_id int REFERENCES ca_lk_fasce_eta(fascia_id),
  anno int NOT NULL DEFAULT 2023,
  uomini int DEFAULT 0,
  donne int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ca_eta_media (
  id serial PRIMARY KEY,
  istituzione_id int NOT NULL REFERENCES lk_enti(ente_id),
  contratto_id int REFERENCES ca_lk_contratti(contratto_id),
  categoria_id int REFERENCES ca_lk_categorie(categoria_id),
  qualifica_id int REFERENCES ca_lk_qualifiche(qualifica_id),
  anno int NOT NULL DEFAULT 2023,
  uomini int DEFAULT 0,
  donne int DEFAULT 0,
  media_uomini numeric(5,2),
  media_donne numeric(5,2),
  media numeric(5,2)
);

CREATE TABLE IF NOT EXISTS ca_anzianita (
  id serial PRIMARY KEY,
  istituzione_id int NOT NULL REFERENCES lk_enti(ente_id),
  contratto_id int REFERENCES ca_lk_contratti(contratto_id),
  categoria_id int REFERENCES ca_lk_categorie(categoria_id),
  qualifica_id int REFERENCES ca_lk_qualifiche(qualifica_id),
  fascia_id int REFERENCES ca_lk_fasce_anzianita(fascia_id),
  anno int NOT NULL DEFAULT 2023,
  uomini int DEFAULT 0,
  donne int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ca_anzianita_media (
  id serial PRIMARY KEY,
  istituzione_id int NOT NULL REFERENCES lk_enti(ente_id),
  contratto_id int REFERENCES ca_lk_contratti(contratto_id),
  categoria_id int REFERENCES ca_lk_categorie(categoria_id),
  qualifica_id int REFERENCES ca_lk_qualifiche(qualifica_id),
  anno int NOT NULL DEFAULT 2023,
  uomini int DEFAULT 0,
  donne int DEFAULT 0,
  media_uomini numeric(5,2),
  media_donne numeric(5,2),
  media numeric(5,2)
);

CREATE TABLE IF NOT EXISTS ca_comandati (
  id serial PRIMARY KEY,
  istituzione_id int NOT NULL REFERENCES lk_enti(ente_id),
  contratto_id int REFERENCES ca_lk_contratti(contratto_id),
  categoria_id int REFERENCES ca_lk_categorie(categoria_id),
  qualifica_id int REFERENCES ca_lk_qualifiche(qualifica_id),
  anno int NOT NULL DEFAULT 2023,
  comandati_distaccati_uomini int DEFAULT 0,
  comandati_distaccati_donne int DEFAULT 0,
  fuori_ruolo_uomini int DEFAULT 0,
  fuori_ruolo_donne int DEFAULT 0,
  comandati_distaccati_esterno_uomini int DEFAULT 0,
  comandati_distaccati_esterno_donne int DEFAULT 0,
  fuori_ruolo_esterno_uomini int DEFAULT 0,
  fuori_ruolo_esterno_donne int DEFAULT 0,
  convenzioni_uomini int DEFAULT 0,
  convenzioni_donne int DEFAULT 0,
  convenzioni_esterno_uomini int DEFAULT 0,
  convenzioni_esterno_donne int DEFAULT 0,
  esoneri_uomini int DEFAULT 0,
  esoneri_donne int DEFAULT 0,
  aspettative_uomini int DEFAULT 0,
  aspettative_donne int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ca_formazione (
  id serial PRIMARY KEY,
  istituzione_id int NOT NULL REFERENCES lk_enti(ente_id),
  contratto_id int REFERENCES ca_lk_contratti(contratto_id),
  categoria_id int REFERENCES ca_lk_categorie(categoria_id),
  qualifica_id int REFERENCES ca_lk_qualifiche(qualifica_id),
  anno int NOT NULL DEFAULT 2023,
  formati_uomini int DEFAULT 0,
  formati_donne int DEFAULT 0,
  giornate_medie_uomini numeric(6,2) DEFAULT 0,
  giornate_medie_donne numeric(6,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ca_lavoro_flessibile (
  id serial PRIMARY KEY,
  istituzione_id int NOT NULL REFERENCES lk_enti(ente_id),
  contratto_id int REFERENCES ca_lk_contratti(contratto_id),
  categoria_id int REFERENCES ca_lk_categorie(categoria_id),
  qualifica_id int REFERENCES ca_lk_qualifiche(qualifica_id),
  anno int NOT NULL DEFAULT 2023,
  tempo_determinato_uomini int DEFAULT 0,
  tempo_determinato_donne int DEFAULT 0,
  formazione_lavoro_uomini int DEFAULT 0,
  formazione_lavoro_donne int DEFAULT 0,
  interinale_uomini int DEFAULT 0,
  interinale_donne int DEFAULT 0,
  lsu_uomini int DEFAULT 0,
  lsu_donne int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ca_modalita_lavoro (
  id serial PRIMARY KEY,
  istituzione_id int NOT NULL REFERENCES lk_enti(ente_id),
  contratto_id int REFERENCES ca_lk_contratti(contratto_id),
  categoria_id int REFERENCES ca_lk_categorie(categoria_id),
  qualifica_id int REFERENCES ca_lk_qualifiche(qualifica_id),
  anno int NOT NULL DEFAULT 2023,
  telelavoro_uomini int DEFAULT 0,
  telelavoro_donne int DEFAULT 0,
  turnazione_uomini int DEFAULT 0,
  turnazione_donne int DEFAULT 0,
  reperibilita_uomini int DEFAULT 0,
  reperibilita_donne int DEFAULT 0,
  lavoro_agile_uomini int DEFAULT 0,
  lavoro_agile_donne int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ca_titolo_studio (
  id serial PRIMARY KEY,
  istituzione_id int NOT NULL REFERENCES lk_enti(ente_id),
  contratto_id int REFERENCES ca_lk_contratti(contratto_id),
  categoria_id int REFERENCES ca_lk_categorie(categoria_id),
  qualifica_id int REFERENCES ca_lk_qualifiche(qualifica_id),
  titolo_id int REFERENCES ca_lk_titoli_studio(titolo_id),
  anno int NOT NULL DEFAULT 2023,
  uomini int DEFAULT 0,
  donne int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ca_assenze (
  id serial PRIMARY KEY,
  istituzione_id int NOT NULL REFERENCES lk_enti(ente_id),
  contratto_id int REFERENCES ca_lk_contratti(contratto_id),
  categoria_id int REFERENCES ca_lk_categorie(categoria_id),
  qualifica_id int REFERENCES ca_lk_qualifiche(qualifica_id),
  causale_id int REFERENCES ca_lk_causali_assenza(causale_id),
  anno int NOT NULL DEFAULT 2023,
  giorni_uomini numeric(10,2) DEFAULT 0,
  giorni_donne numeric(10,2) DEFAULT 0
);

-- ============================================================
-- 3. MINERVA PTFP: Piano Triennale Fabbisogni
-- ============================================================

CREATE TABLE IF NOT EXISTS minerva_ptfp_piani (
  piano_id serial PRIMARY KEY,
  ente_id int NOT NULL REFERENCES lk_enti(ente_id),
  cf_amministrazione varchar(16),
  denominazione_amministrazione varchar(300),
  triennio varchar(20) NOT NULL,
  stato varchar(50) DEFAULT 'Bozza',
  data_trasmissione date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS minerva_ptfp_dotazione (
  id serial PRIMARY KEY,
  piano_id int NOT NULL REFERENCES minerva_ptfp_piani(piano_id) ON DELETE CASCADE,
  categoria_giuridica varchar(100) NOT NULL,
  teste_dotazione int DEFAULT 0,
  valore_economico numeric(14,2) DEFAULT 0,
  spesa_massima_potenziale numeric(14,2) DEFAULT 0,
  num_provvedimento varchar(100),
  data_provvedimento date
);

CREATE TABLE IF NOT EXISTS minerva_ptfp_personale (
  id serial PRIMARY KEY,
  piano_id int NOT NULL REFERENCES minerva_ptfp_piani(piano_id) ON DELETE CASCADE,
  tipo varchar(50) NOT NULL, -- 'tempo_indeterminato','comandato_out','aspettativa','comandato_in','dirigente_td'
  categoria_giuridica varchar(100) NOT NULL,
  ula numeric(8,2) DEFAULT 0,
  valore_economico numeric(14,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS minerva_ptfp_cessazioni (
  id serial PRIMARY KEY,
  piano_id int NOT NULL REFERENCES minerva_ptfp_piani(piano_id) ON DELETE CASCADE,
  anno_riferimento int NOT NULL,
  categoria_giuridica varchar(100) NOT NULL,
  causale varchar(100),
  numero_cessazioni int DEFAULT 0,
  valore_economico numeric(14,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS minerva_ptfp_vacanze (
  id serial PRIMARY KEY,
  piano_id int NOT NULL REFERENCES minerva_ptfp_piani(piano_id) ON DELETE CASCADE,
  categoria_giuridica varchar(100) NOT NULL,
  vacanze_organico int DEFAULT 0,
  eccedenze int DEFAULT 0,
  facolta_assunzionale numeric(14,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS minerva_ptfp_reclutamento (
  id serial PRIMARY KEY,
  piano_id int NOT NULL REFERENCES minerva_ptfp_piani(piano_id) ON DELETE CASCADE,
  anno_riferimento int NOT NULL,
  tipo varchar(50) NOT NULL, -- 'obbligatorio','autorizzato','da_autorizzare'
  categoria_giuridica varchar(100) NOT NULL,
  numero_posti int DEFAULT 0,
  valore_economico numeric(14,2) DEFAULT 0,
  modalita_reclutamento varchar(200)
);

CREATE TABLE IF NOT EXISTS minerva_ptfp_categorie_protette (
  id serial PRIMARY KEY,
  piano_id int NOT NULL REFERENCES minerva_ptfp_piani(piano_id) ON DELETE CASCADE,
  categoria varchar(100) NOT NULL,
  quota_obbligo int DEFAULT 0,
  in_servizio int DEFAULT 0,
  scopertura int DEFAULT 0
);

-- ============================================================
-- 4. MINERVA: Enrich existing + add competenze lookup
-- ============================================================

CREATE TABLE IF NOT EXISTS minerva_area_competenze (
  area_id serial PRIMARY KEY,
  codice varchar(20) NOT NULL UNIQUE,
  descrizione varchar(300) NOT NULL
);

CREATE TABLE IF NOT EXISTS minerva_competenze_catalogo (
  competenza_id serial PRIMARY KEY,
  codice varchar(30) NOT NULL UNIQUE,
  tipo varchar(10) NOT NULL, -- CTP, CC, CDA
  titolo varchar(300) NOT NULL,
  area_id int REFERENCES minerva_area_competenze(area_id)
);

CREATE TABLE IF NOT EXISTS minerva_profilo_competenze (
  id serial PRIMARY KEY,
  profilo_professionale_id int,
  profilo_ruolo_id int,
  competenza_id int NOT NULL REFERENCES minerva_competenze_catalogo(competenza_id),
  livello_richiesto int DEFAULT 1
);

CREATE TABLE IF NOT EXISTS minerva_adozione_profili (
  id serial PRIMARY KEY,
  ente_id int NOT NULL REFERENCES lk_enti(ente_id),
  codice_ipa varchar(20),
  totale_dipendenti int DEFAULT 0,
  dipendenti_con_profilo int DEFAULT 0,
  data_aggiornamento timestamptz DEFAULT now()
);

-- ============================================================
-- 5. InPA: Enrich bandi with full schema
-- ============================================================

ALTER TABLE inpa_bandi 
  ADD COLUMN IF NOT EXISTS codice varchar(50),
  ADD COLUMN IF NOT EXISTS descrizione text,
  ADD COLUMN IF NOT EXISTS requisiti_specifici text,
  ADD COLUMN IF NOT EXISTS tipo_procedura varchar(50),
  ADD COLUMN IF NOT EXISTS num_candidature_submitted int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS concorso_sezioni varchar(200),
  ADD COLUMN IF NOT EXISTS regioni varchar(200),
  ADD COLUMN IF NOT EXISTS province varchar(200),
  ADD COLUMN IF NOT EXISTS categorie varchar(200),
  ADD COLUMN IF NOT EXISTS figura_ricercata text,
  ADD COLUMN IF NOT EXISTS benefits varchar(200),
  ADD COLUMN IF NOT EXISTS tipi_impieghi varchar(50),
  ADD COLUMN IF NOT EXISTS livelli_anzianita varchar(500),
  ADD COLUMN IF NOT EXISTS funzioni_lavorative varchar(500),
  ADD COLUMN IF NOT EXISTS settori_aziende varchar(500),
  ADD COLUMN IF NOT EXISTS categoria_ipa varchar(200),
  ADD COLUMN IF NOT EXISTS tipologia_ipa varchar(200);

-- ============================================================
-- 6. LAVORO PUBBLICO: Additional operational tables
-- ============================================================

CREATE TABLE IF NOT EXISTS lp_pareri (
  id serial PRIMARY KEY,
  id_documento varchar(50) NOT NULL,
  gruppo_tipologia varchar(100),
  tipologia_documento varchar(100),
  pubblicazione boolean DEFAULT true,
  data_pubblicazione date,
  data_fine_pubblicazione date,
  data_protocollo date,
  protocollo_dfp varchar(50),
  altro_identificativo varchar(100),
  tipologia_destinatari varchar(200),
  cf_amministrazione varchar(16),
  destinatari_specifici varchar(300),
  oggetto text,
  argomento varchar(200),
  ambito varchar(200),
  ambito_specifico text,
  sintesi text
);

CREATE TABLE IF NOT EXISTS lp_segretari_comunali (
  id serial PRIMARY KEY,
  ente_id int REFERENCES lk_enti(ente_id),
  ordine_graduatoria int,
  cf_amministrazione varchar(16),
  denominazione varchar(300),
  provincia varchar(50),
  regione varchar(50),
  tipo_comune varchar(50), -- singolo/capofila
  situazione_segreteria varchar(100),
  condizione_finanziaria varchar(100),
  partecipazione_convenzione numeric(5,2),
  contributo_richiesto numeric(14,2),
  contributo_assegnato numeric(14,2),
  anno int DEFAULT 2025
);

CREATE TABLE IF NOT EXISTS lp_risorse_in_comune (
  id serial PRIMARY KEY,
  ente_id int REFERENCES lk_enti(ente_id),
  cf_amministrazione varchar(16),
  denominazione varchar(300),
  provincia varchar(50),
  regione varchar(50),
  popolazione int,
  progetto_titolo varchar(300),
  progetto_descrizione text,
  importo_richiesto numeric(14,2),
  importo_assegnato numeric(14,2),
  stato varchar(50) DEFAULT 'Presentato',
  anno int DEFAULT 2025
);

CREATE TABLE IF NOT EXISTS lp_tfr_tfs (
  id serial PRIMARY KEY,
  ente_id int REFERENCES lk_enti(ente_id),
  tipologia_ente varchar(100),
  regime varchar(50), -- TFR/TFS
  numero_dipendenti int DEFAULT 0,
  importo_accantonato numeric(14,2) DEFAULT 0,
  anno_rilevazione int DEFAULT 2025
);

CREATE TABLE IF NOT EXISTS lp_graduatorie_concorsuali (
  id serial PRIMARY KEY,
  ente_id int REFERENCES lk_enti(ente_id),
  cf_amministrazione varchar(16),
  denominazione varchar(300),
  profilo varchar(200),
  area_contrattuale varchar(100),
  data_approvazione date,
  idonei_totali int DEFAULT 0,
  assunti int DEFAULT 0,
  idonei_disponibili int DEFAULT 0,
  stato varchar(50) DEFAULT 'Vigente',
  anno int DEFAULT 2025
);

-- ============================================================
-- 7. ANAGRAFICA LAVORO PUBBLICO: Classification tables
-- ============================================================

CREATE TABLE IF NOT EXISTS lp_lk_argomenti (
  id serial PRIMARY KEY,
  codice varchar(20) NOT NULL UNIQUE,
  descrizione varchar(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS lp_lk_ambiti (
  id serial PRIMARY KEY,
  codice varchar(20) NOT NULL UNIQUE,
  descrizione varchar(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS lp_lk_tipologie_documento (
  id serial PRIMARY KEY,
  gruppo varchar(100) NOT NULL,
  tipologia varchar(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS lp_lk_destinatari (
  id serial PRIMARY KEY,
  codice varchar(20) NOT NULL UNIQUE,
  descrizione varchar(200) NOT NULL
);

-- ============================================================
-- 8. RLS Policies (read-only for all authenticated)
-- ============================================================

-- Conto Annuale tables
ALTER TABLE ca_lk_contratti ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_lk_categorie ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_lk_qualifiche ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_lk_causali_assunzione ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_lk_causali_cessazione ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_lk_fasce_eta ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_lk_fasce_anzianita ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_lk_titoli_studio ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_lk_causali_assenza ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_occupazione ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_assunti ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_cessati ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_eta ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_eta_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_anzianita ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_anzianita_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_comandati ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_formazione ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_lavoro_flessibile ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_modalita_lavoro ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_titolo_studio ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_assenze ENABLE ROW LEVEL SECURITY;

-- Minerva PTFP
ALTER TABLE minerva_ptfp_piani ENABLE ROW LEVEL SECURITY;
ALTER TABLE minerva_ptfp_dotazione ENABLE ROW LEVEL SECURITY;
ALTER TABLE minerva_ptfp_personale ENABLE ROW LEVEL SECURITY;
ALTER TABLE minerva_ptfp_cessazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE minerva_ptfp_vacanze ENABLE ROW LEVEL SECURITY;
ALTER TABLE minerva_ptfp_reclutamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE minerva_ptfp_categorie_protette ENABLE ROW LEVEL SECURITY;

-- Minerva catalogo
ALTER TABLE minerva_area_competenze ENABLE ROW LEVEL SECURITY;
ALTER TABLE minerva_competenze_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE minerva_profilo_competenze ENABLE ROW LEVEL SECURITY;
ALTER TABLE minerva_adozione_profili ENABLE ROW LEVEL SECURITY;

-- Lavoro Pubblico
ALTER TABLE lp_pareri ENABLE ROW LEVEL SECURITY;
ALTER TABLE lp_segretari_comunali ENABLE ROW LEVEL SECURITY;
ALTER TABLE lp_risorse_in_comune ENABLE ROW LEVEL SECURITY;
ALTER TABLE lp_tfr_tfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lp_graduatorie_concorsuali ENABLE ROW LEVEL SECURITY;
ALTER TABLE lp_lk_argomenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE lp_lk_ambiti ENABLE ROW LEVEL SECURITY;
ALTER TABLE lp_lk_tipologie_documento ENABLE ROW LEVEL SECURITY;
ALTER TABLE lp_lk_destinatari ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated users
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'ca_lk_contratti','ca_lk_categorie','ca_lk_qualifiche','ca_lk_causali_assunzione',
    'ca_lk_causali_cessazione','ca_lk_fasce_eta','ca_lk_fasce_anzianita','ca_lk_titoli_studio',
    'ca_lk_causali_assenza','ca_occupazione','ca_assunti','ca_cessati','ca_eta','ca_eta_media',
    'ca_anzianita','ca_anzianita_media','ca_comandati','ca_formazione','ca_lavoro_flessibile',
    'ca_modalita_lavoro','ca_titolo_studio','ca_assenze',
    'minerva_ptfp_piani','minerva_ptfp_dotazione','minerva_ptfp_personale',
    'minerva_ptfp_cessazioni','minerva_ptfp_vacanze','minerva_ptfp_reclutamento',
    'minerva_ptfp_categorie_protette',
    'minerva_area_competenze','minerva_competenze_catalogo','minerva_profilo_competenze',
    'minerva_adozione_profili',
    'lp_pareri','lp_segretari_comunali','lp_risorse_in_comune','lp_tfr_tfs',
    'lp_graduatorie_concorsuali','lp_lk_argomenti','lp_lk_ambiti',
    'lp_lk_tipologie_documento','lp_lk_destinatari'
  ])
  LOOP
    EXECUTE format('CREATE POLICY "Allow authenticated read on %I" ON %I FOR SELECT TO authenticated USING (true)', tbl, tbl);
  END LOOP;
END $$;
