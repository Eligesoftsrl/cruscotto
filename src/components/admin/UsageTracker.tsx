import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logEvento } from "@/services/admin/logger";
import { useAuth } from "@/contexts/AuthContext";
import { SCHEDA_LABEL_BY_INDICATOR } from "@/config/schedeCatalog";

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

export const UsageTracker = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const params = new URLSearchParams(location.search);
  // Il parametro `indicator` identifica la scheda aperta nella Vista Tecnica.
  const indicator = params.get("indicator") ?? "";

  useEffect(() => {
    // Non tracciare finché l'utente non è autenticato: durante il callback di
    // login il token non è ancora pronto e la chiamata fallirebbe (401/422).
    if (!profile) return;
    const base = PATH_LABELS[location.pathname] ?? location.pathname;
    // Se siamo su una scheda specifica (Conto Annuale o SIPrO), registra la
    // sua etichetta reale (identica a quella di «Schede più consultate»).
    const schedaLabel = indicator ? SCHEDA_LABEL_BY_INDICATOR[indicator] : undefined;
    const label = schedaLabel ?? base;
    logEvento("navigazione", label, {
      path: location.pathname + location.search,
      ...(schedaLabel ? { scheda: schedaLabel, indicator } : {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, indicator, profile]);

  return null;
};
