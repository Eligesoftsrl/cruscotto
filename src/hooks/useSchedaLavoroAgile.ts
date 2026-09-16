/** Hook React Query - scheda Lavoro agile (RPC fa_ca_lavoro_agile_*). */
import { useQuery } from "@tanstack/react-query";
import {
  fetchLavoroAgileKpi,
  fetchLavoroAgileEvoluzione,
  type LavoroAgileFiltri,
} from "@/services/ca/lavoroAgileService";

const key = (name: string, f: LavoroAgileFiltri) => ["ca-lavoro-agile", name, f] as const;

export function useLavoroAgileKpi(f: LavoroAgileFiltri) {
  return useQuery({ queryKey: key("kpi", f), queryFn: () => fetchLavoroAgileKpi(f) });
}
export function useLavoroAgileEvoluzione(f: LavoroAgileFiltri) {
  return useQuery({ queryKey: key("evoluzione", f), queryFn: () => fetchLavoroAgileEvoluzione(f) });
}
