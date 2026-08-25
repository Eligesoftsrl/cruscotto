
-- Fase 1: Aggiungere colonne di classificazione
ALTER TABLE public.dw_kpi_rilevazione
  ADD COLUMN IF NOT EXISTS regione TEXT,
  ADD COLUMN IF NOT EXISTS dimensione_amm TEXT,
  ADD COLUMN IF NOT EXISTS tipologia_amm TEXT;

-- D1: colonne mancanti
ALTER TABLE public.dw_kpi_rilevazione
  ADD COLUMN IF NOT EXISTS q1_2_library_processi TEXT,
  ADD COLUMN IF NOT EXISTS q1_3_dizionario_competenze TEXT,
  ADD COLUMN IF NOT EXISTS q1_profili_totali TEXT;

-- D2: colonne mancanti
ALTER TABLE public.dw_kpi_rilevazione
  ADD COLUMN IF NOT EXISTS q2_1_assunzioni_turnover TEXT,
  ADD COLUMN IF NOT EXISTS q2_2_eq_ep_assunti TEXT,
  ADD COLUMN IF NOT EXISTS q2_4_assunzioni_turnover_tot TEXT,
  ADD COLUMN IF NOT EXISTS q2_5_assunzioni_su_prog TEXT,
  ADD COLUMN IF NOT EXISTS q2_assunzioni_totali TEXT;

-- D3: colonne mancanti
ALTER TABLE public.dw_kpi_rilevazione
  ADD COLUMN IF NOT EXISTS q3_1_concorsi_comp_trasv TEXT,
  ADD COLUMN IF NOT EXISTS q3_2_onboarding TEXT,
  ADD COLUMN IF NOT EXISTS q3_3_apprendistato TEXT,
  ADD COLUMN IF NOT EXISTS q3_4_concorsi_profili_cb TEXT,
  ADD COLUMN IF NOT EXISTS q3_5_concorsi_dizionario TEXT,
  ADD COLUMN IF NOT EXISTS q3_concorsi_totali TEXT;

-- D4: colonne mancanti
ALTER TABLE public.dw_kpi_rilevazione
  ADD COLUMN IF NOT EXISTS q4_1_rilevazione_gap TEXT,
  ADD COLUMN IF NOT EXISTS q4_2_formazione_trasv TEXT,
  ADD COLUMN IF NOT EXISTS q4_percorsi_totali TEXT;

-- D5: colonne mancanti
ALTER TABLE public.dw_kpi_rilevazione
  ADD COLUMN IF NOT EXISTS q5_1_integrazione_performance TEXT,
  ADD COLUMN IF NOT EXISTS q5_2_incentivazione_non_mon TEXT,
  ADD COLUMN IF NOT EXISTS q5_3_convenzioni_universita TEXT;

-- D6: colonne mancanti
ALTER TABLE public.dw_kpi_rilevazione
  ADD COLUMN IF NOT EXISTS q6_1_processi_semplificati TEXT,
  ADD COLUMN IF NOT EXISTS q6_processi_totali TEXT,
  ADD COLUMN IF NOT EXISTS q6_4_posti_vacanti_nondir TEXT,
  ADD COLUMN IF NOT EXISTS q6_5_posti_vacanti_dir TEXT,
  ADD COLUMN IF NOT EXISTS q6_pianta_organica_nondir TEXT,
  ADD COLUMN IF NOT EXISTS q6_pianta_organica_dir TEXT,
  ADD COLUMN IF NOT EXISTS q6_entrati TEXT,
  ADD COLUMN IF NOT EXISTS q6_usciti TEXT,
  ADD COLUMN IF NOT EXISTS q6_organico_medio TEXT,
  ADD COLUMN IF NOT EXISTS q6_9_lavoro_flessibile TEXT,
  ADD COLUMN IF NOT EXISTS q6_dip_flessibili TEXT,
  ADD COLUMN IF NOT EXISTS q6_12_donne_agile_pct TEXT,
  ADD COLUMN IF NOT EXISTS q6_totale_donne TEXT,
  ADD COLUMN IF NOT EXISTS q6_13_sw_hr_nuovi TEXT,
  ADD COLUMN IF NOT EXISTS q6_sw_hr_totali TEXT,
  ADD COLUMN IF NOT EXISTS q6_15_eq_ep_under35 TEXT,
  ADD COLUMN IF NOT EXISTS q6_16_mobilita_out TEXT,
  ADD COLUMN IF NOT EXISTS q6_17_mobilita_in TEXT,
  ADD COLUMN IF NOT EXISTS q6_comandati_out TEXT,
  ADD COLUMN IF NOT EXISTS q6_comandati_in TEXT,
  ADD COLUMN IF NOT EXISTS q6_18_donne_dirigenti TEXT,
  ADD COLUMN IF NOT EXISTS q6_totale_dirigenti TEXT,
  ADD COLUMN IF NOT EXISTS q6_19_strumenti_ict TEXT,
  ADD COLUMN IF NOT EXISTS q6_20_entrati_mobilita TEXT;
