/**
 * Service scheda "Conto Annuale - Tasso di sostituzione".
 * Due sole RPC: fa_ca_sostituzione_kpi (4 card) e fa_ca_sostituzione_evoluzione
 * (bar chart + area chart + tabella). Firma identica: 8 parametri.
 * Contratto: sostituzione = assunti / cessati x 100 (>100 => ingressi > uscite).
 * p_anno e sempre il LIMITE SUPERIORE (m.anno <= p_anno); nel KPI determina anche
 * l'ampiezza del periodo per media e conteggio. p_genere applicato UNIFORMEMENTE.
 * Solo letture RPC: nessuna scrittura sul DB remoto.
 */
import { sbUntyped } from "@/integrations/supabase/untyped";

export type Genere = "T" | "U" | "D";

export interface SostituzioneFiltri {
  anno: number;
  istituzione?: string | null;
  codiceFiscale?: string | null;
  comparto?: string | null;
  macrocategoria?: string | null;
  categoria?: string | null;
  regione?: string | null;
  genere?: Genere | null;
}

function buildParams(f: SostituzioneFiltri): Record<string, unknown> {
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
export interface SostituzioneKpi {
  sostituzione_pct: number | null; // gia in scala %
  sostituzione_var_prec_pp: number | null; // delta in pp, puo essere NULL
  media_periodo_pct: number | null; // media aritmetica dei tassi annui
  anni_ricambio_positivo: number; // criterio assunti > cessati (stretto)
  anni_periodo: number;
}
export interface SostituzioneEvoluzioneRow {
  anno: number;
  sostituzione_pct: number | null;
  assunti: number;
  cessati: number;
  saldo: number;
}

/* ------------------------------ Chiamate --------------------------------- */
export const fetchSostituzioneKpi = (f: SostituzioneFiltri) =>
  rpcOne<SostituzioneKpi>("fa_ca_sostituzione_kpi", buildParams(f));

export const fetchSostituzioneEvoluzione = (f: SostituzioneFiltri) =>
  rpcRows<SostituzioneEvoluzioneRow>("fa_ca_sostituzione_evoluzione", buildParams(f));
