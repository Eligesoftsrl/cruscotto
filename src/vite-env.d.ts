/// <reference types="vite/client" />

/** Build id iniettato a build-time da Vite (vedi vite.config.ts). Usato per il cache-busting. */
declare const __APP_BUILD_ID__: string;

/** Build browser di PDFKit (UMD): esporta il costruttore PDFDocument. */
declare module "pdfkit/js/pdfkit.standalone.js" {
  const PDFDocument: unknown;
  export default PDFDocument;
}
