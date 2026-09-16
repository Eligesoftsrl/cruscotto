/** Hook React Query - scheda Lavoro flessibile (RPC fa_ca_lavoro_flessibile_*). */
import { useQuery } from "@tanstack/react-query";
import {
  fetchLavoroFlessibileKpi,
  fetchLavoroFlessibileEvoluzione,
  type LavoroFlessibileFiltri,
} from "@/services/ca/lavoroFlessibileService";

const key = (name: string, f: LavoroFlessibileFiltri) => ["ca-lavoro-flessibile", name, f] as const;

export function useLavoroFlessibileKpi(f: LavoroFlessibileFiltri) {
  return useQuery({ queryKey: key("kpi", f), queryFn: () => fetchLavoroFlessibileKpi(f) });
}
export function useLavoroFlessibileEvoluzione(f: LavoroFlessibileFiltri) {
  return useQuery({ queryKey: key("evoluzione", f), queryFn: () => fetchLavoroFlessibileEvoluzione(f) });
}
