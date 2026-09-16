/**
 * Tipi del Pannello di Amministrazione.
 * Contratto identico a quello che avranno le future tabelle Supabase
 * (`feature_flags`, `log_accessi`, `log_eventi`, `log_errori`), così il
 * passaggio dal fallback locale ai dati reali sarà a costo (quasi) zero.
 */

export interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  category: string;
  enabled: boolean;
  updatedAt: string;
}

export interface AccessLog {
  id: string;
  ts: string; // ISO datetime
  username: string;
  ruolo: string;
  esito: "success" | "fail";
  userAgent?: string;
}

export interface EventLog {
  id: string;
  ts: string;
  username: string;
  ruolo: string;
  azione: string; // es. "navigazione", "export"
  sezione: string; // etichetta funzione/scheda
  dettagli?: Record<string, unknown>;
}

export interface ErrorLog {
  id: string;
  ts: string;
  username?: string;
  livello: "error" | "warn";
  origine: string; // "query" | "boundary" | "runtime"
  messaggio: string;
}

export interface UsageStat {
  label: string;
  category: string;
  enabled: boolean;
  count: number;
  last: string | null;
}
