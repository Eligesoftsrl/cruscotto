import { supabase } from "@/integrations/supabase/client";
import { applyEnteFilter } from "@/services/dw/enteService";

/** Occupazione (dw_occupazione) filtrata per ente sulla colonna "istituzione". */
export async function fetchLpOccupazione(enteIds: number[] | null | undefined): Promise<any[]> {
  const q = applyEnteFilter(supabase.from("dw_occupazione").select("*"), enteIds, "istituzione");
  const { data } = await q;
  return data ?? [];
}

/** Dotazione organica PTFP (dw_ptfp_dotazione), non filtrata per ente. */
export async function fetchLpDotazione(): Promise<any[]> {
  const { data } = await supabase.from("dw_ptfp_dotazione").select("*");
  return data ?? [];
}
