import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logEvento } from "@/services/admin/logger";

/**
 * Traccia la navigazione (per le statistiche di utilizzo).
 * Registra un evento a ogni cambio di rotta / scheda del cruscotto.
 */
const PATH_LABELS: Record<string, string> = {
  "/": "Home",
  "/bussola": "Navigazione Guidata",
  "/dashboard": "Vista Tecnica",
  "/rapporto": "Rapporto Narrativo",
  "/demo-narrativi": "Rapporto Narrativo",
  "/admin": "Pannello Admin",
};

const SECTION_LABELS: Record<string, string> = {
  eta: "Analisi Età",
  anzianita: "Anzianità",
  assunti: "Assunti",
  cessazioni: "Cessazioni",
  turnover: "Turnover",
  sostituzione: "Sostituzione",
};

export const UsageTracker = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const section = params.get("section") ?? params.get("scheda") ?? "";

  useEffect(() => {
    const base = PATH_LABELS[location.pathname] ?? location.pathname;
    const label =
      location.pathname === "/dashboard" && section && SECTION_LABELS[section]
        ? SECTION_LABELS[section]
        : base;
    logEvento("navigazione", label, { path: location.pathname + location.search });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, section]);

  return null;
};
