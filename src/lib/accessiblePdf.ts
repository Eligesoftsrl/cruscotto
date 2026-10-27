/**
 * PDF accessibile (PDF/UA, «taggato») per le esportazioni tabellari.
 *
 * Generato con PDFKit nel browser: struttura logica (Documento → titolo H1/H2 → Tabella →
 * righe TR → celle TH/TD con ambito colonna/riga), lingua italiana, titolo del documento
 * mostrato dal lettore PDF, font incorporato (Titillium Web, lo stesso del Cruscotto),
 * metadati XMP con identificativo PDF/UA. I lettori di schermo leggono la tabella con le
 * intestazioni corrette e nell'ordine giusto.
 */
import type { ExportTable } from "@/lib/tableExport";

export interface AccessiblePdfInput {
  title: string;
  tables: ExportTable[];
  /** Font regular e bold (TTF/OTF/WOFF). */
  fonts: { regular: ArrayBuffer | Uint8Array; bold: ArrayBuffer | Uint8Array };
  /** Costruttore PDFKit (iniettato: nel browser la build standalone, nei test quella Node). */
  PDFDocument: PdfKitCtor;
}

/* Tipi minimi dell'API PDFKit usata qui. */
interface PdfStruct {
  end(): void;
}
interface PdfDoc {
  registerFont(name: string, src: unknown): PdfDoc;
  font(name: string): PdfDoc;
  fontSize(n: number): PdfDoc;
  fillColor(c: string): PdfDoc;
  text(t: string, opts?: Record<string, unknown>): PdfDoc;
  moveDown(n?: number): PdfDoc;
  addPage(): PdfDoc;
  struct(type: string, opts?: Record<string, unknown>, children?: unknown[]): PdfStruct;
  addStructure(s: PdfStruct): PdfDoc;
  table(opts: Record<string, unknown>): PdfDoc;
  on(ev: "data", cb: (chunk: Uint8Array) => void): PdfDoc;
  on(ev: "end", cb: () => void): PdfDoc;
  end(): void;
  x: number;
  y: number;
}
export type PdfKitCtor = new (opts: Record<string, unknown>) => PdfDoc;

const BLUE = "#113d6e";
const ZEBRA = "#f4f7fa";
const BORDER = "#c8d0da";
const TEXT = "#1f2933";

/** Testo sicuro per i metadati (PDFKit li scrive anche in XML senza escape). */
const metaText = (s: string) => s.replace(/&/g, "e").replace(/[<>"]/g, " ").replace(/\s+/g, " ").trim();

const isNumericLike = (v: string | number) =>
  typeof v === "number" || /^[-+]?\d[\d.]*(,\d+)?\s?%?$/.test(String(v).trim());

/** La prima colonna è un'intestazione di riga se contiene etichette (non numeri). */
const firstColumnIsLabel = (t: ExportTable) =>
  t.rows.length > 0 && t.rows.every((r) => r[0] != null && String(r[0]).trim() !== "" && !isNumericLike(r[0]));

const toBytes = (b: ArrayBuffer | Uint8Array) => (b instanceof Uint8Array ? b : new Uint8Array(b));

/** Genera il PDF accessibile e restituisce i byte. */
export function buildAccessiblePdf({ title, tables, fonts, PDFDocument }: AccessiblePdfInput): Promise<Uint8Array> {
  const maxCols = Math.max(1, ...tables.map((t) => t.headers.length));
  const docTitle = metaText(title) || "Esportazione Cruscotto HR";
  const shownTitle = title.trim() || docTitle;
  const doc = new PDFDocument({
    size: "A4",
    layout: maxCols > 5 ? "landscape" : "portrait",
    margin: 32,
    pdfVersion: "1.7",
    subset: "PDF/UA",
    tagged: true,
    lang: "it-IT",
    displayTitle: true,
    info: {
      Title: docTitle,
      Author: "Cruscotto HR",
      Creator: "Cruscotto HR",
      Subject: metaText(tables.map((t) => t.title).filter(Boolean).join(" - ")) || docTitle,
      Keywords: "Cruscotto HR, esportazione dati",
    },
  });

  const chunks: Uint8Array[] = [];
  const done = new Promise<Uint8Array>((resolve) => {
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => {
      const size = chunks.reduce((s, c) => s + c.length, 0);
      const out = new Uint8Array(size);
      let off = 0;
      for (const c of chunks) {
        out.set(c, off);
        off += c.length;
      }
      resolve(out);
    });
  });

  doc.registerFont("Regular", toBytes(fonts.regular));
  doc.registerFont("Bold", toBytes(fonts.bold));

  const root = doc.struct("Document");
  doc.addStructure(root);

  tables.forEach((t, i) => {
    if (i > 0) doc.addPage();
    doc.font("Bold").fontSize(14).fillColor(BLUE).text(shownTitle, { structParent: root, structType: "H1" });
    if (t.title && t.title.trim() !== shownTitle) {
      doc.font("Bold").fontSize(11).fillColor(TEXT).text(t.title, { structParent: root, structType: "H2" });
    }
    doc.moveDown(0.5);

    const rowHeader = firstColumnIsLabel(t);
    const header = t.headers.map((h) => ({ text: h || " ", type: "TH", scope: "column" }));
    const body = t.rows.map((r) =>
      t.headers.map((_, ci) => {
        const v = r[ci] ?? "";
        const text = (typeof v === "number" ? v.toLocaleString("it-IT", { maximumFractionDigits: 2 }) : String(v)) || " ";
        const align = { x: ci > 0 && isNumericLike(v) ? "right" : "left", y: "top" };
        return ci === 0 && rowHeader ? { text, type: "TH", scope: "row", align } : { text, align };
      }),
    );

    doc.font("Regular").fontSize(8).fillColor(TEXT);
    doc.table({
      structParent: root,
      defaultStyle: { font: { src: "Regular", size: 8 }, padding: 3, border: 0.5, borderColor: BORDER, textColor: TEXT },
      rowStyles: (ri: number) => {
        if (ri === 0) return { backgroundColor: BLUE, textColor: "#ffffff", font: { src: "Bold", size: 8 } };
        const body = { font: { src: "Regular", size: 8 }, textColor: TEXT };
        return ri % 2 === 0 ? { ...body, backgroundColor: ZEBRA } : body;
      },
      data: [header, ...body],
    });
  });

  root.end();
  doc.end();
  return done;
}
