/**
 * Catalogo degli INDICI della Vista Sintetica (pillar con score [0-100]) gestibili
 * dal Pannello Admin (attiva / disattiva) e tracciati in «Schede più consultate».
 *
 * Ogni indice e collegato:
 *  - a `sidebarId`: l'ID usato dalla sidebar e dalla URL `?indicator=...`
 *    (puo differire dal codice RPC, es. TCF -> ICF_Norm, DPI_Norm_D5 -> DPI_Norm)
 *  - a `flagKey`: feature flag `exec_<pillar>_<codice>` (tabella feature_flags)
 *
 * Indice disattivato:
 *  - sparisce dalla sidebar, dalla Vista Sintetica (card + panoramica) e dalla Vista Executive;
 *  - con link diretto si vede l'avviso "Indice disattivato".
 */
import { EXEC_SCORE_PILLARS } from "@/components/dashboard/executive/score/execScoreConfig";

export interface ExecIndiceDef {
  pillar: string;
  /** Codice indice nella RPC (es. "ICF_Norm"). */
  code: string;
  /** ID usato in sidebar / URL (es. "TCF"). */
  sidebarId: string;
  flagKey: string;
  /** Etichetta univoca (usata anche dal tracker di utilizzo). */
  label: string;
  description: string;
  mock: boolean;
  sintetico: boolean;
}

/** Nomi brevi degli indici (dalle RPC fa_ca_exec_<dx>_indicatori_score). */
const NOMI: Record<string, string> = {
  "D2.IGF": "Governo strategico del fabbisogno",
  "D2.IRS": "Replica strutturale",
  "D2.IDP_Norm": "Direzione della progressività",
  "D2.PTI": "Peso del tempo indeterminato",
  "D2.IRG_Norm": "Ricambio generazionale",
  "D5.IDC": "Dinamicità della carriera interna",
  "D5.DPI_Norm": "Dinamicità del personale interna",
  "D5.ICS_Norm": "Crescita strutturale",
  "D4.CGC": "Gestione delle competenze",
  "D4.ICF_Norm": "Intensità formativa",
  "D4.DPI_Norm": "Dinamicità del personale interna",
  "D4.CQT": "Coerenza qualifiche e titoli",
  "D4.ISCP": "Sviluppo capitale professionale",
  "D4.ISTP_Norm": "Sviluppo tecnico-professionale",
  "D4.IDFP": "Diversificazione famiglie professionali",
  "D4.ICRP": "Copertura ruoli professionali",
  "D4.IESF": "Efficacia sviluppo formativo",
  "D4.IEF_Norm": "Efficacia formativa",
  "D4.ICQ": "Completamento qualificato",
  "D4.ICEC": "Coerenza evolutiva competenze",
  "D6.TVO": "Variazione dell'organico",
  "D6.ISG": "Squilibrio generazionale",
  "D6.TEP": "Esposizione al pensionamento",
  "D6.IQP": "Qualificazione del personale",
  "D6.IEQ": "Evoluzione della qualificazione",
  "D6.IPD": "Parità dirigenziale",
  "D6.TEPD": "Equilibrio di genere nella dirigenza",
  "D6.VQF": "Variazione quota femminile",
  "D6.IRG": "Riequilibrio di genere nel ricambio",
  "D6.RTG": "Tassi di cessazione per genere",
  "D6.RRG": "Ricambio per genere",
  "D6.IRIC": "Dinamica di genere del ricambio",
  "D6.IFL": "Flessibilità del lavoro",
  "D6.TFL": "Incidenza del lavoro flessibile",
  "D6.IDLA": "Diffusione del lavoro agile",
  "D6.TDLA": "Evoluzione del lavoro agile",
};

/** Ordine di presentazione dei pillar nel Pannello Admin. */
export const EXEC_ADMIN_PILLARS = ["D2", "D4", "D5", "D6"].filter((p) => p in EXEC_SCORE_PILLARS);

export const execFlagKey = (pillar: string, code: string) =>
  `exec_${pillar}_${code}`.toLowerCase().replace(/[^a-z0-9_]/g, "_");

export const EXEC_INDICI: ExecIndiceDef[] = EXEC_ADMIN_PILLARS.flatMap((p) => {
  const cfg = EXEC_SCORE_PILLARS[p];
  const inverseAlias = Object.fromEntries(Object.entries(cfg.alias ?? {}).map(([k, v]) => [v, k]));
  return [...cfg.sintetici, ...cfg.intermedi].map((code) => {
    const mock = !!cfg.mock?.includes(code);
    const sintetico = cfg.sintetici.includes(code);
    const nome = NOMI[`${p}.${code}`] ?? code;
    return {
      pillar: p,
      code,
      sidebarId: inverseAlias[code] ?? code,
      flagKey: execFlagKey(p, code),
      label: `${p} · ${code} — ${nome}`,
      description: `${sintetico ? "Indice di sintesi" : "Indice intermedio"}${mock ? " · dati mock-up" : ""} · ${cfg.label}`,
      mock,
      sintetico,
    };
  });
});

/** flagKey per (pillar, codice RPC). */
export const EXEC_FLAG_BY_CODE: Record<string, string> = Object.fromEntries(
  EXEC_INDICI.map((i) => [`${i.pillar}.${i.code}`, i.flagKey]),
);

/** flagKey per (pillar, ID sidebar). */
export const EXEC_FLAG_BY_SIDEBAR: Record<string, string> = Object.fromEntries(
  EXEC_INDICI.map((i) => [`${i.pillar}.${i.sidebarId}`, i.flagKey]),
);

/** Etichetta (tracker) per (pillar, codice RPC). */
export const EXEC_LABEL_BY_CODE: Record<string, string> = Object.fromEntries(
  EXEC_INDICI.map((i) => [`${i.pillar}.${i.code}`, i.label]),
);
