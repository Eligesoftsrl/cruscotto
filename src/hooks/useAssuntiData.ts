import { useQuery } from "@tanstack/react-query";
import { fetchAssuntiData, EMPTY_ASSUNTI_DATA } from "@/services/dw/assuntiService";

export type { AssuntoPerCausale, SerieStoricaAssunti } from "@/services/dw/assuntiService";

/** Hook thin: delega l'accesso ai dati a assuntiService. */
export function useAssuntiData(anno?: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dw_assunti", anno],
    queryFn: () => fetchAssuntiData(anno),
  });

  const { assuntiPerCausale, serieStoricaTurnover, kpiOverview } = data ?? EMPTY_ASSUNTI_DATA;

  return { assuntiPerCausale, serieStoricaTurnover, kpiOverview, isLoading, error };
}
