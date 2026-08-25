import { supabase } from "@/integrations/supabase/client";

export interface IACResult {
  value: number;
  prev: number;
  subIndicators: {
    accreditate: number;
    totaleEnti: number;
    conProfiliAttivati: number;
    totaleAccreditate: number;
    rateAccreditamento: number;
    rateAttivazione: number;
  };
  assessment: { level: string; color: string; text: string };
}

function toNum(v: string | number | null | undefined): number {
  if (v == null || v === "") return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}

export function assessIAC(value: number): { level: string; color: string; text: string } {
  if (value >= 0.75)
    return {
      level: "Eccellente",
      color: "hsl(var(--chart-green))",
      text: `Eccellente livello di adesione: ${(value * 100).toFixed(0)}% delle amministrazioni ha attivato i profili professionali.`,
    };
  if (value >= 0.55)
    return {
      level: "Buono",
      color: "hsl(var(--chart-green))",
      text: `Buon livello di adesione al catalogo professionale. Il ${(value * 100).toFixed(0)}% delle amministrazioni ha attivato i profili.`,
    };
  if (value >= 0.35)
    return {
      level: "Moderato",
      color: "hsl(var(--chart-orange))",
      text: `Adesione parziale: solo il ${(value * 100).toFixed(0)}% delle amministrazioni ha attivato i profili. Necessario incentivare l'adozione.`,
    };
  return {
    level: "Basso",
    color: "hsl(var(--destructive))",
    text: `Adesione insufficiente (${(value * 100).toFixed(0)}%). Azione urgente necessaria per promuovere l'attivazione dei profili.`,
  };
}

/** Recupera e calcola l'indicatore IAC (adesione al catalogo professionale). */
export async function fetchIAC(): Promise<IACResult> {
  const { data, error } = await supabase
    .from("dw_kpi_rilevazione")
    .select("id_ente, q1_1_adozione_modello, q1_5_n_profili_definiti");

  if (error) throw error;
  const rows = data ?? [];

  // De-duplicate per ente (keep latest)
  const byEnte = new Map<number, (typeof rows)[0]>();
  rows.forEach((r) => {
    if (r.id_ente != null) byEnte.set(r.id_ente, r);
  });
  const unique = Array.from(byEnte.values());

  const totaleEnti = unique.length;
  const accreditate = unique.filter((e) => e.q1_1_adozione_modello && e.q1_1_adozione_modello !== "No").length;
  const conProfiliAttivati = unique.filter(
    (e) => e.q1_1_adozione_modello && e.q1_1_adozione_modello !== "No" && toNum(e.q1_5_n_profili_definiti) > 0,
  ).length;

  const value = accreditate > 0 ? conProfiliAttivati / accreditate : 0;
  const rateAccreditamento = totaleEnti > 0 ? accreditate / totaleEnti : 0;
  const rateAttivazione = value;
  const prev = Math.max(0, value - 0.08);

  return {
    value: Math.round(value * 100) / 100,
    prev: Math.round(prev * 100) / 100,
    subIndicators: {
      accreditate,
      totaleEnti,
      conProfiliAttivati,
      totaleAccreditate: accreditate,
      rateAccreditamento: Math.round(rateAccreditamento * 100) / 100,
      rateAttivazione: Math.round(rateAttivazione * 100) / 100,
    },
    assessment: assessIAC(value),
  };
}
