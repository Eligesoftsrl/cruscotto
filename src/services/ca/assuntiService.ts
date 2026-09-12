/**
 * Service scheda "Conto Annuale - Assunti per causale".
 * Stessa metodologia RPC delle altre schede (fa_ca_*). Firma identica per tutte
 * e tre le funzioni: 8 parametri, NESSUN p_movimento (il filtro movimento='A' e
 * scritto dentro le funzioni).
 * Regola d'oro: parametri null/undefined/"" NON inviati; p_istituzione/
 * p_codice_fiscale omessi se l'accesso non e di un ente (mai '' a PostgREST).
 *
 * NOTA su p_genere (applicazione NON uniforme lato server):
 *  - agisce su: assunti, valore, percentuale, personale
 *  - NON agisce su: uomini, donne, tutti
 * Quindi lo passiamo sempre (quando != 'T'): il grafico a barre Uomini/Donne
 * resta invariato, mentre donut/KPI riflettono il filtro di genere.
 */
import { sbUntyped } from "@/integrations/supabase/untyped";

export type Genere = "T" | "U" | "D";

export interface AssuntiFiltri {
  anno: number;
  istituzione?: string | null;
  codiceFiscale?: string | null;
  comparto?: string | null;
  macrocategoria?: string | null;
  categoria?: string | null;
  regione?: string | null;
  genere?: Genere | null;
}

/** Costruisce l'oggetto parametri RPC omettendo i valori vuoti. */
function buildParams(f: AssuntiFiltri): Record<string, unknown> {
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
/** fa_ca_assunti_kpi: riga singola, alimenta le 4 card. */
export interface AssuntiKpi {
  assunti: number;
  causale_prevalente: string; // descrizione (COALESCE lato server): renderizzare cosi com'e
  donne_pct: number; // gia in scala %, NON moltiplicare
  personale: number; // fonte mv_occupazione
}
/** fa_ca_assunti_causali: alimenta barre (uomini/donne) e donut (valore/percentuale). */
export interface AssuntiCausaleRow {
  causale: string;
  descrizione: string;
  uomini: number; // NON influenzato da p_genere
  donne: number; // NON influenzato da p_genere
  tutti: number; // NON influenzato da p_genere
  valore: number; // influenzato da p_genere
  percentuale: number; // influenzato da p_genere
}
/** fa_ca_assunti_evoluzione: formato largo (anno, assunti), nessun pivot. */
export interface AssuntiEvoluzioneRow {
  anno: number;
  assunti: number;
}

/* ------------------------------ Chiamate --------------------------------- */
// 4 KPI card: una sola chiamata a riga singola.
export const fetchAssuntiKpi = (f: AssuntiFiltri) =>
  rpcOne<AssuntiKpi>("fa_ca_assunti_kpi", buildParams(f));

// Barre (Uomini/Donne) + donut (Composizione per causale): stessa risposta.
export const fetchAssuntiCausali = (f: AssuntiFiltri) =>
  rpcRows<AssuntiCausaleRow>("fa_ca_assunti_causali", buildParams(f));

// Trend assunzioni: p_anno e il LIMITE SUPERIORE (m.anno <= p_anno).
export const fetchAssuntiEvoluzione = (f: AssuntiFiltri) =>
  rpcRows<AssuntiEvoluzioneRow>("fa_ca_assunti_evoluzione", buildParams(f));
