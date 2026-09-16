/**
 * Service scheda "Conto Annuale - Lavoro flessibile".
 *   - fa_ca_lavoro_flessibile_kpi        -> 4 card + donut. Riga singola.
 *   - fa_ca_lavoro_flessibile_evoluzione -> area (serie 'tutti'). NON accetta p_anno.
 * p_genere NON usato (filtro Genere bloccato in UI). Solo letture RPC.
 */
import { sbUntyped } from "@/integrations/supabase/untyped";

export interface LavoroFlessibileFiltri {
  anno: number;
  istituzione?: string | null;
  codiceFiscale?: string | null;
  comparto?: string | null;
  macrocategoria?: string | null;
  categoria?: string | null;
  regione?: string | null;
}

function buildParams(f: LavoroFlessibileFiltri): Record<string, unknown> {
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
export interface LavoroFlessibileKpi {
  unita_annue_flessibili: number;
  personale_riferimento: number;
  lavoro_flessibile_pct: number | null;
  donne_pct: number | null;
  uomini_pct: number | null;
  primo_anno: number | null;
  crescita_vs_primo_anno_pct: number | null;
}
export interface LavoroFlessibileEvoluzioneRow {
  anno: number;
  uomini: number;
  donne: number;
  tutti: number;
}

/* ------------------------------ Chiamate --------------------------------- */
export const fetchLavoroFlessibileKpi = (f: LavoroFlessibileFiltri) =>
  rpcOne<LavoroFlessibileKpi>("fa_ca_lavoro_flessibile_kpi", buildParams(f));

export const fetchLavoroFlessibileEvoluzione = (f: LavoroFlessibileFiltri) => {
  const params = buildParams(f);
  delete params.p_anno;
  return rpcRows<LavoroFlessibileEvoluzioneRow>("fa_ca_lavoro_flessibile_evoluzione", params);
};
