import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { APP_BUILD_ID, fetchLatestBuildId } from "@/lib/cacheBusting";

/**
 * Banner discreto che compare quando sul server è disponibile una build più
 * recente di quella in esecuzione (confronto con /version.json).
 * Consente all'utente di ricaricare per ottenere l'ultima versione.
 */
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // ogni 5 minuti

export const UpdateBanner = () => {
  const [outdated, setOutdated] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // In sviluppo (nessun build id reale) il banner resta disattivato.
    if (APP_BUILD_ID === "dev") return;

    let active = true;
    const check = async () => {
      const latest = await fetchLatestBuildId();
      if (active && latest && latest !== APP_BUILD_ID) setOutdated(true);
    };

    check();
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);
    const timer = window.setInterval(check, CHECK_INTERVAL_MS);
    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
      window.clearInterval(timer);
    };
  }, []);

  if (!outdated || dismissed) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-4 z-[100] flex justify-center px-4 pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border bg-card/95 px-4 py-2.5 shadow-lg backdrop-blur animate-in fade-in-0 slide-in-from-bottom-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
        </span>
        <span className="text-sm font-medium text-foreground">
          Nuova versione disponibile
        </span>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Ricarica
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Chiudi avviso"
          className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
