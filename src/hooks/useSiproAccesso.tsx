/**
 * Accesso ai dati SIPrO per gli utenti di ente (ruolo ente_hr).
 *
 * Regole:
 *  - DFP / admin: nessuna restrizione (stato "dfp").
 *  - Utente di ente: l'ente attivo (useEnteScope) deve essere ACCREDITATO in SIPrO,
 *    cioè presente in `sipro_mv_enti`. Se non lo è, nessun dato SIPrO è visibile
 *    (stato "non-accreditato").
 *  - Utente di ente accreditato: i filtri Ente e Regione sono applicati
 *    direttamente e bloccati (codice fiscale dell'ente e sua regione), senza
 *    poter vedere altre regioni o altri enti.
 *
 * SiproAccessoProvider è montato da SiproContentRouter; le viste leggono il perimetro
 * iniziale con useSiproInitialScope().
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useEnteScope } from "@/hooks/useEnteScope";
import { fetchSiproEnti, type SiproEnteOption } from "@/services/sipro/filtriService";

export type SiproAccessoStato = "dfp" | "loading" | "ok" | "non-accreditato" | "errore";

export interface SiproAccesso {
  stato: SiproAccessoStato;
  /** Ente attivo accreditato (solo utenti di ente). */
  ente: SiproEnteOption | null;
  /** CF dell'utente di ente accreditati in SIPrO (per il messaggio di cortesia). */
  accreditati: string[];
}

export function useSiproAccessoQuery(): SiproAccesso {
  const scope = useEnteScope();
  const q = useQuery({ queryKey: ["sipro-enti"], queryFn: fetchSiproEnti, staleTime: Infinity });
  return useMemo<SiproAccesso>(() => {
    if (!scope.isEnteUser) return { stato: "dfp", ente: null, accreditati: [] };
    if (q.isLoading) return { stato: "loading", ente: null, accreditati: [] };
    if (q.isError) return { stato: "errore", ente: null, accreditati: [] };
    const byCf = new Map((q.data ?? []).map((e) => [e.codiceFiscale, e]));
    const accreditati = scope.options.map((o) => o.cf).filter((cf) => byCf.has(cf));
    const ente = scope.codiceFiscale ? (byCf.get(scope.codiceFiscale) ?? null) : null;
    return { stato: ente ? "ok" : "non-accreditato", ente, accreditati };
  }, [scope.isEnteUser, scope.codiceFiscale, scope.options, q.isLoading, q.isError, q.data]);
}

const Ctx = createContext<SiproAccesso>({ stato: "dfp", ente: null, accreditati: [] });

export const SiproAccessoProvider = ({ value, children }: { value: SiproAccesso; children: ReactNode }) => (
  <Ctx.Provider value={value}>{children}</Ctx.Provider>
);

export const useSiproAccesso = () => useContext(Ctx);

/** Perimetro iniziale delle viste SIPrO: ente + regione bloccati per gli utenti di ente. */
export function useSiproInitialScope(): { codiceFiscale: string | null; regione: string | null } {
  const { ente } = useSiproAccesso();
  return ente ? { codiceFiscale: ente.codiceFiscale, regione: ente.regione } : { codiceFiscale: null, regione: null };
}
