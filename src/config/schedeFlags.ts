/**
 * Mappa ID indicatore (sidebar "Conto Annuale") -> chiave feature flag.
 * LIMITATA ai 6 componenti REALI alimentati da RPC del Conto Annuale.
 * Le altre schede del Conto Annuale sono ancora da costruire e NON vengono
 * gestite dai feature flag (restano sempre visibili).
 */
export const CA_INDICATOR_FLAG: Record<string, string> = {
  "analisi-eta": "scheda_eta",
  "analisi-anzianita": "scheda_anzianita",
  cessazioni: "scheda_cessazioni",
  "assunti-causale": "scheda_assunti",
  "tasso-turnover": "scheda_turnover",
  "tasso-sostituzione": "scheda_sostituzione",
};
