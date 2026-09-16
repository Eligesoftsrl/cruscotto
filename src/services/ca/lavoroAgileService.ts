/**
 * Service scheda "Conto Annuale - Lavoro agile".
 *   - fa_ca_lavoro_agile_kpi        -> 4 card + donut genere. Riga singola (.single()).
 *   - fa_ca_lavoro_agile_evoluzione -> area (serie 'tutti') + barre variazione. NON accetta p_anno.
 * p_genere NON usato (filtro Genere bloccato in UI). Solo letture RPC.
 */
import { sbUntyped } from "@/integrations/supabase/untyped";

export interface LavoroAgileFiltri {
  anno: number;
  istituzione?: string | null;
  codiceFiscale?: string | null;
  comparto?: string | null;
  macrocategoria?: string | null;
  categoria?: string | null;
  regione?: string | null;
}

function buildParams(f: LavoroAgileFiltri): Record<string, unknown> {
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
export interface LavoroAgileKpi {
  personale_riferimento: number;
  lavoro_agile_uomini: number;
  lavoro_agile_donne: number;
  lavoro_agile_tutti: number;
  lavoro_agile_pct: number | null;
  donne_pct: number | null;
  uomini_pct: number | null;
  picco_anno: number | null;
  picco_tutti: number | null;
  variazione_da_picco_pct: number | null;
  dato_disponibile: boolean;
}
export interface LavoroAgileEvoluzioneRow {
  anno: number;
  uomini: number;
  donne: number;
  tutti: number;
  variazione_assoluta: number | null;
  variazione_pct: number | null;
}

/* ------------------------------ Chiamate --------------------------------- */
export const fetchLavoroAgileKpi = (f: LavoroAgileFiltri) =>
  rpcOne<LavoroAgileKpi>("fa_ca_lavoro_agile_kpi", buildParams(f));

export const fetchLavoroAgileEvoluzione = (f: LavoroAgileFiltri) => {
  const params = buildParams(f);
  delete params.p_anno; // la serie copre sempre tutti gli anni
  return rpcRows<LavoroAgileEvoluzioneRow>("fa_ca_lavoro_agile_evoluzione", params);
};
