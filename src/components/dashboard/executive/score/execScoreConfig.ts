/**
 * Configurazione dei pillar della Vista Sintetica alimentati dalle RPC
 * fa_ca_exec_<dx>_indicatori_score (score [0-100]).
 *
 * Fonte: mappature Excel "mappatura-executive-dX" (fogli Associazioni,
 * Scheda dettaglio, Scomposizione formula). Ogni pillar dichiara:
 *  - sintetici: indici di sintesi (layout 2 card per riga)
 *  - intermedi: indici intermedi/componenti (layout 3 card per riga)
 *  - componenti dei compositi (barre componenti + Parte 2 normalizzazione)
 *  - passaggi aggiuntivi di normalizzazione calcolati nel frontend
 *  - riga "Fonte" statica per indice
 */
import type { ExecScoreRow } from "@/services/exec/execScoreService";

export interface ScoreStep {
  label: string;
  value: string;
}

export interface ExecScorePillarConfig {
  pillar: string;
  label: string;
  description: string;
  color: string;
  sintetici: string[];
  intermedi: string[];
  componenti: Record<string, string[]>;
  fonte: Record<string, string>;
  /** Alias degli id usati da sidebar/vista Executive (es. "DPI_Norm_D5" -> "DPI_Norm"). */
  alias?: Record<string, string>;
  /**
   * Indici con DATI MOCK-UP (fonte non ancora collegata): letti da executiveData,
   * mostrati con disclaimer. Devono comparire anche in sintetici/intermedi.
   */
  mock?: string[];
  /** Indici ritirati (stato_score = excluded): nascosti anche in Vista Executive. */
  ritirati?: string[];
  /** Raggruppamento opzionale degli intermedi (una griglia da 3 per gruppo). */
  gruppiIntermedi?: { titolo: string; codici: string[] }[];
  /** Passaggi extra (Parte 2) calcolati nel frontend dalle righe della risposta. */
  extraScoreSteps?: Record<
    string,
    (rows: Map<string, ExecScoreRow>, fmt: (n: number | null | undefined, d?: number) => string) => ScoreStep[]
  >;
}

export const EXEC_SCORE_PILLARS: Record<string, ExecScorePillarConfig> = {
  D2: {
    pillar: "D2",
    label: "Programmazione fabbisogno",
    description: "Governo strategico del fabbisogno, dotazione organica e pianificazione triennale",
    color: "hsl(var(--chart-blue))",
    sintetici: ["IGF"],
    intermedi: ["IRS", "IDP_Norm", "PTI", "IRG_Norm"],
    componenti: { IGF: ["IRS", "IDP_Norm", "PTI", "IRG_Norm"] },
    fonte: {
      IGF: "Fonte: Conto Annuale · Indice composito D2",
      IRS: "Fonte: Conto Annuale · Saldi occupazionali per categoria",
      IDP_Norm: "Fonte: Conto Annuale · Saldi e composizione dell'organico",
      PTI: "Fonte: Conto Annuale · Assunzioni e lavoro flessibile",
      IRG_Norm: "Fonte: Conto Annuale · Assunzioni e personale 60+",
    },
    extraScoreSteps: {
      IGF: (rows, fmt) => {
        const s = (k: string) => rows.get(k)?.score ?? null;
        const sIrs = s("IRS");
        const sIdp = s("IDP_Norm");
        if (sIrs == null || sIdp == null) return [];
        return [
          {
            label: "Blocco strutturale (score IRS + score IDP_Norm) / 2",
            value: fmt((sIrs + sIdp) / 2, 1),
          },
        ];
      },
    },
  },
  D4: {
    pillar: "D4",
    label: "Sviluppo professionale",
    description: "Copertura formativa, competenze digitali, efficacia Syllabus e diversificazione percorsi",
    color: "hsl(var(--chart-orange))",
    sintetici: ["CGC", "ISCP", "IESF"],
    intermedi: ["ICF_Norm", "DPI_Norm", "CQT", "ISTP_Norm", "IDFP", "ICRP", "IEF_Norm", "ICQ", "ICEC"],
    gruppiIntermedi: [
      { titolo: "Componenti CGC · Gestione delle competenze", codici: ["ICF_Norm", "DPI_Norm", "CQT"] },
      { titolo: "Componenti ISCP · Minerva", codici: ["ISTP_Norm", "IDFP", "ICRP"] },
      { titolo: "Componenti IESF · Syllabus", codici: ["IEF_Norm", "ICQ", "ICEC"] },
    ],
    componenti: {
      CGC: ["ICF_Norm", "DPI_Norm", "CQT"],
      ISCP: ["ISTP_Norm", "IDFP", "ICRP"],
      IESF: ["IEF_Norm", "ICQ", "ICEC"],
    },
    mock: ["ISCP", "IESF", "ISTP_Norm", "IDFP", "ICRP", "IEF_Norm", "ICQ", "ICEC"],
    alias: { TCF: "ICF_Norm" },
    ritirati: ["IFM_Norm"],
    fonte: {
      CGC: "Fonte: Conto Annuale · Indice composito D4",
      ICF_Norm: "Fonte: Conto Annuale · Giornate di formazione",
      DPI_Norm: "Fonte: Conto Annuale · Passaggi orizzontali e verticali",
      CQT: "Fonte: Conto Annuale · Titoli di studio e categorie",
    },
  },
  D5: {
    pillar: "D5",
    label: "Rewarding e carriera",
    description: "Dinamicità delle progressioni di carriera e crescita stipendiale",
    color: "hsl(var(--chart-purple))",
    sintetici: ["IDC"],
    intermedi: ["DPI_Norm", "ICS_Norm"],
    componenti: { IDC: ["DPI_Norm", "ICS_Norm"] },
    alias: { DPI_Norm_D5: "DPI_Norm" },
    fonte: {
      IDC: "Fonte: Conto Annuale · Indice composito D5",
      DPI_Norm: "Fonte: Conto Annuale · Passaggi orizzontali e verticali",
      ICS_Norm: "Fonte: Conto Annuale · Personale per categoria",
    },
  },
  D6: {
    pillar: "D6",
    label: "Capacity building e performance",
    description: "Efficienza organizzativa, ricambio generazionale, parità di genere e flessibilità del lavoro",
    color: "hsl(var(--chart-red))",
    sintetici: [],
    intermedi: ["TVO", "ISG", "TEP", "IQP", "IEQ", "IPD", "TEPD", "VQF", "IRG", "RTG", "RRG", "IRIC", "IFL", "TFL", "IDLA", "TDLA"],
    gruppiIntermedi: [
      { titolo: "Organico e ricambio generazionale", codici: ["TVO", "ISG", "TEP"] },
      { titolo: "Qualificazione del personale", codici: ["IQP", "IEQ"] },
      { titolo: "Parità ed equilibrio di genere", codici: ["IPD", "TEPD", "VQF", "IRG", "RTG", "RRG", "IRIC"] },
      { titolo: "Flessibilità e lavoro agile", codici: ["IFL", "TFL", "IDLA", "TDLA"] },
    ],
    componenti: {},
    alias: { IRG_genere: "IRG" },
    fonte: {
      TVO: "Fonte: Conto Annuale · Consistenza del personale",
      ISG: "Fonte: Conto Annuale · Personale per fasce di età",
      TEP: "Fonte: Conto Annuale · Personale per fasce di età",
      IQP: "Fonte: Conto Annuale · Personale per titolo di studio",
      IEQ: "Fonte: Conto Annuale · Personale per titolo di studio",
      IPD: "Fonte: Conto Annuale · Dirigenza per genere",
      TEPD: "Fonte: Conto Annuale · Dirigenza per genere",
      VQF: "Fonte: Conto Annuale · Personale per genere",
      IRG: "Fonte: Conto Annuale · Assunzioni per genere",
      RTG: "Fonte: Conto Annuale · Cessazioni per genere",
      RRG: "Fonte: Conto Annuale · Assunzioni e cessazioni per genere",
      IRIC: "Fonte: Conto Annuale · Assunzioni e cessazioni per genere",
      IFL: "Fonte: Conto Annuale · Lavoro flessibile",
      TFL: "Fonte: Conto Annuale · Lavoro flessibile",
      IDLA: "Fonte: Conto Annuale · Lavoro agile",
      TDLA: "Fonte: Conto Annuale · Lavoro agile",
    },
  },
};

/** Codice RPC dell'indice a partire dall'id usato in sidebar / Executive. */
export const resolveExecCode = (pillar: string, id?: string | null) =>
  id ? (EXEC_SCORE_PILLARS[pillar]?.alias?.[id] ?? id) : id ?? undefined;

/** Badge da lk_intervalli_badge (usato solo per i dati mock-up, l'API restituisce gia il badge). */
export const badgeFromScore = (score: number) =>
  score < 25 ? "Basso" : score < 50 ? "Moderato" : score < 75 ? "Buono" : "Eccellente";

export const isExecScorePillar = (pillar?: string) => !!pillar && pillar in EXEC_SCORE_PILLARS;

/* ── Badge (lk_intervalli_badge): Basso <25 · Moderato <50 · Buono <75 · Eccellente ── */
export const BADGE_COLORS: Record<string, string> = {
  Basso: "hsl(var(--destructive))",
  Moderato: "hsl(var(--chart-orange))",
  Buono: "hsl(var(--chart-green))",
  Eccellente: "hsl(var(--chart-teal))",
};
export const badgeColor = (badge?: string | null) =>
  (badge && BADGE_COLORS[badge]) || "hsl(var(--muted-foreground))";

/* ── Formattazione numeri (it-IT), null -> 0 ── */
export const fmtNum = (n: number | null | undefined, decimals = 2) => {
  const v = n ?? 0;
  if (Number.isInteger(v) && Math.abs(v) >= 1) return v.toLocaleString("it-IT");
  return v.toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: decimals });
};
export const fmtIndex = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtScore = (n: number | null | undefined) => String(Math.round(n ?? 0));
