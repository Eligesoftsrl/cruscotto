/** Hook React Query - sezione SIPRO "Profili e Cataloghi". */
import { useQuery } from "@tanstack/react-query";
import * as svc from "@/services/sipro/profiliService";
import type { SiproFiltri } from "@/services/sipro/profiliService";

const key = (name: string, extra: unknown) => ["sipro-prof", name, extra] as const;

// S05
export const useFteRiepilogo = (f: SiproFiltri) =>
  useQuery({ queryKey: key("fte-riepilogo", f), queryFn: () => svc.fetchFteRiepilogo(f) });
export const useFteProfili = (f: SiproFiltri, limit?: number | null, offset?: number) =>
  useQuery({ queryKey: key("fte-profili", { f, limit, offset }), queryFn: () => svc.fetchFteProfili(f, limit, offset) });
export const useFte = (f: SiproFiltri, limit: number, offset: number) =>
  useQuery({ queryKey: key("fte", { f, limit, offset }), queryFn: () => svc.fetchFte(f, limit, offset) });

// S06
export const useFteCopertura = (f: SiproFiltri) =>
  useQuery({ queryKey: key("fte-copertura", f), queryFn: () => svc.fetchFteCopertura(f) });

// S08 / S14
export const useCatalogoRiepilogo = (f: SiproFiltri) =>
  useQuery({ queryKey: key("cat-riepilogo", f), queryFn: () => svc.fetchCatalogoRiepilogo(f) });
export const useCatalogoDistribuzione = (f: SiproFiltri, dim: "origine" | "famiglia" | "ambito" | "area") =>
  useQuery({ queryKey: key(`cat-distrib-${dim}`, f), queryFn: () => svc.fetchCatalogoDistribuzione(f, dim) });
export const useCatalogoProfili = (f: SiproFiltri, limit: number, offset: number) =>
  useQuery({ queryKey: key("cat-profili", { f, limit, offset }), queryFn: () => svc.fetchCatalogoProfili(f, limit, offset) });

// S10-S13 (globali)
export const useMinerva = (tipo: "famiglia" | "profilo_professionale" | "ambito" | "area") =>
  useQuery({ queryKey: key("minerva", tipo), queryFn: () => svc.fetchMinerva(tipo), staleTime: 5 * 60 * 1000 });
