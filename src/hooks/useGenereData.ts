import { useQuery } from "@tanstack/react-query";
import { fetchGenereData, EMPTY_GENERE_DATA } from "@/services/dw/genereService";

export type { GenerePerQualificaRow, GenereKpiOverview } from "@/services/dw/genereService";

/**
 * Hook thin: orchestra react-query e delega l'accesso ai dati al service.
 */
export function useGenereData(anno?: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dw_occupazione_genere", anno],
    queryFn: () => fetchGenereData(anno),
  });

  const { generePerQualifica, kpiOverview } = data ?? EMPTY_GENERE_DATA;

  return { generePerQualifica, kpiOverview, isLoading, error };
}
