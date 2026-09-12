/**
 * Service scheda "Conto Annuale - Cessazioni dal servizio".
 * Stessa metodologia RPC delle altre schede (fa_ca_*).
 * Regola d'oro: parametri null/undefined/"" NON inviati; p_istituzione/
 * p_codice_fiscale omessi se l'accesso non e di un ente (mai '' a PostgREST).
 *
 * ECCEZIONI di questa scheda (dalle note della mappatura):
 *  - fa_ca_cessazioni_causali va chiamata DUE volte, cambiando solo p_movimento
 *    ('C' = Cessazioni, 'A' = Assunti). p_movimento va SEMPRE aggiunto (fisso per
 *    componente); ammette solo 'A' e 'C' maiuscoli.
 *  - p_genere e IGNORATO da fa_ca_cessazioni_causali => non lo passiamo li.
 *  - saldo puo essere NEGATIVO (assi/formati devono prevederlo).
 */
import { sbUntyped } from "@/integrations/supabase/untyped";

export type Genere = "T" | "U" | "D";
export type Movimento = "A" | "C";

export interface CessazioniFiltri {
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
function buildParams(
  f: CessazioniFiltri,
  opts: { includeGenere?: boolean; movimento?: Movimento } = {},
): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  if (f.anno != null) p.p_anno = f.anno;
  if (f.istituzione) p.p_istituzione = f.istituzione;
  if (f.codiceFiscale) p.p_codice_fiscale = f.codiceFiscale;
  if (f.comparto) p.p_comparto = f.comparto;
  if (f.macrocategoria) p.p_macrocategoria = f.macrocategoria;
  if (f.categoria) p.p_categoria = f.categoria;
  if (f.regione) p.p_regione = f.regione;
  if (opts.includeGenere !== false && f.genere && f.genere !== "T") p.p_genere = f.genere;
  // p_movimento: eccezione, va aggiunto SEMPRE quando previsto dal componente.
  if (opts.movimento) p.p_movimento = opts.movimento;
  return p;
}

/** Rimuove eventuali doppi apici presenti in alcune descrizioni della fonte. */
function clean(s: string | null | undefined): string {
  return String(s ?? "").replace(/^"|"$/g, "");
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
/** fa_ca_cessazioni_kpi: riga singola, alimenta le 4 card. */
export interface CessazioniKpi {
  cessati: number;
  assunti: number; // movimenti con movimento='A'
  saldo: number; // assunti - cessati (puo essere negativo)
  turnover_pct: number; // gia in scala %, NON moltiplicare (cessati / personale in servizio)
}
/** fa_ca_cessazioni_causali: righe per causale (ORDER BY tutti DESC lato server). */
export interface CessazioniCausaleRow {
  causale: string; // chiave tecnica
  descrizione: string; // etichetta
  uomini: number;
  donne: number;
  tutti: number;
  percentuale: number;
}
/** fa_ca_cessazioni_evoluzione: formato largo (una riga per anno). */
export interface CessazioniEvoluzioneRow {
  anno: number;
  assunti: number;
  cessati: number;
  saldo: number;
}

/* ------------------------------ Chiamate --------------------------------- */
// 4 KPI card: una sola chiamata a riga singola.
export const fetchCessazioniKpi = (f: CessazioniFiltri) =>
  rpcOne<CessazioniKpi>("fa_ca_cessazioni_kpi", buildParams(f));

// Barre per causale: p_genere ESCLUSO (ignorato dalla funzione), p_movimento fisso.
export const fetchCessazioniCausali = async (f: CessazioniFiltri, movimento: Movimento) => {
  const rows = await rpcRows<CessazioniCausaleRow>(
    "fa_ca_cessazioni_causali",
    buildParams(f, { includeGenere: false, movimento }),
  );
  return rows.map((r) => ({ ...r, descrizione: clean(r.descrizione) }));
};

// Serie storica assunti vs cessati: p_anno e il LIMITE SUPERIORE (m.anno <= p_anno).
export const fetchCessazioniEvoluzione = (f: CessazioniFiltri) =>
  rpcRows<CessazioniEvoluzioneRow>("fa_ca_cessazioni_evoluzione", buildParams(f));
