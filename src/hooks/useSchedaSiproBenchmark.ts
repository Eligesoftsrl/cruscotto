/** Hook React Query - sezione SIPRO "Benchmark" (multi-ente). */
import { useQuery } from "@tanstack/react-query";
import * as svc from "@/services/sipro/benchmarkService";

export const useBenchmarkFiltri = () =>
  useQuery({ queryKey: ["sipro-bench", "filtri"], queryFn: svc.fetchBenchmarkFiltri, staleTime: 5 * 60 * 1000 });

export const useBenchmarkScore = (cfs: string[]) =>
  useQuery({
    queryKey: ["sipro-bench", "score", cfs],
    queryFn: () => svc.fetchBenchmarkScore(cfs),
    enabled: cfs.length > 0,
  });

export const useBenchmarkCriticita = (cfs: string[]) =>
  useQuery({
    queryKey: ["sipro-bench", "criticita", cfs],
    queryFn: () => svc.fetchBenchmarkCriticita(cfs),
    enabled: cfs.length > 0,
  });

export const useBenchmarkMaxEnti = () =>
  useQuery({
    queryKey: ["sipro-bench", "max-enti"],
    queryFn: svc.fetchBenchmarkMaxEnti,
    staleTime: Infinity,
    retry: false,
  });
