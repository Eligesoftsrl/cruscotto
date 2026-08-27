import { useQuery } from "@tanstack/react-query";
import {
  fetchModalitaLavoro,
  EMPTY_MODALITA_LAVORO_DATA,
} from "@/services/dw/modalitaLavoroService";

export type { LavoroAgile, LavoroFlessibile } from "@/services/dw/modalitaLavoroService";

/** Hook thin: delega l'accesso ai dati a modalitaLavoroService. */
export function useModalitaLavoro(anno = 2023) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dw_modalita_lavoro", anno],
    queryFn: () => fetchModalitaLavoro(anno),
  });

  const { lavoroAgile, lavoroFlessibile } = data ?? EMPTY_MODALITA_LAVORO_DATA;

  return { lavoroAgile, lavoroFlessibile, isLoading, error };
}
