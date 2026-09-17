/**
 * Risoluzione denominazioni ente a partire dal CODICE FISCALE.
 * Usato per mostrare il nome dell'ente all'utente HR (claim `enti_cf`).
 * Fonte: vista public.dw_ente (campo cfiscale -> denominazione).
 */
import { sbUntyped } from "@/integrations/supabase/untyped";

export async function fetchEntiDenominazioni(
  cfs: string[],
): Promise<Record<string, string>> {
  const list = cfs.map((c) => c.trim()).filter(Boolean);
  if (!list.length) return {};
  const { data, error } = await sbUntyped
    .from("dw_ente")
    .select("cfiscale, denominazione")
    .in("cfiscale", list);
  if (error) throw error;
  const map: Record<string, string> = {};
  (data ?? []).forEach((r) => {
    const row = r as Record<string, unknown>;
    if (row.cfiscale) map[String(row.cfiscale)] = String(row.denominazione ?? row.cfiscale);
  });
  return map;
}
