/**
 * Hook React Query per la scheda Analisi Eta (RPC fa_ca_*).
 */
import { useQuery } from "@tanstack/react-query";
import {
  fetchPersonaleServizio, fetchEtaCard, fetchAnzianita, fetchFasceGenere,
  fetchEvoluzione, fetchBenchmark,
  type EtaFiltri, type Genere, type BenchDimensione,
} from "@/services/ca/analisiEtaService";

const key = (name: string, f: EtaFiltri, extra?: unknown) =>
  ["ca-eta", name, f, extra] as const;

export function usePersonaleServizio(f: EtaFiltri) {
  return useQuery({ queryKey: key("personale", f), queryFn: () => fetchPersonaleServizio(f) });
}
export function useEtaCard(f: EtaFiltri) {
  return useQuery({ queryKey: key("eta", f), queryFn: () => fetchEtaCard(f) });
}
export function useAnzianita(f: EtaFiltri) {
  return useQuery({ queryKey: key("anzianita", f), queryFn: () => fetchAnzianita(f) });
}
export function useFasceGenere(f: EtaFiltri) {
  return useQuery({ queryKey: key("fasce", f), queryFn: () => fetchFasceGenere(f) });
}
export function useEvoluzione(f: EtaFiltri, genereToggle: Genere) {
  return useQuery({ queryKey: key("evoluzione", f, genereToggle), queryFn: () => fetchEvoluzione(f, genereToggle) });
}
export function useBenchmark(f: EtaFiltri, dimensione: BenchDimensione) {
  return useQuery({ queryKey: key("benchmark", f, dimensione), queryFn: () => fetchBenchmark(f, dimensione) });
}
