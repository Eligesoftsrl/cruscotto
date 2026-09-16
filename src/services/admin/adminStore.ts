/**
 * Store dell'Admin Panel — sorgente dati unica per feature flag e log.
 *
 * STRATEGIA: per sbloccare subito lo sviluppo l'implementazione usa un fallback
 * locale (localStorage). L'interfaccia pubblica (subscribe/getState + mutazioni)
 * è pensata per essere sostituita da chiamate Supabase (viste/RPC) quando il
 * backend del cliente creerà le tabelle `feature_flags`, `log_accessi`,
 * `log_eventi`, `log_errori` — senza toccare i componenti dell'Admin Panel.
 */
import { useSyncExternalStore } from "react";
import type { AccessLog, ErrorLog, EventLog, FeatureFlag } from "./types";
import { DEFAULT_FEATURE_FLAGS } from "./featureRegistry";

const STORAGE_KEY = "admin_store_v1";
const MAX_LOGS = 1000;

export interface AdminState {
  flags: FeatureFlag[];
  access: AccessLog[];
  eventi: EventLog[];
  errori: ErrorLog[];
}

const uid = (): string =>
  globalThis.crypto?.randomUUID?.() ??
  `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

function nowMinus(days: number, hours = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

/** Dati dimostrativi iniziali (così i pannelli non sono vuoti al primo avvio). */
function seed(): AdminState {
  const flags = DEFAULT_FEATURE_FLAGS.map((f) => ({
    ...f,
    updatedAt: new Date().toISOString(),
  }));
  const access: AccessLog[] = [
    { id: uid(), ts: nowMinus(0, 1), username: "superadmin", ruolo: "dfp", esito: "success", userAgent: "Keycloak SSO" },
    { id: uid(), ts: nowMinus(1, 3), username: "hr.roma", ruolo: "ente_hr", esito: "success", userAgent: "Keycloak SSO" },
    { id: uid(), ts: nowMinus(2), username: "hr.milano", ruolo: "ente_hr", esito: "fail", userAgent: "login non riuscito" },
    { id: uid(), ts: nowMinus(4), username: "superadmin", ruolo: "dfp", esito: "success", userAgent: "Keycloak SSO" },
  ];
  const eventi: EventLog[] = [
    { id: uid(), ts: nowMinus(0, 1), username: "superadmin", ruolo: "dfp", azione: "navigazione", sezione: "Vista Tecnica" },
    { id: uid(), ts: nowMinus(0, 2), username: "hr.roma", ruolo: "ente_hr", azione: "navigazione", sezione: "Analisi Età" },
    { id: uid(), ts: nowMinus(1), username: "hr.roma", ruolo: "ente_hr", azione: "export", sezione: "Cessazioni" },
    { id: uid(), ts: nowMinus(2), username: "superadmin", ruolo: "dfp", azione: "navigazione", sezione: "Turnover" },
  ];
  const errori: ErrorLog[] = [
    { id: uid(), ts: nowMinus(0, 4), livello: "error", origine: "query", messaggio: "RPC fa_ca_eta_evoluzione: timeout", username: "superadmin" },
    { id: uid(), ts: nowMinus(2), livello: "warn", origine: "runtime", messaggio: "Filtro regione senza risultati", username: "hr.milano" },
  ];
  return { flags, access, eventi, errori };
}

function load(): AdminState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return s;
    }
    const parsed = JSON.parse(raw) as Partial<AdminState>;
    // Unione con eventuali nuove feature flag aggiunte al catalogo.
    const existing = parsed.flags ?? [];
    const known = new Set(existing.map((f) => f.key));
    const merged = [...existing];
    for (const df of DEFAULT_FEATURE_FLAGS) {
      if (!known.has(df.key)) merged.push({ ...df, updatedAt: new Date().toISOString() });
    }
    return {
      flags: merged,
      access: parsed.access ?? [],
      eventi: parsed.eventi ?? [],
      errori: parsed.errori ?? [],
    };
  } catch {
    return seed();
  }
}

let state: AdminState = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota superata: ignora */
  }
}

function setState(next: AdminState) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getState(): AdminState {
  return state;
}

/** Hook React: si ri-renderizza automaticamente a ogni mutazione dello store. */
export function useAdminState(): AdminState {
  return useSyncExternalStore(subscribe, getState, getState);
}

// ---------------------------------------------------------------------------
// Mutazioni
// ---------------------------------------------------------------------------
export function toggleFlag(key: string, enabled: boolean) {
  setState({
    ...state,
    flags: state.flags.map((f) =>
      f.key === key ? { ...f, enabled, updatedAt: new Date().toISOString() } : f,
    ),
  });
}

export function addAccess(e: Omit<AccessLog, "id" | "ts"> & { ts?: string }) {
  const { ts, ...rest } = e;
  const row: AccessLog = { id: uid(), ts: ts ?? new Date().toISOString(), ...rest };
  setState({ ...state, access: [row, ...state.access].slice(0, MAX_LOGS) });
}

export function addEvento(e: Omit<EventLog, "id" | "ts"> & { ts?: string }) {
  const { ts, ...rest } = e;
  const row: EventLog = { id: uid(), ts: ts ?? new Date().toISOString(), ...rest };
  setState({ ...state, eventi: [row, ...state.eventi].slice(0, MAX_LOGS) });
}

export function addErrore(e: Omit<ErrorLog, "id" | "ts"> & { ts?: string }) {
  const { ts, ...rest } = e;
  const row: ErrorLog = { id: uid(), ts: ts ?? new Date().toISOString(), ...rest };
  setState({ ...state, errori: [row, ...state.errori].slice(0, MAX_LOGS) });
}

export function clearLog(kind: "access" | "eventi" | "errori") {
  setState({ ...state, [kind]: [] } as AdminState);
}

/** Utility di lettura per gating funzionalità (uso futuro nei componenti). */
export function isFeatureEnabled(key: string): boolean {
  return state.flags.find((f) => f.key === key)?.enabled ?? true;
}

// ---------------------------------------------------------------------------
// Export CSV
// ---------------------------------------------------------------------------
export function exportCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  // SEC-003: neutralizza la CSV/formula injection (Excel/Sheets):
  // i valori che iniziano con = + - @ (o tab/CR) vengono prefissati con un apice.
  const esc = (v: unknown) => {
    let s = String(v ?? "");
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
  ].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
