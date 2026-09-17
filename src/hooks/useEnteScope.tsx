/**
 * useEnteScope — "perimetro ente" dell'utente autenticato.
 *
 * Per gli utenti con ruolo `ente_hr` il token Keycloak contiene il claim
 * `enti_cf` = array dei CODICI FISCALI degli enti a cui l'utente è abilitato.
 * Questo hook:
 *   - determina il codice fiscale da applicare come filtro (`p_codice_fiscale`)
 *     a TUTTE le RPC del Conto Annuale;
 *   - risolve la denominazione dell'ente (per l'intestazione della scheda);
 *   - se l'utente è abilitato a più enti, espone un selettore (`control`).
 *
 * Per il DFP (super admin) non c'è perimetro: `codiceFiscale` è null e la
 * selezione dell'ente avviene tramite la ricerca dedicata già presente nelle
 * schede (parametro `p_istituzione`).
 *
 * La selezione dell'ente attivo è tenuta in uno store di modulo (condiviso e
 * persistente tra le schede) così cambiando scheda resta l'ente scelto.
 */
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchEntiDenominazioni } from "@/services/ca/entiService";

// Sentinella: utente ente_hr SENZA alcun CF nel token -> nessun dato PA-wide
// (evita il leak: la RPC con un CF inesistente restituisce risultati vuoti).
const NO_ENTE = "__no_ente__";

// --- store di modulo per l'ente attivo (CF selezionato) ---
let selectedCf: string | null = null;
const listeners = new Set<() => void>();
function setSelectedCf(cf: string | null) {
  if (cf === selectedCf) return;
  selectedCf = cf;
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function getSnapshot() {
  return selectedCf;
}

export interface EnteScope {
  /** true se l'utente è un utente-ente (perimetro attivo). */
  isEnteUser: boolean;
  /** CF da inviare come `p_codice_fiscale` (null per il DFP). */
  codiceFiscale: string | null;
  /** Denominazione dell'ente attivo (per l'header), o null. */
  label: string | null;
  /** Lista degli enti dell'utente (CF + denominazione). */
  options: { cf: string; label: string }[];
  /** Selettore da renderizzare (solo se l'utente ha più enti). */
  control: React.ReactNode;
  setEnte: (cf: string) => void;
}

export function useEnteScope(): EnteScope {
  const { profile } = useAuth();
  const isEnteUser = profile?.role === "ente_hr";

  const cfList = useMemo(
    () => (isEnteUser ? (profile?.enti_cf ?? []).filter(Boolean) : []),
    [isEnteUser, profile],
  );

  const selected = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Sincronizza una selezione valida di default nello store condiviso.
  useEffect(() => {
    if (cfList.length && (!selected || !cfList.includes(selected))) {
      setSelectedCf(cfList[0]);
    } else if (!cfList.length && selected) {
      setSelectedCf(null);
    }
  }, [cfList, selected]);

  const { data: denom } = useQuery({
    queryKey: ["enti-denominazioni", cfList],
    queryFn: () => fetchEntiDenominazioni(cfList),
    enabled: cfList.length > 0,
    staleTime: Infinity,
  });

  const currentCf = cfList.length
    ? selected && cfList.includes(selected)
      ? selected
      : cfList[0]
    : null;

  // Filtro effettivo: se ente_hr senza CF -> sentinella (nessun dato).
  const codiceFiscale = isEnteUser ? (currentCf ?? NO_ENTE) : null;

  const options = cfList.map((cf) => ({ cf, label: denom?.[cf] ?? cf }));
  const label = currentCf ? (denom?.[currentCf] ?? currentCf) : null;

  const control =
    cfList.length > 1 ? (
      <select
        value={currentCf ?? ""}
        onChange={(e) => setSelectedCf(e.target.value)}
        aria-label="Seleziona ente"
        className="rounded border bg-background px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o.cf} value={o.cf}>
            {o.label}
          </option>
        ))}
      </select>
    ) : null;

  return { isEnteUser, codiceFiscale, label, options, control, setEnte: setSelectedCf };
}
