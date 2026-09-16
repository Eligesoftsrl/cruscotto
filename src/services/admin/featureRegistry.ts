import type { FeatureFlag } from "./types";

/**
 * Catalogo delle funzionalità del sistema gestibili dall'Admin (on/off).
 * `label` coincide con l'etichetta usata dal tracker di utilizzo, così le
 * statistiche possono correlare eventi ↔ funzionalità.
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlag[] = [
  {
    key: "guided_navigation",
    label: "Navigazione Guidata",
    description: "Percorsi narrativi / Bussola (Pannello di Governo)",
    category: "Navigazione",
    enabled: true,
    updatedAt: "",
  },
  {
    key: "technical_dashboard",
    label: "Vista Tecnica",
    description: "Cruscotto tecnico con indicatori e benchmark",
    category: "Navigazione",
    enabled: true,
    updatedAt: "",
  },
  {
    key: "narrative_report",
    label: "Rapporto Narrativo",
    description: "Generazione del rapporto narrativo",
    category: "Navigazione",
    enabled: true,
    updatedAt: "",
  },
  {
    key: "scheda_eta",
    label: "Analisi Età",
    description: "Scheda Conto Annuale — analisi anagrafica per età",
    category: "Schede Conto Annuale",
    enabled: true,
    updatedAt: "",
  },
  {
    key: "scheda_anzianita",
    label: "Anzianità",
    description: "Scheda Conto Annuale — anzianità di servizio",
    category: "Schede Conto Annuale",
    enabled: true,
    updatedAt: "",
  },
  {
    key: "scheda_assunti",
    label: "Assunti",
    description: "Scheda Conto Annuale — assunzioni per causale",
    category: "Schede Conto Annuale",
    enabled: true,
    updatedAt: "",
  },
  {
    key: "scheda_cessazioni",
    label: "Cessazioni",
    description: "Scheda Conto Annuale — cessazioni per causale",
    category: "Schede Conto Annuale",
    enabled: true,
    updatedAt: "",
  },
  {
    key: "scheda_turnover",
    label: "Turnover",
    description: "Scheda Conto Annuale — tasso di turnover",
    category: "Schede Conto Annuale",
    enabled: true,
    updatedAt: "",
  },
  {
    key: "scheda_sostituzione",
    label: "Sostituzione",
    description: "Scheda Conto Annuale — tasso di sostituzione",
    category: "Schede Conto Annuale",
    enabled: true,
    updatedAt: "",
  },
  {
    key: "export_dati",
    label: "Export Dati",
    description: "Esportazione tabelle e grafici (CSV/immagini)",
    category: "Sistema",
    enabled: true,
    updatedAt: "",
  },
  {
    key: "admin_panel",
    label: "Pannello Admin",
    description: "Accesso al pannello di amministrazione",
    category: "Sistema",
    enabled: true,
    updatedAt: "",
  },
];
