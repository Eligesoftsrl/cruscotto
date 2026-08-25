import { supabase } from "@/integrations/supabase/client";

/** Amministrazioni Syllabus (dw_syllabus_pa). */
export async function fetchSyllabusPa(select = "*"): Promise<any[]> {
  const { data } = await supabase.from("dw_syllabus_pa").select(select);
  return data ?? [];
}

/** Catalogo corsi Syllabus (dw_syllabus_catalogo). */
export async function fetchSyllabusCatalogo(select = "*"): Promise<any[]> {
  const { data } = await supabase.from("dw_syllabus_catalogo").select(select);
  return data ?? [];
}

/** Partecipazioni Syllabus (dw_syllabus_partecipazioni). */
export async function fetchSyllabusPartecipazioni(select = "*"): Promise<any[]> {
  const { data } = await supabase.from("dw_syllabus_partecipazioni").select(select);
  return data ?? [];
}
