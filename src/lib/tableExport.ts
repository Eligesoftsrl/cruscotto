/**
 * Utility di esportazione dati tabellari in CSV, Excel (.xlsx) e PDF.
 *
 * Le librerie pesanti (xlsx, pdfkit) sono caricate con import DINAMICO, così da
 * non appesantire il bundle iniziale: vengono scaricate solo al primo export.
 *
 * Due modalità d'uso:
 *  - DATA-DRIVEN: si passano direttamente headers + rows (valori "puliti").
 *  - DOM-BASED: si estrae il contenuto da una <table> renderizzata
 *    (extractTable / extractTablesIn), utile per le molte tabelle "ad hoc"
 *    delle schede Conto Annuale / SIPrO.
 */

export interface ExportTable {
  /** Titolo della tabella (nome foglio Excel / intestazione PDF). */
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export type ExportFormat = "csv" | "xlsx" | "pdf";

// ---------------------------------------------------------------------------
// Estrazione dal DOM
// ---------------------------------------------------------------------------
const cleanText = (el: Element | null): string =>
  (el?.textContent ?? "").replace(/\s+/g, " ").trim();

/** Estrae intestazioni e righe (incluso l'eventuale tfoot) da una <table>. */
export function extractTable(tableEl: HTMLTableElement, title: string): ExportTable {
  // Intestazioni: ultima riga di <thead> (o prima riga con <th>).
  let headers: string[] = [];
  const thead = tableEl.querySelector("thead");
  if (thead) {
    const headRows = Array.from(thead.querySelectorAll("tr"));
    const lastHeadRow = headRows[headRows.length - 1];
    if (lastHeadRow) headers = Array.from(lastHeadRow.querySelectorAll("th,td")).map(cleanText);
  }

  const bodyRows: (string | number)[][] = [];
  const pushRow = (tr: HTMLTableRowElement) => {
    const cells = Array.from(tr.querySelectorAll("th,td")).map(cleanText);
    if (cells.some((c) => c !== "")) bodyRows.push(cells);
  };
  tableEl.querySelectorAll("tbody tr").forEach((tr) => pushRow(tr as HTMLTableRowElement));
  tableEl.querySelectorAll("tfoot tr").forEach((tr) => pushRow(tr as HTMLTableRowElement));

  if (!headers.length && bodyRows.length) {
    // Nessun thead esplicito: usa la prima riga come intestazione.
    headers = bodyRows.shift()!.map(String);
  }
  return { title, headers, rows: bodyRows };
}

/** Estrae tutte le <table> contenute in un elemento. */
export function extractTablesIn(container: HTMLElement, baseTitle: string): ExportTable[] {
  const tables = Array.from(container.querySelectorAll("table")) as HTMLTableElement[];
  return tables
    .map((t, i) => extractTable(t, tables.length > 1 ? `${baseTitle} (${i + 1})` : baseTitle))
    .filter((t) => t.rows.length > 0);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const stamp = () => new Date().toISOString().slice(0, 10);

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const sanitize = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 60) || "export";

// ---------------------------------------------------------------------------
// CSV (separatore ";" + BOM -> compatibile con Excel italiano)
// ---------------------------------------------------------------------------
/**
 * Cella CSV sicura: neutralizza la «formula injection» (=, +, -, @, tab, a capo iniziali
 * verrebbero eseguiti come formule da Excel/Sheets) senza alterare i numeri negativi.
 */
export function csvCell(v: string | number | null | undefined): string {
  let s = String(v ?? "");
  const isNumber = typeof v === "number" || /^-?\d+([.,]\d+)?%?$/.test(s.trim());
  if (!isNumber && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

export function exportCSV(tables: ExportTable[], filename: string) {
  const esc = csvCell;
  const blocks = tables.map((t) => {
    const lines: string[] = [];
    if (tables.length > 1) lines.push(esc(t.title));
    lines.push(t.headers.map(esc).join(";"));
    t.rows.forEach((r) => lines.push(r.map(esc).join(";")));
    return lines.join("\n");
  });
  const csv = "\uFEFF" + blocks.join("\n\n");
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${sanitize(filename)}_${stamp()}.csv`);
}

// ---------------------------------------------------------------------------
// Excel (.xlsx) — un foglio per tabella
// ---------------------------------------------------------------------------
export async function exportExcel(tables: ExportTable[], filename: string) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const used = new Set<string>();
  tables.forEach((t, i) => {
    const aoa = [t.headers, ...t.rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    // Larghezza colonne basata sul contenuto.
    ws["!cols"] = t.headers.map((h, c) => {
      const maxLen = Math.max(
        String(h).length,
        ...t.rows.map((r) => String(r[c] ?? "").length),
      );
      return { wch: Math.min(Math.max(maxLen + 2, 8), 60) };
    });
    const name = sanitize(t.title).slice(0, 28) || `Foglio${i + 1}`;
    let n = name;
    let k = 1;
    while (used.has(n)) n = `${name}_${k++}`.slice(0, 31);
    used.add(n);
    XLSX.utils.book_append_sheet(wb, ws, n);
  });
  // Accessibilità: titolo e autore del file (letti da Excel e dai lettori di schermo).
  wb.Props = { Title: tables[0]?.title || filename, Author: "Cruscotto HR", Subject: filename };
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  triggerDownload(
    new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `${sanitize(filename)}_${stamp()}.xlsx`,
  );
}

// ---------------------------------------------------------------------------
// PDF accessibile (PDF/UA «taggato») — PDFKit, caricato solo al primo export
// ---------------------------------------------------------------------------
async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font non disponibile (${res.status})`);
  return res.arrayBuffer();
}

export async function exportPDF(tables: ExportTable[], filename: string, docTitle?: string) {
  const [{ buildAccessiblePdf }, pdfkit, regularUrl, boldUrl] = await Promise.all([
    import("@/lib/accessiblePdf"),
    import("pdfkit/js/pdfkit.standalone.js"),
    import("@fontsource/titillium-web/files/titillium-web-latin-400-normal.woff?url"),
    import("@fontsource/titillium-web/files/titillium-web-latin-700-normal.woff?url"),
  ]);
  const [regular, bold] = await Promise.all([loadFont(regularUrl.default), loadFont(boldUrl.default)]);
  const PDFDocument = (pdfkit.default ?? pdfkit) as unknown as import("@/lib/accessiblePdf").PdfKitCtor;
  const bytes = await buildAccessiblePdf({
    title: docTitle || tables[0]?.title || filename,
    tables,
    fonts: { regular, bold },
    PDFDocument,
  });
  triggerDownload(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${sanitize(filename)}_${stamp()}.pdf`);
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------
export async function exportTables(format: ExportFormat, tables: ExportTable[], filename: string, docTitle?: string) {
  if (!tables.length || tables.every((t) => t.rows.length === 0)) return;
  if (format === "csv") return exportCSV(tables, filename);
  if (format === "xlsx") return exportExcel(tables, filename);
  return exportPDF(tables, filename, docTitle);
}
