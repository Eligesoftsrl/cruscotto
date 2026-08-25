
-- =============================================
-- SYLLABUS - ENTE, SOTTOENTE, UTENTE, CONTENUTI, PERCORSI, ASSESSMENT, BADGE, DWH
-- =============================================

-- Ente
CREATE TABLE public.lh_ente (
  id_ente bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  denominazione_ente varchar(1000),
  acronimo_ente varchar(100),
  cod_ipa varchar(100) UNIQUE NOT NULL,
  cf_ente varchar(16),
  id_tipologia_ente integer REFERENCES public.lh_tipologia_ente(id_tipologia_ente),
  id_natura_giuridica_ente integer REFERENCES public.lh_natura_giuridica_ente(id_natura_giuridica_ente),
  id_proprietario_dati smallint NOT NULL REFERENCES public.lh_proprietario_dati(id_proprietario_dati),
  id_categoria_ente integer REFERENCES public.lh_categoria_ente(id_categoria_ente)
);
ALTER TABLE public.lh_ente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_ente" ON public.lh_ente FOR SELECT TO public USING (true);

-- Sottoente
CREATE TABLE public.lh_sottoente (
  id_sottoente bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  denominazione_sottoente varchar(1000),
  codice_sottoente varchar(100),
  id_ente bigint NOT NULL REFERENCES public.lh_ente(id_ente),
  f_ente smallint NOT NULL DEFAULT 1,
  id_stato_ente smallint NOT NULL REFERENCES public.lh_stato_ente(id_stato_ente),
  id_proprietario_dati smallint NOT NULL REFERENCES public.lh_proprietario_dati(id_proprietario_dati),
  data_inizio date,
  data_fine date
);
ALTER TABLE public.lh_sottoente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_sottoente" ON public.lh_sottoente FOR SELECT TO public USING (true);

-- Utente
CREATE TABLE public.lh_utente (
  id_utente bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  cf varchar(16),
  nome varchar(64),
  cognome varchar(64),
  data_nascita date,
  id_genere smallint REFERENCES public.lh_genere(id_genere),
  id_titolo_studio smallint REFERENCES public.lh_titolo_studio(id_titolo_studio),
  id_ruolo_amministrativo smallint REFERENCES public.lh_ruolo_amministrativo(id_ruolo_amministrativo),
  id_proprietario_dati smallint NOT NULL REFERENCES public.lh_proprietario_dati(id_proprietario_dati),
  id_stato_utente smallint NOT NULL REFERENCES public.lh_stato_utente(id_stato_utente),
  id_tipologia_contrattuale smallint REFERENCES public.lh_tipologia_contrattuale(id_tipologia_contrattuale),
  id_comune_sede_lavoro integer REFERENCES public.lh_comune(id_comune),
  id_qualifica smallint REFERENCES public.lh_qualifica(id_qualifica),
  id_attivita_svolte smallint REFERENCES public.lh_attivita_svolte(id_attivita_svolte),
  anno_ingresso_pa smallint,
  data_ultimo_login date,
  data_registrazione_utente date
);
ALTER TABLE public.lh_utente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_utente" ON public.lh_utente FOR SELECT TO public USING (true);

-- Ruolo ente utente (link utente-sottoente-ruolo)
CREATE TABLE public.lh_ruolo_ente_utente (
  id_ruolo_ente_utente bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  id_utente bigint NOT NULL REFERENCES public.lh_utente(id_utente),
  id_sottoente bigint NOT NULL REFERENCES public.lh_sottoente(id_sottoente),
  id_ruolo smallint NOT NULL REFERENCES public.lh_ruolo(id_ruolo),
  UNIQUE(id_utente, id_sottoente, id_ruolo)
);
ALTER TABLE public.lh_ruolo_ente_utente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_ruolo_ente_utente" ON public.lh_ruolo_ente_utente FOR SELECT TO public USING (true);

-- CMS Contenuto live
CREATE TABLE public.lh_cms_contenuto_live (
  id_contenuto bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  titolo_contenuto varchar(2000),
  contenuto varchar(4000),
  id_tipo_contenuto bigint NOT NULL REFERENCES public.lh_cms_tipo_contenuto(id_tipo_contenuto),
  id_ambito bigint NOT NULL REFERENCES public.lh_cms_ambito(id_ambito),
  id_fornitore bigint NOT NULL REFERENCES public.lh_cms_fornitore(id_fornitore),
  durata_contenuto_hh smallint NOT NULL DEFAULT 0,
  durata_contenuto_mm smallint NOT NULL DEFAULT 0,
  id_stato_contenuto bigint NOT NULL REFERENCES public.lh_cms_stato_contenuto(id_stato_contenuto),
  id_metodo_assistenza bigint REFERENCES public.lh_cms_metodo_assistenza(id_metodo_assistenza),
  url_contenuto varchar(2000) NOT NULL DEFAULT '',
  codice_contenuto_fornitore varchar(250) NOT NULL DEFAULT '',
  n_moduli smallint,
  data_inizio_disponibilita timestamp,
  data_fine_disponibilita timestamp
);
ALTER TABLE public.lh_cms_contenuto_live ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_cms_contenuto_live" ON public.lh_cms_contenuto_live FOR SELECT TO public USING (true);

-- CMS Corso live
CREATE TABLE public.lh_cms_corso_live (
  id_contenuto bigint PRIMARY KEY REFERENCES public.lh_cms_contenuto_live(id_contenuto),
  contenuti_e_struttura varchar(4000) NOT NULL DEFAULT '',
  f_certificato smallint DEFAULT 0,
  f_attestato smallint DEFAULT 0,
  id_competenza bigint REFERENCES public.lh_cms_competenza(id_competenza),
  id_livello_da bigint REFERENCES public.lh_cms_livello(id_livello),
  id_livello_a bigint REFERENCES public.lh_cms_livello(id_livello),
  f_webinar smallint NOT NULL DEFAULT 0,
  n_max_iscritti integer,
  data_webinar timestamp
);
ALTER TABLE public.lh_cms_corso_live ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_cms_corso_live" ON public.lh_cms_corso_live FOR SELECT TO public USING (true);

-- Iscrizione utente contenuto
CREATE TABLE public.lh_iscrizione_utente_contenuto (
  id_iscrizione bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  id_utente bigint NOT NULL REFERENCES public.lh_utente(id_utente),
  id_contenuto bigint NOT NULL REFERENCES public.lh_cms_contenuto_live(id_contenuto),
  data_iscrizione timestamp NOT NULL DEFAULT now(),
  data_completamento timestamp,
  stato_fruizione varchar(30) NOT NULL DEFAULT 'ISCRITTO',
  percentuale_completamento smallint NOT NULL DEFAULT 0,
  UNIQUE(id_utente, id_contenuto)
);
ALTER TABLE public.lh_iscrizione_utente_contenuto ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_iscrizione_utente_contenuto" ON public.lh_iscrizione_utente_contenuto FOR SELECT TO public USING (true);

-- Percorso
CREATE TABLE public.lh_percorso (
  id_percorso bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  id_utente bigint NOT NULL REFERENCES public.lh_utente(id_utente),
  id_competenza bigint NOT NULL REFERENCES public.lh_cms_competenza(id_competenza),
  id_livello_partenza bigint REFERENCES public.lh_cms_livello(id_livello),
  id_livello_attuale bigint REFERENCES public.lh_cms_livello(id_livello),
  stato_percorso varchar(30) NOT NULL DEFAULT 'ATTIVO',
  f_dfp smallint NOT NULL DEFAULT 1,
  stato_record smallint NOT NULL DEFAULT 1,
  data_sospensione timestamp,
  UNIQUE(id_utente, id_competenza)
);
ALTER TABLE public.lh_percorso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_percorso" ON public.lh_percorso FOR SELECT TO public USING (true);

-- Assessment
CREATE TABLE public.lh_assessment (
  id_assessment bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  id_utente bigint NOT NULL REFERENCES public.lh_utente(id_utente),
  id_percorso bigint NOT NULL REFERENCES public.lh_percorso(id_percorso),
  tipo_assessment varchar(30) NOT NULL,
  stato_assessment varchar(30) NOT NULL,
  id_livello_dichiarato bigint REFERENCES public.lh_cms_livello(id_livello),
  f_ingresso smallint NOT NULL DEFAULT 1,
  data_creazione timestamp NOT NULL DEFAULT now()
);
ALTER TABLE public.lh_assessment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_assessment" ON public.lh_assessment FOR SELECT TO public USING (true);

-- Assessment tentativo
CREATE TABLE public.lh_assessment_tentativo (
  id_assessment_tentativo bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  id_assessment bigint NOT NULL REFERENCES public.lh_assessment(id_assessment),
  f_abbandonato smallint DEFAULT 0,
  stato_tentativo varchar(30) NOT NULL,
  data_inizio timestamp NOT NULL DEFAULT now(),
  data_fine timestamp
);
ALTER TABLE public.lh_assessment_tentativo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_assessment_tentativo" ON public.lh_assessment_tentativo FOR SELECT TO public USING (true);

-- Assessment tentativo livello
CREATE TABLE public.lh_assessment_tentativo_livello (
  id_assessment_tentativo_livello bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  id_assessment_tentativo bigint NOT NULL REFERENCES public.lh_assessment_tentativo(id_assessment_tentativo),
  id_livello bigint NOT NULL REFERENCES public.lh_cms_livello(id_livello),
  data_inizio_test timestamp NOT NULL,
  data_fine_test timestamp,
  soglia_superamento_percentuale smallint NOT NULL DEFAULT 70,
  risposte_corrette_percentuale numeric(5,2),
  f_livello_superato smallint DEFAULT 0,
  f_ultimo_livello smallint DEFAULT 0,
  f_abbandonato smallint DEFAULT 0,
  UNIQUE(id_assessment_tentativo, id_livello)
);
ALTER TABLE public.lh_assessment_tentativo_livello ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_assessment_tentativo_livello" ON public.lh_assessment_tentativo_livello FOR SELECT TO public USING (true);

-- Badge
CREATE TABLE public.lh_badge (
  id_badge bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  id_utente bigint NOT NULL REFERENCES public.lh_utente(id_utente),
  id_ambito bigint NOT NULL REFERENCES public.lh_cms_ambito(id_ambito),
  id_competenza bigint NOT NULL REFERENCES public.lh_cms_competenza(id_competenza),
  id_livello bigint NOT NULL REFERENCES public.lh_cms_livello(id_livello),
  id_percorso bigint NOT NULL REFERENCES public.lh_percorso(id_percorso),
  stato_badge varchar(20) NOT NULL DEFAULT 'OTTENUTO',
  tipo_badge varchar(1) NOT NULL DEFAULT 'C',
  f_attivo smallint NOT NULL DEFAULT 1,
  data_ottenimento_badge timestamp NOT NULL DEFAULT now()
);
ALTER TABLE public.lh_badge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_badge" ON public.lh_badge FOR SELECT TO public USING (true);

-- Sottoente num dipendenti
CREATE TABLE public.lh_sottoente_num_dip (
  id_sottoente_num_dip bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  id_sottoente bigint REFERENCES public.lh_sottoente(id_sottoente),
  id_ente bigint REFERENCES public.lh_ente(id_ente),
  numero_medio_dip_istat numeric(38,20),
  numero_medio_dip_ae numeric(38,20),
  anno smallint,
  UNIQUE(id_sottoente, anno)
);
ALTER TABLE public.lh_sottoente_num_dip ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_sottoente_num_dip" ON public.lh_sottoente_num_dip FOR SELECT TO public USING (true);

-- DWH Fact percorsi
CREATE TABLE public.lh_fact_percorsi (
  id serial PRIMARY KEY,
  id_utente bigint,
  id_sottoente bigint,
  id_ambito bigint,
  id_competenza bigint,
  stato_percorso varchar(300),
  data_dwh date
);
ALTER TABLE public.lh_fact_percorsi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_fact_percorsi" ON public.lh_fact_percorsi FOR SELECT TO public USING (true);

-- DWH Fact discenti
CREATE TABLE public.lh_fact_discenti (
  id serial PRIMARY KEY,
  id_utente bigint,
  id_sottoente bigint,
  stato_utente varchar(50),
  data_dwh date
);
ALTER TABLE public.lh_fact_discenti ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_fact_discenti" ON public.lh_fact_discenti FOR SELECT TO public USING (true);

-- Sede ente
CREATE TABLE public.lh_sede_ente (
  id_sede_ente bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  id_sottoente bigint NOT NULL REFERENCES public.lh_sottoente(id_sottoente),
  id_comune integer NOT NULL REFERENCES public.lh_comune(id_comune),
  indirizzo varchar(246),
  cap varchar(5)
);
ALTER TABLE public.lh_sede_ente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_sede_ente" ON public.lh_sede_ente FOR SELECT TO public USING (true);

-- Gruppo
CREATE TABLE public.lh_gruppo (
  id_gruppo bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  gruppo varchar(50) NOT NULL,
  descrizione_gruppo varchar(1000) NOT NULL DEFAULT '',
  id_sottoente bigint NOT NULL REFERENCES public.lh_sottoente(id_sottoente),
  f_cancellazione smallint NOT NULL DEFAULT 0
);
ALTER TABLE public.lh_gruppo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_gruppo" ON public.lh_gruppo FOR SELECT TO public USING (true);

-- Abilitazione ambito
CREATE TABLE public.lh_abilitazione_ambito (
  id_abilitazione_ambito bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  id_ambito bigint NOT NULL REFERENCES public.lh_cms_ambito(id_ambito),
  id_sottoente bigint NOT NULL REFERENCES public.lh_sottoente(id_sottoente),
  tipo_abilitazione varchar(20) NOT NULL DEFAULT 'ENTE',
  data_inizio_abilitazione timestamp NOT NULL DEFAULT now(),
  data_fine_abilitazione timestamp NOT NULL DEFAULT (now() + interval '1 year')
);
ALTER TABLE public.lh_abilitazione_ambito ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_abilitazione_ambito" ON public.lh_abilitazione_ambito FOR SELECT TO public USING (true);

-- Ambito assegnato (utente-ambito)
CREATE TABLE public.lh_ambito_assegnato (
  id_ambito_assegnato bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  id_utente bigint NOT NULL REFERENCES public.lh_utente(id_utente),
  id_ambito bigint NOT NULL REFERENCES public.lh_cms_ambito(id_ambito),
  stato_ambito_assegnato varchar(30) NOT NULL DEFAULT 'ATTIVO',
  f_dfp smallint NOT NULL DEFAULT 1,
  UNIQUE(id_utente, id_ambito)
);
ALTER TABLE public.lh_ambito_assegnato ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_ambito_assegnato" ON public.lh_ambito_assegnato FOR SELECT TO public USING (true);

-- Contenuto conteggio (iscritti per contenuto)
CREATE TABLE public.lh_contenuto_conteggio (
  id_contenuto bigint PRIMARY KEY REFERENCES public.lh_cms_contenuto_live(id_contenuto),
  numero_iscritti integer NOT NULL DEFAULT 0
);
ALTER TABLE public.lh_contenuto_conteggio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_contenuto_conteggio" ON public.lh_contenuto_conteggio FOR SELECT TO public USING (true);

-- CMS Matrice descrittori
CREATE TABLE public.lh_cms_matrice_descrittori (
  id_matrice_descrittori bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  id_competenza bigint NOT NULL REFERENCES public.lh_cms_competenza(id_competenza),
  id_livello bigint NOT NULL REFERENCES public.lh_cms_livello(id_livello),
  descrittore varchar(1000) NOT NULL,
  ordine smallint NOT NULL DEFAULT 1,
  numero_domande_test_descrittore smallint NOT NULL DEFAULT 3,
  numero_domande_test_descrittore_ingresso smallint NOT NULL DEFAULT 2
);
ALTER TABLE public.lh_cms_matrice_descrittori ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_cms_matrice_descrittori" ON public.lh_cms_matrice_descrittori FOR SELECT TO public USING (true);
