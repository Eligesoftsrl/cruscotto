// Client Supabase dell'applicazione.
// La configurazione (URL + chiave) proviene ESCLUSIVAMENTE da src/config/env.ts,
// che legge le variabili VITE_SUPABASE_* (nessun valore hardcoded qui).
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { env } from "@/config/env";
import { EXCHANGE_ENABLED, getSupabaseAccessToken } from "./exchangeToken";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Con lo scambio token attivo (VITE_EXCHANGE_URL): supabase-js usa il token
// coniato dal proxy (claim is_global/enti_cf -> RLS). Altrimenti resta la
// configurazione precedente basata sulla sola chiave anon.
export const supabase = EXCHANGE_ENABLED
  ? createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
      accessToken: async () => (await getSupabaseAccessToken()) ?? env.supabaseAnonKey,
    })
  : createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
