/** Hook React Query - scheda Analisi del personale (RPC fa_ca_personale_*). */
import { useQuery } from "@tanstack/react-query";
import {
  fetchPersonaleKpi, fetchPersonaleCategorie, fetchPersonaleTitoli, fetchPersonaleEvoluzione,
  type PersonaleFiltri,
} from "@/services/ca/personaleService";

const key = (name: string, f: PersonaleFiltri) => ["ca-personale", name, f] as const;

export const usePersonaleKpi = (f: PersonaleFiltri) =>
  useQuery({ queryKey: key("kpi", f), queryFn: () => fetchPersonaleKpi(f) });
export const usePersonaleCategorie = (f: PersonaleFiltri) =>
  useQuery({ queryKey: key("categorie", f), queryFn: () => fetchPersonaleCategorie(f) });
export const usePersonaleTitoli = (f: PersonaleFiltri) =>
  useQuery({ queryKey: key("titoli", f), queryFn: () => fetchPersonaleTitoli(f) });
export const usePersonaleEvoluzione = (f: PersonaleFiltri) =>
  useQuery({ queryKey: key("evoluzione", f), queryFn: () => fetchPersonaleEvoluzione(f) });
