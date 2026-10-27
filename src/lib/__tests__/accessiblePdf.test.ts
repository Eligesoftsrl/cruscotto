/// <reference types="node" />
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import PDFDocument from "pdfkit";
import { buildAccessiblePdf, type PdfKitCtor } from "@/lib/accessiblePdf";

const font = (w: number) =>
  readFileSync(`node_modules/@fontsource/titillium-web/files/titillium-web-latin-${w}-normal.woff`);

/** Testo del PDF con gli stream decompressi (per cercare la struttura). */
function pdfText(bytes: Uint8Array): string {
  const buf = Buffer.from(bytes);
  let out = buf.toString("latin1");
  const re = /stream\r?\n/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(out))) {
    const start = m.index + m[0].length;
    const end = buf.indexOf("endstream", start);
    try {
      out += inflateSync(buf.subarray(start, end)).toString("latin1");
    } catch {
      /* stream non compresso */
    }
  }
  return out;
}

describe("PDF accessibile (PDF/UA)", () => {
  it("è taggato, in italiano, con titolo, intestazioni di tabella e font incorporato", async () => {
    const bytes = await buildAccessiblePdf({
      title: "Personale per genere & età",
      tables: [
        {
          title: "Dettaglio 2024",
          headers: ["Ente", "Uomini", "Donne", "Quota"],
          rows: [
            ["Comune di Roma — Dipartimento", 1200, 1350, "52,9%"],
            ["Regione Lazio", 800, 950, "54,3%"],
          ],
        },
      ],
      fonts: { regular: font(400), bold: font(700) },
      PDFDocument: PDFDocument as unknown as PdfKitCtor,
    });
    if (process.env.PDF_OUT) (await import("node:fs")).writeFileSync(process.env.PDF_OUT, bytes);
    const s = pdfText(bytes);
    expect(s.startsWith("%PDF-1.7")).toBe(true);
    expect(s).toContain("/MarkInfo");
    expect(s).toMatch(/\/Marked true/);
    expect(s).toContain("/StructTreeRoot");
    expect(s).toMatch(/\/Lang \(it-IT\)/);
    expect(s).toMatch(/\/DisplayDocTitle true/);
    expect(s).toContain("pdfuaid:part>1<");
    for (const tag of ["/Document", "/H1", "/H2", "/Table", "/TR", "/TH", "/TD"]) {
      expect(s).toContain(`/S ${tag}`);
    }
    expect(s).toMatch(/\/Scope \/Column/);
    expect(s).toMatch(/\/Scope \/Row/);
    expect(s).toContain("/FontFile2");
    // titolo nei metadati senza caratteri che rompono l'XML
    expect(s).toContain("Personale per genere e età");
  });
});

describe("PDF accessibile su più pagine", () => {
  it("tabella lunga: struttura continua su tutte le pagine", async () => {
    const rows = Array.from({ length: 150 }, (_, i) => [`Ente ${i + 1}`, i * 3, `${i},5%`]);
    const bytes = await buildAccessiblePdf({
      title: "Elenco enti",
      tables: [{ title: "Elenco enti", headers: ["Ente", "Valore", "Quota"], rows }],
      fonts: { regular: font(400), bold: font(700) },
      PDFDocument: PDFDocument as unknown as PdfKitCtor,
    });
    if (process.env.PDF_OUT2) (await import("node:fs")).writeFileSync(process.env.PDF_OUT2, bytes);
    const s = pdfText(bytes);
    expect((s.match(/\/Type \/Page\b/g) ?? []).length).toBeGreaterThan(1);
    expect((s.match(/\/S \/TR/g) ?? []).length).toBe(151);
  });
});
