/** Hook React Query - sezione SIPRO "Processi" (RPC sipro_*). */
import { useQuery } from "@tanstack/react-query";
import * as svc from "@/services/sipro/processiService";
import type { SiproFiltri } from "@/services/sipro/processiService";

const key = (name: string, extra: unknown) => ["sipro-proc", name, extra] as const;

// S15 / S16 distribuzioni
export const useProcessiDistribuzione = (f: SiproFiltri, dim: "funzione" | "tipologia" | "obiettivo") =>
  useQuery({ queryKey: key(`distrib-${dim}`, f), queryFn: () => svc.fetchProcessiDistribuzione(f, dim) });

// S16 elenco processi
export const useProcessi = (f: SiproFiltri, limit: number, offset: number) =>
  useQuery({ queryKey: key("processi", { f, limit, offset }), queryFn: () => svc.fetchProcessi(f, limit, offset) });

// S17 / S22
export const useSemplificazioneProcessi = (f: SiproFiltri, limit: number, offset: number) =>
  useQuery({ queryKey: key("semplificazione", { f, limit, offset }), queryFn: () => svc.fetchSemplificazioneProcessi(f, limit, offset) });
export const useCriticitaDistribuzioneProcesso = (f: SiproFiltri) =>
  useQuery({ queryKey: key("crit-distrib-proc", f), queryFn: () => svc.fetchCriticitaDistribuzioneProcesso(f) });

// S19 / S20
export const useDigitalizzazioneFasi = (f: SiproFiltri, dim: "digitale" | "outsourcing" | "agile") =>
  useQuery({ queryKey: key(`digit-${dim}`, f), queryFn: () => svc.fetchDigitalizzazioneFasi(f, dim) });
export const useFasiRiepilogo = (f: SiproFiltri, limit: number, offset: number) =>
  useQuery({ queryKey: key("fasi-riepilogo", { f, limit, offset }), queryFn: () => svc.fetchFasiRiepilogo(f, limit, offset) });

// S21
export const useCoinvolgimentoUo = (f: SiproFiltri, limit: number, offset: number) =>
  useQuery({ queryKey: key("coinvolgimento", { f, limit, offset }), queryFn: () => svc.fetchCoinvolgimentoUo(f, limit, offset) });

// S23
export const useTempiPicchi = (f: SiproFiltri, limit: number, offset: number) =>
  useQuery({ queryKey: key("tempi-picchi", { f, limit, offset }), queryFn: () => svc.fetchTempiPicchi(f, limit, offset) });
export const usePicchiDistribuzione = (f: SiproFiltri, dim: "frequenza" | "intensita" | "presidio") =>
  useQuery({ queryKey: key(`picchi-${dim}`, f), queryFn: () => svc.fetchPicchiDistribuzione(f, dim) });
