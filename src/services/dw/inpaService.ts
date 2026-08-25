import { supabase } from "@/integrations/supabase/client";
import { applyEnteFilter } from "@/services/dw/enteService";

/** Bandi INPA filtrati per ente. `select` opzionale (default "*"). */
export async function fetchInpaBandi(enteIds: number[] | null | undefined, select = "*"): Promise<any[]> {
  const q = applyEnteFilter(supabase.from("dw_inpa_bandi").select(select), enteIds);
  const { data } = await q;
  return data ?? [];
}

/** Bandi INPA ordinati per data di pubblicazione (decrescente). */
export async function fetchInpaBandiOrderedByPublication(enteIds: number[] | null | undefined): Promise<any[]> {
  const q = applyEnteFilter(supabase.from("dw_inpa_bandi").select("*"), enteIds);
  const { data } = await q.order("data_pubblicazione", { ascending: false });
  return data ?? [];
}

/** Bandi INPA filtrati per ente, con solo i record che hanno data_scadenza valorizzata. */
export async function fetchInpaBandiWithScadenza(enteIds: number[] | null | undefined): Promise<any[]> {
  let q = applyEnteFilter(supabase.from("dw_inpa_bandi").select("*"), enteIds);
  q = q.not("data_scadenza", "is", null);
  const { data } = await q;
  return data ?? [];
}

/** Candidati INPA (demografia), non filtrati per ente. */
export async function fetchInpaCandidati(): Promise<any[]> {
  const { data } = await supabase.from("dw_inpa_candidati").select("*");
  return data ?? [];
}

/** Graduatorie del lavoro pubblico filtrate per ente. */
export async function fetchInpaGraduatorie(enteIds: number[] | null | undefined): Promise<any[]> {
  const q = applyEnteFilter(supabase.from("dw_lp_graduatorie").select("*"), enteIds);
  const { data } = await q;
  return data ?? [];
}

/** Conteggio totale degli enti (dw_ente). */
export async function fetchEnteTotalCount(): Promise<number> {
  const { count } = await supabase.from("dw_ente").select("*", { count: "exact", head: true });
  return count ?? 0;
}

/** Campi dei bandi usati per popolare i filtri locali INPA. */
export async function fetchInpaBandiFilterFields(): Promise<any[]> {
  const { data } = await supabase
    .from("dw_inpa_bandi")
    .select("anno, regione, tipo_procedura, settore_pubblicazione, stato_bando");
  return data ?? [];
}
