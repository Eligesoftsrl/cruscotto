import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useEnteScope } from "@/hooks/useEnteScope";
import { fetchSiproEnti } from "@/services/sipro/filtriService";
import { EnteSelector } from "@/components/dashboard/EnteSelector";
import { useSiproAccesso } from "@/hooks/useSiproAccesso";
import { Lock } from "lucide-react";

export interface SiproScope {
  codiceFiscale: string | null;
  regione: string | null;
}

interface Props {
  value: SiproScope;
  onChange: (v: SiproScope) => void;
}

const labelCls =
  "text-[11px] font-semibold text-muted-foreground whitespace-nowrap uppercase tracking-wide";
const selectCls =
  "appearance-none rounded-md border border-input bg-background pl-3 pr-8 py-1.5 text-[12px] text-foreground outline-none focus:ring-1 focus:ring-ring cursor-pointer min-w-[200px]";

/**
 * Barra filtri SIPRO (sezioni non-benchmark): Regione + Ente (singola selezione,
 * default "Tutti"). Per gli utenti ente_hr l'ente e bloccato al perimetro del token
 * (useEnteScope); se abilitati a piu enti viene mostrato il relativo selettore.
 */
export const SiproScopeBar = ({ value, onChange }: Props) => {
  const scope = useEnteScope();
  const { ente: enteSipro } = useSiproAccesso();

  // ente_hr: ente (CF del token) e sua regione applicati e bloccati
  useEffect(() => {
    if (!scope.isEnteUser) return;
    const cf = enteSipro?.codiceFiscale ?? scope.codiceFiscale;
    const regione = enteSipro?.regione ?? null;
    if (value.codiceFiscale !== cf || value.regione !== regione) {
      onChange({ codiceFiscale: cf, regione });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope.isEnteUser, scope.codiceFiscale, enteSipro?.codiceFiscale]);

  const { data: enti = [] } = useQuery({
    queryKey: ["sipro-enti"],
    queryFn: fetchSiproEnti,
    enabled: !scope.isEnteUser,
    staleTime: Infinity,
  });

  const regioni = useMemo(
    () => Array.from(new Set(enti.map((e) => e.regione).filter(Boolean))).sort() as string[],
    [enti],
  );
  const entiFiltrati = useMemo(
    () => (value.regione ? enti.filter((e) => e.regione === value.regione) : enti),
    [enti, value.regione],
  );

  // ente_hr: ente bloccato al perimetro; scelta ente a destra nella barra filtri
  if (scope.isEnteUser) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card px-4 py-2.5" data-testid="sipro-scope-ente">
        <span className={labelCls}>Filtri</span>
        {enteSipro?.regione && (
          <span
            className="inline-flex items-center gap-1.5 rounded-md border border-input bg-muted px-3 py-1.5 text-[12px] text-foreground"
            title="Regione dell'ente: non modificabile"
            data-testid="sipro-regione-bloccata"
          >
            <span className={labelCls}>Regione</span>
            <span className="font-medium">{enteSipro.regione}</span>
            <Lock className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
          </span>
        )}
        <EnteSelector className="ml-auto" />
      </div>
    );
  }

  // DFP: Regione + Ente (singola selezione)
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card px-4 py-2.5">
      <div className="flex items-center gap-2">
        <label className={labelCls}>Regione</label>
        <div className="relative">
          <select
            className={selectCls}
            value={value.regione ?? ""}
            onChange={(e) => onChange({ regione: e.target.value || null, codiceFiscale: null })}
            aria-label="Filtra per regione"
          >
            <option value="">Tutte</option>
            {regioni.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label className={labelCls}>Ente</label>
        <div className="relative">
          <select
            className={selectCls}
            value={value.codiceFiscale ?? ""}
            onChange={(e) => onChange({ ...value, codiceFiscale: e.target.value || null })}
            aria-label="Seleziona ente"
          >
            <option value="">Tutti</option>
            {entiFiltrati.map((o) => (
              <option key={o.codiceFiscale} value={o.codiceFiscale}>{o.ente}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
