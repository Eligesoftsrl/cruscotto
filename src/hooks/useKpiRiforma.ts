/** Hook React Query — scheda KPI Riforma PA (RPC kpi_filtri · kpi_scheda). */
import { useQuery } from "@tanstack/react-query";
import { fetchKpiFiltri, fetchKpiScheda } from "@/services/kpi/kpiRiformaService";

export function useKpiFiltri() {
  return useQuery({ queryKey: ["kpi-riforma", "filtri"], queryFn: fetchKpiFiltri, staleTime: 30 * 60_000 });
}

export function useKpiScheda(anno: number | null) {
  return useQuery({
    queryKey: ["kpi-riforma", "scheda", anno],
    queryFn: () => fetchKpiScheda(anno as number),
    enabled: anno != null,
  });
}
