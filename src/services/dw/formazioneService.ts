import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export interface FormazioneData {
  formatiTotale: number;
  formatiPerc: number;
  oreFormazione: number;
  oreProCapite: number;
  serieStorica: { anno: number; formatiPerc: number }[];
  _personaleTotale: number;
}

export const EMPTY_FORMAZIONE_DATA: FormazioneData = {
  formatiTotale: 0,
  formatiPerc: 0,
  oreFormazione: 0,
  oreProCapite: 0,
  serieStorica: [],
  _personaleTotale: 1,
};

type FormRow = Partial<Database["public"]["Tables"]["dw_formazione"]["Row"]>;
type OccRow = Partial<Database["public"]["Tables"]["dw_occupazione"]["Row"]>;

export function transformFormazioneData(form: FormRow[], occ: OccRow[], anno: number): FormazioneData {
  const perAnno = new Map<number, { f: number; ore: number }>();
  for (const r of form) {
    const a = Number(r.anno);
    const f = (Number(r.form_uomini) || 0) + (Number(r.form_donne) || 0);
    const ore = (Number(r.form_uomini) || 0) * (Number(r.ore_media_u) || 0) + (Number(r.form_donne) || 0) * (Number(r.ore_media_d) || 0);
    const cur = perAnno.get(a) ?? { f: 0, ore: 0 };
    cur.f += f;
    cur.ore += ore;
    perAnno.set(a, cur);
  }
  const personale = occ.reduce((s, r) => s + (Number(r.tp_uomini) || 0) + (Number(r.tp_donne) || 0), 0) || 1;
  const cur = perAnno.get(anno) ?? { f: 0, ore: 0 };
  const serieStorica = Array.from(perAnno.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([a, v]) => ({ anno: a, formatiPerc: Number(((v.f / personale) * 100).toFixed(1)) }));
  return {
    formatiTotale: cur.f,
    formatiPerc: Number(((cur.f / personale) * 100).toFixed(1)),
    oreFormazione: Math.round(cur.ore),
    oreProCapite: cur.f ? Number((cur.ore / cur.f).toFixed(1)) : 0,
    serieStorica,
    _personaleTotale: personale,
  };
}

export async function fetchFormazioneData(anno = 2023): Promise<FormazioneData> {
  const [formRes, occRes] = await Promise.all([
    supabase.from("dw_formazione").select("anno, form_uomini, form_donne, ore_media_u, ore_media_d"),
    supabase.from("dw_occupazione").select("tp_uomini, tp_donne, anno").eq("anno", anno),
  ]);
  if (formRes.error) throw formRes.error;
  if (occRes.error) throw occRes.error;
  return transformFormazioneData(formRes.data ?? [], occRes.data ?? [], anno);
}
