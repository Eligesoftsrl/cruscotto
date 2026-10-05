import { useQuery } from "@tanstack/react-query";
import { fetchAnni } from "@/services/ca/filtriService";
import { CURRENT_YEAR } from "@/config/constants";

/**
 * Ultimo anno disponibile nei dati (da mv_filtri), utilizzabile OVUNQUE
 * (non richiede il FilterProvider). Fallback: CURRENT_YEAR.
 */
export function useLatestYear(): string {
  const { data } = useQuery({
    queryKey: ["ca", "anni", "latest"],
    queryFn: fetchAnni,
    staleTime: Infinity,
  });
  if (data && data.length) return String(Math.max(...data));
  return String(CURRENT_YEAR);
}
