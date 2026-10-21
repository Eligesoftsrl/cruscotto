import { createRoot } from "react-dom/client";
import App from "./App.tsx";
// Font Titillium Web self-hosted (nessuna richiesta esterna -> nessun blocco CSP)
import "@fontsource/titillium-web/200.css";
import "@fontsource/titillium-web/300.css";
import "@fontsource/titillium-web/400.css";
import "@fontsource/titillium-web/400-italic.css";
import "@fontsource/titillium-web/600.css";
import "@fontsource/titillium-web/700.css";
import "@fontsource/titillium-web/900.css";
import "./index.css";
import { initCacheBusting } from "./lib/cacheBusting";

// Prima del render: attiva la protezione anti-cache (chunk stantii dopo nuova build).
initCacheBusting();

// Accessibilità: con «riduci movimento» attivo si spengono anche le animazioni dei grafici
// (import dinamico: la libreria dei grafici non entra nel pacchetto iniziale).
if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
  void import("./lib/a11y/reducedMotion").then((m) => m.applyReducedMotionToCharts());
}

createRoot(document.getElementById("root")!).render(<App />);
