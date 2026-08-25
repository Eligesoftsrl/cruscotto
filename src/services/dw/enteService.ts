import { supabase } from "@/integrations/supabase/client";

export interface EnteFilterParams {
  isEnteHr: boolean;
  enteId?: number | null;
  comparto: string;
  regione: string;
  dimensione_pa: string;
}

/**
 * Restituisce la lista di id_ente che soddisfano i filtri correnti.
 * `null` significa "tutti gli enti" (nessun filtro necessario).
 */
export async function fetchFilteredEnteIds(params: EnteFilterParams): Promise<number[] | null> {
  const { isEnteHr, enteId, comparto, regione, dimensione_pa } = params;

  if (isEnteHr && enteId) {
    return [enteId];
  }

  const hasActiveFilter = comparto !== "Tutti" || regione !== "Tutte" || dimensione_pa !== "Tutte";
  if (!hasActiveFilter) return null;

  let q = supabase.from("dw_ente").select("id_ente");
  if (comparto !== "Tutti") q = q.eq("comparto", comparto);
  if (regione !== "Tutte") q = q.eq("regione", regione);
  if (dimensione_pa !== "Tutte") q = q.eq("categoria_cruscotto", dimensione_pa);

  const { data } = await q;
  return (data ?? []).map((e) => e.id_ente);
}

/** Valori distinti (comparto/regione/dimensione) da dw_ente per i filtri globali. */
export async function fetchEnteFilterOptions(): Promise<{ comparti: string[]; regioni: string[]; dimensioni: string[] }> {
  const [cRes, rRes, dRes] = await Promise.all([
    supabase.from("dw_ente").select("comparto").not("comparto", "is", null),
    supabase.from("dw_ente").select("regione").not("regione", "is", null),
    supabase.from("dw_ente").select("categoria_cruscotto").not("categoria_cruscotto", "is", null),
  ]);
  const uniq = (rows: any[] | null, key: string) =>
    [...new Set((rows ?? []).map((r) => r[key]).filter(Boolean) as string[])].sort();
  return {
    comparti: uniq(cRes.data, "comparto"),
    regioni: uniq(rRes.data, "regione"),
    dimensioni: uniq(dRes.data, "categoria_cruscotto"),
  };
}

/** Valori distinti di una colonna da lk_enti (ordinati e deduplicati). */
export async function fetchLkEntiDistinct(column: "comparto" | "regione"): Promise<string[]> {
  const { data } = await supabase.from("lk_enti").select(column).not(column, "is", null).order(column);
  return [...new Set((data ?? []).map((r: any) => r[column]).filter(Boolean))] as string[];
}

/**
 * Helper puro: applica il filtro per ente_id a un query builder Supabase.
 * Se enteIds e null -> nessun filtro. Se array vuoto -> nessun risultato.
 */
export function applyEnteFilter(
  query: any,
  enteIds: number[] | null | undefined,
  column = "id_ente",
): any {
  if (enteIds === null || enteIds === undefined) return query;
  if (enteIds.length === 0) return query.eq(column, -1);
  if (enteIds.length === 1) return query.eq(column, enteIds[0]);
  return query.in(column, enteIds);
}
