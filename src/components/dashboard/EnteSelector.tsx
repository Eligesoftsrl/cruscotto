/**
 * EnteSelector — scelta dell'ente per gli utenti NON admin (ruolo ente_hr).
 *
 * Mostrato a destra nella barra dei filtri di ogni sezione attiva (Conto Annuale,
 * Vista Sintetica, Vista Executive, SIPrO), così l'ente su cui si sta lavorando è
 * sempre visibile:
 *  - utente abilitato a più enti → menu a tendina (selezione condivisa tra le schede);
 *  - utente con un solo ente      → etichetta in sola lettura;
 *  - DFP / admin                  → non mostrato (nessun perimetro).
 */
import { Building2 } from "lucide-react";
import { useEnteScope } from "@/hooks/useEnteScope";

export const EnteSelector = ({ className = "" }: { className?: string }) => {
  const scope = useEnteScope();
  if (!scope.isEnteUser) return null;

  return (
    <div className={`flex items-center gap-1.5 ${className}`} data-testid="ente-selector">
      <Building2 className="h-3.5 w-3.5 text-primary flex-shrink-0" aria-hidden="true" />
      <span className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Ente</span>
      {scope.options.length > 1 ? (
        <select
          value={scope.codiceFiscale ?? ""}
          onChange={(e) => scope.setEnte(e.target.value)}
          aria-label="Seleziona ente"
          data-testid="ente-selector-select"
          className="max-w-[320px] rounded-full border border-primary/40 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary outline-none focus:ring-1 focus:ring-ring cursor-pointer"
        >
          {scope.options.map((o) => (
            <option key={o.cf} value={o.cf}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <span
          className="max-w-[320px] truncate rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary"
          title={scope.label ?? undefined}
          data-testid="ente-selector-label"
        >
          {scope.label ?? "Nessun ente abilitato"}
        </span>
      )}
    </div>
  );
};
