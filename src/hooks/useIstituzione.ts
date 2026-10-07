/**
 * useIstituzione — selezione ENTE per l'amministratore (DFP), CONDIVISA.
 *
 * In precedenza ogni scheda del Conto Annuale aveva il proprio autocomplete con
 * stato locale. Per renderlo unico e sempre visibile (barra in alto a destra),
 * la selezione è stata spostata in questo store di modulo: l'autocomplete vive
 * in FilterPills, mentre le schede leggono qui l'ente selezionato (`ente.codice`
 * → parametro `p_istituzione` delle RPC) e il relativo termine di ricerca.
 *
 * Nota: riguarda solo il DFP (super admin). Per gli utenti-ente il perimetro è
 * imposto da Keycloak (useEnteScope) e questo store resta a null.
 */
import { useSyncExternalStore } from "react";

export interface IstituzioneSel {
  codice: string;
  descrizione: string;
}

let ente: IstituzioneSel | null = null;
let enteTerm = "";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function setEnte(v: IstituzioneSel | null) {
  ente = v;
  emit();
}
function setEnteTerm(v: string) {
  enteTerm = v;
  emit();
}

// Snapshot stabile per useSyncExternalStore (stessa reference finché non cambia).
let snap = { ente, enteTerm };
function getSnapshot() {
  if (snap.ente !== ente || snap.enteTerm !== enteTerm) {
    snap = { ente, enteTerm };
  }
  return snap;
}

export function useIstituzione() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { ente: s.ente, enteTerm: s.enteTerm, setEnte, setEnteTerm };
}
