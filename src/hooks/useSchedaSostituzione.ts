/** Hook React Query - scheda Tasso di sostituzione (RPC fa_ca_sostituzione_*). */
import { useQuery } from "@tanstack/react-query";
import {
  fetchSostituzioneKpi, fetchSostituzioneEvoluzione, type SostituzioneFiltri,
} from "@/services/ca/sostituzioneService";

const key = (name: string, f: SostituzioneFiltri) => ["ca-sostituzione", name, f] as const;

export function useSostituzioneKpi(f: SostituzioneFiltri) {
  return useQuery({ queryKey: key("kpi", f), queryFn: () => fetchSostituzioneKpi(f) });
}
export function useSostituzioneEvoluzione(f: SostituzioneFiltri) {
  return useQuery({ queryKey: key("evoluzione", f), queryFn: () => fetchSostituzioneEvoluzione(f) });
}
