import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryKeys";
import { fetchEtaData, EMPTY_ETA_DATA } from "@/services/dw/etaService";

export type { DistribuzioneEtaRow } from "@/services/dw/etaService";

/**
 * Hook thin: orchestra react-query e delega l'accesso ai dati al service.
 */
export function useEtaData(anno?: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.eta(anno),
    queryFn: () => fetchEtaData(anno),
  });

  const { distribuzioneEta, totalePersonale } = data ?? EMPTY_ETA_DATA;

  return {
    distribuzioneEta,
    totalePersonale,
    isLoading,
    error,
  };
}
