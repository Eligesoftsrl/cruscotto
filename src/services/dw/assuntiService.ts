import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export interface AssuntoPerCausale {
  causale: string;
  uomini: number;
  donne: number;
  totale: number;
}

export interface SerieStoricaAssunti {
  anno: number;
  assunti: number;
}

export interface AssuntiData {
  assuntiPerCausale: AssuntoPerCausale[];
  serieStoricaTurnover: SerieStoricaAssunti[];
  kpiOverview: { personaleTotale: number };
}

export const EMPTY_ASSUNTI_DATA: AssuntiData = {
  assuntiPerCausale: [],
  serieStoricaTurnover: [],
  kpiOverview: { personaleTotale: 0 },
};

/** Aggrega gli assunti per causale, la serie storica del turnover e il totale personale. */
type AssuntiRow = Partial<Database["public"]["Tables"]["dw_assunti"]["Row"]>;
type CausaliRow = Partial<Database["public"]["Tables"]["dw_causali"]["Row"]>;
type OccRow = Partial<Database["public"]["Tables"]["dw_occupazione"]["Row"]>;

export function transformAssuntiData(
  assunti: AssuntiRow[],
  serie: AssuntiRow[],
  causali: CausaliRow[],
  occ: OccRow[],
): AssuntiData {
  const label = new Map<string, string>();
  for (const c of causali) label.set(String(c.cod_alfa), String(c.descrizione ?? c.cod_alfa));

  const agg = new Map<string, { uomini: number; donne: number }>();
  for (const r of assunti) {
    const key = String(r.causale);
    const cur = agg.get(key) ?? { uomini: 0, donne: 0 };
    cur.uomini += Number(r.uomini) || 0;
    cur.donne += Number(r.donne) || 0;
    agg.set(key, cur);
  }
  const assuntiPerCausale = Array.from(agg.entries())
    .map(([cod, v]) => ({ causale: label.get(cod) ?? cod, uomini: v.uomini, donne: v.donne, totale: v.uomini + v.donne }))
    .sort((a, b) => b.totale - a.totale);

  const perAnno = new Map<number, number>();
  for (const r of serie) {
    const a = Number(r.anno);
    perAnno.set(a, (perAnno.get(a) ?? 0) + (Number(r.uomini) || 0) + (Number(r.donne) || 0));
  }
  const serieStoricaTurnover = Array.from(perAnno.entries())
    .map(([anno, assunti]) => ({ anno, assunti }))
    .sort((a, b) => a.anno - b.anno);

  const personaleTotale = occ.reduce((s, r) => s + (Number(r.tp_uomini) || 0) + (Number(r.tp_donne) || 0), 0);

  return { assuntiPerCausale, serieStoricaTurnover, kpiOverview: { personaleTotale } };
}

export async function fetchAssuntiData(anno?: number): Promise<AssuntiData> {
  const assuntiQb = supabase.from("dw_assunti").select("causale, uomini, donne, anno");
  const occQb = supabase.from("dw_occupazione").select("tp_uomini, tp_donne, anno");
  const [assuntiRes, serieRes, causaliRes, occRes] = await Promise.all([
    anno ? assuntiQb.eq("anno", anno) : assuntiQb,
    supabase.from("dw_assunti").select("anno, uomini, donne"),
    supabase.from("dw_causali").select("cod_alfa, descrizione"),
    anno ? occQb.eq("anno", anno) : occQb,
  ]);
  if (assuntiRes.error) throw assuntiRes.error;
  if (serieRes.error) throw serieRes.error;
  if (causaliRes.error) throw causaliRes.error;
  if (occRes.error) throw occRes.error;

  return transformAssuntiData(
    assuntiRes.data ?? [],
    serieRes.data ?? [],
    causaliRes.data ?? [],
    occRes.data ?? [],
  );
}
