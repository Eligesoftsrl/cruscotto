/**
 * Hook centralizzato per il calcolo dei 41 KPI della Riforma PA
 * secondo la metodologia ufficiale del documento "Proposta analisi fonte KPI".
 *
 * Scoring ufficiale:
 * - Binari (Sì/No): 0% o 100%
 * - Quantitativi: valore percentuale effettivo
 * - Success Rate: media aritmetica semplice dei KPI della dimensione
 * - Indici compositi (CGC, PSFL, GR, IVCU): scala 0-4
 */

export interface KpiRow {
  codice: string;
  nome: string;
  dimensione: string;
  tipo: "binario" | "quantitativo";
  categoria: "abilitante" | "successo" | "strutturale";
  valore: number; // 0-100 percentuale
  valoreRaw?: number; // valore assoluto (numeratore)
  denominatore?: number;
}

export interface DimensionScore {
  dim: string;
  label: string;
  srTotale: number;
  srAbilitanti: number;
  srSuccesso: number;
  kpis: KpiRow[];
}

export interface CompositeIndex {
  codice: string;
  nome: string;
  valore: number; // 0-4
  componenti: { codice: string; contributo: number }[];
}

const toNum = (v: string | null | undefined) => {
  if (!v) return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

const boolScore = (v: string | null | undefined): number => (v === "Sì" ? 100 : 0);

const pctSafe = (num: number, den: number): number =>
  den > 0 ? Math.min(100, Math.round((num / den) * 100)) : 0;

/**
 * Estrae tutti i 41 KPI da un record di dw_kpi_rilevazione
 */
export function extractAllKpis(row: any): KpiRow[] {
  const tep = toNum(row.q6_tep_personale) || 1;
  const profiliTot = toNum(row.q1_profili_totali) || 1;
  const concorsiTot = toNum(row.q3_concorsi_totali) || 1;
  const assunzioniProg = toNum(row.q2_3_assunzioni_prog) || 1;
  const assunzioniTot = toNum(row.q2_assunzioni_totali) || 1;
  const assuntiTi = toNum(row.q2_2_assunti_ti) || 1;
  const percorsiTot = toNum(row.q4_percorsi_totali) || 1;
  const processiTot = toNum(row.q6_processi_totali) || 1;
  const totDonne = toNum(row.q6_totale_donne) || 1;
  const totDirigenti = toNum(row.q6_totale_dirigenti) || 1;
  const organico = toNum(row.q6_organico_medio) || tep;
  const swHrTot = toNum(row.q6_sw_hr_totali) || 1;
  const piOrg = toNum(row.q6_pianta_organica_nondir) || 1;
  const piDir = toNum(row.q6_pianta_organica_dir) || 1;
  const ggTotali = toNum(row.q6_18_gg_totali) || 1;
  const entrati = toNum(row.q6_entrati) || 0;
  const usciti = toNum(row.q6_usciti) || 0;
  const dipFlessibili = toNum(row.q6_dip_flessibili) || 0;

  const tiDirD = toNum(row.q6_4_ti_dir_donne);
  const tiDirU = toNum(row.q6_4_ti_dir_uomini);
  const tiNonDirD = toNum(row.q6_4_ti_nondir_donne);
  const tiNonDirU = toNum(row.q6_4_ti_nondir_uomini);
  const tiTot = tiDirD + tiDirU + tiNonDirD + tiNonDirU || 1;

  const agileD = toNum(row.q6_16_donne_agile);
  const agileU = toNum(row.q6_16_uomini_agile);
  const agileTot = agileD + agileU;

  return [
    // D1 – Modello organizzativo
    {
      codice: "D1.1",
      nome: "Sistema profili competency based",
      dimensione: "D1",
      tipo: "binario",
      categoria: "abilitante",
      valore: boolScore(row.q1_1_adozione_modello === "Formalmente" ? "Sì" : null),
    },
    {
      codice: "D1.2",
      nome: "Library dei processi",
      dimensione: "D1",
      tipo: "binario",
      categoria: "abilitante",
      valore: boolScore(row.q1_2_library_processi),
    },
    {
      codice: "D1.3",
      nome: "Dizionario competenze",
      dimensione: "D1",
      tipo: "binario",
      categoria: "abilitante",
      valore: boolScore(row.q1_3_dizionario_competenze === "Sì" ? "Sì" : null),
    },
    {
      codice: "D1.4",
      nome: "% profili associati a SP CB",
      dimensione: "D1",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(toNum(row.q1_5_n_profili_definiti), profiliTot),
      valoreRaw: toNum(row.q1_5_n_profili_definiti),
      denominatore: profiliTot,
    },
    {
      codice: "D1.5",
      nome: "% profili con dizionario competenze",
      dimensione: "D1",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(toNum(row.q1_6_n_profili_competenze), profiliTot),
      valoreRaw: toNum(row.q1_6_n_profili_competenze),
      denominatore: profiliTot,
    },

    // D2 – Programmazione fabbisogno
    {
      codice: "D2.1",
      nome: "% assunzioni da turnover",
      dimensione: "D2",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(toNum(row.q2_1_assunzioni_turnover), assunzioniProg),
      valoreRaw: toNum(row.q2_1_assunzioni_turnover),
      denominatore: assunzioniProg,
    },
    {
      codice: "D2.2",
      nome: "% profili EQ/EP assunti",
      dimensione: "D2",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(toNum(row.q2_2_eq_ep_assunti), assuntiTi),
      valoreRaw: toNum(row.q2_2_eq_ep_assunti),
      denominatore: assuntiTi,
    },
    {
      codice: "D2.3",
      nome: "Assessment competenze (triennio)",
      dimensione: "D2",
      tipo: "binario",
      categoria: "abilitante",
      valore: boolScore(row.q2_5_assessment),
    },
    {
      codice: "D2.4",
      nome: "% assunzioni turnover su totale",
      dimensione: "D2",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(toNum(row.q2_4_assunzioni_turnover_tot), assunzioniTot),
      valoreRaw: toNum(row.q2_4_assunzioni_turnover_tot),
      denominatore: assunzioniTot,
    },
    {
      codice: "D2.5",
      nome: "% assunzioni tot. su programmate",
      dimensione: "D2",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(toNum(row.q2_5_assunzioni_su_prog), assunzioniProg),
      valoreRaw: toNum(row.q2_5_assunzioni_su_prog),
      denominatore: assunzioniProg,
    },

    // D3 – Recruiting
    {
      codice: "D3.1",
      nome: "% concorsi con competenze trasversali",
      dimensione: "D3",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(toNum(row.q3_1_concorsi_comp_trasv), concorsiTot),
      valoreRaw: toNum(row.q3_1_concorsi_comp_trasv),
      denominatore: concorsiTot,
    },
    {
      codice: "D3.2",
      nome: "On-boarding strutturato",
      dimensione: "D3",
      tipo: "binario",
      categoria: "abilitante",
      valore: boolScore(row.q3_2_onboarding),
    },
    {
      codice: "D3.3",
      nome: "Apprendistato attivo",
      dimensione: "D3",
      tipo: "binario",
      categoria: "abilitante",
      valore: boolScore(row.q3_3_apprendistato),
    },
    {
      codice: "D3.4",
      nome: "% concorsi con profili CB",
      dimensione: "D3",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(toNum(row.q3_4_concorsi_profili_cb), concorsiTot),
      valoreRaw: toNum(row.q3_4_concorsi_profili_cb),
      denominatore: concorsiTot,
    },
    {
      codice: "D3.5",
      nome: "% concorsi con dizionario competenze",
      dimensione: "D3",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(toNum(row.q3_5_concorsi_dizionario), concorsiTot),
      valoreRaw: toNum(row.q3_5_concorsi_dizionario),
      denominatore: concorsiTot,
    },
    {
      codice: "D3.6",
      nome: "% personale assunto <35 anni",
      dimensione: "D3",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(toNum(row.q2_1_assunti_under35), assuntiTi),
      valoreRaw: toNum(row.q2_1_assunti_under35),
      denominatore: assuntiTi,
    },

    // D4 – Sviluppo professionale
    {
      codice: "D4.1",
      nome: "Rilevazione fabbisogni post gap",
      dimensione: "D4",
      tipo: "binario",
      categoria: "abilitante",
      valore: boolScore(row.q4_1_rilevazione_gap),
    },
    {
      codice: "D4.2",
      nome: "% formazione competenze trasversali",
      dimensione: "D4",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(
        row.q4_2_formazione_trasv === "Sì"
          ? percorsiTot
          : row.q4_2_formazione_trasv === "Parzialmente"
            ? Math.round(percorsiTot * 0.5)
            : 0,
        percorsiTot,
      ),
    },

    // D5 – Rewarding e carriera
    {
      codice: "D5.1",
      nome: "Integrazione performance e SP CB",
      dimensione: "D5",
      tipo: "binario",
      categoria: "abilitante",
      valore: boolScore(row.q5_1_integrazione_performance),
    },
    {
      codice: "D5.2",
      nome: "Incentivazione non monetaria",
      dimensione: "D5",
      tipo: "binario",
      categoria: "abilitante",
      valore: boolScore(row.q5_2_incentivazione_non_mon),
    },
    {
      codice: "D5.3",
      nome: "Convenzioni con università",
      dimensione: "D5",
      tipo: "binario",
      categoria: "abilitante",
      valore: boolScore(row.q5_3_convenzioni_universita),
    },

    // D6 – Capacity building (20 KPI)
    {
      codice: "D6.1",
      nome: "% processi semplificati/digitalizzati",
      dimensione: "D6",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(toNum(row.q6_1_processi_semplificati), processiTot),
      valoreRaw: toNum(row.q6_1_processi_semplificati),
      denominatore: processiTot,
    },
    {
      codice: "D6.2",
      nome: "Composizione per genere (donne)",
      dimensione: "D6",
      tipo: "quantitativo",
      categoria: "strutturale",
      valore: pctSafe(toNum(row.q6_totale_donne), tep),
    },
    {
      codice: "D6.3",
      nome: "Dirigenti",
      dimensione: "D6",
      tipo: "quantitativo",
      categoria: "strutturale",
      valore: pctSafe(toNum(row.q6_3_dirigente), tep),
    },
    {
      codice: "D6.4",
      nome: "% posti vacanti non dirigente",
      dimensione: "D6",
      tipo: "quantitativo",
      categoria: "strutturale",
      valore: pctSafe(toNum(row.q6_4_posti_vacanti_nondir), piOrg),
    },
    {
      codice: "D6.5",
      nome: "% posti vacanti dirigente",
      dimensione: "D6",
      tipo: "quantitativo",
      categoria: "strutturale",
      valore: pctSafe(toNum(row.q6_5_posti_vacanti_dir), piDir),
    },
    {
      codice: "D6.6",
      nome: "Tasso turnover complessivo",
      dimensione: "D6",
      tipo: "quantitativo",
      categoria: "successo",
      valore: organico > 0 ? Math.min(100, Math.round(((entrati + usciti) / organico) * 100)) : 0,
    },
    {
      codice: "D6.7",
      nome: "Progressioni orizzontali",
      dimensione: "D6",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(toNum(row.q6_14_progressioni_oriz), tep),
    },
    {
      codice: "D6.8",
      nome: "Progressioni verticali",
      dimensione: "D6",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(toNum(row.q6_14_progressioni_vert), tep),
    },
    {
      codice: "D6.9",
      nome: "% lavoro flessibile",
      dimensione: "D6",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(dipFlessibili, tep),
    },
    {
      codice: "D6.10",
      nome: "% giornate lavoro agile",
      dimensione: "D6",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(toNum(row.q6_17_gg_agile_donne), ggTotali),
    },
    {
      codice: "D6.11",
      nome: "% risorse in lavoro agile",
      dimensione: "D6",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(agileTot, tiTot),
    },
    {
      codice: "D6.12",
      nome: "% donne in lavoro agile",
      dimensione: "D6",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(agileD, totDonne),
    },
    {
      codice: "D6.13",
      nome: "Innovazione tecnologica HR",
      dimensione: "D6",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(toNum(row.q6_13_sw_hr_nuovi), swHrTot),
    },
    {
      codice: "D6.14",
      nome: "% personale <35 anni",
      dimensione: "D6",
      tipo: "quantitativo",
      categoria: "strutturale",
      valore: pctSafe(toNum(row.q6_6_under35), tep),
    },
    {
      codice: "D6.15",
      nome: "% EQ-EP <35 anni",
      dimensione: "D6",
      tipo: "quantitativo",
      categoria: "strutturale",
      valore: pctSafe(toNum(row.q6_15_eq_ep_under35), toNum(row.q6_7_eq_ep) || 1),
    },
    {
      codice: "D6.16",
      nome: "% mobilità OUT",
      dimensione: "D6",
      tipo: "quantitativo",
      categoria: "strutturale",
      valore: pctSafe(toNum(row.q6_16_mobilita_out), tep),
    },
    {
      codice: "D6.17",
      nome: "% mobilità IN",
      dimensione: "D6",
      tipo: "quantitativo",
      categoria: "strutturale",
      valore: pctSafe(toNum(row.q6_17_mobilita_in), tep),
    },
    {
      codice: "D6.18",
      nome: "% donne dirigenti",
      dimensione: "D6",
      tipo: "quantitativo",
      categoria: "strutturale",
      valore: pctSafe(toNum(row.q6_18_donne_dirigenti), totDirigenti),
    },
    {
      codice: "D6.19",
      nome: "Strumenti ICT collaboration",
      dimensione: "D6",
      tipo: "binario",
      categoria: "abilitante",
      valore: boolScore(row.q6_19_strumenti_ict),
    },
    {
      codice: "D6.20",
      nome: "% mobilità volontaria",
      dimensione: "D6",
      tipo: "quantitativo",
      categoria: "successo",
      valore: pctSafe(toNum(row.q6_20_entrati_mobilita), entrati || 1),
    },
  ];
}

const DIM_LABELS: Record<string, string> = {
  D1: "D1 – Modello organizzativo",
  D2: "D2 – Programmazione fabbisogno",
  D3: "D3 – Recruiting",
  D4: "D4 – Sviluppo professionale",
  D5: "D5 – Rewarding e carriera",
  D6: "D6 – Capacity building",
};

/**
 * Calcola i dimension scores aggregati su più entità
 */
export function computeDimensionScores(rows: any[]): DimensionScore[] {
  const allKpis = rows.flatMap((r) => extractAllKpis(r));

  const byDim: Record<string, KpiRow[]> = {};
  allKpis.forEach((k) => {
    if (!byDim[k.dimensione]) byDim[k.dimensione] = [];
    byDim[k.dimensione].push(k);
  });

  return Object.entries(byDim)
    .map(([dim, kpis]) => {
      const abl = kpis.filter((k) => k.categoria === "abilitante");
      const succ = kpis.filter((k) => k.categoria === "successo");
      const avg = (arr: KpiRow[]) =>
        arr.length ? Math.round(arr.reduce((s, k) => s + k.valore, 0) / arr.length) : 0;

      return {
        dim,
        label: DIM_LABELS[dim] || dim,
        srTotale: avg(kpis.filter((k) => k.categoria !== "strutturale")),
        srAbilitanti: avg(abl),
        srSuccesso: avg(succ),
        kpis,
      };
    })
    .sort((a, b) => a.dim.localeCompare(b.dim));
}

/**
 * Calcola i 4 indici compositi secondo la metodologia ufficiale
 */
export function computeCompositeIndices(row: any): CompositeIndex[] {
  const kpis = extractAllKpis(row);
  const get = (codice: string) => kpis.find((k) => k.codice === codice)?.valore ?? 0;

  // CGC: D1.1 + D1.2 + D1.3 + D2.3 (tutti binari 0/1)
  const cgcComps = ["D1.1", "D1.2", "D1.3", "D2.3"];
  const cgc = cgcComps.reduce((s, c) => s + (get(c) === 100 ? 1 : 0), 0);

  // PSFL: D2.3 (abilitante) + (100%-D2.1 bucket) + D3.4 bucket
  const d21inv = 100 - get("D2.1");
  const d21bucket = d21inv <= 25 ? 2 : d21inv <= 50 ? 1 : 0;
  const d34bucket = get("D3.4") >= 66 ? 2 : get("D3.4") >= 33 ? 1 : 0;
  const psfl = (get("D2.3") === 100 ? 1 : 0) + d21bucket + d34bucket;

  // GR: S_GR = D3.1 + D3.2 (abilitante ≥1) + D3.4 bucket
  const sgr = (get("D3.2") === 100 ? 1 : 0) + (get("D3.3") === 100 ? 1 : 0);
  const grAbl = sgr >= 1 ? 1 : 0;
  const grD34 = get("D3.4") >= 66 ? 2 : get("D3.4") >= 33 ? 1 : 0;
  const gr = grAbl + grD34 + (get("D3.1") >= 50 ? 1 : 0);

  // IVCU: S_IVCU = D5.1 + D5.2 (abilitante ≥1) + D4.2 + D6.7 + D6.8 (vs mediana)
  const sivcu = (get("D5.1") === 100 ? 1 : 0) + (get("D5.2") === 100 ? 1 : 0);
  const ivcuAbl = sivcu >= 1 ? 1 : 0;
  const ivcuD42 = get("D4.2") >= 50 ? 1 : 0;
  const ivcuProg = get("D6.7") + get("D6.8") >= 10 ? 1 : 0;
  const ivcu = ivcuAbl + ivcuD42 + ivcuProg + (get("D5.3") === 100 ? 1 : 0);

  return [
    {
      codice: "CGC",
      nome: "Capacità Gestione Competenze",
      valore: Math.min(4, cgc),
      componenti: cgcComps.map((c) => ({ codice: c, contributo: get(c) === 100 ? 1 : 0 })),
    },
    {
      codice: "PSFL",
      nome: "Planning Strategico Forza Lavoro",
      valore: Math.min(4, psfl),
      componenti: [
        { codice: "D2.3", contributo: get("D2.3") === 100 ? 1 : 0 },
        { codice: "D2.1", contributo: d21bucket },
        { codice: "D3.4", contributo: d34bucket },
      ],
    },
    {
      codice: "GR",
      nome: "Gestione Recruiting",
      valore: Math.min(4, gr),
      componenti: [
        { codice: "S_GR", contributo: grAbl },
        { codice: "D3.4", contributo: grD34 },
        { codice: "D3.1", contributo: get("D3.1") >= 50 ? 1 : 0 },
      ],
    },
    {
      codice: "IVCU",
      nome: "Valorizzazione Capitale Umano",
      valore: Math.min(4, ivcu),
      componenti: [
        { codice: "S_IVCU", contributo: ivcuAbl },
        { codice: "D4.2", contributo: ivcuD42 },
        { codice: "D6.7+D6.8", contributo: ivcuProg },
        { codice: "D5.3", contributo: get("D5.3") === 100 ? 1 : 0 },
      ],
    },
  ];
}
