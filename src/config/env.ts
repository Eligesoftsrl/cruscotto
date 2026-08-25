/**
 * Configurazione centralizzata delle variabili d'ambiente.
 * UNICA sorgente di verita per le variabili VITE_*: nessun valore hardcoded altrove.
 *
 * Comportamento env-aware (gestito da Vite tramite i file .env):
 *  - ONLINE (preview / produzione): usa i valori del file `.env` committato
 *    (Supabase cloud -> https://<project>.supabase.co).
 *  - LOCALE (macchina sviluppatore): creare un file `.env.local` (ignorato da git)
 *    con `VITE_SUPABASE_URL=http://localhost:8000` per puntare al Supabase locale.
 *    Vite da SEMPRE precedenza a `.env.local` rispetto a `.env`, quindi lo stesso
 *    codice usa il cloud online e il localhost in locale senza modifiche.
 */

export interface AppEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseProjectId: string;
}

function readEnv(key: string, { required = true }: { required?: boolean } = {}): string {
  const value = import.meta.env[key as keyof ImportMetaEnv] as string | undefined;
  if (!value) {
    if (required) {
      // Non blocchiamo l'app: logghiamo un errore chiaro per facilitare il debug locale.
      console.error(
        `[config] Variabile d'ambiente mancante: ${key}. ` +
          `Definiscila nel file .env (online) o .env.local (locale).`,
      );
    }
    return "";
  }
  return value;
}

export const env: AppEnv = {
  supabaseUrl: readEnv("VITE_SUPABASE_URL"),
  supabaseAnonKey: readEnv("VITE_SUPABASE_PUBLISHABLE_KEY"),
  supabaseProjectId: readEnv("VITE_SUPABASE_PROJECT_ID", { required: false }),
};

/** True se sia URL che chiave anon sono configurati. */
export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
