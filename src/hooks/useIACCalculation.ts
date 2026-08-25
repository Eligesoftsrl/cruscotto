import { useQuery } from "@tanstack/react-query";
import { fetchIAC } from "@/services/dw/iacService";

export type { IACResult } from "@/services/dw/iacService";

/** Hook thin: delega il calcolo dell'indicatore IAC a iacService. */
export function useIACCalculation() {
  return useQuery({
    queryKey: ["iac-indicator"],
    queryFn: fetchIAC,
  });
}
