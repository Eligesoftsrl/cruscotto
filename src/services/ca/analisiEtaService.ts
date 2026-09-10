/**
 * Service scheda "Conto Annuale - Analisi per eta".
 * Il backend reale espone FUNZIONI RPC (fa_ca_*) che restituiscono i dati gia
 * calcolati (variazioni, cluster, PA, gap). Qui si limitano a invocarle.
 * Regola d'oro: i parametri null/undefined/"" NON vengono inviati (una stringa
 * vuota arriverebbe a PostgREST come '' azzerando il risultato).
 */
import { sbUntyped } from "@/integrations/supabase/untyped";

export type Genere = "T" | "U" | "D";
export type BenchDimensione = "comparto" | "regione";

export interface EtaFiltri {
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
function buildParams(f: EtaFiltri, opts: { includeGenere?: boolean } = {}): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  if (f.anno != null) p.p_anno = f.anno;
  if (f.istituzione) p.p_istituzione = f.istituzione;
  if (f.codiceFiscale) p.p_codice_fiscale = f.codiceFiscale;
  if (f.comparto) p.p_comparto = f.comparto;
  if (f.macrocategoria) p.p_macrocategoria = f.macrocategoria;
  if (f.categoria) p.p_categoria = f.categoria;
  if (f.regione) p.p_regione = f.regione;
  // genere: 'T' = tutti => si omette. Escluso del tutto per piramide/tabella.
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
export interface PersonaleServizio {
  personale: number;
  personale_var_prec_pct: number | null;
  personale_min_storico: number | null;
  personale_max_storico: number | null;
}
export interface EtaCard {
  eta_media: number; eta_var_prec: number | null; eta_cluster: number | null; eta_pa: number | null;
  over_55: number; over_55_var_prec_pp: number | null; over_55_cluster: number | null; over_55_gap_pp: number | null;
  under_35: number; under_35_var_prec_pp: number | null; under_35_cluster: number | null; under_35_gap_pp: number | null;
}
export interface AnzianitaCard {
  anzianita_media: number; anzianita_var_prec: number | null;
  anzianita_cluster: number | null; anzianita_pa: number | null;
}
export interface FasciaGenereRow {
  ordine: number; fascia_eta: string;
  uomini: number; uomini_grafico: number; donne: number; tutti: number;
  donne_pct: number | null; donne_pa_pct: number | null; delta_pa_pp: number | null;
}
export interface EvoluzioneRow {
  anno: number; eta_selezione: number | null; eta_cluster: number | null; eta_pa: number | null;
}
export interface BenchmarkRow {
  gruppo_codice: string; gruppo_descrizione: string;
  personale: number | null; eta_gruppo: number | null; eta_selezione: number | null;
}

/* ------------------------------ Chiamate --------------------------------- */
export const fetchPersonaleServizio = (f: EtaFiltri) =>
  rpcOne<PersonaleServizio>("fa_ca_personale_servizio", buildParams(f));

export const fetchEtaCard = (f: EtaFiltri) =>
  rpcOne<EtaCard>("fa_ca_eta", buildParams(f));

export const fetchAnzianita = (f: EtaFiltri) =>
  rpcOne<AnzianitaCard>("fa_ca_anzianita_media", buildParams(f));

// Piramide + tabella: p_genere ESCLUSO per costruzione.
export const fetchFasceGenere = (f: EtaFiltri) =>
  rpcRows<FasciaGenereRow>("fa_ca_eta_fasce_genere", buildParams(f, { includeGenere: false }));

// Evoluzione: il genere qui e pilotato dal toggle locale (ha precedenza).
export const fetchEvoluzione = (f: EtaFiltri, genereToggle: Genere) =>
  rpcRows<EvoluzioneRow>("fa_ca_eta_evoluzione", buildParams({ ...f, genere: genereToggle }));

export const fetchBenchmark = (f: EtaFiltri, dimensione: BenchDimensione) =>
  rpcRows<BenchmarkRow>("fa_ca_eta_benchmark", { ...buildParams(f), p_dimensione: dimensione });
