import { supabase } from "@/integrations/supabase/client";

export interface GenerePerQualificaRow {
  qualifica: string;
  uomini: number;
  donne: number;
}

export interface GenereKpiOverview {
  uominiPerc: number;
  donnePerc: number;
  personaleDirigente: number;
  personaleNonDirigente: number;
}

export interface GenereData {
  generePerQualifica: GenerePerQualificaRow[];
  kpiOverview: GenereKpiOverview;
}

export const EMPTY_GENERE_DATA: GenereData = {
  generePerQualifica: [],
  kpiOverview: { uominiPerc: 0, donnePerc: 0, personaleDirigente: 0, personaleNonDirigente: 0 },
};

/** Trasformazione pura: aggrega occupazione per qualifica e calcola i KPI di genere. */
export function transformGenereData(rows: any[]): GenereData {
  const agg = new Map<string, { uomini: number; donne: number }>();
  for (const r of rows) {
    const key = String(r.qualifica ?? "\u2014");
    const cur = agg.get(key) ?? { uomini: 0, donne: 0 };
    cur.uomini += Number(r.tp_uomini) || 0;
    cur.donne += Number(r.tp_donne) || 0;
    agg.set(key, cur);
  }

  const generePerQualifica = Array.from(agg.entries())
    .map(([qualifica, v]) => ({ qualifica, uomini: v.uomini, donne: v.donne }))
    .sort((a, b) => b.uomini + b.donne - (a.uomini + a.donne));

  const totU = generePerQualifica.reduce((s, r) => s + r.uomini, 0);
  const totD = generePerQualifica.reduce((s, r) => s + r.donne, 0);
  const tot = totU + totD || 1;
  const dir = generePerQualifica.filter((r) => /dirig/i.test(r.qualifica));
  const personaleDirigente = dir.reduce((s, r) => s + r.uomini + r.donne, 0);

  const kpiOverview: GenereKpiOverview = {
    uominiPerc: Number(((totU / tot) * 100).toFixed(1)),
    donnePerc: Number(((totD / tot) * 100).toFixed(1)),
    personaleDirigente,
    personaleNonDirigente: totU + totD - personaleDirigente,
  };

  return { generePerQualifica, kpiOverview };
}

/** Recupera e aggrega i dati di genere per qualifica dal DWH. */
export async function fetchGenereData(anno?: number): Promise<GenereData> {
  const qb = supabase.from("dw_occupazione").select("qualifica, tp_uomini, tp_donne, anno");
  const { data, error } = anno ? await qb.eq("anno", anno) : await qb;
  if (error) throw error;
  return transformGenereData(data ?? []);
}
