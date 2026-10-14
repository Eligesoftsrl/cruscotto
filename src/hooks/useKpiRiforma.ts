/** Hook React Query — scheda KPI Riforma PA (RPC kpi_filtri · kpi_scheda). */
import { useQuery } from "@tanstack/react-query";
import { fetchKpiEntiCensiti, fetchKpiFiltri, fetchKpiScheda } from "@/services/kpi/kpiRiformaService";

export function useKpiFiltri() {
  return useQuery({ queryKey: ["kpi-riforma", "filtri"], queryFn: fetchKpiFiltri, staleTime: 30 * 60_000 });
}

export function useKpiScheda(anno: number | null, enabled = true) {
  return useQuery({
    queryKey: ["kpi-riforma", "scheda", anno],
    queryFn: () => fetchKpiScheda(anno as number),
    enabled: enabled && anno != null,
  });
}

/** Enti partecipanti alla rilevazione KPI (lista fissa di riferimento; null = controllo non disponibile). */
export function useKpiEntiCensiti(enabled: boolean) {
  return useQuery({
    queryKey: ["kpi-riforma", "enti-partecipanti"],
    queryFn: fetchKpiEntiCensiti,
    enabled,
    staleTime: 30 * 60_000,
    retry: 1,
  });
}
