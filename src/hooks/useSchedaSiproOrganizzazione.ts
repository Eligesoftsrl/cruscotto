/** Hook React Query - sezione SIPRO "Organizzazione" (RPC sipro_*). */
import { useQuery } from "@tanstack/react-query";
import * as svc from "@/services/sipro/organizzazioneService";
import type { SiproFiltri } from "@/services/sipro/organizzazioneService";

const key = (name: string, extra: unknown) => ["sipro-org", name, extra] as const;

// 02 Organigramma
export const useUoDistribuzione = (f: SiproFiltri, dim: "livello" | "responsabilita") =>
  useQuery({ queryKey: key(`uo-${dim}`, f), queryFn: () => svc.fetchUoDistribuzione(f, dim) });

// 03 Stato Organizzazione
export const useOrganizzazioniStati = (f: SiproFiltri) =>
  useQuery({ queryKey: key("stati", f), queryFn: () => svc.fetchOrganizzazioniStati(f) });
export const useOrganizzazioni = (f: SiproFiltri, limit: number, offset: number) =>
  useQuery({ queryKey: key("organizzazioni", { f, limit, offset }), queryFn: () => svc.fetchOrganizzazioni(f, limit, offset) });

// 04 Provvedimenti
export const useProvvedimentiAndamento = (f: SiproFiltri) =>
  useQuery({ queryKey: key("prov-andamento", f), queryFn: () => svc.fetchProvvedimentiAndamento(f) });
export const useProvvedimenti = (f: SiproFiltri, limit: number, offset: number) =>
  useQuery({ queryKey: key("provvedimenti", { f, limit, offset }), queryFn: () => svc.fetchProvvedimenti(f, limit, offset) });

// 07 Dotazione Risorse UO
export const useDotazioneUo = (f: SiproFiltri, limit: number, offset: number) =>
  useQuery({ queryKey: key("dotazione", { f, limit, offset }), queryFn: () => svc.fetchDotazioneUo(f, limit, offset) });
export const useDotazioneUoRiepilogo = (f: SiproFiltri) =>
  useQuery({ queryKey: key("dotazione-riepilogo", f), queryFn: () => svc.fetchDotazioneUoRiepilogo(f) });

// 18 Criticita UO
export const useCriticita = (f: SiproFiltri, limit: number, offset: number) =>
  useQuery({ queryKey: key("criticita", { f, limit, offset }), queryFn: () => svc.fetchCriticita(f, limit, offset) });
export const useCriticitaDistribuzione = (f: SiproFiltri) =>
  useQuery({ queryKey: key("criticita-distrib", f), queryFn: () => svc.fetchCriticitaDistribuzione(f) });
