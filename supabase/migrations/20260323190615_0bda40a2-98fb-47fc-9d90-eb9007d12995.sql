
-- =============================================
-- INPA TABLES: Recruiting data
-- =============================================

CREATE TABLE public.inpa_bandi (
  bando_id SERIAL PRIMARY KEY,
  ente_id INTEGER NOT NULL REFERENCES public.lk_enti(ente_id),
  titolo VARCHAR NOT NULL,
  profilo_richiesto VARCHAR NOT NULL,
  area_funzionale VARCHAR NOT NULL DEFAULT 'Amministrativa',
  tipologia_contratto VARCHAR NOT NULL DEFAULT 'Tempo indeterminato',
  posti_disponibili INTEGER NOT NULL DEFAULT 1,
  stato VARCHAR NOT NULL DEFAULT 'Chiuso',
  data_pubblicazione DATE NOT NULL,
  data_scadenza DATE NOT NULL,
  data_graduatoria DATE,
  anno INTEGER NOT NULL DEFAULT 2023
);

CREATE TABLE public.inpa_candidature (
  candidatura_id SERIAL PRIMARY KEY,
  bando_id INTEGER NOT NULL REFERENCES public.inpa_bandi(bando_id),
  genere VARCHAR NOT NULL DEFAULT 'M',
  eta INTEGER NOT NULL DEFAULT 30,
  regione_provenienza VARCHAR NOT NULL DEFAULT 'Lazio',
  titolo_studio VARCHAR NOT NULL DEFAULT 'Laurea',
  esito VARCHAR NOT NULL DEFAULT 'Non idoneo',
  punteggio NUMERIC(5,2),
  data_candidatura DATE NOT NULL
);

CREATE TABLE public.inpa_graduatorie (
  graduatoria_id SERIAL PRIMARY KEY,
  bando_id INTEGER NOT NULL REFERENCES public.inpa_bandi(bando_id),
  posizione INTEGER NOT NULL,
  idoneo BOOLEAN NOT NULL DEFAULT true,
  assunto BOOLEAN NOT NULL DEFAULT false,
  data_assunzione DATE,
  punteggio_finale NUMERIC(5,2)
);

ALTER TABLE public.inpa_bandi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inpa_candidature ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inpa_graduatorie ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on inpa_bandi" ON public.inpa_bandi FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read on inpa_candidature" ON public.inpa_candidature FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read on inpa_graduatorie" ON public.inpa_graduatorie FOR SELECT TO public USING (true);

-- =============================================
-- MINERVA TABLES: Professional profiles and competencies
-- =============================================

CREATE TABLE public.minerva_famiglie_professionali (
  famiglia_id SERIAL PRIMARY KEY,
  comparto VARCHAR NOT NULL DEFAULT 'Funzioni Locali',
  dimensione_professionale VARCHAR NOT NULL,
  famiglia VARCHAR NOT NULL,
  descrizione VARCHAR
);

CREATE TABLE public.minerva_profili (
  profilo_id SERIAL PRIMARY KEY,
  famiglia_id INTEGER NOT NULL REFERENCES public.minerva_famiglie_professionali(famiglia_id),
  ente_id INTEGER NOT NULL REFERENCES public.lk_enti(ente_id),
  denominazione_profilo VARCHAR NOT NULL,
  area_contrattuale VARCHAR NOT NULL DEFAULT 'Funzionari',
  dotazione_organica INTEGER NOT NULL DEFAULT 0,
  personale_in_servizio INTEGER NOT NULL DEFAULT 0,
  fabbisogno_triennale INTEGER NOT NULL DEFAULT 0,
  anno INTEGER NOT NULL DEFAULT 2023
);

CREATE TABLE public.minerva_competenze (
  competenza_id SERIAL PRIMARY KEY,
  profilo_id INTEGER NOT NULL REFERENCES public.minerva_profili(profilo_id),
  competenza VARCHAR NOT NULL,
  tipo VARCHAR NOT NULL DEFAULT 'Tecnica',
  livello_richiesto INTEGER NOT NULL DEFAULT 3,
  livello_medio_posseduto NUMERIC(3,1) NOT NULL DEFAULT 2.5,
  gap NUMERIC(3,1) GENERATED ALWAYS AS (livello_richiesto - livello_medio_posseduto) STORED
);

CREATE TABLE public.minerva_valutazioni (
  valutazione_id SERIAL PRIMARY KEY,
  profilo_id INTEGER NOT NULL REFERENCES public.minerva_profili(profilo_id),
  anno INTEGER NOT NULL DEFAULT 2023,
  valutazione_media NUMERIC(3,1) NOT NULL DEFAULT 3.0,
  percentuale_formati NUMERIC(5,1) NOT NULL DEFAULT 50.0,
  copertura_competenze NUMERIC(5,1) NOT NULL DEFAULT 60.0
);

ALTER TABLE public.minerva_famiglie_professionali ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minerva_profili ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minerva_competenze ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minerva_valutazioni ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on minerva_famiglie" ON public.minerva_famiglie_professionali FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read on minerva_profili" ON public.minerva_profili FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read on minerva_competenze" ON public.minerva_competenze FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read on minerva_valutazioni" ON public.minerva_valutazioni FOR SELECT TO public USING (true);

-- =============================================
-- KPI RIFORMA PA TABLE
-- =============================================

CREATE TABLE public.kpi_riforma_rilevazioni (
  rilevazione_id SERIAL PRIMARY KEY,
  ente_id INTEGER NOT NULL REFERENCES public.lk_enti(ente_id),
  kpi_codice VARCHAR NOT NULL,
  kpi_denominazione VARCHAR NOT NULL,
  dimensione VARCHAR NOT NULL,
  anno INTEGER NOT NULL DEFAULT 2023,
  valore_target NUMERIC(6,2),
  valore_rilevato NUMERIC(6,2),
  stato VARCHAR NOT NULL DEFAULT 'In corso',
  tipo_valore VARCHAR NOT NULL DEFAULT 'Quantitativo',
  note VARCHAR
);

ALTER TABLE public.kpi_riforma_rilevazioni ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on kpi_riforma" ON public.kpi_riforma_rilevazioni FOR SELECT TO public USING (true);

-- =============================================
-- LAVORO PUBBLICO TABLES
-- =============================================

CREATE TABLE public.lavoro_pubblico_personale (
  record_id SERIAL PRIMARY KEY,
  ente_id INTEGER NOT NULL REFERENCES public.lk_enti(ente_id),
  qualifica VARCHAR NOT NULL,
  area_contrattuale VARCHAR NOT NULL DEFAULT 'Funzionari',
  genere VARCHAR NOT NULL DEFAULT 'M',
  fascia_eta VARCHAR NOT NULL DEFAULT '30-39',
  titolo_studio VARCHAR NOT NULL DEFAULT 'Laurea',
  tipo_contratto VARCHAR NOT NULL DEFAULT 'Tempo indeterminato',
  regione VARCHAR NOT NULL DEFAULT 'Lazio',
  anno INTEGER NOT NULL DEFAULT 2023,
  numero_unita INTEGER NOT NULL DEFAULT 1,
  retribuzione_media NUMERIC(10,2),
  anzianita_media NUMERIC(4,1)
);

CREATE TABLE public.lavoro_pubblico_dotazione (
  dotazione_id SERIAL PRIMARY KEY,
  ente_id INTEGER NOT NULL REFERENCES public.lk_enti(ente_id),
  area_contrattuale VARCHAR NOT NULL,
  dotazione_organica INTEGER NOT NULL DEFAULT 0,
  personale_servizio INTEGER NOT NULL DEFAULT 0,
  anno INTEGER NOT NULL DEFAULT 2023
);

ALTER TABLE public.lavoro_pubblico_personale ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lavoro_pubblico_dotazione ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on lp_personale" ON public.lavoro_pubblico_personale FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read on lp_dotazione" ON public.lavoro_pubblico_dotazione FOR SELECT TO public USING (true);
