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
