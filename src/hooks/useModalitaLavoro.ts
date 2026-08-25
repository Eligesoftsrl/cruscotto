import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useModalitaLavoro(anno = 2023) {
  const ml = useQuery({ queryKey: ["dw_modalita_lavoro"], queryFn: async () => {
    const { data, error } = await supabase.from("dw_modalita_lavoro")
      .select("anno, telelavoro_u, telelavoro_d, lavoro_agile_u, lavoro_agile_d, turnazione_u, turnazione_d, reperibilita_u, reperibilita_d");
    if (error) throw error; return data ?? [];
  }});
  const occ = useQuery({ queryKey: ["dw_occ_tot_ml", anno], queryFn: async () => {
    const { data, error } = await supabase.from("dw_occupazione").select("tp_uomini, tp_donne, anno").eq("anno", anno);
    if (error) throw error; return data ?? [];
  }});

  return useMemo(() => {
    const rows = (ml.data ?? []) as any[];
    const n = (x:any)=>Number(x)||0;
    const agile = new Map<number,{u:number;d:number}>();
    const fless = new Map<number,{u:number;d:number}>();
    for (const r of rows) {
      const a = Number(r.anno);
      const au=n(r.lavoro_agile_u), ad=n(r.lavoro_agile_d);
      const fu=au+n(r.telelavoro_u)+n(r.turnazione_u)+n(r.reperibilita_u);
      const fd=ad+n(r.telelavoro_d)+n(r.turnazione_d)+n(r.reperibilita_d);
      const ca=agile.get(a)??{u:0,d:0}; ca.u+=au; ca.d+=ad; agile.set(a,ca);
      const cf=fless.get(a)??{u:0,d:0}; cf.u+=fu; cf.d+=fd; fless.set(a,cf);
    }
    const personale = ((occ.data ?? []) as any[]).reduce((s,r)=>s+n(r.tp_uomini)+n(r.tp_donne),0)||1;
    const build = (m:Map<number,{u:number;d:number}>, key:string) => {
      const cur = m.get(anno) ?? {u:0,d:0}; const tot = cur.u+cur.d;
      const serie = Array.from(m.entries()).sort((a,b)=>a[0]-b[0]).map(([a,v])=>({anno:a,[key]:v.u+v.d}));
      return { tot, perc:Number(((tot/personale)*100).toFixed(1)),
        donnePerc: tot?Number(((cur.d/tot)*100).toFixed(1)):0,
        uominiPerc: tot?Number(((cur.u/tot)*100).toFixed(1)):0, serie };
    };
    const a = build(agile,"agili"); const f = build(fless,"flessibili");
    return {
      lavoroAgile: { agiliTotale:a.tot, agiliPerc:a.perc, donneAgiliPerc:a.donnePerc, uominiAgiliPerc:a.uominiPerc, serieStorica:a.serie },
      lavoroFlessibile: { flessibiliTotale:f.tot, flessibiliPerc:f.perc, donneFlessibiliPerc:f.donnePerc, uominiFlessibiliPerc:f.uominiPerc, serieStorica:f.serie },
      isLoading: ml.isLoading||occ.isLoading, error: ml.error||occ.error,
    };
  }, [ml.data, occ.data, anno]);
}