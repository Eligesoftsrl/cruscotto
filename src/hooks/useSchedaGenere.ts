/** Hook React Query - scheda Analisi per genere (RPC fa_ca_genere_*). */
import { useQuery } from "@tanstack/react-query";
import {
  fetchGenereKpi, fetchGenereQualifiche, fetchGenerePiramide, type GenereFiltri,
} from "@/services/ca/genereService";

const key = (name: string, f: GenereFiltri) => ["ca-genere", name, f] as const;

export const useGenereKpi = (f: GenereFiltri) =>
  useQuery({ queryKey: key("kpi", f), queryFn: () => fetchGenereKpi(f) });
export const useGenereQualifiche = (f: GenereFiltri) =>
  useQuery({ queryKey: key("qualifiche", f), queryFn: () => fetchGenereQualifiche(f) });
export const useGenerePiramide = (f: GenereFiltri) =>
  useQuery({ queryKey: key("piramide", f), queryFn: () => fetchGenerePiramide(f) });
