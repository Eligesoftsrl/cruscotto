/** Hook React Query - scheda Tasso di turnover (RPC fa_ca_turnover_*). */
import { useQuery } from "@tanstack/react-query";
import {
  fetchTurnoverKpi, fetchTurnoverEvoluzione, type TurnoverFiltri,
} from "@/services/ca/turnoverService";

const key = (name: string, f: TurnoverFiltri) => ["ca-turnover", name, f] as const;

export function useTurnoverKpi(f: TurnoverFiltri) {
  return useQuery({ queryKey: key("kpi", f), queryFn: () => fetchTurnoverKpi(f) });
}
export function useTurnoverEvoluzione(f: TurnoverFiltri) {
  return useQuery({ queryKey: key("evoluzione", f), queryFn: () => fetchTurnoverEvoluzione(f) });
}
