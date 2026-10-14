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

/** Enti censiti nella rilevazione dell'anno (null = controllo non ancora disponibile). */
export function useKpiEntiCensiti(anno: number | null, enabled: boolean) {
  return useQuery({
    queryKey: ["kpi-riforma", "enti", anno],
    queryFn: () => fetchKpiEntiCensiti(anno as number),
    enabled: enabled && anno != null,
    staleTime: 30 * 60_000,
    retry: 1,
  });
}
