/**
 * Service scheda "Conto Annuale - Analisi per genere".
 *   - fa_ca_genere_kpi        -> 4 card. Riga singola.
 *   - fa_ca_genere_qualifiche -> barre distribuzione + tabella (max 20, ORDER BY tutti DESC).
 *   - fa_ca_genere_piramide   -> piramide demografica (uomini_grafico negativo).
 * Il filtro Genere è l'oggetto stesso della scheda -> p_genere NON usato (bloccato in UI).
 * Solo letture RPC.
 */
import { sbUntyped } from "@/integrations/supabase/untyped";

export interface GenereFiltri {
  anno: number;
  istituzione?: string | null;
  codiceFiscale?: string | null;
  comparto?: string | null;
  macrocategoria?: string | null;
  categoria?: string | null;
  regione?: string | null;
}

function buildParams(f: GenereFiltri): Record<string, unknown> {
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
export interface GenereKpi {
  donne_pct: number | null;
  uomini_pct: number | null;
  gender_gap_pp: number | null;
  qualifica_bilanciata: string | null;
  desc_qualifica_bilanciata: string | null;
}
export interface GenereQualificaRow {
  contratto: string; categoria: string; qualifica: string; descrizione: string;
  uomini: number; donne: number; tutti: number; donne_pct: number | null; gap_pp: number | null;
}
export interface GenerePiramideRow {
  ordine: number; fascia_eta: string; uomini: number; uomini_grafico: number; donne: number; tutti: number;
}

/* ------------------------------ Chiamate --------------------------------- */
export const fetchGenereKpi = (f: GenereFiltri) =>
  rpcOne<GenereKpi>("fa_ca_genere_kpi", buildParams(f));
export const fetchGenereQualifiche = (f: GenereFiltri) =>
  rpcRows<GenereQualificaRow>("fa_ca_genere_qualifiche", buildParams(f));
export const fetchGenerePiramide = (f: GenereFiltri) =>
  rpcRows<GenerePiramideRow>("fa_ca_genere_piramide", buildParams(f));
