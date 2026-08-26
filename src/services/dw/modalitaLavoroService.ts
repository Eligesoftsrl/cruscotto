import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

interface ModalitaBlock {
  serieStorica: { anno: number; [key: string]: number }[];
}

export interface LavoroAgile extends ModalitaBlock {
  agiliTotale: number;
  agiliPerc: number;
  donneAgiliPerc: number;
  uominiAgiliPerc: number;
}

export interface LavoroFlessibile extends ModalitaBlock {
  flessibiliTotale: number;
  flessibiliPerc: number;
  donneFlessibiliPerc: number;
  uominiFlessibiliPerc: number;
}

export interface ModalitaLavoroData {
  lavoroAgile: LavoroAgile;
  lavoroFlessibile: LavoroFlessibile;
}

export const EMPTY_MODALITA_LAVORO_DATA: ModalitaLavoroData = {
  lavoroAgile: { agiliTotale: 0, agiliPerc: 0, donneAgiliPerc: 0, uominiAgiliPerc: 0, serieStorica: [] },
  lavoroFlessibile: { flessibiliTotale: 0, flessibiliPerc: 0, donneFlessibiliPerc: 0, uominiFlessibiliPerc: 0, serieStorica: [] },
};

type MlRow = Partial<Database["public"]["Tables"]["dw_modalita_lavoro"]["Row"]>;
type OccRow = Partial<Database["public"]["Tables"]["dw_occupazione"]["Row"]>;

export function transformModalitaLavoro(ml: MlRow[], occ: OccRow[], anno: number): ModalitaLavoroData {
  const n = (x: number | null | undefined) => Number(x) || 0;
  const agile = new Map<number, { u: number; d: number }>();
  const fless = new Map<number, { u: number; d: number }>();
  for (const r of ml) {
    const a = Number(r.anno);
    const au = n(r.lavoro_agile_u);
    const ad = n(r.lavoro_agile_d);
    const fu = au + n(r.telelavoro_u) + n(r.turnazione_u) + n(r.reperibilita_u);
    const fd = ad + n(r.telelavoro_d) + n(r.turnazione_d) + n(r.reperibilita_d);
    const ca = agile.get(a) ?? { u: 0, d: 0 };
    ca.u += au;
    ca.d += ad;
    agile.set(a, ca);
    const cf = fless.get(a) ?? { u: 0, d: 0 };
    cf.u += fu;
    cf.d += fd;
    fless.set(a, cf);
  }
  const personale = occ.reduce((s, r) => s + n(r.tp_uomini) + n(r.tp_donne), 0) || 1;
  const build = (m: Map<number, { u: number; d: number }>, key: string) => {
    const cur = m.get(anno) ?? { u: 0, d: 0 };
    const tot = cur.u + cur.d;
    const serie = Array.from(m.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([a, v]) => ({ anno: a, [key]: v.u + v.d }));
    return {
      tot,
      perc: Number(((tot / personale) * 100).toFixed(1)),
      donnePerc: tot ? Number(((cur.d / tot) * 100).toFixed(1)) : 0,
      uominiPerc: tot ? Number(((cur.u / tot) * 100).toFixed(1)) : 0,
      serie,
    };
  };
  const a = build(agile, "agili");
  const f = build(fless, "flessibili");
  return {
    lavoroAgile: {
      agiliTotale: a.tot,
      agiliPerc: a.perc,
      donneAgiliPerc: a.donnePerc,
      uominiAgiliPerc: a.uominiPerc,
      serieStorica: a.serie,
    },
    lavoroFlessibile: {
      flessibiliTotale: f.tot,
      flessibiliPerc: f.perc,
      donneFlessibiliPerc: f.donnePerc,
      uominiFlessibiliPerc: f.uominiPerc,
      serieStorica: f.serie,
    },
  };
}

export async function fetchModalitaLavoro(anno = 2023): Promise<ModalitaLavoroData> {
  const [mlRes, occRes] = await Promise.all([
    supabase
      .from("dw_modalita_lavoro")
      .select("anno, telelavoro_u, telelavoro_d, lavoro_agile_u, lavoro_agile_d, turnazione_u, turnazione_d, reperibilita_u, reperibilita_d"),
    supabase.from("dw_occupazione").select("tp_uomini, tp_donne, anno").eq("anno", anno),
  ]);
  if (mlRes.error) throw mlRes.error;
  if (occRes.error) throw occRes.error;
  return transformModalitaLavoro(mlRes.data ?? [], occRes.data ?? [], anno);
}
