import { supabase } from "@/integrations/supabase/client";
import { applyEnteFilter } from "@/services/dw/enteService";

/** Rilevazione KPI (dw_kpi_rilevazione) filtrata per ente. */
export async function fetchKpiRilevazione(enteIds: number[] | null | undefined): Promise<any[]> {
  const q = applyEnteFilter(supabase.from("dw_kpi_rilevazione").select("*"), enteIds);
  const { data } = await q;
  return data ?? [];
}
