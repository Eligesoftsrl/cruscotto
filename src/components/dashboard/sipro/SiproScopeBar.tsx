import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useEnteScope } from "@/hooks/useEnteScope";
import { fetchSiproEnti } from "@/services/sipro/filtriService";

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

  // ente_hr: blocca il CF al perimetro del token
  useEffect(() => {
    if (scope.isEnteUser && value.codiceFiscale !== scope.codiceFiscale) {
      onChange({ codiceFiscale: scope.codiceFiscale, regione: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope.isEnteUser, scope.codiceFiscale]);

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

  // ente_hr: ente bloccato (eventuale selettore multi-ente dal perimetro)
  if (scope.isEnteUser) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card px-4 py-2.5">
        <label className={labelCls}>Ente</label>
        {scope.control ?? (
          <span className="rounded-md border border-input bg-muted px-3 py-1.5 text-[12px] text-foreground font-medium min-w-[220px]">
            {scope.label ?? "Il tuo ente"}
          </span>
        )}
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
