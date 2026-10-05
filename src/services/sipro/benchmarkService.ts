/**
 * Service SIPRO - sezione "Benchmark" (S01, multi-ente).
 * RPC reali: sipro_benchmark_filtri (elenco enti), sipro_benchmark_score (p_codici_fiscali text[]),
 * sipro_benchmark_criticita (p_codici_fiscali text[]).
 */
import { sbUntyped } from "@/integrations/supabase/untyped";

export interface BenchmarkEnteRow { codice_fiscale: string; ente: string; regione: string | null; }
export interface BenchmarkScoreRow {
  codice_fiscale: string; ente: string; asse: string; score: number; grezzo: number | null;
  numeratore: number | null; denominatore: number | null; osservazioni: number;
  media_score_cluster: number | null; mediana_score_cluster: number | null;
  q1_score_cluster: number | null; q3_score_cluster: number | null;
  media_grezzo_cluster: number | null; numero_enti_cluster: number;
}
export interface BenchmarkCriticitaRow {
  ambito: string; categoria_id: number; categoria: string; occorrenze: number;
  enti_coinvolti: number; numero_enti_cluster: number; incidenza_pct: number | null;
}

async function rpcRows<T>(fn: string, params: Record<string, unknown>): Promise<T[]> {
  const { data, error } = await sbUntyped.rpc(fn, params);
  if (error) throw error;
  return (data ?? []) as T[];
}

export const fetchBenchmarkFiltri = () =>
  rpcRows<BenchmarkEnteRow>("sipro_benchmark_filtri", {});
export const fetchBenchmarkScore = (codiciFiscali: string[]) =>
  rpcRows<BenchmarkScoreRow>("sipro_benchmark_score", { p_codici_fiscali: codiciFiscali });
export const fetchBenchmarkCriticita = (codiciFiscali: string[]) =>
  rpcRows<BenchmarkCriticitaRow>("sipro_benchmark_criticita", { p_codici_fiscali: codiciFiscali });
