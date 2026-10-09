/**
 * Parte 2 della "Scomposizione formula": passaggi di normalizzazione dello score
 * per famiglia di scala (campo famiglia_score della RPC).
 *
 * I passaggi seguono le mappature Excel (foglio "Scomposizione formula",
 * colonna "Espressione nel frontend"). Il valore finale dello score e SEMPRE
 * quello restituito dall'API (formula_score / score): i passaggi qui servono
 * solo a renderlo leggibile.
 *
 * Famiglie gestite:
 *  - Diretto [0;1] / Diretto centrato           -> score = indice × 100
 *  - Target sul valore grezzo / Target su quota -> valore (c1/c2) + target
 *  - Regola condivisa con D4 (DPI_Norm)        -> valore (c1/c2) + target
 *  - Variazione centrata                        -> variazione (+ equivalente annuo TVO, o media annua) + ampiezza
 *  - Variazione centrata inversa                -> variazione triennale, media annua, ampiezza
 *  - Progresso verso l'ottimo                   -> variazione triennale, media annua, ampiezza
 *  - Inverso [0;1] / Inverso non limitato       -> valore (c1/c2)
 *  - Inverso con soglia                         -> valore (c1/c2) + soglia
 *  - Ottimo centrale a 1                        -> valore + reciproco 1/valore
 *  - Rapporto centrato a 1                      -> valore + scarto (valore − 1) + ampiezza
 *  - Ottimo a 0                                 -> valore + |valore|
 *  - Composito orientato                        -> score dei componenti (+ passaggi extra del pillar)
 */
import type { ExecScoreRow } from "@/services/exec/execScoreService";
import { fmtNum, fmtScore, type ExecScorePillarConfig, type ScoreStep } from "./execScoreConfig";

const soglia = (r: ExecScoreRow) =>
  r.soglia_score == null ? "—" : `${fmtNum(r.soglia_score, 3)}${r.unita_soglia ? ` ${r.unita_soglia}` : ""}`;

const rapporto = (r: ExecScoreRow) =>
  r.valore_1 != null && r.valore_2 ? fmtNum(r.valore_1 / r.valore_2, 3) : fmtNum(r.valore, 3);

export function normalizationSteps(
  code: string,
  row: ExecScoreRow | undefined,
  rows: Map<string, ExecScoreRow>,
  config: ExecScorePillarConfig,
): ScoreStep[] {
  if (!row) return [];
  const steps: ScoreStep[] = [];
  const fam = (row.famiglia_score ?? "").trim();
  const f = fam.toLowerCase();
  const desc = (row.descrizione_score ?? "").toLowerCase();
  const v = row.valore ?? 0;
  const componenti = config.componenti[code] ?? [];

  if (row.descrizione_score || fam) steps.push({ label: "Famiglia di scala", value: row.descrizione_score || fam });

  if (componenti.length > 0 || f.startsWith("composito")) {
    componenti.forEach((c) => steps.push({ label: `Score ${c}`, value: fmtScore(rows.get(c)?.score) }));
    (config.extraScoreSteps?.[code]?.(rows, fmtNum) ?? []).forEach((s) => steps.push(s));
  } else if (f === "variazione centrata inversa" || f === "progresso verso l'ottimo") {
    steps.push({ label: `Variazione triennale ${code}`, value: fmtNum(v, 3) });
    steps.push({ label: "Media annua = variazione / 3", value: fmtNum(v / 3, 4) });
    steps.push({ label: "Ampiezza", value: soglia(row) });
  } else if (f === "variazione centrata") {
    if (desc.includes("equivalente annuo")) {
      // TVO: variazione triennale convertita in equivalente annuo centrato
      const rr = Math.cbrt((2 + v) / (2 - v));
      steps.push({ label: `Variazione triennale ${code}`, value: fmtNum(v, 3) });
      steps.push({ label: `r = ((2 + ${code}) / (2 − ${code}))^(1/3)`, value: fmtNum(rr, 4) });
      steps.push({ label: "Variazione annua equivalente 2(r − 1)/(r + 1)", value: fmtNum((2 * (rr - 1)) / (rr + 1), 4) });
    } else if (desc.includes("media annua")) {
      steps.push({ label: `Variazione triennale ${code}`, value: fmtNum(v, 3) });
      steps.push({ label: "Media annua = variazione / 3", value: fmtNum(v / 3, 4) });
    } else {
      steps.push({ label: `Variazione ${code}`, value: fmtNum(v, 3) });
    }
    steps.push({ label: "Ampiezza", value: soglia(row) });
  } else if (f.startsWith("inverso con soglia")) {
    steps.push({ label: `Valore ${code} (componente 1 / componente 2)`, value: rapporto(row) });
    steps.push({ label: "Soglia", value: soglia(row) });
  } else if (f.startsWith("inverso")) {
    steps.push({ label: `Valore ${code} (componente 1 / componente 2)`, value: rapporto(row) });
  } else if (f === "ottimo centrale a 1") {
    steps.push({ label: `Valore ${code}`, value: fmtNum(v, 3) });
    steps.push({ label: `Reciproco 1 / ${code}`, value: v ? fmtNum(1 / v, 3) : "—" });
  } else if (f === "rapporto centrato a 1") {
    steps.push({ label: `Valore ${code}`, value: fmtNum(v, 3) });
    steps.push({ label: `Scarto dalla parità ${code} − 1`, value: fmtNum(v - 1, 3) });
    steps.push({ label: "Ampiezza", value: soglia(row) });
  } else if (f === "ottimo a 0") {
    steps.push({ label: `Valore ${code}`, value: fmtNum(v, 3) });
    steps.push({ label: `Distanza dalla neutralità |${code}|`, value: fmtNum(Math.abs(v), 3) });
  } else if (f.includes("target") || row.soglia_score != null) {
    // Target sul valore grezzo / Target su quota / Regola condivisa con D4
    steps.push({ label: `Valore ${code} (componente 1 / componente 2)`, value: rapporto(row) });
    steps.push({ label: "Target", value: soglia(row) });
  } else if (f.startsWith("diretto")) {
    steps.push({ label: "Normalizzazione", value: `Non necessaria: score = ${code} × 100` });
  }

  if (row.formula_score) steps.push({ label: "Calcolo score", value: row.formula_score });
  return steps;
}
