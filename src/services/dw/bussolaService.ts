import { supabase } from "@/integrations/supabase/client";

export interface BussolaMetric {
  value: number;
  numerator?: number;
  denominator?: number;
  description?: string;
}

export type BussolaMetrics = Record<string, BussolaMetric>;

/**
 * Recupera e calcola tutte le metriche della Bussola per un dato ente,
 * interrogando le tabelle dw_* del data warehouse.
 */
export async function fetchBussolaMetrics(enteId: number): Promise<BussolaMetrics> {
  const metrics: BussolaMetrics = {};

  // === ETA: over55, under35 ===
  const { data: etaData } = await supabase
    .from("dw_eta")
    .select("fascia_eta, uomini, donne")
    .eq("istituzione", enteId)
    .eq("anno", 2023);

  if (etaData && etaData.length > 0) {
    const total = etaData.reduce((s, r) => s + (Number(r.uomini) || 0) + (Number(r.donne) || 0), 0);
    const over55Bands = ["E55", "E60", "E65", "E68"];
    const under35Bands = ["E0", "E20", "E25", "E30"];
    const over55 = etaData
      .filter((r) => over55Bands.includes(r.fascia_eta ?? ""))
      .reduce((s, r) => s + (Number(r.uomini) || 0) + (Number(r.donne) || 0), 0);
    const under35 = etaData
      .filter((r) => under35Bands.includes(r.fascia_eta ?? ""))
      .reduce((s, r) => s + (Number(r.uomini) || 0) + (Number(r.donne) || 0), 0);

    if (total > 0) {
      metrics["over55"] = { value: over55 / total, numerator: over55, denominator: total, description: `${Math.round((over55 / total) * 100)}% del personale \u00b7 ${over55.toLocaleString("it-IT")} unita` };
      metrics["under35"] = { value: under35 / total, numerator: under35, denominator: total, description: `${Math.round((under35 / total) * 100)}% del personale \u00b7 ${under35.toLocaleString("it-IT")} unita` };
      metrics["ISG"] = { value: total > 0 && over55 > 0 ? under35 / over55 : 0, numerator: under35, denominator: over55 };

      const over60Bands = ["E60", "E65", "E68"];
      const over60 = etaData
        .filter((r) => over60Bands.includes(r.fascia_eta ?? ""))
        .reduce((s, r) => s + (Number(r.uomini) || 0) + (Number(r.donne) || 0), 0);
      metrics["TEP"] = { value: over60 / total, numerator: over60, denominator: total, description: `${Math.round((over60 / total) * 100)}% in uscita entro 36 mesi \u00b7 ${over60.toLocaleString("it-IT")} unita` };
    }
  }

  // === OCCUPAZIONE: organico, genere ===
  const { data: occData } = await supabase
    .from("dw_occupazione")
    .select("tp_uomini, tp_donne, pt_sup50_u, pt_sup50_d, pt_inf50_u, pt_inf50_d")
    .eq("istituzione", enteId)
    .eq("anno", 2023);

  if (occData && occData.length > 0) {
    let totU = 0;
    let totD = 0;
    for (const r of occData) {
      totU += (Number(r.tp_uomini) || 0) + (Number(r.pt_sup50_u) || 0) + (Number(r.pt_inf50_u) || 0);
      totD += (Number(r.tp_donne) || 0) + (Number(r.pt_sup50_d) || 0) + (Number(r.pt_inf50_d) || 0);
    }
    const tot = totU + totD;
    if (tot > 0) {
      metrics["genere"] = { value: totD / tot, numerator: totD, denominator: tot, description: `${Math.round((totD / tot) * 100)}% donne, ${Math.round((totU / tot) * 100)}% uomini` };
      metrics["organico"] = { value: tot, numerator: tot, denominator: 1 };
    }
  }

  // === ASSUNTI / CESSATI: turnover, sostituzione ===
  const [{ data: assuntiData }, { data: cessatiData }] = await Promise.all([
    supabase.from("dw_assunti").select("uomini, donne").eq("istituzione", enteId).eq("anno", 2023),
    supabase.from("dw_cessati").select("uomini, donne").eq("istituzione", enteId).eq("anno", 2023),
  ]);

  const totAssunti = (assuntiData ?? []).reduce((s, r) => s + (Number(r.uomini) || 0) + (Number(r.donne) || 0), 0);
  const totCessati = (cessatiData ?? []).reduce((s, r) => s + (Number(r.uomini) || 0) + (Number(r.donne) || 0), 0);
  const organico = metrics["organico"]?.value ?? 0;

  if (organico > 0) {
    metrics["TVO"] = { value: (totAssunti + totCessati) / (organico * 2), numerator: totAssunti + totCessati, denominator: organico };
  }
  if (totCessati > 0) {
    metrics["TSO"] = { value: totAssunti / totCessati, numerator: totAssunti, denominator: totCessati };
  }

  // === INPA: attrattivita, tempi ===
  const { data: inpaData } = await supabase
    .from("dw_inpa_bandi")
    .select("num_candidature_submitted, num_posti")
    .eq("id_ente", enteId);

  if (inpaData && inpaData.length > 0) {
    const totCand = inpaData.reduce((s, r) => s + (Number(r.num_candidature_submitted) || 0), 0);
    const totPosti = inpaData.reduce((s, r) => s + (Number(r.num_posti) || 0), 0);
    if (totPosti > 0) {
      metrics["IAP"] = { value: Math.min(totCand / (totPosti * 15), 1), numerator: totCand, denominator: totPosti, description: `${Math.round(totCand / totPosti)} candidature medie per posizione` };
    }
  }

  // === GRADUATORIE: copertura, tempi ===
  const { data: gradData } = await supabase
    .from("dw_lp_graduatorie")
    .select("num_posti_banditi, num_vincitori_assunti, tcp_giorni")
    .eq("id_ente", enteId);

  if (gradData && gradData.length > 0) {
    const totBanditi = gradData.reduce((s, r) => s + (Number(r.num_posti_banditi) || 0), 0);
    const totAssuntiGrad = gradData.reduce((s, r) => s + (Number(r.num_vincitori_assunti) || 0), 0);
    const tcpValues = gradData.map((r) => Number(r.tcp_giorni) || 0).filter((v) => v > 0);
    const avgTcp = tcpValues.length > 0 ? tcpValues.reduce((a, b) => a + b, 0) / tcpValues.length : 0;

    if (totBanditi > 0) {
      metrics["TCPB"] = { value: totAssuntiGrad / totBanditi, numerator: totAssuntiGrad, denominator: totBanditi };
    }
    if (avgTcp > 0) {
      metrics["TCP"] = { value: Math.max(0, 1 - avgTcp / 300), numerator: Math.round(avgTcp), denominator: 300, description: `Media ${Math.round(avgTcp)} giorni su 300 normativi` };
    }
  }

  // === KPI RILEVAZIONE ===
  const { data: kpiData } = await supabase
    .from("dw_kpi_rilevazione")
    .select("*")
    .eq("id_ente", enteId)
    .limit(1)
    .maybeSingle();

  if (kpiData) {
    const toNum = (v: string | null | undefined) => {
      if (!v) return 0;
      const n = Number(v);
      return isNaN(n) ? 0 : n;
    };
    const tep = toNum(kpiData.q6_tep_personale);
    if (tep > 0) {
      const progVert = toNum(kpiData.q6_14_progressioni_vert);
      metrics["IPR"] = { value: Math.min(progVert / tep, 1), numerator: progVert, denominator: tep };

      const agileD = toNum(kpiData.q6_16_donne_agile);
      const agileU = toNum(kpiData.q6_16_uomini_agile);
      metrics["ILA"] = { value: Math.min((agileD + agileU) / tep, 1), numerator: agileD + agileU, denominator: tep };
    }
  }

  return metrics;
}
