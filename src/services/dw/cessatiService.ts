import { supabase } from "@/integrations/supabase/client";

export interface CessazionePerCausale {
  causale: string;
  uomini: number;
  donne: number;
  totale: number;
}

export interface SerieStoricaCessati {
  anno: number;
  cessati: number;
}

export interface CessatiData {
  cessazioniPerCausale: CessazionePerCausale[];
  serieStoricaCessati: SerieStoricaCessati[];
  kpiOverview: { personaleTotale: number };
}

export const EMPTY_CESSATI_DATA: CessatiData = {
  cessazioniPerCausale: [],
  serieStoricaCessati: [],
  kpiOverview: { personaleTotale: 0 },
};

/** Aggrega le cessazioni per causale, la serie storica e il totale personale. */
export function transformCessatiData(
  cessati: any[],
  serie: any[],
  causali: any[],
  occ: any[],
): CessatiData {
  const label = new Map<string, string>();
  for (const c of causali) label.set(String(c.cod_alfa), String(c.descrizione ?? c.cod_alfa));

  const agg = new Map<string, { uomini: number; donne: number }>();
  for (const r of cessati) {
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
  for (const r of serie) {
    const a = Number(r.anno);
    perAnno.set(a, (perAnno.get(a) ?? 0) + (Number(r.uomini) || 0) + (Number(r.donne) || 0));
  }
  const serieStoricaCessati = Array.from(perAnno.entries())
    .map(([anno, cessati]) => ({ anno, cessati }))
    .sort((a, b) => a.anno - b.anno);

  const personaleTotale = occ.reduce((s, r) => s + (Number(r.tp_uomini) || 0) + (Number(r.tp_donne) || 0), 0);

  return { cessazioniPerCausale, serieStoricaCessati, kpiOverview: { personaleTotale } };
}

export async function fetchCessatiData(anno?: number): Promise<CessatiData> {
  const cessatiQb = supabase.from("dw_cessati").select("causale, uomini, donne, anno");
  const occQb = supabase.from("dw_occupazione").select("tp_uomini, tp_donne, anno");
  const [cessatiRes, serieRes, causaliRes, occRes] = await Promise.all([
    anno ? cessatiQb.eq("anno", anno) : cessatiQb,
    supabase.from("dw_cessati").select("anno, uomini, donne"),
    supabase.from("dw_causali").select("cod_alfa, descrizione"),
    anno ? occQb.eq("anno", anno) : occQb,
  ]);
  if (cessatiRes.error) throw cessatiRes.error;
  if (serieRes.error) throw serieRes.error;
  if (causaliRes.error) throw causaliRes.error;
  if (occRes.error) throw occRes.error;

  return transformCessatiData(
    cessatiRes.data ?? [],
    serieRes.data ?? [],
    causaliRes.data ?? [],
    occRes.data ?? [],
  );
}
