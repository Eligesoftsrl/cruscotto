/**
 * Service scheda "KPI Riforma PA — KPI Abilitanti e di Successo".
 * Mappatura: docs/mappature/mappatura-scheda-kpi-riforma_3_Filippo.xlsx
 *
 * RPC (sola lettura):
 *  - kpi_filtri  (POST, body {})  -> { anni: number[], anno_predefinito: number }
 *    Una volta all'avvio: gli anni NON sono scritti nel codice.
 *  - kpi_scheda  (p_anno)         -> 39 righe (una per KPI), gia ordinate dal DB
 *    (D6.2 prima di D6.10). UNA SOLA chiamata alimenta le sei card e tutti gli
 *    accordion; un anno non presente restituisce lista vuota (non errore).
 *  - kpi_enti_partecipanti (p_anno=2024) -> enti PARTECIPANTI alla rilevazione (lista di riferimento)
 *    (in arrivo dal backend). Serve a bloccare la scheda agli utenti di ente non
 *    censiti, come per il SIPrO. Finché la RPC non esiste il controllo resta
 *    inattivo e la scheda funziona come oggi (si attiva da sola al rilascio).
 *    Formati accettati: text[] · setof text · setof { codice_fiscale | cfiscale | cf }.
 */
import { sbUntyped } from "@/integrations/supabase/untyped";

export interface KpiFiltri {
  anni: number[];
  anno_predefinito: number | null;
}

export interface KpiSchedaRow {
  anno: number;
  dimensione: string; // "D1" … "D6"
  descrizione_dimensione: string | null;
  kpi: string; // "D1.1"
  nome: string | null;
  unita: string | null; // "%" · "numero" · "anni"
  valore: number | null; // numeric, 2 decimali
  tipo_sintesi: string | null; // "Formula complessiva" · "Media semplice"
  formula_catalogo: string | null;
}

const SCHEDA_COLS =
  "anno,dimensione,descrizione_dimensione,kpi,nome,unita,valore,tipo_sintesi,formula_catalogo";

export async function fetchKpiFiltri(): Promise<KpiFiltri> {
  const { data, error } = await sbUntyped.rpc("kpi_filtri", {});
  if (error) throw error;
  const d = (Array.isArray(data) ? data[0] : data) as Partial<KpiFiltri> | null;
  const anni = [...(d?.anni ?? [])].map(Number).filter(Number.isFinite).sort((a, b) => b - a);
  return { anni, anno_predefinito: d?.anno_predefinito ?? anni[0] ?? null };
}

export async function fetchKpiScheda(anno: number): Promise<KpiSchedaRow[]> {
  const { data, error } = await sbUntyped.rpc("kpi_scheda", { p_anno: anno }).select(SCHEDA_COLS);
  if (error) throw error;
  return (data ?? []) as unknown as KpiSchedaRow[];
}

/** Risultato del controllo "ente partecipante": null = controllo non disponibile (nessun blocco). */
export type KpiEntiCensiti = Set<string> | null;

/**
 * Anno di riferimento della lista enti partecipanti: fornito dal backend come
 * lista "garantita" (alcuni dati KPI sono espressi solo come totale enti).
 */
export const KPI_ANNO_ENTI_PARTECIPANTI = 2024;

export async function fetchKpiEntiCensiti(): Promise<KpiEntiCensiti> {
  try {
    const { data, error } = await sbUntyped.rpc("kpi_enti_partecipanti", {
      p_anno: KPI_ANNO_ENTI_PARTECIPANTI,
    });
    if (error) {
      console.warn("[KPI] verifica enti partecipanti non disponibile:", error.message);
      return null; // controllo non disponibile: si lasciano vedere i dati
    }
    const out = new Set<string>();
    const add = (v: unknown) => {
      if (typeof v === "string") out.add(v.trim());
      else if (v && typeof v === "object") {
        const o = v as Record<string, unknown>;
        const cf = o.cf_ente ?? o.codice_fiscale ?? o.cfiscale ?? o.cf;
        if (typeof cf === "string") out.add(cf.trim());
        else if (Array.isArray(cf)) cf.forEach(add);
      }
    };
    (Array.isArray(data) ? data : [data]).forEach((v) => (Array.isArray(v) ? v.forEach(add) : add(v)));
    return out.size > 0 ? out : null; // lista vuota = dato anomalo: nessun blocco
  } catch (e) {
    console.warn("[KPI] verifica enti partecipanti fallita:", e);
    return null;
  }
}
