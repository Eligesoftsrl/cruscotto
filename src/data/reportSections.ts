/**
 * Catalogo delle sezioni disponibili per il Rapporto Narrativo
 * Ogni sezione corrisponde a un blocco di contenuto reale del cruscotto
 */

export type ReportAudience = "executive" | "extended" | "technical";
export type RepresentationMode = "narrative" | "chart" | "table" | "kpi_strip";

export interface ReportSectionDef {
  id: string;
  title: string;
  pillar?: string;
  category: "overview" | "demographic" | "recruiting" | "development" | "organization" | "strategic";
  description: string;
  /** Descrizione estesa: cosa contiene, a quale domanda risponde, quali fonti usa */
  extendedDescription: string;
  /** Domanda analitica a cui il capitolo risponde */
  questionAnswered: string;
  /** Fonti dati utilizzate */
  dataSources: string[];
  /** Quali audience lo vedono di default (pre-selezionato) */
  defaultFor: ReportAudience[];
  /** Modalità di rappresentazione disponibili */
  representations: RepresentationMode[];
  /** Rappresentazione di default per audience */
  defaultRepresentation: Record<ReportAudience, RepresentationMode>;
  /** Dati mock per preview */
  data: ReportSectionData;
  /** Rilevanza: il sistema evidenzia le sezioni più importanti */
  relevance: "critical" | "notable" | "normal";
  relevanceReason?: string;
}

export interface ReportSectionData {
  kpis?: { label: string; value: string; status: "green" | "yellow" | "red"; cluster?: string; delta?: string }[];
  narrative?: string;
  insight?: string;
  tableRows?: { label: string; value: string; target?: string; status: "green" | "yellow" | "red" }[];
}

/* ═══ Preset report themes ═══ */
export interface ReportTheme {
  id: string;
  label: string;
  icon: string;
  description: string;
  audience: ReportAudience;
  sectionIds: string[];
}

import data from "./json/reportSections.json";

export const reportThemes: ReportTheme[] = data.reportThemes as ReportTheme[];
export const reportAudienceProfiles: Record<ReportAudience, {
  label: string;
  subtitle: string;
  icon: string;
  description: string;
  maxSections: number;
  preferredRepresentation: RepresentationMode;
}> = data.reportAudienceProfiles as any;
export const reportSectionsCatalog: ReportSectionDef[] = data.reportSectionsCatalog as ReportSectionDef[];
