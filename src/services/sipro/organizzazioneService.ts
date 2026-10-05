/**
 * Service SIPRO - sezione "Organizzazione".
 * Accesso dati tramite RPC reali Supabase (sipro_*), coerente con il pattern
 * del Conto Annuale (services/ca). Isolamento multi-tenant via p_codice_fiscale
 * (perimetro ente derivato dai claim Keycloak tramite useEnteScope).
 *
 * Schede coperte:
 *  02 Organigramma UO       -> sipro_uo_distribuzione
 *  03 Stato Organizzazione  -> sipro_organizzazioni_stati + sipro_organizzazioni
 *  04 Provvedimenti         -> sipro_provvedimenti_andamento + sipro_provvedimenti
 *  07 Dotazione Risorse UO  -> sipro_dotazione_uo + sipro_dotazione_uo_riepilogo
 *  18 Criticita UO          -> sipro_criticita + sipro_criticita_distribuzione
 */
import { sbUntyped } from "@/integrations/supabase/untyped";

export interface SiproFiltri {
  codiceFiscale?: string | null;
  regione?: string | null;
}

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
async function rpcOne<T>(fn: string, params: Record<string, unknown>): Promise<T | null> {
  const rows = await rpcRows<T>(fn, params);
  return rows[0] ?? null;
}

/* ------------------------------ Tipi output ------------------------------ */
export interface UoDistribuzioneRow {
  codice_fiscale: string | null; ente: string | null;
  voce_id: string; voce: string; numero: number; totale_uo: number; percentuale: number | null;
}
export interface OrganizzazioniStatiRow {
  stato_id: number; stato: string; numero: number; percentuale: number | null;
  organizzazioni_totali: number; formalizzate: number; in_inserimento: number;
}
export interface OrganizzazioneRow {
  organizzazione_id: number; codice_fiscale: string; ente: string;
  organizzazione: string; stato_id: number; stato: string; totale_righe: number;
}
export interface ProvvedimentiAndamentoRow {
  mese: string; numero: number; provvedimenti_totali: number; enti_coinvolti: number; senza_data: number;
}
export interface ProvvedimentoRow {
  provvedimento_id: number; codice_fiscale: string; ente: string;
  provvedimento: string; data_adozione: string; totale_righe: number;
}
export interface DotazioneUoRow {
  uo_id: number; codice_fiscale: string; ente: string; uo: string;
  dotazione: number; servizio_ti: number; servizio_td: number; gap_ti: number; totale_righe: number;
}
export interface DotazioneUoRiepilogoRow {
  codice_fiscale: string | null; ente: string | null;
  dotazione: number; servizio_ti: number; servizio_td: number; gap_ti: number;
  copertura_ti_pct: number | null; servizio_ti_valido: number; dotazione_valida: number;
  uo_coppie_valide: number; totale_uo: number;
}
export interface CriticitaRow {
  oggetto_id: number; codice_fiscale: string; ente: string; oggetto: string;
  criticita_id: string; criticita: string; categoria_id: number; categoria: string; totale_righe: number;
}
export interface CriticitaDistribuzioneRow {
  codice_fiscale: string | null; ente: string | null; oggetto_id: number | null; oggetto: string | null;
  categoria_id: number; categoria: string; occorrenze: number;
  oggetti_coinvolti: number; oggetti_totali: number; incidenza_pct: number | null;
}

/* ------------------------------- Chiamate -------------------------------- */
// 02 - Organigramma UO (dim = 'livello' | 'responsabilita'; vista aggregata p_per_ente=false)
export const fetchUoDistribuzione = (f: SiproFiltri, dimensione: "livello" | "responsabilita") =>
  rpcRows<UoDistribuzioneRow>("sipro_uo_distribuzione", {
    ...baseParams(f), p_dimensione: dimensione, p_per_ente: false,
  });

// 03 - Stato Organizzazione
export const fetchOrganizzazioniStati = (f: SiproFiltri) =>
  rpcRows<OrganizzazioniStatiRow>("sipro_organizzazioni_stati", baseParams(f));
export const fetchOrganizzazioni = (f: SiproFiltri, limit = 20, offset = 0) =>
  rpcRows<OrganizzazioneRow>("sipro_organizzazioni", { ...baseParams(f), p_limit: limit, p_offset: offset });

// 04 - Provvedimenti (filtro data in sospeso: solo ordinamento lato RPC)
export const fetchProvvedimentiAndamento = (f: SiproFiltri) =>
  rpcRows<ProvvedimentiAndamentoRow>("sipro_provvedimenti_andamento", baseParams(f));
export const fetchProvvedimenti = (f: SiproFiltri, limit = 20, offset = 0) =>
  rpcRows<ProvvedimentoRow>("sipro_provvedimenti", { ...baseParams(f), p_limit: limit, p_offset: offset });

// 07 - Dotazione Risorse UO
export const fetchDotazioneUo = (f: SiproFiltri, limit = 20, offset = 0) =>
  rpcRows<DotazioneUoRow>("sipro_dotazione_uo", { ...baseParams(f), p_limit: limit, p_offset: offset });
export const fetchDotazioneUoRiepilogo = (f: SiproFiltri) =>
  rpcOne<DotazioneUoRiepilogoRow>("sipro_dotazione_uo_riepilogo", { ...baseParams(f), p_per_ente: false });

// 18 - Criticita UO (ambito 'uo')
export const fetchCriticita = (f: SiproFiltri, limit = 20, offset = 0) =>
  rpcRows<CriticitaRow>("sipro_criticita", { ...baseParams(f), p_ambito: "uo", p_limit: limit, p_offset: offset });
export const fetchCriticitaDistribuzione = (f: SiproFiltri) =>
  rpcRows<CriticitaDistribuzioneRow>("sipro_criticita_distribuzione", {
    ...baseParams(f), p_ambito: "uo", p_grana: "totale", p_dimensione: "categoria",
  });
