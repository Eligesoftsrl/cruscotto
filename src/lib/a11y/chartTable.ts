/**
 * Accessibilità · alternativa testuale dei grafici (WCAG 1.1.1, 1.3.1 — AGID).
 *
 * Ricava una tabella dati dagli stessi elementi Recharts che disegnano il grafico
 * (dati del grafico, serie Bar/Line/Area/Radar, Pie, Scatter, asse delle categorie),
 * così ogni grafico ha la sua tabella equivalente senza duplicare i dati a mano.
 */
import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from "react";
import { Area, Bar, Line, Pie, PolarAngleAxis, Radar, Scatter, XAxis, YAxis } from "recharts";

export interface ChartTable {
  /** Intestazioni di colonna (la prima è l'intestazione delle righe). */
  columns: string[];
  /** Righe formattate per la lettura: la prima cella è l'intestazione di riga. */
  rows: string[][];
  /** Stesse righe con i numeri non formattati (per l'esportazione in Excel). */
  raw: (string | number)[][];
}

/** Valore per l'esportazione: numeri come numeri, il resto come testo formattato. */
export function rawCell(v: unknown): string | number {
  return typeof v === "number" && Number.isFinite(v) ? v : formatCell(v);
}

/** Costruisce la tabella a partire dalle righe grezze. */
function build(columns: string[], raw: (string | number)[][]): ChartTable | null {
  if (!raw.length) return null;
  return { columns, raw, rows: raw.map((r) => r.map(formatCell)) };
}

type AnyProps = Record<string, unknown>;
type El = ReactElement<AnyProps>;
type Row = Record<string, unknown>;

const SERIES_TYPES: unknown[] = [Bar, Line, Area, Radar];

/** Appiattisce figli, frammenti e array in una lista di elementi. */
function flatten(node: ReactNode): El[] {
  const out: El[] = [];
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return;
    const el = child as El;
    if (el.type === Fragment) out.push(...flatten(el.props.children as ReactNode));
    else out.push(el);
  });
  return out;
}

/** Valore di una riga anche per chiavi annidate ("a.b"). */
function getValue(row: Row, key: string): unknown {
  if (key in row) return row[key];
  return key.split(".").reduce<unknown>((acc, k) => (acc && typeof acc === "object" ? (acc as Row)[k] : undefined), row);
}

/** Formato italiano per le celle. */
export function formatCell(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") {
    return Number.isFinite(v) ? v.toLocaleString("it-IT", { maximumFractionDigits: 2 }) : "—";
  }
  if (Array.isArray(v)) return v.map(formatCell).join(" – ");
  if (typeof v === "object") return "—";
  return String(v);
}

const asString = (v: unknown): string | undefined => (typeof v === "string" && v ? v : undefined);

/** Etichetta leggibile di un asse (name o label testuale). */
function axisLabel(axis: El | undefined, fallback: string): string {
  if (!axis) return fallback;
  const label = axis.props.label;
  const labelValue = label && typeof label === "object" ? (label as AnyProps).value : label;
  return asString(axis.props.name) ?? asString(labelValue) ?? fallback;
}

function pieTable(pies: El[]): ChartTable | null {
  const multi = pies.length > 1;
  const raw: (string | number)[][] = [];
  for (const pie of pies) {
    const data = (pie.props.data as Row[] | undefined) ?? [];
    const nameKey = asString(pie.props.nameKey) ?? "name";
    const dataKey = asString(pie.props.dataKey) ?? "value";
    const total = data.reduce((s, d) => s + (Number(getValue(d, dataKey)) || 0), 0);
    for (const d of data) {
      const value = Number(getValue(d, dataKey)) || 0;
      const pct = total ? `${formatCell(Math.round((value / total) * 1000) / 10)}%` : "—";
      const head = formatCell(getValue(d, nameKey));
      const cells = [rawCell(getValue(d, dataKey)), pct];
      raw.push(multi ? [`${asString(pie.props.name) ?? "Serie"} · ${head}`, ...cells] : [head, ...cells]);
    }
  }
  return build(["Voce", "Valore", "Quota"], raw);
}

function scatterTable(scatters: El[], xAxis?: El, yAxis?: El): ChartTable | null {
  const xKey = asString(xAxis?.props.dataKey) ?? "x";
  const yKey = asString(yAxis?.props.dataKey) ?? "y";
  const raw: (string | number)[][] = [];
  for (const sc of scatters) {
    const data = (sc.props.data as Row[] | undefined) ?? [];
    const name = asString(sc.props.name) ?? "Serie";
    data.forEach((d, i) => {
      const label = asString(d.name) ?? asString(d.label) ?? `${name} ${i + 1}`;
      raw.push([label, rawCell(getValue(d, xKey)), rawCell(getValue(d, yKey))]);
    });
  }
  return build(["Punto", axisLabel(xAxis, xKey), axisLabel(yAxis, yKey)], raw);
}

/** Asse delle categorie: Y per i grafici orizzontali, angolare per i radar, altrimenti X. */
function categoryAxis(chart: El, els: El[]): El | undefined {
  const find = (t: unknown) => els.find((e) => e.type === t && asString(e.props.dataKey));
  if (chart.props.layout === "vertical") return find(YAxis);
  return find(PolarAngleAxis) ?? find(XAxis) ?? find(YAxis);
}

/**
 * Tabella equivalente al grafico. `chart` è l'elemento grafico Recharts
 * (BarChart, LineChart, PieChart, ...). Restituisce null se non ci sono dati.
 */
export function extractChartTable(chart: ReactNode): ChartTable | null {
  const root = flatten(chart)[0];
  if (!root) return null;
  const els = flatten(root.props.children as ReactNode);

  const pies = els.filter((e) => e.type === Pie);
  if (pies.length) return pieTable(pies);

  const scatters = els.filter((e) => e.type === Scatter);
  if (scatters.length) return scatterTable(scatters, els.find((e) => e.type === XAxis), els.find((e) => e.type === YAxis));

  const data = (root.props.data as Row[] | undefined) ?? [];
  if (!data.length) return null;

  const axis = categoryAxis(root, els);
  const series = els
    .filter((e) => SERIES_TYPES.includes(e.type) && asString(e.props.dataKey) && !e.props.hide)
    .map((e) => ({ key: e.props.dataKey as string, name: asString(e.props.name) ?? (e.props.dataKey as string) }));

  const firstKeys = Object.keys(data[0]);
  const catKey =
    asString(axis?.props.dataKey) ??
    firstKeys.find((k) => typeof data[0][k] === "string" && !series.some((s) => s.key === k));
  const seriesList = series.length
    ? series
    : firstKeys.filter((k) => k !== catKey && typeof data[0][k] === "number").map((k) => ({ key: k, name: k }));
  if (!seriesList.length) return null;

  const columns = [axisLabel(axis, "Categoria"), ...seriesList.map((s) => s.name)];
  const raw = data.map((d, i) => [
    catKey ? formatCell(getValue(d, catKey)) : String(i + 1),
    ...seriesList.map((s) => rawCell(getValue(d, s.key))),
  ]);
  return build(columns, raw);
}
