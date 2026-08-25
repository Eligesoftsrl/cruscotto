import { supabase } from "@/integrations/supabase/client";

/**
 * Modulo di accesso dati per il dominio SIPRO.
 *
 * I grafici SIPRO eseguono query multi-tabella (ft_sipo_*, lk_sipo_*, lk_minerva_*,
 * lk_picchi_*, lk_enti) fortemente intrecciate con le trasformazioni di presentazione.
 * Per centralizzare l'accesso al database senza alterare la logica di questi grafici,
 * esponiamo `sipoFrom` come unico punto d'ingresso: i componenti non importano piu
 * direttamente il client Supabase, ma passano da questo layer di servizio.
 *
 * NB: e possibile in futuro sostituire progressivamente le chiamate `sipoFrom(...)`
 * con funzioni `fetchX()` dedicate e tipizzate, senza toccare i componenti.
 */
export const sipoFrom: typeof supabase.from = (relation: any) => supabase.from(relation);
