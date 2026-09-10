/**
 * Service filtri della scheda Analisi Eta: legge il dizionario public.mv_filtri.
 * Cascata Comparto -> Macrocategoria -> Categoria; Anno/Regione indipendenti.
 * mv_filtri e partizionata per anno.
 */
import { sbUntyped } from "@/integrations/supabase/untyped";

export interface FiltroOpzione {
  chiave: string;
  codice: string;
  descrizione: string;
  chiave_padre?: string | null;
}

/** Rimuove eventuali doppi apici presenti in alcune descrizioni della fonte. */
function clean(s: string | null | undefined): string {
  return String(s ?? "").replace(/^"|"$/g, "");
}

async function query(tipo: string, anno: number, chiavePadre?: string): Promise<FiltroOpzione[]> {
  let q = sbUntyped
    .from("mv_filtri")
    .select("chiave, codice, descrizione, chiave_padre")
    .eq("tipo", tipo)
    .eq("anno", anno)
    .order("ordine", { ascending: true })
    .order("descrizione", { ascending: true });
  if (chiavePadre) q = q.eq("chiave_padre", chiavePadre);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((r) => ({
    chiave: String((r as Record<string, unknown>).chiave ?? ""),
    codice: String((r as Record<string, unknown>).codice ?? ""),
    descrizione: clean((r as Record<string, unknown>).descrizione as string),
    chiave_padre: (r as Record<string, unknown>).chiave_padre as string | null,
  }));
}

export const fetchAnni = async (): Promise<number[]> => {
  const { data, error } = await sbUntyped
    .from("mv_filtri")
    .select("codice")
    .eq("tipo", "anno")
    .order("codice", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => Number((r as Record<string, unknown>).codice)).filter(Number.isFinite);
};

export const fetchComparti = (anno: number) => query("comparto", anno);
// chiave_padre = 'comparto:<codice>'
export const fetchMacrocategorie = (anno: number, chiaveComparto: string) =>
  query("macrocategoria", anno, chiaveComparto);
// chiave_padre = <chiave della macrocategoria selezionata>
export const fetchCategorie = (anno: number, chiaveMacro: string) =>
  query("categoria", anno, chiaveMacro);

export const fetchRegioni = (anno: number) => query("regione", anno);

/** Ricerca enti per il selettore (autocomplete): tipo='ente', filtro ilike sulla descrizione. */
export async function searchEnti(anno: number, term: string): Promise<FiltroOpzione[]> {
  if (!term || term.trim().length < 2) return [];
  const { data, error } = await sbUntyped
    .from("mv_filtri")
    .select("codice, descrizione")
    .eq("tipo", "ente")
    .eq("anno", anno)
    .ilike("descrizione", `%${term.trim()}%`)
    .order("descrizione", { ascending: true })
    .limit(20);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    chiave: String((r as Record<string, unknown>).codice ?? ""),
    codice: String((r as Record<string, unknown>).codice ?? ""),
    descrizione: clean((r as Record<string, unknown>).descrizione as string),
  }));
}
