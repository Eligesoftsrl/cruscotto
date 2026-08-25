import { useQuery } from "@tanstack/react-query";
import { fetchD1Indicators } from "@/services/dw/d1Service";
import type { D1Filters, D1Result } from "@/services/dw/d1Service";

export type {
  D1Result,
  D1Filters,
  DrilldownRow,
  DrilldownData,
  FormulaBreakdown,
  ContextInfo,
  IndicatorResult,
} from "@/services/dw/d1Service";

/** Hook thin: delega il calcolo degli indicatori D1 a d1Service. */
export function useD1Calculations(filters?: D1Filters) {
  const fKey = filters ?? {};

  return useQuery<D1Result>({
    queryKey: ["d1-indicators", fKey],
    queryFn: () => fetchD1Indicators(filters),
  });
}
