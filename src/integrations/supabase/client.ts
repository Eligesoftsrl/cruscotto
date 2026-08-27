// Client Supabase dell'applicazione.
// La configurazione (URL + chiave) proviene ESCLUSIVAMENTE da src/config/env.ts,
// che legge le variabili VITE_SUPABASE_* (nessun valore hardcoded qui).
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { env } from "@/config/env";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
