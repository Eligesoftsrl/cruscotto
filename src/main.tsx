import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initCacheBusting } from "./lib/cacheBusting";

// Prima del render: attiva la protezione anti-cache (chunk stantii dopo nuova build).
initCacheBusting();

createRoot(document.getElementById("root")!).render(<App />);
