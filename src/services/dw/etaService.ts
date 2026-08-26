import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export interface DistribuzioneEtaRow {
  fascia: string;
  uomini: number;
  donne: number;
  totale: number;
}

export interface EtaData {
  distribuzioneEta: DistribuzioneEtaRow[];
  totalePersonale: number;
}

export const EMPTY_ETA_DATA: EtaData = { distribuzioneEta: [], totalePersonale: 0 };

/** Trasformazione pura: aggrega le righe eta per fascia rispettando l'ordine anagrafico. */
type EtaRow = Partial<Database["public"]["Tables"]["dw_eta"]["Row"]>;
type FasciaEtaRow = Partial<Database["public"]["Tables"]["dw_fascia_eta"]["Row"]>;

export function transformEtaData(rows: EtaRow[], fasce: FasciaEtaRow[]): EtaData {
  const order = new Map<string, { label: string; i: number }>();
  fasce.forEach((f, i) => {
    order.set(String(f.codice), { label: String(f.classe ?? f.codice), i });
  });

  const agg = new Map<string, { uomini: number; donne: number }>();
  for (const r of rows) {
    const key = String(r.fascia_eta);
    const cur = agg.get(key) ?? { uomini: 0, donne: 0 };
    cur.uomini += Number(r.uomini) || 0;
    cur.donne += Number(r.donne) || 0;
    agg.set(key, cur);
  }

  const dist: DistribuzioneEtaRow[] = Array.from(agg.entries())
    .map(([codice, v]) => ({
      fascia: order.get(codice)?.label ?? codice,
      uomini: v.uomini,
      donne: v.donne,
      totale: v.uomini + v.donne,
      _ord: order.get(codice)?.i ?? 999,
    }))
    .sort((a, b) => a._ord - b._ord)
    .map(({ _ord, ...rest }) => rest);

  const totalePersonale = dist.reduce((s, r) => s + r.totale, 0);
  return { distribuzioneEta: dist, totalePersonale };
}

/** Recupera e aggrega la distribuzione per fascia d'eta dal DWH. */
export async function fetchEtaData(anno?: number): Promise<EtaData> {
  const qb = supabase.from("dw_eta").select("fascia_eta, uomini, donne, anno");
  const [rowsRes, fasceRes] = await Promise.all([
    anno ? qb.eq("anno", anno) : qb,
    supabase
      .from("dw_fascia_eta")
      .select("codice, classe, eta_min")
      .order("eta_min", { ascending: true }),
  ]);

  if (rowsRes.error) throw rowsRes.error;
  if (fasceRes.error) throw fasceRes.error;

  return transformEtaData(rowsRes.data ?? [], fasceRes.data ?? []);
}
