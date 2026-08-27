import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryKeys";
import { fetchFormazioneData, EMPTY_FORMAZIONE_DATA } from "@/services/dw/formazioneService";

export type { FormazioneData } from "@/services/dw/formazioneService";

/** Hook thin: delega l'accesso ai dati a formazioneService. */
export function useFormazioneData(anno = 2023) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.formazione(anno),
    queryFn: () => fetchFormazioneData(anno),
  });

  return { formazione: data ?? EMPTY_FORMAZIONE_DATA, isLoading, error };
}
