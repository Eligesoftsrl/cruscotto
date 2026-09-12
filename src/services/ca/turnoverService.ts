/**
 * Service scheda "Conto Annuale - Tasso di turnover".
 * Due sole RPC: fa_ca_turnover_kpi (4 card) e fa_ca_turnover_evoluzione
 * (combo chart + saldo cumulato + tabella). Firma identica: 8 parametri.
 * Contratto: turnover = cessati / personale x 100; ingresso = assunti / personale x 100.
 * p_genere applicato UNIFORMEMENTE (nessuna eccezione). Regola vuoti/null invariata.
 * Solo letture RPC: nessuna scrittura sul DB remoto.
 */
import { sbUntyped } from "@/integrations/supabase/untyped";

export type Genere = "T" | "U" | "D";

export interface TurnoverFiltri {
  anno: number;
  istituzione?: string | null;
  codiceFiscale?: string | null;
  comparto?: string | null;
  macrocategoria?: string | null;
  categoria?: string | null;
  regione?: string | null;
  genere?: Genere | null;
}

function buildParams(f: TurnoverFiltri): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  if (f.anno != null) p.p_anno = f.anno;
  if (f.istituzione) p.p_istituzione = f.istituzione;
  if (f.codiceFiscale) p.p_codice_fiscale = f.codiceFiscale;
  if (f.comparto) p.p_comparto = f.comparto;
  if (f.macrocategoria) p.p_macrocategoria = f.macrocategoria;
  if (f.categoria) p.p_categoria = f.categoria;
  if (f.regione) p.p_regione = f.regione;
  if (f.genere && f.genere !== "T") p.p_genere = f.genere;
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
export interface TurnoverKpi {
  turnover_pct: number | null; // gia in scala %
  turnover_var_prec_pp: number | null; // delta in pp, puo essere NULL
  cessati: number;
  assunti: number;
  saldo: number; // assunti - cessati (spesso negativo)
}
export interface TurnoverEvoluzioneRow {
  anno: number;
  assunti: number;
  cessati: number;
  saldo: number;
  turnover_pct: number | null;
  ingresso_pct: number | null;
  saldo_cumulato: number; // parte dal primo anno presente nella MV
}

/* ------------------------------ Chiamate --------------------------------- */
export const fetchTurnoverKpi = (f: TurnoverFiltri) =>
  rpcOne<TurnoverKpi>("fa_ca_turnover_kpi", buildParams(f));

// p_anno = limite superiore della serie. Alimenta combo, saldo cumulato e tabella.
export const fetchTurnoverEvoluzione = (f: TurnoverFiltri) =>
  rpcRows<TurnoverEvoluzioneRow>("fa_ca_turnover_evoluzione", buildParams(f));
