import { useEffect, useRef } from "react";
import { ND_PLACEHOLDER_ENABLED } from "@/config/ndMode";

/**
 * NdMode — stato "placeholder" per le sezioni le cui fonti dati NON sono ancora
 * disponibili (indicazione committente): la struttura/layout di ogni scheda resta
 * INVARIATA (comportamento mock iniziale), ma:
 *  - i valori numerici delle card KPI vengono mostrati come "N/D";
 *  - i grafici vengono svuotati (serie nascoste via CSS: restano assi e griglia).
 *
 * Implementazione volutamente NON invasiva: non modifica i ~25 componenti mock.
 * Applica una maschera solo al sottoalbero marcato `.nd-mode`. La sostituzione del
 * testo KPI usa un MutationObserver (idempotente, si auto-ripristina ai re-render)
 * ed e circoscritta ai numeri "grandi" delle card (elementi foglia text-2xl/3xl bold).
 */
const KPI_SELECTOR =
  ".text-2xl.font-bold, .text-3xl.font-bold, .text-xl.font-bold, .font-tableau-number";

export const NdMode = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ND_PLACEHOLDER_ENABLED) return;
    const root = ref.current;
    if (!root) return;
    let raf = 0;

    const apply = () => {
      const nodes = root.querySelectorAll<HTMLElement>(KPI_SELECTOR);
      nodes.forEach((el) => {
        // solo elementi "foglia" (nessun figlio): sono i numeri KPI, non i contenitori dei grafici
        if (el.childElementCount !== 0) return;
        const t = (el.textContent ?? "").trim();
        // riapplica anche dopo i re-render di React (che riscrivono il numero)
        if (t !== "" && t !== "N/D") el.textContent = "N/D";
      });
    };

    const obs = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    });
    obs.observe(root, { childList: true, subtree: true, characterData: true });
    apply();

    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  // Interruttore spento: pass-through, le sezioni mostrano i dati normalmente.
  if (!ND_PLACEHOLDER_ENABLED) return <>{children}</>;

  return (
    <div ref={ref} className="nd-mode">
      <div className="flex items-center gap-2 px-4 py-1.5 text-[11px] font-medium text-amber-800 bg-amber-50 border-b border-amber-200">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
        Dati non disponibili — sezione in attesa delle fonti dati (valori mostrati come N/D)
      </div>
      {children}
    </div>
  );
};
