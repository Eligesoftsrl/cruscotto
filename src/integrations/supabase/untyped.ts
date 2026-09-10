/**
 * Client Supabase "non tipizzato" per oggetti NON presenti nei tipi generati
 * (Database): le funzioni RPC reali `fa_ca_*` e il dizionario `mv_filtri`.
 * Isola qui l'unico cast, così i service restano puliti e la build TS non rompe.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const sbUntyped = supabase as unknown as SupabaseClient;
