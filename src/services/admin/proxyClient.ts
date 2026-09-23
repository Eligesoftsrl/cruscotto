/**
 * Client per gli endpoint /admin/* del proxy di sicurezza.
 * Usato dallo store Admin SOLO quando EXCHANGE_ENABLED (VITE_EXCHANGE_URL impostata).
 * Autenticazione: token Keycloak così com'è (il proxy verifica e applica i ruoli).
 */
import { EXCHANGE_URL } from "@/integrations/supabase/exchangeToken";
import { ensureFreshToken } from "@/auth/keycloak";

async function headers(): Promise<Record<string, string>> {
  const t = await ensureFreshToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

type Row = Record<string, unknown>;

async function pget(path: string): Promise<Row[]> {
  const res = await fetch(`${EXCHANGE_URL}${path}`, { headers: await headers() });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  const data = (await res.json()) as { items?: Row[] };
  return data.items ?? [];
}

async function ppost(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${EXCHANGE_URL}${path}`, {
    method: "POST",
    headers: { ...(await headers()), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} -> ${res.status}`);
}

export const adminProxy = {
  listFlags: () => pget("/admin/feature-flags"),
  listAccessi: (limit = 1000) => pget(`/admin/log-accessi?limit=${limit}`),
  listEventi: (limit = 1000) => pget(`/admin/log-eventi?limit=${limit}`),
  listErrori: (limit = 1000) => pget(`/admin/log-errori?limit=${limit}`),
  setFlag: (key: string, enabled: boolean) => ppost("/admin/feature-flags", { key, enabled }),
  logAccesso: (esito: string) => ppost("/admin/log-accessi", { esito }),
  logEvento: (azione: string, sezione?: string, dettagli?: unknown) =>
    ppost("/admin/log-eventi", { azione, sezione, dettagli }),
  logErrore: (messaggio: string, livello: string, origine?: string) =>
    ppost("/admin/log-errori", { messaggio, livello, origine }),
};
