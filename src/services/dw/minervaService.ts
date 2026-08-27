import { supabase } from "@/integrations/supabase/client";
import { applyEnteFilter } from "@/services/dw/enteService";

/** Bridge profilo-competenza (dw_bridge_profilo_competenza) filtrato per ente. */
export async function fetchBridgeProfiloCompetenza(
  enteIds: number[] | null | undefined,
): Promise<any[]> {
  const q = applyEnteFilter(supabase.from("dw_bridge_profilo_competenza").select("*"), enteIds);
  const { data } = await q;
  return data ?? [];
}

/** Profili di ruolo (dw_profilo_di_ruolo). */
export async function fetchProfiliDiRuolo(): Promise<any[]> {
  const { data } = await supabase.from("dw_profilo_di_ruolo").select("*");
  return data ?? [];
}

/** Competenze (dw_competenza). */
export async function fetchCompetenze(): Promise<any[]> {
  const { data } = await supabase.from("dw_competenza").select("*");
  return data ?? [];
}

/** Famiglie professionali (dw_famiglia_professionale). */
export async function fetchFamiglieProfessionali(): Promise<any[]> {
  const { data } = await supabase.from("dw_famiglia_professionale").select("*");
  return data ?? [];
}

/** Assessment Minerva (dw_minerva_assessment) filtrato per ente su "id_ente". */
export async function fetchMinervaAssessment(enteIds: number[] | null | undefined): Promise<any[]> {
  const q = applyEnteFilter(supabase.from("dw_minerva_assessment").select("*"), enteIds, "id_ente");
  const { data } = await q;
  return data ?? [];
}

/** Denominazioni enti (dw_ente: id_ente, denominazione). */
export async function fetchEntiDenominazioni(): Promise<any[]> {
  const { data } = await supabase.from("dw_ente").select("id_ente,denominazione");
  return data ?? [];
}

/** Reclutamento PTFP (dw_ptfp_reclutamento). */
export async function fetchPtfpReclutamento(): Promise<any[]> {
  const { data } = await supabase.from("dw_ptfp_reclutamento").select("*");
  return data ?? [];
}
