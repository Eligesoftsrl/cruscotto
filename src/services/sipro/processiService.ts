/**
 * Service SIPRO - sezione "Processi" (schede S15-S23).
 * RPC reali Supabase sipro_*. Filtri: Ente (singola selezione) + Regione,
 * tramite il tipo SiproFiltri condiviso (p_codice_fiscale / p_regione).
 */
import { sbUntyped } from "@/integrations/supabase/untyped";
import type { SiproFiltri } from "@/services/sipro/organizzazioneService";

export type { SiproFiltri };

function baseParams(f: SiproFiltri): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  if (f.codiceFiscale) p.p_codice_fiscale = f.codiceFiscale;
  if (f.regione) p.p_regione = f.regione;
  return p;
}
async function rpcRows<T>(fn: string, params: Record<string, unknown>): Promise<T[]> {
  const { data, error } = await sbUntyped.rpc(fn, params);
  if (error) throw error;
  return (data ?? []) as T[];
}

/* ------------------------------ Tipi output ------------------------------ */
export interface ProcessiDistribuzioneRow {
  codice_fiscale: string | null; ente: string | null;
  voce_id: string; voce: string; numero: number; totale_processi: number; percentuale: number | null;
}
export interface ProcessoRow {
  processo_id: number; codice_fiscale: string; ente: string; processo: string;
  funzione: string; tipologia_id: number; tipologia: string; obiettivo_id: number; obiettivo: string;
  rilevanza: string; altre_amministrazioni: string; semplificazione: string; presidio: string;
  picchi: string; numero_criticita: number; totale_righe: number;
}
export interface SemplificazioneProcessoRow {
  processo_id: number; codice_fiscale: string; ente: string; processo: string;
  numero_fasi: number; numero_criticita: number; stato_id: number | null; semplificazione: string; totale_righe: number;
}
export interface CriticitaDistribuzioneRow {
  categoria_id: number; categoria: string; occorrenze: number;
  oggetti_coinvolti: number; oggetti_totali: number; incidenza_pct: number | null;
}
export interface DigitalizzazioneFasiRow {
  stato_id: number | null; stato: string; numero: number; numero_fasi: number; percentuale: number | null;
}
export interface FasiRiepilogoRow {
  processo_id: number; codice_fiscale: string; ente: string; processo: string;
  numero_fasi: number; fasi_esternalizzate: number; fasi_agile: number; digitale_prevalente: string | null;
  outsourcing_totale: number; outsourcing_parziale: number; outsourcing_no: number; outsourcing_non_specificato: number;
  totale_righe: number;
}
export interface CoinvolgimentoUoRow {
  processo_id: number; codice_fiscale: string; ente: string; processo: string;
  numero_uo: number; altre_amministrazioni: string; totale_righe: number;
}
export interface TempiPicchiRow {
  processo_id: number; codice_fiscale: string; ente: string; processo: string;
  previsto: number | null; effettivo: number | null; totale_righe: number;
}
export interface PicchiDistribuzioneRow {
  voce_id: string | null; voce: string; numero: number; denominatore: number; percentuale: number | null;
  con_picchi: number; senza_picchi: number; picchi_non_specificati: number;
  con_presidio: number; senza_presidio: number; presidio_non_specificato: number;
}

/* ------------------------------- Chiamate -------------------------------- */
// S15 / S16 distribuzioni processi (funzione | tipologia | obiettivo)
export const fetchProcessiDistribuzione = (f: SiproFiltri, dim: "funzione" | "tipologia" | "obiettivo") =>
  rpcRows<ProcessiDistribuzioneRow>("sipro_processi_distribuzione", { ...baseParams(f), p_dimensione: dim, p_per_ente: false });

// S16 elenco processi censiti
export const fetchProcessi = (f: SiproFiltri, limit = 20, offset = 0) =>
  rpcRows<ProcessoRow>("sipro_processi", { ...baseParams(f), p_limit: limit, p_offset: offset });

// S17 / S22 tabella semplificazione + distribuzione criticita (ambito 'processo')
export const fetchSemplificazioneProcessi = (f: SiproFiltri, limit = 20, offset = 0) =>
  rpcRows<SemplificazioneProcessoRow>("sipro_semplificazione_processi", { ...baseParams(f), p_limit: limit, p_offset: offset });
export const fetchCriticitaDistribuzioneProcesso = (f: SiproFiltri) =>
  rpcRows<CriticitaDistribuzioneRow>("sipro_criticita_distribuzione", { ...baseParams(f), p_ambito: "processo", p_grana: "totale", p_dimensione: "categoria" });

// S19 / S20 digitalizzazione fasi (digitale | outsourcing | agile) + riepilogo per processo
export const fetchDigitalizzazioneFasi = (f: SiproFiltri, dim: "digitale" | "outsourcing" | "agile") =>
  rpcRows<DigitalizzazioneFasiRow>("sipro_digitalizzazione_fasi", { ...baseParams(f), p_dimensione: dim });
export const fetchFasiRiepilogo = (f: SiproFiltri, limit = 20, offset = 0) =>
  rpcRows<FasiRiepilogoRow>("sipro_fasi_riepilogo", { ...baseParams(f), p_limit: limit, p_offset: offset });

// S21 outsourcing / coinvolgimento UO
export const fetchCoinvolgimentoUo = (f: SiproFiltri, limit = 20, offset = 0) =>
  rpcRows<CoinvolgimentoUoRow>("sipro_coinvolgimento_uo", { ...baseParams(f), p_limit: limit, p_offset: offset });

// S23 tempi e picchi
export const fetchTempiPicchi = (f: SiproFiltri, limit = 20, offset = 0) =>
  rpcRows<TempiPicchiRow>("sipro_tempi_picchi", { ...baseParams(f), p_limit: limit, p_offset: offset });
export const fetchPicchiDistribuzione = (f: SiproFiltri, dim: "frequenza" | "intensita" | "presidio") =>
  rpcRows<PicchiDistribuzioneRow>("sipro_picchi_distribuzione", { ...baseParams(f), p_dimensione: dim });
