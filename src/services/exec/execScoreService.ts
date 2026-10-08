/**
 * Service Vista Executive / Sintetica - indicatori con SCORE [0-100].
 *
 * RPC reali (una per pillar): fa_ca_exec_<dx>_indicatori_score
 *   es. fa_ca_exec_d2_indicatori_score
 * Parametri: p_anno, p_istituzione, p_codice_fiscale, p_comparto, p_regione,
 *            p_codici (text[] - codici indice senza prefisso, es. ["IGF","IRS"]).
 * Regola d'oro: parametri null/undefined/"" NON inviati. Senza p_codici la RPC
 * restituisce tutte le righe del pillar (panoramica).
 * Solo letture RPC: nessuna scrittura sul DB remoto.
 */
import { sbUntyped } from "@/integrations/supabase/untyped";

export interface ExecScoreFiltri {
  anno: number;
  istituzione?: string | null;
  codiceFiscale?: string | null;
  comparto?: string | null;
  regione?: string | null;
}

export interface ExecScoreDettaglio {
  anno: number | null;
  valore: number | null;
  componente: string;
}

export interface ExecScoreRow {
  anno: number;
  id: string; // es. "D2.IGF"
  nome: string;
  descrizione: string | null;
  formula: string | null;
  interpretazione: string | null;
  dominio: string | null;
  unita: string | null;
  valore: number | null;
  var_anno_prec: number | null;
  componente_1: string | null;
  valore_1: number | null;
  anno_1: number | null;
  componente_2: string | null;
  valore_2: number | null;
  anno_2: number | null;
  formula_con_numeri: string | null;
  interconnessioni: string[] | null;
  dettagli: ExecScoreDettaglio[] | null;
  score: number | null; // gia in scala [0-100]
  var_score: number | null; // variazione in punti score vs anno precedente
  stato_score: string | null;
  famiglia_score: string | null;
  soglia_score: number | null;
  unita_soglia: string | null;
  descrizione_score: string | null;
  formula_score: string | null;
  badge: string | null; // Basso · Moderato · Buono · Eccellente
}

const rpcName = (pillar: string) => `fa_ca_exec_${pillar.toLowerCase()}_indicatori_score`;

function buildParams(f: ExecScoreFiltri, codici?: string[]): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  if (f.anno != null) p.p_anno = f.anno;
  if (f.istituzione) p.p_istituzione = f.istituzione;
  if (f.codiceFiscale) p.p_codice_fiscale = f.codiceFiscale;
  if (f.comparto) p.p_comparto = f.comparto;
  if (f.regione) p.p_regione = f.regione;
  if (codici && codici.length) p.p_codici = codici;
  return p;
}

export async function fetchExecIndicatoriScore(
  pillar: string,
  f: ExecScoreFiltri,
  codici?: string[],
): Promise<ExecScoreRow[]> {
  const { data, error } = await sbUntyped.rpc(rpcName(pillar), buildParams(f, codici));
  if (error) throw error;
  return (data ?? []) as ExecScoreRow[];
}

/** Codice indice senza prefisso pillar: "D2.IRS" -> "IRS". */
export const codiceIndice = (id: string) => (id.includes(".") ? id.split(".").slice(1).join(".") : id);
