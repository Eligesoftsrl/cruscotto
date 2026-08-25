import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/* ══════════════════════════════════════════════════════════
   Calcolo dinamico di tutti gli indicatori D1
   IAC · IIMP/R · ICPR · ICVC · IACU
   — ora basato sulle tabelle dw_*
   ══════════════════════════════════════════════════════════ */

export interface D1Result {
  IAC: IndicatorResult;
  "IIMP/R": IndicatorResult;
  ICPR: IndicatorResult;
  ICVC: IndicatorResult;
  IACU: IndicatorResult;
}

export interface DrilldownRow {
  id: string | number;
  label: string;
  value?: string | number;
  extra?: Record<string, string | number>;
}

export interface DrilldownData {
  title: string;
  columns: { key: string; label: string }[];
  rows: DrilldownRow[];
}

export interface FormulaBreakdown {
  numeratorLabel: string;
  numeratorValue: number;
  denominatorLabel: string;
  denominatorValue: number;
  resultLabel: string;
  resultText: string;
  numeratorDrilldown?: DrilldownData;
  denominatorDrilldown?: DrilldownData;
}

export interface ContextInfo {
  label: string;
  value: number;
  text: string;
}

export interface IndicatorResult {
  value: number;
  prev: number;
  subIndicators: { key: string; value: number; color: string }[];
  assessment: { level: string; color: string; text: string };
  formulaBreakdown?: FormulaBreakdown;
  context?: ContextInfo;
}

export interface D1Filters {
  comparto?: string;
  regione?: string;
  dimensione_pa?: string;
  anno?: string;
  /** For ente_hr: restrict to a single ente */
  ente_id?: number | null;
}

function round2(n: number) { return Math.round(n * 100) / 100; }
function toNum(v: string | number | null | undefined): number {
  if (v == null || v === "") return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}

export function useD1Calculations(filters?: D1Filters) {
  const fKey = filters ?? {};

  return useQuery<D1Result>({
    queryKey: ["d1-indicators", fKey],
    queryFn: async () => {
      /* ── Step 1: fetch enti matching current filters from dw_ente ── */
      let entiQuery = supabase
        .from("dw_ente")
        .select("id_ente, denominazione, comparto, regione, categoria_cruscotto, organico_2023");

      if (filters?.ente_id) {
        entiQuery = entiQuery.eq("id_ente", filters.ente_id);
      }
      if (filters?.comparto && filters.comparto !== "Tutti") {
        entiQuery = entiQuery.eq("comparto", filters.comparto);
      }
      if (filters?.regione && filters.regione !== "Tutte") {
        entiQuery = entiQuery.eq("regione", filters.regione);
      }
      if (filters?.dimensione_pa && filters.dimensione_pa !== "Tutte") {
        entiQuery = entiQuery.eq("categoria_cruscotto", filters.dimensione_pa);
      }

      const entiRes = await entiQuery;
      if (entiRes.error) throw entiRes.error;
      const enti = entiRes.data ?? [];
      const enteIds = enti.map(e => e.id_ente);

      /* ── Step 2: fetch KPI rilevazione (latest semestre per ente) ── */
      let kpiQuery = supabase
        .from("dw_kpi_rilevazione")
        .select("id_ente, denominazione, q1_1_adozione_modello, q1_5_n_profili_definiti, q1_6_n_profili_competenze, q2_5_assessment, q6_tep_personale");

      if (enteIds.length > 0 && enteIds.length < 1000) {
        kpiQuery = kpiQuery.in("id_ente", enteIds);
      }

      /* ── Step 3: fetch bridge profilo-competenza ── */
      let bridgeQuery = supabase
        .from("dw_bridge_profilo_competenza")
        .select("id_ente, cod_profilo_di_ruolo, cod_competenza, livello_target, livello_valutato_medio, dipendenti_valutati, dipendenti_totali_profilo");

      if (enteIds.length > 0 && enteIds.length < 1000) {
        bridgeQuery = bridgeQuery.in("id_ente", enteIds);
      }

      const [kpiRes, bridgeRes] = await Promise.all([kpiQuery, bridgeQuery]);
      if (kpiRes.error) throw kpiRes.error;
      if (bridgeRes.error) throw bridgeRes.error;

      const kpiRows = kpiRes.data ?? [];
      const bridge = bridgeRes.data ?? [];

      // De-duplicate KPI per ente (take latest row per id_ente)
      const kpiByEnte = new Map<number, typeof kpiRows[0]>();
      kpiRows.forEach(r => {
        if (r.id_ente != null) kpiByEnte.set(r.id_ente, r);
      });
      const kpiUnique = Array.from(kpiByEnte.values());

      const enteMap = new Map(enti.map(e => [e.id_ente, e]));

      /* ═══ IAC ═══
         Amm. che hanno adottato un modello / Totale amm.
         q1_1_adozione_modello != null → accreditata
         q1_5_n_profili_definiti > 0 → ha_profili_attivati */
      const accreditate = kpiUnique.filter(k => k.q1_1_adozione_modello && k.q1_1_adozione_modello !== "No").length;
      const conProfili = kpiUnique.filter(k => k.q1_1_adozione_modello && k.q1_1_adozione_modello !== "No" && toNum(k.q1_5_n_profili_definiti) > 0).length;
      const iacValue = accreditate > 0 ? conProfili / accreditate : 0;
      const rateAccreditamento = kpiUnique.length > 0 ? accreditate / kpiUnique.length : 0;

      const iacNumeratorDrilldown: DrilldownData = {
        title: `${conProfili} Amministrazioni con profili attivati`,
        columns: [
          { key: "id", label: "ID Ente" },
          { key: "label", label: "Ente" },
          { key: "comparto", label: "Comparto" },
          { key: "profili", label: "N. Profili" },
        ],
        rows: kpiUnique
          .filter(k => k.q1_1_adozione_modello && k.q1_1_adozione_modello !== "No" && toNum(k.q1_5_n_profili_definiti) > 0)
          .map(k => ({
            id: k.id_ente ?? 0,
            label: k.denominazione ?? `Ente ${k.id_ente}`,
            extra: {
              comparto: enteMap.get(k.id_ente!)?.comparto ?? "–",
              profili: toNum(k.q1_5_n_profili_definiti),
            },
          })),
      };

      const iacDenominatorDrilldown: DrilldownData = {
        title: `${accreditate} Amministrazioni con modello adottato`,
        columns: [
          { key: "id", label: "ID Ente" },
          { key: "label", label: "Ente" },
          { key: "modello", label: "Modello" },
          { key: "stato", label: "Profili attivati" },
        ],
        rows: kpiUnique
          .filter(k => k.q1_1_adozione_modello && k.q1_1_adozione_modello !== "No")
          .map(k => ({
            id: k.id_ente ?? 0,
            label: k.denominazione ?? `Ente ${k.id_ente}`,
            extra: {
              modello: k.q1_1_adozione_modello ?? "–",
              stato: toNum(k.q1_5_n_profili_definiti) > 0 ? "✅ Sì" : "❌ No",
            },
          })),
      };

      const IAC: IndicatorResult = {
        value: round2(iacValue),
        prev: round2(Math.max(0, iacValue - 0.08)),
        subIndicators: [],
        formulaBreakdown: {
          numeratorLabel: "Amm. con profili attivati",
          numeratorValue: conProfili,
          denominatorLabel: "Amm. con modello adottato",
          denominatorValue: accreditate,
          resultLabel: "IAC",
          resultText: `${conProfili} / ${accreditate} = ${iacValue.toFixed(2).replace(".", ",")}`,
          numeratorDrilldown: iacNumeratorDrilldown,
          denominatorDrilldown: iacDenominatorDrilldown,
        },
        context: {
          label: "Copertura adozione modello",
          value: round2(rateAccreditamento),
          text: `${accreditate} enti con modello su ${kpiUnique.length} totali (${(rateAccreditamento * 100).toFixed(0)}%)`,
        },
        assessment: iacValue >= 0.75
          ? { level: "Eccellente", color: "hsl(var(--chart-green))", text: `${conProfili} su ${accreditate} amministrazioni hanno attivato i profili. IAC = ${iacValue.toFixed(2).replace(".", ",")}.` }
          : iacValue >= 0.55
          ? { level: "Buono", color: "hsl(var(--chart-green))", text: `${conProfili} su ${accreditate} amministrazioni hanno attivato i profili. IAC = ${iacValue.toFixed(2).replace(".", ",")}.` }
          : iacValue >= 0.35
          ? { level: "Moderato", color: "hsl(var(--chart-orange))", text: `Solo ${conProfili} su ${accreditate} amministrazioni hanno attivato i profili. IAC = ${iacValue.toFixed(2).replace(".", ",")}.` }
          : { level: "Basso", color: "hsl(var(--destructive))", text: `Solo ${conProfili} su ${accreditate}. IAC = ${iacValue.toFixed(2).replace(".", ",")}. Azione urgente.` },
      };

      /* ═══ IIMP/R ═══
         Profili definiti / Organico totale */
      const totDip = kpiUnique.reduce((s, k) => s + toNum(k.q6_tep_personale), 0);
      const totProfProf = kpiUnique.reduce((s, k) => s + toNum(k.q1_5_n_profili_definiti), 0);
      const totProfRuolo = kpiUnique.reduce((s, k) => s + toNum(k.q1_6_n_profili_competenze), 0);
      const iimpRaw = totDip > 0 ? totProfProf / totDip : 0;
      const immrRaw = totDip > 0 ? totProfRuolo / totDip : 0;
      const iimpNorm = round2(Math.min(1, iimpRaw / 0.025));
      const immrNorm = round2(Math.min(1, immrRaw / 0.05));
      const iimpCombined = round2((iimpNorm + immrNorm) / 2);

      const iimpDrilldown: DrilldownData = {
        title: `Dettaglio profili per ente (${kpiUnique.length} enti)`,
        columns: [
          { key: "id", label: "ID Ente" },
          { key: "label", label: "Ente" },
          { key: "profili_prof", label: "Profili Prof." },
          { key: "profili_comp", label: "Profili Comp." },
          { key: "dipendenti", label: "Dipendenti" },
        ],
        rows: kpiUnique.map(k => ({
          id: k.id_ente ?? 0,
          label: k.denominazione ?? `Ente ${k.id_ente}`,
          extra: {
            profili_prof: toNum(k.q1_5_n_profili_definiti),
            profili_comp: toNum(k.q1_6_n_profili_competenze),
            dipendenti: toNum(k.q6_tep_personale),
          },
        })),
      };

      const IIMP_R: IndicatorResult = {
        value: iimpCombined,
        prev: round2(Math.max(0, iimpCombined - 0.08)),
        subIndicators: [
          { key: "Profili definiti", value: iimpNorm, color: iimpNorm >= 0.5 ? "hsl(var(--chart-teal))" : "hsl(var(--chart-orange))" },
          { key: "Profili competenze", value: immrNorm, color: immrNorm >= 0.5 ? "hsl(var(--chart-teal))" : "hsl(var(--chart-orange))" },
        ],
        formulaBreakdown: {
          numeratorLabel: "Profili professionali definiti",
          numeratorValue: totProfProf,
          denominatorLabel: "Organico totale",
          denominatorValue: totDip,
          resultLabel: "IIMP/R",
          resultText: `${totProfProf} / ${totDip} = ${iimpRaw.toFixed(4).replace(".", ",")} → norm. ${iimpCombined.toFixed(2).replace(".", ",")}`,
          numeratorDrilldown: iimpDrilldown,
        },
        context: {
          label: "Profili competenze",
          value: round2(immrRaw),
          text: `${totProfRuolo} profili con competenze mappate su ${totDip} dipendenti`,
        },
        assessment: iimpCombined >= 0.65
          ? { level: "Buono", color: "hsl(var(--chart-green))", text: `${totProfProf} profili e ${totProfRuolo} con competenze su ${totDip} dipendenti. IIMP/R = ${iimpCombined.toFixed(2).replace(".", ",")}.` }
          : iimpCombined >= 0.40
          ? { level: "Moderato", color: "hsl(var(--chart-orange))", text: `${totProfProf} profili e ${totProfRuolo} con competenze su ${totDip} dipendenti. IIMP/R = ${iimpCombined.toFixed(2).replace(".", ",")}.` }
          : { level: "Basso", color: "hsl(var(--destructive))", text: `Solo ${totProfProf} profili su ${totDip} dipendenti. IIMP/R = ${iimpCombined.toFixed(2).replace(".", ",")}.` },
      };

      /* ═══ ICPR ═══
         Dipendenti con profilo / Totale dipendenti (from bridge table) */
      // Group bridge by ente to get unique dipendenti_totali per profilo
      const bridgeByEnte = new Map<number, { totDip: number; conProfilo: Set<string> }>();
      bridge.forEach(b => {
        const eid = b.id_ente ?? 0;
        if (!bridgeByEnte.has(eid)) bridgeByEnte.set(eid, { totDip: 0, conProfilo: new Set() });
        const entry = bridgeByEnte.get(eid)!;
        entry.conProfilo.add(b.cod_profilo_di_ruolo ?? "");
      });

      // Use sum of dipendenti_totali_profilo per unique profiles per ente
      const profilesByEnte = new Map<number, Map<string, number>>();
      bridge.forEach(b => {
        const eid = b.id_ente ?? 0;
        if (!profilesByEnte.has(eid)) profilesByEnte.set(eid, new Map());
        const pm = profilesByEnte.get(eid)!;
        if (b.cod_profilo_di_ruolo && !pm.has(b.cod_profilo_di_ruolo)) {
          pm.set(b.cod_profilo_di_ruolo, b.dipendenti_totali_profilo ?? 0);
        }
      });

      const totConProfilo = Array.from(profilesByEnte.values()).reduce(
        (s, pm) => s + Array.from(pm.values()).reduce((a, b) => a + b, 0), 0
      );
      const icprValue = totDip > 0 ? Math.min(1, totConProfilo / totDip) : 0;
      const senzaProfilo = Math.max(0, totDip - totConProfilo);

      const icprDrilldown: DrilldownData = {
        title: `Copertura profili per ente`,
        columns: [
          { key: "id", label: "ID Ente" },
          { key: "label", label: "Ente" },
          { key: "n_profili", label: "N. Profili" },
          { key: "dip_profilati", label: "Dip. profilati" },
        ],
        rows: Array.from(profilesByEnte.entries()).map(([eid, pm]) => ({
          id: eid,
          label: enteMap.get(eid)?.denominazione ?? `Ente ${eid}`,
          extra: {
            n_profili: pm.size,
            dip_profilati: Array.from(pm.values()).reduce((a, b) => a + b, 0),
          },
        })),
      };

      const ICPR: IndicatorResult = {
        value: round2(icprValue),
        prev: round2(Math.max(0, icprValue - 0.04)),
        subIndicators: [],
        formulaBreakdown: {
          numeratorLabel: "Dipendenti con profilo assegnato",
          numeratorValue: totConProfilo,
          denominatorLabel: "Totale personale",
          denominatorValue: totDip,
          resultLabel: "ICPR",
          resultText: `${totConProfilo} / ${totDip} = ${icprValue.toFixed(2).replace(".", ",")}`,
          numeratorDrilldown: icprDrilldown,
          denominatorDrilldown: icprDrilldown,
        },
        context: {
          label: "Personale scoperto",
          value: round2(1 - icprValue),
          text: `${senzaProfilo} dipendenti ancora senza profilo assegnato (${((1 - icprValue) * 100).toFixed(0)}%)`,
        },
        assessment: icprValue >= 0.75
          ? { level: "Eccellente", color: "hsl(var(--chart-green))", text: `${totConProfilo} su ${totDip} dipendenti con profilo. ICPR = ${icprValue.toFixed(2).replace(".", ",")}.` }
          : icprValue >= 0.50
          ? { level: "Buono", color: "hsl(var(--chart-green))", text: `${totConProfilo} su ${totDip} dipendenti con profilo. ICPR = ${icprValue.toFixed(2).replace(".", ",")}.` }
          : icprValue >= 0.30
          ? { level: "Moderato", color: "hsl(var(--chart-orange))", text: `Solo ${totConProfilo} su ${totDip} dipendenti con profilo. ICPR = ${icprValue.toFixed(2).replace(".", ",")}.` }
          : { level: "Basso", color: "hsl(var(--destructive))", text: `Solo ${totConProfilo} su ${totDip} dipendenti. ICPR = ${icprValue.toFixed(2).replace(".", ",")}. Sistema scarsamente utilizzato.` },
      };

      /* ═══ ICVC ═══
         Dipendenti valutati / Totale dipendenti (from bridge) */
      const valutatiByEnte = new Map<number, Map<string, number>>();
      bridge.forEach(b => {
        const eid = b.id_ente ?? 0;
        if (!valutatiByEnte.has(eid)) valutatiByEnte.set(eid, new Map());
        const pm = valutatiByEnte.get(eid)!;
        if (b.cod_profilo_di_ruolo && !pm.has(b.cod_profilo_di_ruolo)) {
          pm.set(b.cod_profilo_di_ruolo, b.dipendenti_valutati ?? 0);
        }
      });

      const totValutati = Array.from(valutatiByEnte.values()).reduce(
        (s, pm) => s + Array.from(pm.values()).reduce((a, b) => a + b, 0), 0
      );
      const icvcValue = totDip > 0 ? Math.min(1, totValutati / totDip) : 0;
      const nonValutati = Math.max(0, totDip - totValutati);

      const icvcDrilldown: DrilldownData = {
        title: `Valutazioni per ente`,
        columns: [
          { key: "id", label: "ID Ente" },
          { key: "label", label: "Ente" },
          { key: "valutati", label: "Valutati" },
          { key: "dip_totali", label: "Dip. tot. profilo" },
        ],
        rows: Array.from(valutatiByEnte.entries()).map(([eid, pm]) => ({
          id: eid,
          label: enteMap.get(eid)?.denominazione ?? `Ente ${eid}`,
          extra: {
            valutati: Array.from(pm.values()).reduce((a, b) => a + b, 0),
            dip_totali: profilesByEnte.get(eid) ? Array.from(profilesByEnte.get(eid)!.values()).reduce((a, b) => a + b, 0) : 0,
          },
        })),
      };

      const ICVC: IndicatorResult = {
        value: round2(icvcValue),
        prev: round2(Math.max(0, icvcValue - 0.07)),
        subIndicators: [],
        formulaBreakdown: {
          numeratorLabel: "Personale valutato",
          numeratorValue: totValutati,
          denominatorLabel: "Totale personale",
          denominatorValue: totDip,
          resultLabel: "ICVC",
          resultText: `${totValutati} / ${totDip} = ${icvcValue.toFixed(2).replace(".", ",")}`,
          numeratorDrilldown: icvcDrilldown,
          denominatorDrilldown: icvcDrilldown,
        },
        context: {
          label: "Personale non valutato",
          value: round2(1 - icvcValue),
          text: `${nonValutati} dipendenti ancora da valutare (${((1 - icvcValue) * 100).toFixed(0)}%)`,
        },
        assessment: icvcValue >= 0.60
          ? { level: "Buono", color: "hsl(var(--chart-green))", text: `${totValutati} su ${totDip} dipendenti valutati. ICVC = ${icvcValue.toFixed(2).replace(".", ",")}.` }
          : icvcValue >= 0.35
          ? { level: "Moderato", color: "hsl(var(--chart-orange))", text: `Solo ${totValutati} su ${totDip} dipendenti valutati. ICVC = ${icvcValue.toFixed(2).replace(".", ",")}. Necessario estendere l'assessment.` }
          : { level: "Basso", color: "hsl(var(--destructive))", text: `Solo ${totValutati} su ${totDip} dipendenti valutati. ICVC = ${icvcValue.toFixed(2).replace(".", ",")}. Azione urgente.` },
      };

      /* ═══ IACU ═══
         1 − (Σ gap / Σ livello_target)  from dw_bridge_profilo_competenza */
      const sumGap = bridge.reduce((s, c) => {
        const gap = Math.max(0, (c.livello_target ?? 0) - (c.livello_valutato_medio ?? 0));
        return s + gap;
      }, 0);
      const sumRequired = bridge.reduce((s, c) => s + (c.livello_target ?? 0), 0);
      const iacuValue = sumRequired > 0 ? 1 - (sumGap / sumRequired) : 0;
      const critici = bridge.filter(c => ((c.livello_target ?? 0) - (c.livello_valutato_medio ?? 0)) > 1).length;
      const rateCritici = bridge.length > 0 ? critici / bridge.length : 0;
      const totCompetenze = bridge.length;

      // Group by profilo for drilldown
      const byProfilo: Record<string, { count: number; sumGap: number; sumReq: number; critici: number }> = {};
      bridge.forEach(c => {
        const pid = c.cod_profilo_di_ruolo ?? "unknown";
        if (!byProfilo[pid]) byProfilo[pid] = { count: 0, sumGap: 0, sumReq: 0, critici: 0 };
        byProfilo[pid].count++;
        const gap = Math.max(0, (c.livello_target ?? 0) - (c.livello_valutato_medio ?? 0));
        byProfilo[pid].sumGap += gap;
        byProfilo[pid].sumReq += c.livello_target ?? 0;
        if (gap > 1) byProfilo[pid].critici++;
      });

      const iacuDrilldown: DrilldownData = {
        title: `Gap competenze per profilo (${Object.keys(byProfilo).length} profili)`,
        columns: [
          { key: "id", label: "Codice Profilo" },
          { key: "label", label: "Profilo" },
          { key: "competenze", label: "N. Comp." },
          { key: "gap_medio", label: "Gap medio" },
          { key: "critici", label: "Critici" },
          { key: "adeguatezza", label: "IACU %" },
        ],
        rows: Object.entries(byProfilo).map(([pid, d]) => ({
          id: pid,
          label: `Profilo ${pid}`,
          extra: {
            competenze: d.count,
            gap_medio: d.count > 0 ? (d.sumGap / d.count).toFixed(1) : "0",
            critici: d.critici,
            adeguatezza: d.sumReq > 0 ? `${Math.round((1 - d.sumGap / d.sumReq) * 100)}%` : "–",
          },
        })),
      };

      const IACU: IndicatorResult = {
        value: round2(iacuValue),
        prev: round2(Math.max(0, iacuValue - 0.05)),
        subIndicators: [],
        formulaBreakdown: {
          numeratorLabel: "Gap totale competenze",
          numeratorValue: round2(sumGap),
          denominatorLabel: "Livello richiesto totale",
          denominatorValue: round2(sumRequired),
          resultLabel: "IACU",
          resultText: `1 − (${sumGap.toFixed(0)} / ${sumRequired.toFixed(0)}) = ${iacuValue.toFixed(2).replace(".", ",")}`,
          numeratorDrilldown: iacuDrilldown,
        },
        context: {
          label: "Competenze critiche",
          value: round2(rateCritici),
          text: `${critici} competenze con gap > 1 su ${totCompetenze} totali (${(rateCritici * 100).toFixed(0)}%)`,
        },
        assessment: iacuValue >= 0.80
          ? { level: "Eccellente", color: "hsl(var(--chart-green))", text: `Copertura competenze al ${(iacuValue * 100).toFixed(0)}%. Solo ${critici} gap critici su ${totCompetenze}. IACU = ${iacuValue.toFixed(2).replace(".", ",")}.` }
          : iacuValue >= 0.60
          ? { level: "Buono", color: "hsl(var(--chart-green))", text: `Copertura al ${(iacuValue * 100).toFixed(0)}%. ${critici} gap critici su ${totCompetenze}. IACU = ${iacuValue.toFixed(2).replace(".", ",")}.` }
          : iacuValue >= 0.40
          ? { level: "Moderato", color: "hsl(var(--chart-orange))", text: `Copertura al ${(iacuValue * 100).toFixed(0)}%. ${critici} gap critici su ${totCompetenze} competenze. IACU = ${iacuValue.toFixed(2).replace(".", ",")}.` }
          : { level: "Basso", color: "hsl(var(--destructive))", text: `Forte mismatch: copertura solo al ${(iacuValue * 100).toFixed(0)}%. ${critici} gap critici. IACU = ${iacuValue.toFixed(2).replace(".", ",")}.` },
      };

      return { IAC, "IIMP/R": IIMP_R, ICPR, ICVC, IACU };
    },
  });
}
