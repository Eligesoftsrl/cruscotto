/**
 * Service scheda "Conto Annuale - Formazione" (misura in GIORNATE).
 *   - fa_ca_formazione_kpi           -> 4 card. Accetta p_genere. Riga singola.
 *   - fa_ca_formazione_macrocategorie-> bar-list per macrocategoria. Firma ridotta
 *     (NO p_macrocategoria/p_categoria/p_genere).
 *   - fa_ca_formazione_evoluzione    -> trend giornate. NON accetta p_anno.
 * Solo letture RPC.
 */
import { sbUntyped } from "@/integrations/supabase/untyped";

export type Genere = "T" | "U" | "D";

export interface FormazioneFiltri {
  anno: number;
  istituzione?: string | null;
  codiceFiscale?: string | null;
  comparto?: string | null;
  macrocategoria?: string | null;
  categoria?: string | null;
  regione?: string | null;
  genere?: Genere | null;
}

// Set completo (kpi/evoluzione): 7 filtri + genere.
function buildFull(f: FormazioneFiltri): Record<string, unknown> {
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

// Firma ridotta per macrocategorie (raggruppa per macrocategoria).
function buildMacro(f: FormazioneFiltri): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  if (f.anno != null) p.p_anno = f.anno;
  if (f.istituzione) p.p_istituzione = f.istituzione;
  if (f.codiceFiscale) p.p_codice_fiscale = f.codiceFiscale;
  if (f.comparto) p.p_comparto = f.comparto;
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
export interface FormazioneKpi {
  personale: number | null;
  giornate_formazione: number | null;
  giornate_pro_capite: number | null;
  var_prec_pct: number | null;
}
export interface FormazioneMacroRow {
  macrocategoria: string;
  descrizione: string;
  giornate_formazione: number;
}
export interface FormazioneEvoluzioneRow {
  anno: number;
  giornate_formazione: number;
}

/* ------------------------------ Chiamate --------------------------------- */
export const fetchFormazioneKpi = (f: FormazioneFiltri) =>
  rpcOne<FormazioneKpi>("fa_ca_formazione_kpi", buildFull(f));

export const fetchFormazioneMacrocategorie = (f: FormazioneFiltri) =>
  rpcRows<FormazioneMacroRow>("fa_ca_formazione_macrocategorie", buildMacro(f));

export const fetchFormazioneEvoluzione = (f: FormazioneFiltri) => {
  const params = buildFull(f);
  delete params.p_anno;
  return rpcRows<FormazioneEvoluzioneRow>("fa_ca_formazione_evoluzione", params);
};
