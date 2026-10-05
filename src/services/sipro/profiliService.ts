/**
 * Service SIPRO - sezione "Profili e Cataloghi" (schede S05-S14).
 * RPC reali Supabase. Filtri Ente(singolo)+Regione per le schede FTE/Copertura/Catalogo/Evoluzione.
 * NOTA: sipro_cataloghi_minerva NON accetta p_codice_fiscale / p_regione (cataloghi globali).
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
async function rpcOne<T>(fn: string, params: Record<string, unknown>): Promise<T | null> {
  const rows = await rpcRows<T>(fn, params);
  return rows[0] ?? null;
}

/* ------------------------------ Tipi output ------------------------------ */
export interface FteRiepilogoRow {
  fte_programmati: number; fte_assegnati: number; scostamento_fte: number; copertura_pct: number | null;
  numero_profili: number; totale_assegnazioni: number;
}
export interface FteProfiloRow {
  profilo_key: string; profilo: string; fte_programmati: number; fte_assegnati: number;
  scostamento_fte: number; copertura_pct: number | null; classe_copertura: string; totale_righe: number;
}
export interface FteRow {
  profilo_fase_id: number; codice_fiscale: string; ente: string; processo_id: number; fase_id: number;
  profilo_key: string; profilo: string; fte_programmati: number; fte_assegnati: number; totale_righe: number;
}
export interface FteCoperturaRow {
  classe: string; numero_profili: number; totale_profili: number; percentuale: number | null;
}
export interface CatalogoRiepilogoRow {
  profili_totali: number; famiglie_totali: number; ambiti_totali: number; aree_totali: number;
  attivi: number | null; eliminati: number | null;
}
export interface CatalogoDistribuzioneRow {
  voce_id: string; voce: string; numero_profili: number; totale_profili: number; percentuale: number | null;
}
export interface CatalogoProfiloRow {
  profilo_key: string; profilo: string; famiglia_id: number | null; famiglia: string | null;
  ambito_id: number | null; ambito: string | null; area_id: number | null; area_contrattuale: string | null;
  origine: string | null; fte_programmati: number; fte_assegnati: number; totale_righe: number;
}
export interface MinervaRow {
  id: number; codice: string; denominazione: string; totale: number;
}

/* ------------------------------- Chiamate -------------------------------- */
// S05 FTE Programmati vs Assegnati
export const fetchFteRiepilogo = (f: SiproFiltri) =>
  rpcOne<FteRiepilogoRow>("sipro_fte_riepilogo", baseParams(f));
export const fetchFteProfili = (f: SiproFiltri, limit?: number | null, offset?: number) => {
  const p = baseParams(f);
  if (typeof limit === "number") p.p_limit = limit;
  if (typeof offset === "number") p.p_offset = offset;
  return rpcRows<FteProfiloRow>("sipro_fte_profili", p);
};
export const fetchFte = (f: SiproFiltri, limit = 20, offset = 0) =>
  rpcRows<FteRow>("sipro_fte", { ...baseParams(f), p_limit: limit, p_offset: offset });

// S06 Copertura Profili di Ruolo
export const fetchFteCopertura = (f: SiproFiltri) =>
  rpcRows<FteCoperturaRow>("sipro_fte_copertura", baseParams(f));

// S08 Catalogo Profili di Ruolo
export const fetchCatalogoRiepilogo = (f: SiproFiltri) =>
  rpcOne<CatalogoRiepilogoRow>("sipro_catalogo_profili_riepilogo", baseParams(f));
export const fetchCatalogoDistribuzione = (f: SiproFiltri, dim: "origine" | "famiglia" | "ambito" | "area") =>
  rpcRows<CatalogoDistribuzioneRow>("sipro_catalogo_profili_distribuzione", { ...baseParams(f), p_dimensione: dim });
export const fetchCatalogoProfili = (f: SiproFiltri, limit = 20, offset = 0) =>
  rpcRows<CatalogoProfiloRow>("sipro_catalogo_profili", { ...baseParams(f), p_limit: limit, p_offset: offset });

// S10-S13 Cataloghi Minerva (globali, senza filtro ente/regione)
export const fetchMinerva = (tipo: "famiglia" | "profilo_professionale" | "ambito" | "area") =>
  rpcRows<MinervaRow>("sipro_cataloghi_minerva", { p_tipo: tipo });
