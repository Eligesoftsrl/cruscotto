import { A11Y_FEEDBACK_HREF, A11Y_STATEMENT_URL } from "@/config/accessibility";

/**
 * Link agli adempimenti AGID, sempre nella stessa posizione (WCAG 3.2.3 / 3.2.6):
 * «Dichiarazione di accessibilità» e «Segnala un problema di accessibilità».
 * Non mostra nulla finché l'amministrazione non ha fornito i dati (vedi config/accessibility).
 */
export const AccessibilityLinks = ({
  className = "",
  linkClassName = "underline hover:no-underline",
  separator = " · ",
}: {
  className?: string;
  linkClassName?: string;
  separator?: string;
}) => {
  if (!A11Y_STATEMENT_URL && !A11Y_FEEDBACK_HREF) return null;
  return (
    <span className={className} data-testid="accessibility-links">
      {A11Y_STATEMENT_URL && (
        <a href={A11Y_STATEMENT_URL} target="_blank" rel="noopener noreferrer" className={linkClassName}>
          Dichiarazione di accessibilità
          <span className="sr-only"> (si apre in una nuova finestra)</span>
        </a>
      )}
      {A11Y_STATEMENT_URL && A11Y_FEEDBACK_HREF && <span aria-hidden="true">{separator}</span>}
      {A11Y_FEEDBACK_HREF && (
        <a href={A11Y_FEEDBACK_HREF} className={linkClassName}>
          Segnala un problema di accessibilità
        </a>
      )}
    </span>
  );
};
