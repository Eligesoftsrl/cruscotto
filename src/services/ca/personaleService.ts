/**
 * Service scheda "Conto Annuale - Analisi del personale".
 *   - fa_ca_personale_kpi         -> 4 card (full params, incl. p_genere). Riga singola.
 *   - fa_ca_personale_categorie   -> bar per macrocategoria (NO macro/categoria).
 *   - fa_ca_personale_titoli      -> donut titolo di studio (full params).
 *   - fa_ca_personale_evoluzione  -> line serie storica (NO p_anno, NO p_genere).
 * Solo letture RPC.
 */
import { sbUntyped } from "@/integrations/supabase/untyped";

export type Genere = "T" | "U" | "D";

export interface PersonaleFiltri {
  anno: number;
  istituzione?: string | null;
  codiceFiscale?: string | null;
  comparto?: string | null;
  macrocategoria?: string | null;
  categoria?: string | null;
  regione?: string | null;
  genere?: Genere | null;
}

function buildFull(f: PersonaleFiltri): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  if (f.anno != null) p.p_anno = f.anno;
  if (f.istituzione) p.p_istituzione = f.istituzione;
  if (f.codiceFiscale) p.p_codice_fiscale = f.codiceFiscale;
  if (f.comparto) p.p_comparto = f.comparto;
  if (f.macrocategoria) p.p_macrocategoria = f.macrocategoria;
  if (f.categoria) p.p_categoria = f.categoria;
  if (f.regione) p.p_regione = f.regione;
  if (f.genere && f.genere !== "T") p.p_genere = f.genere;
  return p;
}
// categorie: senza macro/categoria
function buildCat(f: PersonaleFiltri): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  if (f.anno != null) p.p_anno = f.anno;
  if (f.istituzione) p.p_istituzione = f.istituzione;
  if (f.codiceFiscale) p.p_codice_fiscale = f.codiceFiscale;
  if (f.comparto) p.p_comparto = f.comparto;
  if (f.regione) p.p_regione = f.regione;
  if (f.genere && f.genere !== "T") p.p_genere = f.genere;
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

/* ----------------------------- Tipi output ------------------------------- */
export interface PersonaleKpi {
  personale: number | null;
  dirigenti: number | null;
  non_dirigenti: number | null;
  var_prec_pct: number | null;
}
export interface PersonaleCategoriaRow { categoria: string; descrizione: string; valore: number; }
export interface PersonaleTitoloRow { titolo_studio: string; valore: number; percentuale: number | null; }
export interface PersonaleEvoluzioneRow { anno: number; uomini: number; donne: number; tutti: number; }

/* ------------------------------ Chiamate --------------------------------- */
export const fetchPersonaleKpi = (f: PersonaleFiltri) =>
  rpcOne<PersonaleKpi>("fa_ca_personale_kpi", buildFull(f));
export const fetchPersonaleCategorie = (f: PersonaleFiltri) =>
  rpcRows<PersonaleCategoriaRow>("fa_ca_personale_categorie", buildCat(f));
export const fetchPersonaleTitoli = (f: PersonaleFiltri) =>
  rpcRows<PersonaleTitoloRow>("fa_ca_personale_titoli", buildFull(f));
export const fetchPersonaleEvoluzione = (f: PersonaleFiltri) => {
  const params = buildFull(f);
  delete params.p_anno;
  delete params.p_genere;
  return rpcRows<PersonaleEvoluzioneRow>("fa_ca_personale_evoluzione", params);
};
