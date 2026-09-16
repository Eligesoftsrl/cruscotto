/**
 * Service scheda "Conto Annuale - Progressioni di carriera".
 * Due sole RPC (la scheda più leggera):
 *   - fa_ca_progressioni_kpi        -> 3 card (verticali, orizzontali, totale). Riga singola.
 *   - fa_ca_progressioni_evoluzione -> serie storica (bar + line). NON accetta p_anno.
 * Il parametro p_genere NON è usato da queste RPC (filtro Genere bloccato in UI).
 * Solo letture RPC: nessuna scrittura sul DB remoto.
 */
import { sbUntyped } from "@/integrations/supabase/untyped";

export interface ProgressioniFiltri {
  anno: number;
  istituzione?: string | null;
  codiceFiscale?: string | null;
  comparto?: string | null;
  macrocategoria?: string | null;
  categoria?: string | null;
  regione?: string | null;
}

// 7 parametri (niente p_genere): la cascata standard senza Genere.
function buildParams(f: ProgressioniFiltri): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  if (f.anno != null) p.p_anno = f.anno;
  if (f.istituzione) p.p_istituzione = f.istituzione;
  if (f.codiceFiscale) p.p_codice_fiscale = f.codiceFiscale;
  if (f.comparto) p.p_comparto = f.comparto;
  if (f.macrocategoria) p.p_macrocategoria = f.macrocategoria;
  if (f.categoria) p.p_categoria = f.categoria;
  if (f.regione) p.p_regione = f.regione;
  return p;
}

async function rpcRows<T>(fn: string, params: Record<string, unknown>): Promise<T[]> {
  const { data, error } = await sbUntyped.rpc(fn, params);
  if (error) throw error;
  return (data ?? []) as T[];
}
async function rpcOne<T>(fn: string, params: Record<string, unknown>): Promise<T | null> {
  const rows = await rpcRows<T>(fn, params);
  return rows[0] ?? null;
}

/* ----------------------------- Tipi output ------------------------------- */
export interface ProgressioniKpi {
  verticali: number;
  orizzontali: number;
  totale: number;
}
export interface ProgressioniEvoluzioneRow {
  anno: number;
  verticali: number;
  orizzontali: number;
  totale: number;
}

/* ------------------------------ Chiamate --------------------------------- */
export const fetchProgressioniKpi = (f: ProgressioniFiltri) =>
  rpcOne<ProgressioniKpi>("fa_ca_progressioni_kpi", buildParams(f));

// La RPC NON accetta p_anno: la serie copre sempre tutti gli anni disponibili.
export const fetchProgressioniEvoluzione = (f: ProgressioniFiltri) => {
  const params = buildParams(f);
  delete params.p_anno;
  return rpcRows<ProgressioniEvoluzioneRow>("fa_ca_progressioni_evoluzione", params);
};
