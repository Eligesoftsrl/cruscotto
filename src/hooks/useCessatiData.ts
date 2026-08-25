import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCessatiData(anno?: number) {
  const cessati = useQuery({
    queryKey: ["dw_cessati", anno],
    queryFn: async () => {
      const qb = supabase.from("dw_cessati").select("causale, uomini, donne, anno");
      const { data, error } = anno ? await qb.eq("anno", anno) : await qb;
      if (error) throw error;
      return data ?? [];
    },
  });
  const serie = useQuery({
    queryKey: ["dw_cessati_serie"],
    queryFn: async () => {
      const { data, error } = await supabase.from("dw_cessati").select("anno, uomini, donne");
      if (error) throw error;
      return data ?? [];
    },
  });
  const causali = useQuery({
    queryKey: ["dw_causali"],
    queryFn: async () => {
      const { data, error } = await supabase.from("dw_causali").select("cod_alfa, descrizione");
      if (error) throw error;
      return data ?? [];
    },
  });
  const occ = useQuery({
    queryKey: ["dw_occupazione_tot", anno],
    queryFn: async () => {
      const qb = supabase.from("dw_occupazione").select("tp_uomini, tp_donne, anno");
      const { data, error } = anno ? await qb.eq("anno", anno) : await qb;
      if (error) throw error;
      return data ?? [];
    },
  });

  const { cessazioniPerCausale, serieStoricaCessati, kpiOverview } = useMemo(() => {
    const label = new Map<string, string>();
    for (const c of (causali.data ?? []) as any[]) label.set(String(c.cod_alfa), String(c.descrizione ?? c.cod_alfa));

    const agg = new Map<string, { uomini: number; donne: number }>();
    for (const r of (cessati.data ?? []) as any[]) {
      const key = String(r.causale);
      const cur = agg.get(key) ?? { uomini: 0, donne: 0 };
      cur.uomini += Number(r.uomini) || 0;
      cur.donne += Number(r.donne) || 0;
      agg.set(key, cur);
    }
    const cessazioniPerCausale = Array.from(agg.entries())
      .map(([cod, v]) => ({ causale: label.get(cod) ?? cod, uomini: v.uomini, donne: v.donne, totale: v.uomini + v.donne }))
      .sort((a, b) => b.totale - a.totale);

    const perAnno = new Map<number, number>();
    for (const r of (serie.data ?? []) as any[]) {
      const a = Number(r.anno);
      perAnno.set(a, (perAnno.get(a) ?? 0) + (Number(r.uomini) || 0) + (Number(r.donne) || 0));
    }
    const serieStoricaCessati = Array.from(perAnno.entries())
      .map(([anno, cessati]) => ({ anno, cessati }))
      .sort((a, b) => a.anno - b.anno);

    const personaleTotale = ((occ.data ?? []) as any[])
      .reduce((s, r) => s + (Number(r.tp_uomini) || 0) + (Number(r.tp_donne) || 0), 0);

    return { cessazioniPerCausale, serieStoricaCessati, kpiOverview: { personaleTotale } };
  }, [cessati.data, serie.data, causali.data, occ.data]);

  return {
    cessazioniPerCausale, serieStoricaCessati, kpiOverview,
    isLoading: cessati.isLoading || serie.isLoading || causali.isLoading || occ.isLoading,
    error: cessati.error || serie.error || causali.error || occ.error,
  };
}