import { useQuery } from "@tanstack/react-query";
import { fetchProgressioniData } from "@/services/dw/progressioniService";

export type { ProgressioneRow } from "@/services/dw/progressioniService";

/** Hook thin: delega l'accesso ai dati a progressioniService. */
export function useProgressioniData() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dw_passaggi_qualifica"],
    queryFn: fetchProgressioniData,
  });

  return { progressioni: data ?? [], isLoading, error };
}
