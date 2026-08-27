import { useQuery } from "@tanstack/react-query";
import { useFilters } from "@/contexts/FilterContext";
import { useAuth } from "@/contexts/AuthContext";
import { fetchFilteredEnteIds } from "@/services/dw/enteService";
import { queryKeys } from "@/services/queryKeys";

// Ri-esportato dal service per non rompere gli import esistenti nei componenti.
export { applyEnteFilter } from "@/services/dw/enteService";

/**
 * Restituisce la lista di ente_ids che soddisfano i filtri globali correnti.
 * Usa dw_ente come sorgente di verita. `null` = "tutti gli enti".
 */
export function useFilteredEnteIds() {
  const { filters } = useFilters();
  const { profile } = useAuth();

  const isEnteHr = profile?.role === "ente_hr" && !!profile.ente_id;

  return useQuery<number[] | null>({
    queryKey: queryKeys.filteredEnteIds({
      comparto: filters.comparto,
      regione: filters.regione,
      dimensionePa: filters.dimensione_pa,
      enteId: profile?.ente_id,
      role: profile?.role,
    }),
    queryFn: () =>
      fetchFilteredEnteIds({
        isEnteHr,
        enteId: profile?.ente_id ?? null,
        comparto: filters.comparto,
        regione: filters.regione,
        dimensione_pa: filters.dimensione_pa,
      }),
    staleTime: 30_000,
  });
}
