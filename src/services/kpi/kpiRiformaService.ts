/**
 * Service scheda "KPI Riforma PA — KPI Abilitanti e di Successo".
 * Mappatura: docs/mappature/mappatura-scheda-kpi-riforma_3_Filippo.xlsx
 *
 * Due sole RPC (sola lettura):
 *  - kpi_filtri  (POST, body {})  -> { anni: number[], anno_predefinito: number }
 *    Una volta all'avvio: gli anni NON sono scritti nel codice.
 *  - kpi_scheda  (p_anno)         -> 39 righe (una per KPI), gia ordinate dal DB
 *    (D6.2 prima di D6.10). UNA SOLA chiamata alimenta le sei card e tutti gli
 *    accordion; un anno non presente restituisce lista vuota (non errore).
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
