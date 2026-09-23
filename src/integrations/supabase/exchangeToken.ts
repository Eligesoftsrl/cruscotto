/**
 * Gestione del token "scambiato" per Supabase.
 *
 * Quando è configurata VITE_EXCHANGE_URL (URL base del proxy di sicurezza),
 * l'app chiama POST {EXCHANGE_URL}/exchange col token Keycloak e riceve un token
 * firmato col JWT secret di Supabase (con claim is_global/enti_cf per le RLS).
 * Il token viene messo in cache e riemesso poco prima della scadenza.
 *
 * Se VITE_EXCHANGE_URL NON è impostata, tutto resta come prima (chiave anon).
 */
import { ensureFreshToken } from "@/auth/keycloak";

export const EXCHANGE_URL = (
  (import.meta.env.VITE_EXCHANGE_URL as string | undefined) ?? ""
).replace(/\/+$/, "");

export const EXCHANGE_ENABLED = EXCHANGE_URL.length > 0;

let cachedToken: string | null = null;
let expEpoch = 0; // secondi epoch di scadenza (con margine)

async function mint(): Promise<string | null> {
  if (!EXCHANGE_ENABLED) return null;
  const kc = await ensureFreshToken();
  if (!kc) return null;
  const res = await fetch(`${EXCHANGE_URL}/exchange`, {
    method: "POST",
    headers: { Authorization: `Bearer ${kc}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  cachedToken = data.access_token ?? null;
  const ttl = Math.max(60, data.expires_in ?? 3600);
  expEpoch = Math.floor(Date.now() / 1000) + ttl - 60; // margine 60s
  return cachedToken;
}

/** Token da usare con supabase-js (o null se lo scambio non è attivo/fallisce). */
export async function getSupabaseAccessToken(): Promise<string | null> {
  if (!EXCHANGE_ENABLED) return null;
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && now < expEpoch) return cachedToken;
  try {
    return await mint();
  } catch {
    return null;
  }
}
