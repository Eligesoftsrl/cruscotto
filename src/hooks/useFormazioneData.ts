import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useFormazioneData(anno = 2023) {
  const form = useQuery({ queryKey: ["dw_formazione"], queryFn: async () => {
    const { data, error } = await supabase.from("dw_formazione").select("anno, form_uomini, form_donne, ore_media_u, ore_media_d");
    if (error) throw error; return data ?? [];
  }});
  const occ = useQuery({ queryKey: ["dw_occ_tot", anno], queryFn: async () => {
    const { data, error } = await supabase.from("dw_occupazione").select("tp_uomini, tp_donne, anno").eq("anno", anno);
    if (error) throw error; return data ?? [];
  }});

  const formazione = useMemo(() => {
    const rows = (form.data ?? []) as any[];
    const perAnno = new Map<number, { f: number; ore: number }>();
    for (const r of rows) {
      const a = Number(r.anno);
      const f = (Number(r.form_uomini)||0) + (Number(r.form_donne)||0);
      const ore = (Number(r.form_uomini)||0)*(Number(r.ore_media_u)||0) + (Number(r.form_donne)||0)*(Number(r.ore_media_d)||0);
      const cur = perAnno.get(a) ?? { f: 0, ore: 0 };
      cur.f += f; cur.ore += ore; perAnno.set(a, cur);
    }
    const personale = ((occ.data ?? []) as any[]).reduce((s, r) => s + (Number(r.tp_uomini)||0) + (Number(r.tp_donne)||0), 0) || 1;
    const cur = perAnno.get(anno) ?? { f: 0, ore: 0 };
    const serieStorica = Array.from(perAnno.entries()).sort((a,b)=>a[0]-b[0])
      .map(([a, v]) => ({ anno: a, formatiPerc: Number(((v.f / personale) * 100).toFixed(1)) }));
    return {
      formatiTotale: cur.f,
      formatiPerc: Number(((cur.f / personale) * 100).toFixed(1)),
      oreFormazione: Math.round(cur.ore),
      oreProCapite: cur.f ? Number((cur.ore / cur.f).toFixed(1)) : 0,
      serieStorica,
      _personaleTotale: personale,
    };
  }, [form.data, occ.data, anno]);

  return { formazione, isLoading: form.isLoading || occ.isLoading, error: form.error || occ.error };
}