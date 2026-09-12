/**
 * Service scheda "Conto Annuale - Anzianita di servizio".
 * Stessa metodologia della scheda Analisi Eta: il backend reale espone FUNZIONI
 * RPC (fa_ca_anzianita_*) che restituiscono i dati gia calcolati.
 * Regola d'oro: i parametri null/undefined/"" NON vengono inviati (una stringa
 * vuota arriverebbe a PostgREST come '' azzerando il risultato). In particolare
 * p_istituzione/p_codice_fiscale vanno OMESSI se l'accesso non e di un ente.
 *
 * NB sull'ordine posizionale della firma SQL: p_regione precede p_macrocategoria
 * (diverso dalle funzioni dell'eta). Con supabase-js/REST i parametri sono per
 * nome, quindi l'ordine qui non ha effetto.
 */
import { sbUntyped } from "@/integrations/supabase/untyped";

export type Genere = "T" | "U" | "D";

export interface AnzFiltri {
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
function buildParams(f: AnzFiltri, opts: { includeGenere?: boolean } = {}): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  if (f.anno != null) p.p_anno = f.anno;
  if (f.istituzione) p.p_istituzione = f.istituzione;
  if (f.codiceFiscale) p.p_codice_fiscale = f.codiceFiscale;
  if (f.comparto) p.p_comparto = f.comparto;
  if (f.macrocategoria) p.p_macrocategoria = f.macrocategoria;
  if (f.categoria) p.p_categoria = f.categoria;
  if (f.regione) p.p_regione = f.regione;
  // genere: 'T' = tutti => si omette (ramo ELSE lato funzione).
  if (opts.includeGenere !== false && f.genere && f.genere !== "T") p.p_genere = f.genere;
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
/** fa_ca_anzianita_kpi: risposta a riga singola, alimenta le 4 card. */
export interface AnzianitaKpi {
  personale: number;
  fascia_prevalente: string;
  fascia_prevalente_pct: number; // gia in scala %, NON moltiplicare
  anzianita_media: number; // gia arrotondata a 1 decimale
}
/** fa_ca_anzianita_fasce_genere: sempre 5 righe (anche a zero), ORDER BY ordine. */
export interface AnzFasciaRow {
  ordine: number;
  fascia: string;
  uomini: number;
  donne: number;
  tutti: number; // uomini + donne
  percentuale: number; // quota sul totale
}
/** fa_ca_anzianita_evoluzione: formato LUNGO, 5 righe per anno (pivot lato client). */
export interface AnzEvoluzioneRow {
  anno: number;
  ordine: number;
  fascia: string;
  personale: number;
  percentuale: number; // somma 100 per anno
}

/* ------------------------------ Chiamate --------------------------------- */
// 4 KPI card: una sola chiamata a riga singola.
export const fetchAnzianitaKpi = (f: AnzFiltri) =>
  rpcOne<AnzianitaKpi>("fa_ca_anzianita_kpi", buildParams(f));

// Grafico a barre + tabella dettaglio: p_genere ESCLUSO (ignorato dalla funzione).
export const fetchAnzianitaFasce = (f: AnzFiltri) =>
  rpcRows<AnzFasciaRow>("fa_ca_anzianita_fasce_genere", buildParams(f, { includeGenere: false }));

// Evoluzione composizione: p_anno e il LIMITE SUPERIORE (m.anno <= p_anno).
export const fetchAnzianitaEvoluzione = (f: AnzFiltri) =>
  rpcRows<AnzEvoluzioneRow>("fa_ca_anzianita_evoluzione", buildParams(f));
