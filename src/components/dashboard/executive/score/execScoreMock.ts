/**
 * Adattatore DATI MOCK-UP -> ExecScoreRow.
 * Per gli indici la cui fonte non e ancora collegata (es. D4: Minerva / Syllabus),
 * la mappatura Excel prevede di mantenere i valori dimostrativi con disclaimer.
 * I valori sono letti da executiveData (statici) e convertiti nello stesso
 * formato della RPC, cosi la card resta identica a quella dei dati reali.
 */
import type { ExecScoreRow } from "@/services/exec/execScoreService";
import type { ExecutiveIndex } from "../ExecutiveKpiCards";
import { executiveIndicesStatic } from "../executiveData";
import { badgeFromScore, fmtIndex } from "./execScoreConfig";

export function mockRowFromStatic(idx: ExecutiveIndex, anno: number): ExecScoreRow {
  const score = Math.round((idx.value ?? 0) * 100);
  const varScore = Math.round(((idx.value ?? 0) - (idx.prev ?? 0)) * 100);
  const fb = idx.formulaBreakdown;
  return {
    anno,
    id: `${idx.pillar}.${idx.id}`,
    nome: idx.label.replace(/\n/g, " "),
    descrizione: idx.metodologia?.definizione ?? null,
    formula: idx.formula,
    interpretazione: idx.metodologia?.interpretazione ?? null,
    dominio: "[0;1]",
    unita: "indice",
    valore: idx.value,
    var_anno_prec: (idx.value ?? 0) - (idx.prev ?? 0),
    componente_1: fb?.numeratorLabel ?? null,
    valore_1: fb?.numeratorValue ?? null,
    anno_1: null,
    componente_2: fb?.denominatorLabel ?? null,
    valore_2: fb?.denominatorValue ?? null,
    anno_2: null,
    formula_con_numeri: fb?.resultText ?? null,
    interconnessioni: (idx.interconnections?.connections ?? []).map((c) => c.pillar),
    dettagli: null,
    score,
    var_score: varScore,
    stato_score: "mock",
    famiglia_score: "Dati dimostrativi",
    soglia_score: null,
    unita_soglia: null,
    descrizione_score: "Dati dimostrativi (mock-up): score = valore × 100",
    formula_score: `${fmtIndex(idx.value)} × 100 = ${score}`,
    badge: badgeFromScore(score),
  };
}

/** Righe mock-up del pillar per i codici indicati. */
export function mockRows(pillar: string, codici: string[], anno: number): ExecScoreRow[] {
  return codici
    .map((c) => executiveIndicesStatic.find((i) => i.pillar === pillar && i.id === c))
    .filter((i): i is ExecutiveIndex => !!i)
    .map((i) => mockRowFromStatic(i, anno));
}
