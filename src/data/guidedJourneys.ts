/* ══════════════════════════════════════════════════════════
   Percorsi guidati drill-down — D2 (Fabbisogni) e D3 (Selezione)
   ══════════════════════════════════════════════════════════ */

export interface CrossImpact {
  pillar: string;
  indicatorId: string;
  label: string;
  reason: string;
}

export interface OperativeCorrelation {
  label: string;
  description: string;
  /** Optional: link to an executive KPI to show its cross-pillar interconnections */
  relatedKpiId?: string;
  drillTarget?: {
    level: string;
    pillar?: string;
    source?: string;
    indicator?: string;
  };
}

export interface JourneyStep {
  id: string;
  title: string;
  question: string;
  description: string;
  /** KPI ids shown in this step */
  kpiIds: string[];
  /** Cross-pillar impacts */
  impacts: CrossImpact[];
  /** Optional narrative insights per KPI, keyed by KPI id. */
  insights?: Record<string, string>;
  /** Drill-down hint for atomic data */
  drillTarget?: {
    level: "synthetic" | "operational";
    pillar?: string;
    source?: string;
    indicator?: string;
  };
  /** Operative indicators correlated to the executive KPIs in this step (from client matrix) */
  operativeCorrelations?: OperativeCorrelation[];
  /** Conditional narratives based on value ranges (e.g. IGF thresholds) */
  conditionalNarratives?: {
    high: string; // >= 0.7
    medium: string; // 0.4–0.6
    low: string; // <= 0.3
  };
}

export interface GuidedJourneyDef {
  id: string;
  pillar: string;
  title: string;
  subtitle: string;
  colorVar: string;
  steps: JourneyStep[];
}

import data from "./json/guidedJourneys.json";

export const guidedJourneys: Record<string, GuidedJourneyDef> = data.guidedJourneys as Record<
  string,
  GuidedJourneyDef
>;
export const pillarToJourney: Record<string, string> = data.pillarToJourney;
