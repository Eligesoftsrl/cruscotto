-- ============================================================================
-- feature_flags · seed SCHEDE SIPrO + INDICI della Vista Sintetica (D2·D4·D5·D6)
-- ----------------------------------------------------------------------------
-- Perché serve: il Pannello Admin attiva o disattiva le schede e gli indici
-- aggiornando la tabella public.feature_flags (UPDATE ... WHERE key = ...).
-- Se la chiave non esiste nella tabella, la modifica NON viene salvata:
--   - in modalità proxy l'endpoint risponde 404 e il toggle torna indietro;
--   - in modalità diretta l'UPDATE non tocca nessuna riga.
-- Sullo staging, alla data di questo script, la tabella contiene solo le 17
-- chiavi di base (Navigazione, Sistema, 12 schede Conto Annuale).
--
-- Contenuto: 22 schede SIPrO + 36 indici Vista Sintetica = 58 chiavi.
-- Chiavi indici: exec_<pillar>_<codice RPC>, es. exec_d2_igf, exec_d4_icf_norm.
-- Generato da src/services/admin/featureRegistry.ts (DEFAULT_FEATURE_FLAGS).
--
-- Idempotente: ON CONFLICT DO NOTHING, quindi non sovrascrive lo stato
-- (enabled) già impostato dall'amministratore. Da eseguire nel SQL editor
-- di Supabase con un ruolo che abbia INSERT su public.feature_flags.
-- ============================================================================

insert into public.feature_flags (key, label, description, category, enabled) values
  ('sipro_benchmark', 'Benchmark DFP', 'SIPrO — Benchmark multi-ente', 'Schede SIPrO — Benchmark', true),
  ('sipro_organigramma', 'Organigramma UO', 'SIPrO — Organizzazione', 'Schede SIPrO — Organizzazione', true),
  ('sipro_stato_org', 'Stato Organizzazione', 'SIPrO — Organizzazione', 'Schede SIPrO — Organizzazione', true),
  ('sipro_provvedimenti', 'Provvedimenti Organizzativi', 'SIPrO — Organizzazione', 'Schede SIPrO — Organizzazione', true),
  ('sipro_dotazione_uo', 'Dotazione Risorse UO', 'SIPrO — Organizzazione', 'Schede SIPrO — Organizzazione', true),
  ('sipro_criticita_uo', 'Criticità UO', 'SIPrO — Organizzazione', 'Schede SIPrO — Organizzazione', true),
  ('sipro_mappatura_processi', 'Mappatura Processi', 'SIPrO — Processi', 'Schede SIPrO — Processi', true),
  ('sipro_fasi_processi', 'Fasi dei Processi', 'SIPrO — Processi', 'Schede SIPrO — Processi', true),
  ('sipro_criticita_processi', 'Criticità Processi', 'SIPrO — Processi', 'Schede SIPrO — Processi', true),
  ('sipro_digitalizzazione', 'Digitalizzazione Fasi', 'SIPrO — Processi', 'Schede SIPrO — Processi', true),
  ('sipro_lavoro_agile', 'Lavoro Agile Processi', 'SIPrO — Processi', 'Schede SIPrO — Processi', true),
  ('sipro_outsourcing', 'Outsourcing Fasi', 'SIPrO — Processi', 'Schede SIPrO — Processi', true),
  ('sipro_semplificazione', 'Semplificazione Processi', 'SIPrO — Processi', 'Schede SIPrO — Processi', true),
  ('sipro_tempi_picchi', 'Tempi e Picchi', 'SIPrO — Processi', 'Schede SIPrO — Processi', true),
  ('sipro_fte', 'FTE Programmati vs Assegnati', 'SIPrO — Profili e Cataloghi', 'Schede SIPrO — Profili e Cataloghi', true),
  ('sipro_copertura', 'Copertura Profili di Ruolo', 'SIPrO — Profili e Cataloghi', 'Schede SIPrO — Profili e Cataloghi', true),
  ('sipro_catalogo_profili', 'Catalogo Profili di Ruolo', 'SIPrO — Profili e Cataloghi', 'Schede SIPrO — Profili e Cataloghi', true),
  ('sipro_famiglie', 'Famiglie Professionali', 'SIPrO — Profili e Cataloghi', 'Schede SIPrO — Profili e Cataloghi', true),
  ('sipro_profili_minerva', 'Profili Professionali Minerva', 'SIPrO — Profili e Cataloghi', 'Schede SIPrO — Profili e Cataloghi', true),
  ('sipro_ambiti_ruolo', 'Ambiti e Profili di Ruolo', 'SIPrO — Profili e Cataloghi', 'Schede SIPrO — Profili e Cataloghi', true),
  ('sipro_aree_contrattuali', 'Aree Contrattuali', 'SIPrO — Profili e Cataloghi', 'Schede SIPrO — Profili e Cataloghi', true),
  ('sipro_evoluzione_profili', 'Evoluzione Profili', 'SIPrO — Profili e Cataloghi', 'Schede SIPrO — Profili e Cataloghi', true),
  ('exec_d2_igf', 'D2 · IGF — Governo strategico del fabbisogno', 'Indice di sintesi · Programmazione fabbisogno', 'Schede Indici — D2 Programmazione fabbisogno', true),
  ('exec_d2_irs', 'D2 · IRS — Replica strutturale', 'Indice intermedio · Programmazione fabbisogno', 'Schede Indici — D2 Programmazione fabbisogno', true),
  ('exec_d2_idp_norm', 'D2 · IDP_Norm — Direzione della progressività', 'Indice intermedio · Programmazione fabbisogno', 'Schede Indici — D2 Programmazione fabbisogno', true),
  ('exec_d2_pti', 'D2 · PTI — Peso del tempo indeterminato', 'Indice intermedio · Programmazione fabbisogno', 'Schede Indici — D2 Programmazione fabbisogno', true),
  ('exec_d2_irg_norm', 'D2 · IRG_Norm — Ricambio generazionale', 'Indice intermedio · Programmazione fabbisogno', 'Schede Indici — D2 Programmazione fabbisogno', true),
  ('exec_d4_cgc', 'D4 · CGC — Gestione delle competenze', 'Indice di sintesi · Sviluppo professionale', 'Schede Indici — D4 Sviluppo professionale', true),
  ('exec_d4_iscp', 'D4 · ISCP — Sviluppo capitale professionale', 'Indice di sintesi · dati mock-up · Sviluppo professionale', 'Schede Indici — D4 Sviluppo professionale', true),
  ('exec_d4_iesf', 'D4 · IESF — Efficacia sviluppo formativo', 'Indice di sintesi · dati mock-up · Sviluppo professionale', 'Schede Indici — D4 Sviluppo professionale', true),
  ('exec_d4_icf_norm', 'D4 · ICF_Norm — Intensità formativa', 'Indice intermedio · Sviluppo professionale', 'Schede Indici — D4 Sviluppo professionale', true),
  ('exec_d4_dpi_norm', 'D4 · DPI_Norm — Dinamicità del personale interna', 'Indice intermedio · Sviluppo professionale', 'Schede Indici — D4 Sviluppo professionale', true),
  ('exec_d4_cqt', 'D4 · CQT — Coerenza qualifiche e titoli', 'Indice intermedio · Sviluppo professionale', 'Schede Indici — D4 Sviluppo professionale', true),
  ('exec_d4_istp_norm', 'D4 · ISTP_Norm — Sviluppo tecnico-professionale', 'Indice intermedio · dati mock-up · Sviluppo professionale', 'Schede Indici — D4 Sviluppo professionale', true),
  ('exec_d4_idfp', 'D4 · IDFP — Diversificazione famiglie professionali', 'Indice intermedio · dati mock-up · Sviluppo professionale', 'Schede Indici — D4 Sviluppo professionale', true),
  ('exec_d4_icrp', 'D4 · ICRP — Copertura ruoli professionali', 'Indice intermedio · dati mock-up · Sviluppo professionale', 'Schede Indici — D4 Sviluppo professionale', true),
  ('exec_d4_ief_norm', 'D4 · IEF_Norm — Efficacia formativa', 'Indice intermedio · dati mock-up · Sviluppo professionale', 'Schede Indici — D4 Sviluppo professionale', true),
  ('exec_d4_icq', 'D4 · ICQ — Completamento qualificato', 'Indice intermedio · dati mock-up · Sviluppo professionale', 'Schede Indici — D4 Sviluppo professionale', true),
  ('exec_d4_icec', 'D4 · ICEC — Coerenza evolutiva competenze', 'Indice intermedio · dati mock-up · Sviluppo professionale', 'Schede Indici — D4 Sviluppo professionale', true),
  ('exec_d5_idc', 'D5 · IDC — Dinamicità della carriera interna', 'Indice di sintesi · Rewarding e carriera', 'Schede Indici — D5 Rewarding e carriera', true),
  ('exec_d5_dpi_norm', 'D5 · DPI_Norm — Dinamicità del personale interna', 'Indice intermedio · Rewarding e carriera', 'Schede Indici — D5 Rewarding e carriera', true),
  ('exec_d5_ics_norm', 'D5 · ICS_Norm — Crescita strutturale', 'Indice intermedio · Rewarding e carriera', 'Schede Indici — D5 Rewarding e carriera', true),
  ('exec_d6_tvo', 'D6 · TVO — Variazione dell''organico', 'Indice intermedio · Capacity building e performance', 'Schede Indici — D6 Capacity building e performance', true),
  ('exec_d6_isg', 'D6 · ISG — Squilibrio generazionale', 'Indice intermedio · Capacity building e performance', 'Schede Indici — D6 Capacity building e performance', true),
  ('exec_d6_tep', 'D6 · TEP — Esposizione al pensionamento', 'Indice intermedio · Capacity building e performance', 'Schede Indici — D6 Capacity building e performance', true),
  ('exec_d6_iqp', 'D6 · IQP — Qualificazione del personale', 'Indice intermedio · Capacity building e performance', 'Schede Indici — D6 Capacity building e performance', true),
  ('exec_d6_ieq', 'D6 · IEQ — Evoluzione della qualificazione', 'Indice intermedio · Capacity building e performance', 'Schede Indici — D6 Capacity building e performance', true),
  ('exec_d6_ipd', 'D6 · IPD — Parità dirigenziale', 'Indice intermedio · Capacity building e performance', 'Schede Indici — D6 Capacity building e performance', true),
  ('exec_d6_tepd', 'D6 · TEPD — Equilibrio di genere nella dirigenza', 'Indice intermedio · Capacity building e performance', 'Schede Indici — D6 Capacity building e performance', true),
  ('exec_d6_vqf', 'D6 · VQF — Variazione quota femminile', 'Indice intermedio · Capacity building e performance', 'Schede Indici — D6 Capacity building e performance', true),
  ('exec_d6_irg', 'D6 · IRG — Riequilibrio di genere nel ricambio', 'Indice intermedio · Capacity building e performance', 'Schede Indici — D6 Capacity building e performance', true),
  ('exec_d6_rtg', 'D6 · RTG — Tassi di cessazione per genere', 'Indice intermedio · Capacity building e performance', 'Schede Indici — D6 Capacity building e performance', true),
  ('exec_d6_rrg', 'D6 · RRG — Ricambio per genere', 'Indice intermedio · Capacity building e performance', 'Schede Indici — D6 Capacity building e performance', true),
  ('exec_d6_iric', 'D6 · IRIC — Dinamica di genere del ricambio', 'Indice intermedio · Capacity building e performance', 'Schede Indici — D6 Capacity building e performance', true),
  ('exec_d6_ifl', 'D6 · IFL — Flessibilità del lavoro', 'Indice intermedio · Capacity building e performance', 'Schede Indici — D6 Capacity building e performance', true),
  ('exec_d6_tfl', 'D6 · TFL — Incidenza del lavoro flessibile', 'Indice intermedio · Capacity building e performance', 'Schede Indici — D6 Capacity building e performance', true),
  ('exec_d6_idla', 'D6 · IDLA — Diffusione del lavoro agile', 'Indice intermedio · Capacity building e performance', 'Schede Indici — D6 Capacity building e performance', true),
  ('exec_d6_tdla', 'D6 · TDLA — Evoluzione del lavoro agile', 'Indice intermedio · Capacity building e performance', 'Schede Indici — D6 Capacity building e performance', true)
on conflict (key) do nothing;

-- Verifica
select category, count(*) as n, count(*) filter (where enabled) as attive
from public.feature_flags
group by category
order by category;
