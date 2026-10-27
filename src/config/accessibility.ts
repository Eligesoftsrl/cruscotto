/**
 * Adempimenti AGID (Fase 2): Dichiarazione di Accessibilità e meccanismo di feedback.
 *
 * I valori sono forniti dall'amministrazione e si impostano come variabili d'ambiente,
 * senza modificare il codice:
 *  - VITE_A11Y_STATEMENT_URL  link alla Dichiarazione pubblicata su form.agid.gov.it
 *  - VITE_A11Y_FEEDBACK_EMAIL indirizzo per le segnalazioni sull'accessibilità
 * Finché non sono impostati, i relativi link non vengono mostrati.
 */
const clean = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);

const statementUrl = clean(import.meta.env.VITE_A11Y_STATEMENT_URL);
const feedbackEmail = clean(import.meta.env.VITE_A11Y_FEEDBACK_EMAIL);

/** Solo link https (niente javascript: o indirizzi non sicuri). */
export const A11Y_STATEMENT_URL = statementUrl && /^https:\/\//i.test(statementUrl) ? statementUrl : null;

/** Solo indirizzi email semplici (nessun parametro aggiuntivo nel mailto). */
export const A11Y_FEEDBACK_EMAIL =
  feedbackEmail && /^[^\s@?&]+@[^\s@?&]+\.[a-z]{2,}$/i.test(feedbackEmail) ? feedbackEmail : null;

export const A11Y_FEEDBACK_HREF = A11Y_FEEDBACK_EMAIL
  ? `mailto:${A11Y_FEEDBACK_EMAIL}?subject=${encodeURIComponent("Segnalazione accessibilità - Cruscotto HR")}`
  : null;
