/** Hook React Query - Vista Executive/Sintetica con score [0-100] (RPC fa_ca_exec_<dx>_indicatori_score). */
import { useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useFilters } from "@/contexts/FilterContext";
import { useEnteScope } from "@/hooks/useEnteScope";
import { useIstituzione } from "@/hooks/useIstituzione";
import {
  fetchExecIndicatoriScore,
  type ExecScoreFiltri,
  type ExecScoreRow,
} from "@/services/exec/execScoreService";
import { fetchAnni } from "@/services/ca/filtriService";

const key = (pillar: string, f: ExecScoreFiltri) => ["exec-score", pillar, f] as const;

/** Tutte le righe del pillar per l'anno selezionato (panoramica + card). */
export function useExecScore(pillar: string, f: ExecScoreFiltri, enabled = true) {
  return useQuery({
    queryKey: key(pillar, f),
    queryFn: () => fetchExecIndicatoriScore(pillar, f),
    enabled: enabled && Number.isFinite(f.anno) && f.anno > 0,
  });
}

/**
 * Trend storico: anni da mv_filtri (tipo=anno), una chiamata per anno con i
 * filtri invariati (anni successivi a quello selezionato esclusi).
 * Restituisce le righe di tutti gli anni, ordinate per anno.
 */
export function useExecScoreTrend(pillar: string, f: ExecScoreFiltri, enabled = true) {
  const anniQ = useQuery({ queryKey: ["mvf", "anni"], queryFn: fetchAnni, enabled });
  const anni = (anniQ.data ?? []).filter((a) => a <= f.anno).sort((a, b) => a - b);
  const results = useQueries({
    queries: anni.map((anno) => ({
      queryKey: key(pillar, { ...f, anno }),
      queryFn: () => fetchExecIndicatoriScore(pillar, { ...f, anno }),
      enabled,
    })),
  });
  const rows: ExecScoreRow[] = results.flatMap((r) => r.data ?? []);
  const isLoading = anniQ.isLoading || results.some((r) => r.isLoading);
  return { rows, anni, isLoading };
}

/** Filtri comuni delle viste Executive/Sintetica: anno, ente (Keycloak/DFP), comparto, regione. */
export function useExecScoreFiltri() {
  const { filters, latestYear } = useFilters();
  const enteScope = useEnteScope();
  const { ente } = useIstituzione();
  const anno = Number(filters.anno) || Number(latestYear) || 0;
  const filtri: ExecScoreFiltri = useMemo(
    () => ({
      anno,
      istituzione: ente?.codice ?? null,
      codiceFiscale: enteScope.codiceFiscale,
      comparto: filters.comparto !== "Tutti" ? filters.comparto : null,
      regione: filters.regione !== "Tutte" ? filters.regione : null,
    }),
    [anno, ente?.codice, enteScope.codiceFiscale, filters.comparto, filters.regione],
  );
  return { filtri, enteScope, ente };
}
