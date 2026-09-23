/**
 * Store dell'Admin Panel — sorgente dati unica per feature flag e log.
 *
 * Dati REALI da Supabase (tabelle `feature_flags`, `log_accessi`, `log_eventi`,
 * `log_errori` + viste `v_stat_*`). Mantiene una cache in memoria con pattern
 * store esterno (subscribe/getState) per offrire un'API sincrona ai componenti:
 * le mutazioni sono OTTIMISTICHE e vengono persistite su Supabase.
 * DEFAULT_FEATURE_FLAGS resta come fallback sincrono iniziale (prima che il
 * fetch risolva) e per eventuali chiavi non ancora presenti in tabella.
 */
import { useSyncExternalStore } from "react";
import { sbUntyped } from "@/integrations/supabase/untyped";
import { EXCHANGE_ENABLED } from "@/integrations/supabase/exchangeToken";
import { adminProxy } from "./proxyClient";
import type { AccessLog, ErrorLog, EventLog, FeatureFlag } from "./types";
import { DEFAULT_FEATURE_FLAGS } from "./featureRegistry";

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

// -- Mapper: righe DB (snake_case) -> tipi frontend (camelCase) --
type Row = Record<string, unknown>;
const s = (v: unknown): string => (v == null ? "" : String(v));

const mapFlag = (r: Row): FeatureFlag => ({
  key: s(r.key),
  label: s(r.label),
  description: s(r.description),
  category: s(r.category) || "Altro",
  enabled: r.enabled !== false,
  updatedAt: s(r.updated_at),
});
const mapAccess = (r: Row): AccessLog => ({
  id: s(r.id),
  ts: s(r.ts),
  username: s(r.username),
  ruolo: s(r.ruolo) || "-",
  esito: r.esito === "fail" ? "fail" : "success",
  userAgent: r.user_agent ? s(r.user_agent) : undefined,
});
const mapEvento = (r: Row): EventLog => ({
  id: s(r.id),
  ts: s(r.ts),
  username: s(r.username),
  ruolo: s(r.ruolo) || "-",
  azione: s(r.azione),
  sezione: s(r.sezione),
  dettagli: (r.dettagli as Record<string, unknown> | null) ?? undefined,
});
const mapErrore = (r: Row): ErrorLog => ({
  id: s(r.id),
  ts: s(r.ts),
  username: r.username ? s(r.username) : undefined,
  livello: r.livello === "warn" ? "warn" : "error",
  origine: s(r.origine),
  messaggio: s(r.messaggio),
});

// Stato iniziale: feature flag dal catalogo (fallback sincrono), log vuoti.
let state: AdminState = {
  flags: DEFAULT_FEATURE_FLAGS.map((f) => ({ ...f })),
  access: [],
  eventi: [],
  errori: [],
};
const listeners = new Set<() => void>();

function setState(next: AdminState) {
  state = next;
  listeners.forEach((l) => l());
}

// -- Caricamento iniziale da Supabase (idempotente) --
let loadPromise: Promise<void> | undefined;
async function loadAll(): Promise<void> {
  try {
    // --- Modalità proxy sicuro (VITE_EXCHANGE_URL attiva) ---
    if (EXCHANGE_ENABLED) {
      const flagsRows = await adminProxy.listFlags().catch(() => [] as Row[]);
      const [acc, ev, er] = await Promise.all([
        adminProxy.listAccessi().catch(() => [] as Row[]),
        adminProxy.listEventi().catch(() => [] as Row[]),
        adminProxy.listErrori().catch(() => [] as Row[]),
      ]);
      const dbFlags = flagsRows.map(mapFlag);
      const known = new Set(dbFlags.map((f) => f.key));
      const merged = dbFlags.length
        ? [...dbFlags, ...DEFAULT_FEATURE_FLAGS.filter((d) => !known.has(d.key)).map((d) => ({ ...d }))]
        : state.flags;
      setState({
        flags: merged,
        access: acc.map(mapAccess),
        eventi: ev.map(mapEvento),
        errori: er.map(mapErrore),
      });
      return;
    }

    // --- Modalità diretta Supabase (anon) ---
    const [ff, la, le, lr] = await Promise.all([
      sbUntyped.from("feature_flags").select("*"),
      sbUntyped.from("log_accessi").select("*").order("ts", { ascending: false }).limit(MAX_LOGS),
      sbUntyped.from("log_eventi").select("*").order("ts", { ascending: false }).limit(MAX_LOGS),
      sbUntyped.from("log_errori").select("*").order("ts", { ascending: false }).limit(MAX_LOGS),
    ]);
    const dbFlags = ((ff.data as Row[] | null) ?? []).map(mapFlag);
    // Integra eventuali chiavi del catalogo non ancora presenti in tabella.
    const known = new Set(dbFlags.map((f) => f.key));
    const merged = [
      ...dbFlags,
      ...DEFAULT_FEATURE_FLAGS.filter((d) => !known.has(d.key)).map((d) => ({ ...d })),
    ];
    setState({
      flags: dbFlags.length ? merged : state.flags,
      access: ((la.data as Row[] | null) ?? []).map(mapAccess),
      eventi: ((le.data as Row[] | null) ?? []).map(mapEvento),
      errori: ((lr.data as Row[] | null) ?? []).map(mapErrore),
    });
  } catch (err) {
    console.error("[adminStore] caricamento dati Admin fallito", err);
  }
}

/** Avvia (una sola volta) il caricamento dei dati Admin da Supabase. */
export function ensureAdminLoaded(): Promise<void> {
  loadPromise ??= loadAll();
  return loadPromise;
}

// Le feature flag servono a tutta l'app: avvio il caricamento all'import.
void ensureAdminLoaded();

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
// Mutazioni (ottimistiche + persistenza su Supabase)
// ---------------------------------------------------------------------------
function persistFlags(keys: string[], enabled: boolean, ts: string) {
  const prev = state.flags;
  if (EXCHANGE_ENABLED) {
    Promise.all(keys.map((k) => adminProxy.setFlag(k, enabled))).catch((err) => {
      console.error("[adminStore] proxy setFlag fallito", err);
      setState({ ...getState(), flags: prev });
    });
    return;
  }
  sbUntyped
    .from("feature_flags")
    .update({ enabled, updated_at: ts })
    .in("key", keys)
    .then((res: { error: unknown }) => {
      if (res.error) {
        console.error("[adminStore] update feature_flags fallito", res.error);
        setState({ ...getState(), flags: prev }); // rollback
      }
    });
}

export function toggleFlag(key: string, enabled: boolean) {
  const ts = new Date().toISOString();
  setState({
    ...state,
    flags: state.flags.map((f) => (f.key === key ? { ...f, enabled, updatedAt: ts } : f)),
  });
  persistFlags([key], enabled, ts);
}

/** Attiva/disattiva in blocco un insieme di feature flag (una sola notifica). */
export function setManyFlags(keys: string[], enabled: boolean) {
  const set = new Set(keys);
  const ts = new Date().toISOString();
  setState({
    ...state,
    flags: state.flags.map((f) => (set.has(f.key) ? { ...f, enabled, updatedAt: ts } : f)),
  });
  persistFlags(keys, enabled, ts);
}

export function addAccess(e: Omit<AccessLog, "id" | "ts"> & { ts?: string }) {
  const { ts, ...rest } = e;
  const row: AccessLog = { id: uid(), ts: ts ?? new Date().toISOString(), ...rest };
  setState({ ...state, access: [row, ...state.access].slice(0, MAX_LOGS) });
  if (EXCHANGE_ENABLED) {
    adminProxy.logAccesso(rest.esito).catch(() => {});
    return;
  }
  sbUntyped
    .from("log_accessi")
    .insert({
      username: rest.username,
      ruolo: rest.ruolo,
      esito: rest.esito,
      user_agent: rest.userAgent ?? null,
    })
    .then((res: { error: unknown }) => {
      if (res.error) console.error("[adminStore] insert log_accessi fallito", res.error);
    });
}

export function addEvento(e: Omit<EventLog, "id" | "ts"> & { ts?: string }) {
  const { ts, ...rest } = e;
  const row: EventLog = { id: uid(), ts: ts ?? new Date().toISOString(), ...rest };
  setState({ ...state, eventi: [row, ...state.eventi].slice(0, MAX_LOGS) });
  if (EXCHANGE_ENABLED) {
    adminProxy.logEvento(rest.azione, rest.sezione, rest.dettagli).catch(() => {});
    return;
  }
  sbUntyped
    .from("log_eventi")
    .insert({
      username: rest.username,
      ruolo: rest.ruolo,
      azione: rest.azione,
      sezione: rest.sezione,
      dettagli: rest.dettagli ?? null,
    })
    .then((res: { error: unknown }) => {
      if (res.error) console.error("[adminStore] insert log_eventi fallito", res.error);
    });
}

export function addErrore(e: Omit<ErrorLog, "id" | "ts"> & { ts?: string }) {
  const { ts, ...rest } = e;
  const row: ErrorLog = { id: uid(), ts: ts ?? new Date().toISOString(), ...rest };
  setState({ ...state, errori: [row, ...state.errori].slice(0, MAX_LOGS) });
  // SEC-004: non persistiamo lo stack trace.
  if (EXCHANGE_ENABLED) {
    adminProxy.logErrore(rest.messaggio, rest.livello, rest.origine).catch(() => {});
    return;
  }
  sbUntyped
    .from("log_errori")
    .insert({
      username: rest.username ?? null,
      livello: rest.livello,
      origine: rest.origine,
      messaggio: rest.messaggio,
    })
    .then((res: { error: unknown }) => {
      if (res.error) console.error("[adminStore] insert log_errori fallito", res.error);
    });
}

export function clearLog(kind: "access" | "eventi" | "errori") {
  setState({ ...state, [kind]: [] } as AdminState);
  // In modalità proxy non è previsto un endpoint di cancellazione: si svuota
  // solo la vista locale (i log restano nel DB, gestibili lato back-end).
  if (EXCHANGE_ENABLED) return;
  const table = kind === "access" ? "log_accessi" : kind === "eventi" ? "log_eventi" : "log_errori";
  sbUntyped
    .from(table)
    .delete()
    .gte("ts", "1970-01-01T00:00:00Z")
    .then((res: { error: unknown }) => {
      if (res.error) console.error(`[adminStore] svuotamento ${table} fallito`, res.error);
    });
}

/** Utility di lettura per gating funzionalità. */
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
