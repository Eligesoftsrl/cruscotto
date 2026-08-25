
-- DW staging tables for Cruscotto HR seeding

CREATE TABLE IF NOT EXISTS public.dw_ente (
  id_ente INTEGER PRIMARY KEY,
  cfiscale TEXT,
  codice_ipa TEXT,
  denominazione TEXT NOT NULL,
  tipo_istituzione TEXT,
  cod_tipo TEXT,
  comparto TEXT,
  cod_comparto TEXT,
  contratto TEXT,
  cod_contratto TEXT,
  regione TEXT,
  classe_amministrazione TEXT,
  categoria_cruscotto TEXT,
  profilo_prestazionale TEXT,
  organico_2023 INTEGER,
  stato INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.dw_tipo_istituzione (
  cod_tipo TEXT PRIMARY KEY,
  tipo_istituzione TEXT,
  gruppo TEXT,
  classe TEXT
);

CREATE TABLE IF NOT EXISTS public.dw_comparto_contratto (
  id SERIAL PRIMARY KEY,
  cod_comparto TEXT,
  desc_comparto TEXT,
  cod_contratto TEXT,
  desc_contratto TEXT
);

CREATE TABLE IF NOT EXISTS public.dw_qualifiche (
  id SERIAL PRIMARY KEY,
  cod_contratto TEXT,
  macrocategoria TEXT,
  categoria TEXT,
  descrizione TEXT
);

CREATE TABLE IF NOT EXISTS public.dw_causali (
  id SERIAL PRIMARY KEY,
  tipo TEXT,
  cod_alfa TEXT,
  descrizione TEXT,
  is_ti INTEGER
);

CREATE TABLE IF NOT EXISTS public.dw_fascia_eta (
  codice TEXT PRIMARY KEY,
  eta_min INTEGER,
  eta_max INTEGER,
  classe TEXT
);

CREATE TABLE IF NOT EXISTS public.dw_titolo_studio (
  codice TEXT PRIMARY KEY,
  descrizione TEXT,
  macro_classe TEXT
);

CREATE TABLE IF NOT EXISTS public.dw_occupazione (
  id SERIAL PRIMARY KEY,
  anno INTEGER NOT NULL,
  istituzione INTEGER NOT NULL,
  contratto TEXT,
  macrocat TEXT,
  qualifica TEXT,
  tp_uomini INTEGER,
  tp_donne INTEGER,
  pt_inf50_u INTEGER,
  pt_inf50_d INTEGER,
  pt_sup50_u INTEGER,
  pt_sup50_d INTEGER
);

CREATE TABLE IF NOT EXISTS public.dw_eta (
  id SERIAL PRIMARY KEY,
  anno INTEGER NOT NULL,
  istituzione INTEGER NOT NULL,
  contratto TEXT,
  fascia_eta TEXT,
  uomini INTEGER,
  donne INTEGER
);

CREATE TABLE IF NOT EXISTS public.dw_assunti (
  id SERIAL PRIMARY KEY,
  anno INTEGER NOT NULL,
  istituzione INTEGER NOT NULL,
  contratto TEXT,
  categoria TEXT,
  qualifica TEXT,
  causale TEXT,
  uomini INTEGER,
  donne INTEGER
);

CREATE TABLE IF NOT EXISTS public.dw_cessati (
  id SERIAL PRIMARY KEY,
  anno INTEGER NOT NULL,
  istituzione INTEGER NOT NULL,
  contratto TEXT,
  categoria TEXT,
  qualifica TEXT,
  causale TEXT,
  uomini INTEGER,
  donne INTEGER
);

CREATE TABLE IF NOT EXISTS public.dw_formazione (
  id SERIAL PRIMARY KEY,
  anno INTEGER NOT NULL,
  istituzione INTEGER NOT NULL,
  contratto TEXT,
  categoria TEXT,
  qualifica TEXT,
  causale TEXT,
  form_uomini INTEGER,
  form_donne INTEGER,
  ore_media_u NUMERIC,
  ore_media_d NUMERIC
);

CREATE TABLE IF NOT EXISTS public.dw_passaggi_qualifica (
  id SERIAL PRIMARY KEY,
  anno INTEGER NOT NULL,
  istituzione INTEGER NOT NULL,
  contratto TEXT,
  cat_partenza TEXT,
  qual_partenza TEXT,
  cat_arrivo TEXT,
  qual_arrivo TEXT,
  tipo_passaggio TEXT,
  numero_passaggi INTEGER
);

CREATE TABLE IF NOT EXISTS public.dw_titoli_studio (
  id SERIAL PRIMARY KEY,
  anno INTEGER NOT NULL,
  istituzione INTEGER NOT NULL,
  contratto TEXT,
  categoria TEXT,
  qualifica TEXT,
  titolo_studio TEXT,
  uomini INTEGER,
  donne INTEGER
);

CREATE TABLE IF NOT EXISTS public.dw_modalita_lavoro (
  id SERIAL PRIMARY KEY,
  anno INTEGER NOT NULL,
  istituzione INTEGER NOT NULL,
  contratto TEXT,
  macrocat TEXT,
  categoria TEXT,
  telelavoro_u INTEGER,
  telelavoro_d INTEGER,
  lavoro_agile_u INTEGER,
  lavoro_agile_d INTEGER,
  turnazione_u INTEGER,
  turnazione_d INTEGER,
  reperibilita_u INTEGER,
  reperibilita_d INTEGER
);

CREATE TABLE IF NOT EXISTS public.dw_famiglia_professionale (
  codice TEXT PRIMARY KEY,
  titolo TEXT,
  comparto TEXT
);

CREATE TABLE IF NOT EXISTS public.dw_competenza (
  codice TEXT PRIMARY KEY,
  tipo TEXT,
  titolo TEXT,
  area TEXT
);

CREATE TABLE IF NOT EXISTS public.dw_profilo_di_ruolo (
  codice TEXT PRIMARY KEY,
  nome TEXT,
  famiglia_professionale TEXT,
  macrocategoria TEXT
);

CREATE TABLE IF NOT EXISTS public.dw_bridge_profilo_competenza (
  id SERIAL PRIMARY KEY,
  cod_profilo_di_ruolo TEXT,
  cod_competenza TEXT,
  livello_target INTEGER,
  cfiscale_ente TEXT,
  id_ente INTEGER,
  dipendenti_valutati INTEGER,
  dipendenti_totali_profilo INTEGER,
  livello_valutato_medio NUMERIC
);

CREATE TABLE IF NOT EXISTS public.dw_inpa_bandi (
  id INTEGER PRIMARY KEY,
  codice TEXT,
  data_pubblicazione DATE,
  data_scadenza DATE,
  tipo_procedura TEXT,
  num_posti INTEGER,
  cfiscale_pa TEXT,
  id_ente INTEGER,
  regione TEXT,
  figura_ricercata TEXT,
  num_candidature_submitted INTEGER,
  anno INTEGER
);

CREATE TABLE IF NOT EXISTS public.dw_lp_graduatorie (
  id INTEGER PRIMARY KEY,
  cfiscale_amm TEXT,
  denominazione TEXT,
  tipologia TEXT,
  stato_graduatoria TEXT,
  data_pubblicazione_bando_gu DATE,
  contratto TEXT,
  categoria TEXT,
  qualifica TEXT,
  profilo TEXT,
  famiglia_professionale TEXT,
  data_approvazione_graduatoria DATE,
  num_posti_banditi INTEGER,
  num_vincitori_assunti INTEGER,
  num_vincitori_da_assumere INTEGER,
  num_idonei INTEGER,
  num_idonei_assunti INTEGER,
  num_idonei_disponibili INTEGER,
  tcp_giorni INTEGER,
  anno INTEGER,
  id_ente INTEGER
);

CREATE TABLE IF NOT EXISTS public.dw_syllabus_pa (
  id_pa_syllabus INTEGER PRIMARY KEY,
  cfiscale TEXT,
  denominazione TEXT,
  comparto TEXT,
  tipologia TEXT,
  anno_partecipazione INTEGER,
  regione TEXT
);

CREATE TABLE IF NOT EXISTS public.dw_syllabus_catalogo (
  id SERIAL PRIMARY KEY,
  id_programma INTEGER,
  programma TEXT,
  famiglia_livelli TEXT,
  livello TEXT,
  categoria_syllabus TEXT,
  competenza TEXT,
  id_corso INTEGER,
  denominazione_corso TEXT,
  durata_ore NUMERIC,
  tipologia TEXT
);

CREATE TABLE IF NOT EXISTS public.dw_syllabus_partecipazioni (
  id SERIAL PRIMARY KEY,
  id_discente INTEGER,
  id_corso INTEGER,
  id_pa INTEGER,
  anno INTEGER,
  eta INTEGER,
  genere TEXT,
  anzianita_pa INTEGER,
  titolo_studio TEXT,
  qualifica TEXT,
  attivita_svolte TEXT,
  esito_finale TEXT,
  id_competenza TEXT,
  livello_da INTEGER,
  livello_a INTEGER
);

CREATE TABLE IF NOT EXISTS public.dw_kpi_rilevazione (
  id SERIAL PRIMARY KEY,
  id_ente INTEGER,
  cfiscale TEXT,
  denominazione TEXT,
  semestre TEXT,
  segmento TEXT,
  q1_1_adozione_modello NUMERIC,
  q1_5_n_profili_definiti NUMERIC,
  q1_6_n_profili_competenze NUMERIC,
  q2_1_assunti_under35 NUMERIC,
  q2_2_assunti_ti NUMERIC,
  q2_3_assunzioni_prog NUMERIC,
  q2_5_assessment NUMERIC,
  q6_3_dirigente NUMERIC,
  q6_3_non_dirigente NUMERIC,
  q6_4_ti_dir_donne NUMERIC,
  q6_4_ti_dir_uomini NUMERIC,
  q6_4_ti_nondir_uomini NUMERIC,
  q6_4_ti_nondir_donne NUMERIC,
  q6_7_eq_ep NUMERIC,
  q6_8_eq_ep_under45 NUMERIC,
  q6_5_td_dir_donne NUMERIC,
  q6_5_td_dir_uomini NUMERIC,
  q6_6_under35 NUMERIC,
  q6_tep_personale NUMERIC,
  q6_14_progressioni_oriz NUMERIC,
  q6_14_progressioni_vert NUMERIC,
  q6_16_uomini_agile NUMERIC,
  q6_16_donne_agile NUMERIC,
  q6_17_gg_agile_donne NUMERIC,
  q6_18_gg_totali NUMERIC,
  status TEXT
);

CREATE TABLE IF NOT EXISTS public.dw_ptfp_anagrafica (
  id SERIAL PRIMARY KEY,
  cfiscale_amm TEXT,
  denominazione TEXT,
  triennio TEXT,
  stato TEXT,
  data_trasmissione DATE
);

CREATE TABLE IF NOT EXISTS public.dw_ptfp_dotazione (
  id SERIAL PRIMARY KEY,
  cfiscale_amm TEXT,
  triennio TEXT,
  categoria_giuridica TEXT,
  n_teste_dotazione INTEGER,
  valore_economico NUMERIC,
  spesa_massima NUMERIC
);

CREATE TABLE IF NOT EXISTS public.dw_ptfp_reclutamento (
  id SERIAL PRIMARY KEY,
  cfiscale_amm TEXT,
  triennio TEXT,
  anno_piano INTEGER,
  area_giuridica TEXT,
  profilo_di_ruolo TEXT,
  procedura_selettiva TEXT,
  tipologia TEXT,
  ula_da_assumere INTEGER,
  valore_economico NUMERIC,
  totale_impegnato NUMERIC
);

CREATE TABLE IF NOT EXISTS public.dw_sipro_ente (
  id SERIAL PRIMARY KEY,
  codice_ipa TEXT,
  cfiscale TEXT,
  denominazione TEXT,
  comparto TEXT,
  tipologia TEXT
);

CREATE TABLE IF NOT EXISTS public.dw_sipro_uo (
  id SERIAL PRIMARY KEY,
  id_uo INTEGER,
  codice_ipa_ente TEXT,
  anno INTEGER,
  denominazione_uo TEXT,
  livello_gerarchico INTEGER,
  id_uo_padre INTEGER,
  livello_responsabilita TEXT,
  fte_dotazione NUMERIC,
  fte_in_servizio NUMERIC
);

CREATE TABLE IF NOT EXISTS public.dw_anagrafica_lp (
  id_lp INTEGER PRIMARY KEY,
  cfiscale TEXT,
  codice_ipa TEXT,
  denominazione TEXT,
  tipo_istituzione TEXT,
  cod_tipo TEXT,
  comparto TEXT,
  cod_comparto TEXT,
  cod_contratto TEXT,
  regione TEXT,
  pr_sigla TEXT,
  provincia TEXT,
  classe_tipo_amm TEXT,
  stato INTEGER
);

CREATE TABLE IF NOT EXISTS public.dw_verifica_indicatori (
  id_ente INTEGER PRIMARY KEY,
  denominazione TEXT,
  tipologia TEXT,
  profilo TEXT,
  organico_2023 INTEGER,
  iac NUMERIC, icpr NUMERIC, irs NUMERIC, idp_norm NUMERIC,
  pti NUMERIC, irg_norm NUMERIC, igf NUMERIC, iap NUMERIC,
  tsc NUMERIC, tcp_gg NUMERIC, tcpb NUMERIC, tcf NUMERIC,
  ifm_norm NUMERIC, dpi_norm NUMERIC, cqt NUMERIC, cgc NUMERIC,
  ief_norm NUMERIC, icq NUMERIC, icec NUMERIC, iesf NUMERIC,
  ics_norm NUMERIC, idc NUMERIC, isg NUMERIC, tep NUMERIC,
  ipd NUMERIC, idla NUMERIC,
  cluster_isg TEXT, cluster_tep TEXT, cluster_iap TEXT
);

-- RLS: read access for authenticated users
ALTER TABLE public.dw_ente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_ente" ON public.dw_ente FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_tipo_istituzione ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_tipo_istituzione" ON public.dw_tipo_istituzione FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_comparto_contratto ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_comparto_contratto" ON public.dw_comparto_contratto FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_qualifiche ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_qualifiche" ON public.dw_qualifiche FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_causali ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_causali" ON public.dw_causali FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_fascia_eta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_fascia_eta" ON public.dw_fascia_eta FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_titolo_studio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_titolo_studio" ON public.dw_titolo_studio FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_occupazione ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_occupazione" ON public.dw_occupazione FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_eta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_eta" ON public.dw_eta FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_assunti ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_assunti" ON public.dw_assunti FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_cessati ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_cessati" ON public.dw_cessati FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_formazione ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_formazione" ON public.dw_formazione FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_passaggi_qualifica ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_passaggi_qualifica" ON public.dw_passaggi_qualifica FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_titoli_studio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_titoli_studio" ON public.dw_titoli_studio FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_modalita_lavoro ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_modalita_lavoro" ON public.dw_modalita_lavoro FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_famiglia_professionale ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_famiglia_professionale" ON public.dw_famiglia_professionale FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_competenza ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_competenza" ON public.dw_competenza FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_profilo_di_ruolo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_profilo_di_ruolo" ON public.dw_profilo_di_ruolo FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_bridge_profilo_competenza ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_bridge_profilo_competenza" ON public.dw_bridge_profilo_competenza FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_inpa_bandi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_inpa_bandi" ON public.dw_inpa_bandi FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_lp_graduatorie ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_lp_graduatorie" ON public.dw_lp_graduatorie FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_syllabus_pa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_syllabus_pa" ON public.dw_syllabus_pa FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_syllabus_catalogo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_syllabus_catalogo" ON public.dw_syllabus_catalogo FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_syllabus_partecipazioni ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_syllabus_partecipazioni" ON public.dw_syllabus_partecipazioni FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_kpi_rilevazione ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_kpi_rilevazione" ON public.dw_kpi_rilevazione FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_ptfp_anagrafica ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_ptfp_anagrafica" ON public.dw_ptfp_anagrafica FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_ptfp_dotazione ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_ptfp_dotazione" ON public.dw_ptfp_dotazione FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_ptfp_reclutamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_ptfp_reclutamento" ON public.dw_ptfp_reclutamento FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_sipro_ente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_sipro_ente" ON public.dw_sipro_ente FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_sipro_uo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_sipro_uo" ON public.dw_sipro_uo FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_anagrafica_lp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_anagrafica_lp" ON public.dw_anagrafica_lp FOR SELECT TO authenticated USING (true);
ALTER TABLE public.dw_verifica_indicatori ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_dw_verifica_indicatori" ON public.dw_verifica_indicatori FOR SELECT TO authenticated USING (true);

-- Create indexes for common query patterns
CREATE INDEX idx_dw_occupazione_anno_ist ON public.dw_occupazione(anno, istituzione);
CREATE INDEX idx_dw_eta_anno_ist ON public.dw_eta(anno, istituzione);
CREATE INDEX idx_dw_assunti_anno_ist ON public.dw_assunti(anno, istituzione);
CREATE INDEX idx_dw_cessati_anno_ist ON public.dw_cessati(anno, istituzione);
CREATE INDEX idx_dw_syllabus_part_pa ON public.dw_syllabus_partecipazioni(id_pa, anno);
