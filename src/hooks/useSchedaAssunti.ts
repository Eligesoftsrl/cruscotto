/**
 * Hook React Query per la scheda Assunti per causale (RPC fa_ca_assunti_*).
 */
import { useQuery } from "@tanstack/react-query";
import {
  fetchAssuntiKpi, fetchAssuntiCausali, fetchAssuntiEvoluzione,
  type AssuntiFiltri,
} from "@/services/ca/assuntiService";

const key = (name: string, f: AssuntiFiltri) => ["ca-assunti", name, f] as const;

export function useAssuntiKpi(f: AssuntiFiltri) {
  return useQuery({ queryKey: key("kpi", f), queryFn: () => fetchAssuntiKpi(f) });
}
export function useAssuntiCausali(f: AssuntiFiltri) {
  return useQuery({ queryKey: key("causali", f), queryFn: () => fetchAssuntiCausali(f) });
}
export function useAssuntiEvoluzione(f: AssuntiFiltri) {
  return useQuery({ queryKey: key("evoluzione", f), queryFn: () => fetchAssuntiEvoluzione(f) });
}
