import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFilters } from "@/contexts/FilterContext";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Returns the list of ente_ids matching current global filters.
 * Uses dw_ente as the source of truth.
 * `null` means "all enti" (no filtering needed).
 */
export function useFilteredEnteIds() {
  const { filters } = useFilters();
  const { profile } = useAuth();

  const isEnteHr = profile?.role === "ente_hr" && !!profile.ente_id;
  const hasActiveFilter =
    (filters.comparto !== "Tutti") ||
    (filters.regione !== "Tutte") ||
    (filters.dimensione_pa !== "Tutte");

  return useQuery<number[] | null>({
    queryKey: ["filtered-ente-ids", filters.comparto, filters.regione, filters.dimensione_pa, profile?.ente_id, profile?.role],
    queryFn: async () => {
      if (isEnteHr && profile?.ente_id) {
        return [profile.ente_id];
      }
      if (!hasActiveFilter) return null;

      let q = supabase.from("dw_ente").select("id_ente");
      if (filters.comparto !== "Tutti") q = q.eq("comparto", filters.comparto);
      if (filters.regione !== "Tutte") q = q.eq("regione", filters.regione);
      if (filters.dimensione_pa !== "Tutte") q = q.eq("categoria_cruscotto", filters.dimensione_pa);

      const { data } = await q;
      return (data ?? []).map((e) => e.id_ente);
    },
    staleTime: 30_000,
  });
}

/**
 * Helper: apply the ente_id filter to a Supabase query builder.
 * If enteIds is null → no filter. If empty array → no results.
 */
export function applyEnteFilter(
  query: any,
  enteIds: number[] | null | undefined,
  column = "id_ente"
): any {
  if (enteIds === null || enteIds === undefined) return query;
  if (enteIds.length === 0) return query.eq(column, -1);
  if (enteIds.length === 1) return query.eq(column, enteIds[0]);
  return query.in(column, enteIds);
}
