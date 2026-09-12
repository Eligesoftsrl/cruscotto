/**
 * Hook React Query per la scheda Anzianita di servizio (RPC fa_ca_anzianita_*).
 */
import { useQuery } from "@tanstack/react-query";
import {
  fetchAnzianitaKpi, fetchAnzianitaFasce, fetchAnzianitaEvoluzione,
  type AnzFiltri,
} from "@/services/ca/anzianitaService";

const key = (name: string, f: AnzFiltri) => ["ca-anzianita", name, f] as const;

export function useAnzianitaKpi(f: AnzFiltri) {
  return useQuery({ queryKey: key("kpi", f), queryFn: () => fetchAnzianitaKpi(f) });
}
export function useAnzianitaFasce(f: AnzFiltri) {
  return useQuery({ queryKey: key("fasce", f), queryFn: () => fetchAnzianitaFasce(f) });
}
export function useAnzianitaEvoluzione(f: AnzFiltri) {
  return useQuery({ queryKey: key("evoluzione", f), queryFn: () => fetchAnzianitaEvoluzione(f) });
}
