/** Hook React Query - scheda Formazione (RPC fa_ca_formazione_*). */
import { useQuery } from "@tanstack/react-query";
import {
  fetchFormazioneKpi,
  fetchFormazioneMacrocategorie,
  fetchFormazioneEvoluzione,
  type FormazioneFiltri,
} from "@/services/ca/formazioneService";

const key = (name: string, f: FormazioneFiltri) => ["ca-formazione", name, f] as const;

export function useFormazioneKpi(f: FormazioneFiltri) {
  return useQuery({ queryKey: key("kpi", f), queryFn: () => fetchFormazioneKpi(f) });
}
export function useFormazioneMacrocategorie(f: FormazioneFiltri) {
  return useQuery({ queryKey: key("macro", f), queryFn: () => fetchFormazioneMacrocategorie(f) });
}
export function useFormazioneEvoluzione(f: FormazioneFiltri) {
  return useQuery({ queryKey: key("evoluzione", f), queryFn: () => fetchFormazioneEvoluzione(f) });
}
