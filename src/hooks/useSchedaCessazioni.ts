/**
 * Hook React Query per la scheda Cessazioni dal servizio (RPC fa_ca_cessazioni_*).
 */
import { useQuery } from "@tanstack/react-query";
import {
  fetchCessazioniKpi, fetchCessazioniCausali, fetchCessazioniEvoluzione,
  type CessazioniFiltri, type Movimento,
} from "@/services/ca/cessazioniService";

const key = (name: string, f: CessazioniFiltri, extra?: unknown) =>
  ["ca-cessazioni", name, f, extra] as const;

export function useCessazioniKpi(f: CessazioniFiltri) {
  return useQuery({ queryKey: key("kpi", f), queryFn: () => fetchCessazioniKpi(f) });
}
export function useCessazioniCausali(f: CessazioniFiltri, movimento: Movimento) {
  return useQuery({
    queryKey: key("causali", f, movimento),
    queryFn: () => fetchCessazioniCausali(f, movimento),
  });
}
export function useCessazioniEvoluzione(f: CessazioniFiltri) {
  return useQuery({ queryKey: key("evoluzione", f), queryFn: () => fetchCessazioniEvoluzione(f) });
}
