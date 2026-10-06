/**
 * Registry di esportazione "full-data".
 *
 * Le viste con tabelle PAGINATE lato server (es. molte schede SIPrO) non hanno
 * in memoria l'intero dataset: registrano qui un provider asincrono che recupera
 * TUTTE le righe (chiamando il service con un limite alto) e le restituisce già
 * mappate in ExportTable. Il pulsante "Esporta" (in OperationalContent) usa il
 * provider registrato quando presente; altrimenti ricade sull'estrazione dal DOM
 * (sufficiente per le tabelle interamente renderizzate lato client).
 */
import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import type { ExportTable } from "@/lib/tableExport";

export type ExportProvider = () => Promise<ExportTable[]>;

let provider: ExportProvider | null = null;
const listeners = new Set<() => void>();

export function setExportProvider(p: ExportProvider | null) {
  provider = p;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return provider;
}

/** Hook: restituisce il provider corrente (o null). */
export function useExportProvider(): ExportProvider | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Hook per le viste: registra un provider full-data e lo rimuove allo smontaggio.
 * `deps` deve includere lo scope/filtri così il provider resta aggiornato.
 */
export function useRegisterExport(build: ExportProvider, deps: unknown[]) {
  useEffect(() => {
    setExportProvider(build);
    return () => setExportProvider(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
