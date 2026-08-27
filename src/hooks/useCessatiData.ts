import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryKeys";
import { fetchCessatiData, EMPTY_CESSATI_DATA } from "@/services/dw/cessatiService";

export type { CessazionePerCausale, SerieStoricaCessati } from "@/services/dw/cessatiService";

/** Hook thin: delega l'accesso ai dati a cessatiService. */
export function useCessatiData(anno?: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.cessati(anno),
    queryFn: () => fetchCessatiData(anno),
  });

  const { cessazioniPerCausale, serieStoricaCessati, kpiOverview } = data ?? EMPTY_CESSATI_DATA;

  return { cessazioniPerCausale, serieStoricaCessati, kpiOverview, isLoading, error };
}
