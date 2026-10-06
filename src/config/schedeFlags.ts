/**
 * Mappa ID indicatore (sidebar "Conto Annuale") -> chiave feature flag.
 * Copre TUTTE le 12 schede reali del Conto Annuale alimentate da RPC.
 * La gestione on/off avviene dal Pannello Admin → sezione «Schede».
 */
export const CA_INDICATOR_FLAG: Record<string, string> = {
  "analisi-eta": "scheda_eta",
  "analisi-anzianita": "scheda_anzianita",
  cessazioni: "scheda_cessazioni",
  "assunti-causale": "scheda_assunti",
  "tasso-turnover": "scheda_turnover",
  "tasso-sostituzione": "scheda_sostituzione",
  "formati-personale": "scheda_formazione",
  progressioni: "scheda_progressioni",
  "analisi-personale": "scheda_analisi_personale",
  "lavoro-flessibile": "scheda_lavoro_flessibile",
  "lavoro-agile": "scheda_lavoro_agile",
  "analisi-genere": "scheda_analisi_genere",
};

/**
 * Mappa ID indicatore (sidebar "SIPrO") -> chiave feature flag.
 * Gestione on/off dal Pannello Admin → sezione «Schede».
 */
export const SIPRO_INDICATOR_FLAG: Record<string, string> = {
  "sipro-benchmark-dfp": "sipro_benchmark",
  "sipro-organigramma": "sipro_organigramma",
  "sipro-stato-org": "sipro_stato_org",
  "sipro-provvedimenti": "sipro_provvedimenti",
  "sipro-dotazione-uo": "sipro_dotazione_uo",
  "sipro-criticita-uo": "sipro_criticita_uo",
  "sipro-mappatura-processi": "sipro_mappatura_processi",
  "sipro-fasi-processi": "sipro_fasi_processi",
  "sipro-criticita-processi": "sipro_criticita_processi",
  "sipro-digitalizzazione": "sipro_digitalizzazione",
  "sipro-lavoro-agile": "sipro_lavoro_agile",
  "sipro-outsourcing": "sipro_outsourcing",
  "sipro-semplificazione": "sipro_semplificazione",
  "sipro-tempi-picchi": "sipro_tempi_picchi",
  "sipro-fte": "sipro_fte",
  "sipro-copertura": "sipro_copertura",
  "sipro-catalogo-profili": "sipro_catalogo_profili",
  "sipro-famiglie": "sipro_famiglie",
  "sipro-profili-minerva": "sipro_profili_minerva",
  "sipro-ambiti-ruolo": "sipro_ambiti_ruolo",
  "sipro-aree-contrattuali": "sipro_aree_contrattuali",
  "sipro-evoluzione-profili": "sipro_evoluzione_profili",
};
