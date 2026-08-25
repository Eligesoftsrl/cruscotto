/**
 * Definizione dei percorsi della Bussola
 * Ogni percorso = una domanda dell'utente → una sequenza di "capitoli" con indicatori
 */

export interface BussolaDataSource {
  table: string;
  formula: string;
}

export interface BussolaIndicator {
  id: string;
  label: string;
  value: number;
  description: string;
  status: "green" | "yellow" | "red";
  numerator?: number;
  denominator?: number;
  trend?: { anno: string; valore: number }[];
  benchmark?: number;
  benchmarkLabel?: string;
  methodology?: string;
  pillar?: string;
  source?: string;
  /** ID specifico della vista operativa per deep-link di precisione */
  indicatorTarget?: string;
  /** Provenienza del dato: tabella DWH e formula di calcolo */
  dataSource?: BussolaDataSource;
}

export interface BussolaProjection {
  label: string;
  data: { anno: string; valore: number; projected?: boolean }[];
  unit: string;
  threshold?: number;
  thresholdLabel?: string;
}

export interface BussolaStep {
  title: string;
  description: string;
  indicators: BussolaIndicator[];
  insight: { type: "success" | "warning" | "danger"; text: string };
  cta?: { label: string; pillar?: string; source?: string };
  projection?: BussolaProjection;
}

export interface BussolaPercorsoData {
  id: string;
  question: string;
  subtitle: string;
  valueProposition: string;
  icon: string;
  category: "attention" | "explore" | "plan";
  steps: BussolaStep[];
}

import data from "./json/bussolaPercorsi.json";

export const bussolaPercorsi: BussolaPercorsoData[] = data.bussolaPercorsi as BussolaPercorsoData[];
export const categoryLabels: Record<string, { label: string; color: string }> = data.categoryLabels;
