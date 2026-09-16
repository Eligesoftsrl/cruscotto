/**
 * Logger applicativo — scrive accessi/eventi/errori nello store Admin.
 * Chiamabile anche fuori da React (QueryCache.onError, Keycloak).
 * L'utente corrente è impostato da AuthContext via setLogUser().
 */
import { addAccess, addErrore, addEvento } from "./adminStore";

let current: { username: string; ruolo: string } = { username: "sconosciuto", ruolo: "-" };

export function setLogUser(u: { username: string; ruolo: string }) {
  current = u;
}

export function resetLogUser() {
  current = { username: "sconosciuto", ruolo: "-" };
}

const DEDUPE_KEY = "admin_access_logged";

/** Registra un accesso (dedup una volta per sessione browser sull'esito success). */
export function logAccesso(esito: "success" | "fail" = "success") {
  try {
    const marker = `${current.username}:${esito}`;
    if (esito === "success" && sessionStorage.getItem(DEDUPE_KEY) === marker) return;
    sessionStorage.setItem(DEDUPE_KEY, marker);
  } catch {
    /* ignore */
  }
  addAccess({
    username: current.username,
    ruolo: current.ruolo,
    esito,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 140) : undefined,
  });
}

export function clearAccessDedupe() {
  try {
    sessionStorage.removeItem(DEDUPE_KEY);
  } catch {
    /* ignore */
  }
}

export function logEvento(azione: string, sezione: string, dettagli?: Record<string, unknown>) {
  addEvento({ username: current.username, ruolo: current.ruolo, azione, sezione, dettagli });
}

export function logErrore(
  messaggio: string,
  origine: string,
  opts?: { livello?: "error" | "warn" },
) {
  // SEC-004: non salviamo stack trace (nessuna esposizione una volta persistiti i log).
  addErrore({
    username: current.username,
    livello: opts?.livello ?? "error",
    origine,
    messaggio: String(messaggio).slice(0, 500),
  });
}
