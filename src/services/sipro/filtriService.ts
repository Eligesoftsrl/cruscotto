/**
 * Service filtri SIPRO: elenco enti e regioni dalla vista `sipro_mv_enti`.
 * Usato dal selettore Ente (singola selezione, default "Tutti") e dal filtro
 * Regione. La selezione multi-ente e prevista solo nella scheda Benchmark.
 */
import { sbUntyped } from "@/integrations/supabase/untyped";

export interface SiproEnteOption {
  codiceFiscale: string;
  ente: string;
  regione: string | null;
}

/** Elenco enti (dedotto per codice fiscale) ordinato per denominazione. */
export async function fetchSiproEnti(): Promise<SiproEnteOption[]> {
  const { data, error } = await sbUntyped
    .from("sipro_mv_enti")
    .select("codice_fiscale, ente, regione")
    .order("ente", { ascending: true });
  if (error) throw error;

  const seen = new Set<string>();
  const out: SiproEnteOption[] = [];
  (data ?? []).forEach((r) => {
    const row = r as Record<string, unknown>;
    const cf = String(row.codice_fiscale ?? "").trim();
    if (!cf || seen.has(cf)) return;
    seen.add(cf);
    out.push({
      codiceFiscale: cf,
      ente: String(row.ente ?? cf),
      regione: (row.regione as string | null) ?? null,
    });
  });
  return out;
}
