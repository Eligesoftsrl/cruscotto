/** Hook React Query - scheda Progressioni (RPC fa_ca_progressioni_*). */
import { useQuery } from "@tanstack/react-query";
import {
  fetchProgressioniKpi,
  fetchProgressioniEvoluzione,
  type ProgressioniFiltri,
} from "@/services/ca/progressioniService";

const key = (name: string, f: ProgressioniFiltri) => ["ca-progressioni", name, f] as const;

export function useProgressioniKpi(f: ProgressioniFiltri) {
  return useQuery({ queryKey: key("kpi", f), queryFn: () => fetchProgressioniKpi(f) });
}
export function useProgressioniEvoluzione(f: ProgressioniFiltri) {
  return useQuery({ queryKey: key("evoluzione", f), queryFn: () => fetchProgressioniEvoluzione(f) });
}
