/**
 * Hook per alimentare gli indicatori della Bussola con dati reali dal DWH.
 * L'accesso ai dati e delegato a `@/services/dw/bussolaService` (thin hook).
 */
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useFilteredEnteIds } from "@/hooks/useFilteredEnteIds";
import { fetchBussolaMetrics, type BussolaMetrics } from "@/services/dw/bussolaService";
import { queryKeys } from "@/services/queryKeys";

export type { BussolaMetric } from "@/services/dw/bussolaService";

export interface BussolaDataResult {
  metrics: BussolaMetrics;
  isLoading: boolean;
  error: Error | null;
}

export function useBussolaData(): BussolaDataResult {
  useAuth();
  const enteIds = useFilteredEnteIds();
  const enteId = enteIds?.[0];

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.bussola(enteId),
    enabled: !!enteId,
    staleTime: 5 * 60 * 1000,
    queryFn: () => fetchBussolaMetrics(enteId as number),
  });

  return {
    metrics: data ?? {},
    isLoading,
    error: error as Error | null,
  };
}
