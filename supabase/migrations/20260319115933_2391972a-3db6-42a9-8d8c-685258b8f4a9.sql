
-- =============================================
-- SYLLABUS / LEARNINGHUB - LOOKUP TABLES
-- =============================================

-- Proprietario dati
CREATE TABLE public.lh_proprietario_dati (
  id_proprietario_dati smallint PRIMARY KEY,
  proprietario_dati varchar(50) NOT NULL
);
ALTER TABLE public.lh_proprietario_dati ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_proprietario_dati" ON public.lh_proprietario_dati FOR SELECT TO public USING (true);

-- Genere
CREATE TABLE public.lh_genere (
  id_genere smallint PRIMARY KEY,
  genere varchar(30) NOT NULL
);
ALTER TABLE public.lh_genere ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_genere" ON public.lh_genere FOR SELECT TO public USING (true);

-- Stato utente
CREATE TABLE public.lh_stato_utente (
  id_stato_utente smallint PRIMARY KEY,
  stato_utente varchar(50) NOT NULL
);
ALTER TABLE public.lh_stato_utente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_stato_utente" ON public.lh_stato_utente FOR SELECT TO public USING (true);

-- Grado titolo studio
CREATE TABLE public.lh_grado_titolo_studio (
  id_grado_titolo_studio smallint PRIMARY KEY,
  grado_titolo_studio varchar(255) NOT NULL
);
ALTER TABLE public.lh_grado_titolo_studio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_grado_titolo_studio" ON public.lh_grado_titolo_studio FOR SELECT TO public USING (true);

-- Livello titolo studio
CREATE TABLE public.lh_livello_titolo_studio (
  id_livello_titolo_studio smallint PRIMARY KEY,
  livello_titolo_studio varchar(250) NOT NULL,
  cod_livello_titolo_studio smallint NOT NULL,
  isced_2011 smallint NOT NULL,
  id_grado_titolo_studio smallint NOT NULL REFERENCES public.lh_grado_titolo_studio(id_grado_titolo_studio)
);
ALTER TABLE public.lh_livello_titolo_studio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_livello_titolo_studio" ON public.lh_livello_titolo_studio FOR SELECT TO public USING (true);

-- Titolo studio
CREATE TABLE public.lh_titolo_studio (
  id_titolo_studio smallint PRIMARY KEY,
  titolo_studio varchar(250) NOT NULL,
  id_livello_titolo_studio smallint NOT NULL REFERENCES public.lh_livello_titolo_studio(id_livello_titolo_studio)
);
ALTER TABLE public.lh_titolo_studio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_titolo_studio" ON public.lh_titolo_studio FOR SELECT TO public USING (true);

-- Ruolo amministrativo
CREATE TABLE public.lh_ruolo_amministrativo (
  id_ruolo_amministrativo smallint PRIMARY KEY,
  ruolo_amministrativo varchar(250) NOT NULL,
  ordinamento smallint
);
ALTER TABLE public.lh_ruolo_amministrativo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_ruolo_amministrativo" ON public.lh_ruolo_amministrativo FOR SELECT TO public USING (true);

-- Tipologia contrattuale
CREATE TABLE public.lh_tipologia_contrattuale (
  id_tipologia_contrattuale smallint PRIMARY KEY,
  tipologia_contrattuale varchar(250) NOT NULL
);
ALTER TABLE public.lh_tipologia_contrattuale ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_tipologia_contrattuale" ON public.lh_tipologia_contrattuale FOR SELECT TO public USING (true);

-- Qualifica principale
CREATE TABLE public.lh_qualifica_principale (
  id_qualifica_principale smallint PRIMARY KEY,
  qualifica_principale varchar(250) NOT NULL
);
ALTER TABLE public.lh_qualifica_principale ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_qualifica_principale" ON public.lh_qualifica_principale FOR SELECT TO public USING (true);

-- Qualifica
CREATE TABLE public.lh_qualifica (
  id_qualifica smallint PRIMARY KEY,
  qualifica varchar(250) NOT NULL,
  id_qualifica_principale smallint NOT NULL REFERENCES public.lh_qualifica_principale(id_qualifica_principale)
);
ALTER TABLE public.lh_qualifica ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_qualifica" ON public.lh_qualifica FOR SELECT TO public USING (true);

-- Attività svolte
CREATE TABLE public.lh_attivita_svolte (
  id_attivita_svolte smallint PRIMARY KEY,
  attivita_svolte varchar(30) NOT NULL,
  descrizione_attivita_svolte varchar(250)
);
ALTER TABLE public.lh_attivita_svolte ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_attivita_svolte" ON public.lh_attivita_svolte FOR SELECT TO public USING (true);

-- Regione
CREATE TABLE public.lh_regione (
  cod_regione varchar(2) PRIMARY KEY,
  denominazione varchar(80)
);
ALTER TABLE public.lh_regione ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_regione" ON public.lh_regione FOR SELECT TO public USING (true);

-- Provincia
CREATE TABLE public.lh_provincia (
  id_provincia integer PRIMARY KEY,
  denominazione varchar(60),
  cod_regione varchar(2) NOT NULL REFERENCES public.lh_regione(cod_regione),
  sigla varchar(2)
);
ALTER TABLE public.lh_provincia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_provincia" ON public.lh_provincia FOR SELECT TO public USING (true);

-- Comune
CREATE TABLE public.lh_comune (
  id_comune integer PRIMARY KEY,
  denominazione_it varchar(80),
  cod_istat varchar(6),
  id_provincia integer NOT NULL REFERENCES public.lh_provincia(id_provincia)
);
ALTER TABLE public.lh_comune ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_comune" ON public.lh_comune FOR SELECT TO public USING (true);

-- Tipologia ente
CREATE TABLE public.lh_tipologia_ente (
  id_tipologia_ente integer PRIMARY KEY,
  tipologia_ente varchar(140) NOT NULL,
  id_proprietario_dati smallint NOT NULL REFERENCES public.lh_proprietario_dati(id_proprietario_dati)
);
ALTER TABLE public.lh_tipologia_ente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_tipologia_ente" ON public.lh_tipologia_ente FOR SELECT TO public USING (true);

-- Natura giuridica ente
CREATE TABLE public.lh_natura_giuridica_ente (
  id_natura_giuridica_ente integer PRIMARY KEY,
  cod_natura_giuridica_ente varchar(4),
  natura_giuridica_ente varchar(200),
  id_proprietario_dati smallint NOT NULL REFERENCES public.lh_proprietario_dati(id_proprietario_dati)
);
ALTER TABLE public.lh_natura_giuridica_ente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_natura_giuridica_ente" ON public.lh_natura_giuridica_ente FOR SELECT TO public USING (true);

-- Categoria ente
CREATE TABLE public.lh_categoria_ente (
  id_categoria_ente integer PRIMARY KEY,
  categoria_ente varchar(250),
  cod_categoria_ente varchar(5),
  id_proprietario_dati smallint NOT NULL REFERENCES public.lh_proprietario_dati(id_proprietario_dati)
);
ALTER TABLE public.lh_categoria_ente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_categoria_ente" ON public.lh_categoria_ente FOR SELECT TO public USING (true);

-- Stato ente
CREATE TABLE public.lh_stato_ente (
  id_stato_ente smallint PRIMARY KEY,
  stato_ente varchar(50) NOT NULL
);
ALTER TABLE public.lh_stato_ente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_stato_ente" ON public.lh_stato_ente FOR SELECT TO public USING (true);

-- CMS Macro ambito
CREATE TABLE public.lh_cms_macro_ambito (
  id_macro_ambito bigint PRIMARY KEY,
  macro_ambito varchar(250) NOT NULL,
  descrizione varchar(4000) NOT NULL,
  ordine smallint
);
ALTER TABLE public.lh_cms_macro_ambito ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_cms_macro_ambito" ON public.lh_cms_macro_ambito FOR SELECT TO public USING (true);

-- CMS Famiglia livelli
CREATE TABLE public.lh_cms_famiglia_livelli (
  id_famiglia_livelli bigint PRIMARY KEY,
  famiglia_livelli varchar(100) NOT NULL,
  descrizione varchar(1000)
);
ALTER TABLE public.lh_cms_famiglia_livelli ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_cms_famiglia_livelli" ON public.lh_cms_famiglia_livelli FOR SELECT TO public USING (true);

-- CMS Livello
CREATE TABLE public.lh_cms_livello (
  id_livello bigint PRIMARY KEY,
  livello varchar(100) NOT NULL,
  ordine integer NOT NULL,
  id_famiglia_livelli bigint NOT NULL REFERENCES public.lh_cms_famiglia_livelli(id_famiglia_livelli)
);
ALTER TABLE public.lh_cms_livello ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_cms_livello" ON public.lh_cms_livello FOR SELECT TO public USING (true);

-- CMS Ambito
CREATE TABLE public.lh_cms_ambito (
  id_ambito bigint PRIMARY KEY,
  ambito varchar(250) NOT NULL,
  descrizione varchar(4000) NOT NULL,
  id_famiglia_livelli bigint NOT NULL REFERENCES public.lh_cms_famiglia_livelli(id_famiglia_livelli),
  id_macro_ambito bigint REFERENCES public.lh_cms_macro_ambito(id_macro_ambito),
  colore varchar(10),
  stato_matrice varchar(20) NOT NULL DEFAULT 'ATTIVO',
  f_dfp smallint NOT NULL DEFAULT 1,
  f_matrice smallint NOT NULL DEFAULT 1,
  f_disattivato smallint NOT NULL DEFAULT 0,
  data_disattivazione timestamp
);
ALTER TABLE public.lh_cms_ambito ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_cms_ambito" ON public.lh_cms_ambito FOR SELECT TO public USING (true);

-- CMS Area competenza
CREATE TABLE public.lh_cms_area_competenza (
  id_area_competenza bigint PRIMARY KEY,
  area_competenza varchar(250) NOT NULL,
  descrizione varchar(4000) NOT NULL,
  ordine smallint NOT NULL,
  id_ambito bigint NOT NULL REFERENCES public.lh_cms_ambito(id_ambito),
  f_disattivato smallint NOT NULL DEFAULT 0
);
ALTER TABLE public.lh_cms_area_competenza ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_cms_area_competenza" ON public.lh_cms_area_competenza FOR SELECT TO public USING (true);

-- CMS Competenza
CREATE TABLE public.lh_cms_competenza (
  id_competenza bigint PRIMARY KEY,
  competenza varchar(255) NOT NULL,
  descrizione varchar(4000) NOT NULL,
  id_macroarea bigint NOT NULL REFERENCES public.lh_cms_area_competenza(id_area_competenza),
  ordine smallint NOT NULL,
  soglia_superamento_percentuale smallint,
  f_dfp smallint NOT NULL DEFAULT 1,
  f_disattivato smallint NOT NULL DEFAULT 0,
  f_assessment_ingresso smallint NOT NULL DEFAULT 1,
  f_assessment_uscita smallint NOT NULL DEFAULT 1
);
ALTER TABLE public.lh_cms_competenza ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_cms_competenza" ON public.lh_cms_competenza FOR SELECT TO public USING (true);

-- CMS Tipo contenuto
CREATE TABLE public.lh_cms_tipo_contenuto (
  id_tipo_contenuto bigint PRIMARY KEY,
  tipo_contenuto varchar(50)
);
ALTER TABLE public.lh_cms_tipo_contenuto ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_cms_tipo_contenuto" ON public.lh_cms_tipo_contenuto FOR SELECT TO public USING (true);

-- CMS Stato contenuto
CREATE TABLE public.lh_cms_stato_contenuto (
  id_stato_contenuto bigint PRIMARY KEY,
  stato_contenuto varchar(50),
  f_visibile smallint NOT NULL DEFAULT 1
);
ALTER TABLE public.lh_cms_stato_contenuto ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_cms_stato_contenuto" ON public.lh_cms_stato_contenuto FOR SELECT TO public USING (true);

-- CMS LMS
CREATE TABLE public.lh_cms_lms (
  id_lms bigint PRIMARY KEY,
  codice_lms_fornitore varchar(50) NOT NULL,
  lms varchar(50) NOT NULL
);
ALTER TABLE public.lh_cms_lms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_cms_lms" ON public.lh_cms_lms FOR SELECT TO public USING (true);

-- CMS Stato fornitore
CREATE TABLE public.lh_cms_stato_fornitore (
  id_stato_fornitore bigint PRIMARY KEY,
  stato_fornitore varchar(2000)
);
ALTER TABLE public.lh_cms_stato_fornitore ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_cms_stato_fornitore" ON public.lh_cms_stato_fornitore FOR SELECT TO public USING (true);

-- CMS Metodo assistenza
CREATE TABLE public.lh_cms_metodo_assistenza (
  id_metodo_assistenza bigint PRIMARY KEY,
  metodo_assistenza varchar(2000) NOT NULL
);
ALTER TABLE public.lh_cms_metodo_assistenza ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_cms_metodo_assistenza" ON public.lh_cms_metodo_assistenza FOR SELECT TO public USING (true);

-- CMS Formato
CREATE TABLE public.lh_cms_formato (
  id_formato bigint PRIMARY KEY,
  formato varchar(2000) NOT NULL,
  f_video smallint DEFAULT 0,
  f_audio smallint DEFAULT 0,
  f_trascrizione smallint DEFAULT 0
);
ALTER TABLE public.lh_cms_formato ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_cms_formato" ON public.lh_cms_formato FOR SELECT TO public USING (true);

-- CMS Destinatario
CREATE TABLE public.lh_cms_destinatario (
  id_destinatario bigint PRIMARY KEY,
  destinatario varchar(50)
);
ALTER TABLE public.lh_cms_destinatario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_cms_destinatario" ON public.lh_cms_destinatario FOR SELECT TO public USING (true);

-- CMS Fornitore
CREATE TABLE public.lh_cms_fornitore (
  id_fornitore bigint PRIMARY KEY,
  fornitore varchar(2000) NOT NULL,
  email varchar(400) NOT NULL,
  telefono varchar(100) NOT NULL,
  id_stato_fornitore bigint REFERENCES public.lh_cms_stato_fornitore(id_stato_fornitore),
  piva varchar(25) NOT NULL,
  id_lms bigint REFERENCES public.lh_cms_lms(id_lms),
  pec varchar(40) NOT NULL
);
ALTER TABLE public.lh_cms_fornitore ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_cms_fornitore" ON public.lh_cms_fornitore FOR SELECT TO public USING (true);

-- Ruolo (piattaforma)
CREATE TABLE public.lh_ruolo (
  id_ruolo smallint PRIMARY KEY,
  ruolo varchar(50) NOT NULL
);
ALTER TABLE public.lh_ruolo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lh_ruolo" ON public.lh_ruolo FOR SELECT TO public USING (true);
