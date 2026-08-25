import { supabase } from "@/integrations/supabase/client";

export interface ProgressioneRow {
  anno: number;
  verticali: number;
  orizzontali: number;
}

export function transformProgressioniData(rows: any[]): ProgressioneRow[] {
  const perAnno = new Map<number, { verticali: number; orizzontali: number }>();
  for (const r of rows) {
    const a = Number(r.anno);
    const nn = Number(r.numero_passaggi) || 0;
    const cur = perAnno.get(a) ?? { verticali: 0, orizzontali: 0 };
    if (/vert/i.test(String(r.tipo_passaggio))) cur.verticali += nn;
    else cur.orizzontali += nn;
    perAnno.set(a, cur);
  }
  return Array.from(perAnno.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([anno, v]) => ({ anno, ...v }));
}

export async function fetchProgressioniData(): Promise<ProgressioneRow[]> {
  const { data, error } = await supabase
    .from("dw_passaggi_qualifica")
    .select("anno, tipo_passaggio, numero_passaggi");
  if (error) throw error;
  return transformProgressioniData(data ?? []);
}
