import { useEffect, useState, useRef } from "react";
import { sipoFrom } from "@/services/dw/siproService";
import { ChevronDown, X, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export interface SiproFilterValues {
  enteId: number | null;
  /** For DFP multi-select comparison */
  enteIds: number[];
}

/** Helper: returns the effective ente_id list for queries */
export function effectiveEnteIds(v: SiproFilterValues): number[] {
  if (v.enteId) return [v.enteId]; // ente_hr locked
  return v.enteIds; // DFP selection (empty = all)
}

interface Props {
  value: SiproFilterValues;
  onChange: (v: SiproFilterValues) => void;
}

interface Ente {
  ente_id: number;
  denominazione: string;
}

export const SiproFilters = ({ value, onChange }: Props) => {
  const { profile } = useAuth();
  const [enti, setEnti] = useState<Ente[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isEnteHr = profile?.role === "ente_hr" && !!profile.ente_id;

  // Force enteId for ente_hr users
  useEffect(() => {
    if (isEnteHr && profile?.ente_id && value.enteId !== profile.ente_id) {
      onChange({ ...value, enteId: profile.ente_id });
    }
  }, [isEnteHr, profile?.ente_id]);

  useEffect(() => {
    if (isEnteHr) return;
    sipoFrom("lk_enti")
      .select("ente_id, denominazione")
      .order("denominazione")
      .then(({ data }) => {
        if (data) setEnti(data as Ente[]);
      });
  }, [isEnteHr]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleEnte = (id: number) => {
    const ids = value.enteIds.includes(id)
      ? value.enteIds.filter((x) => x !== id)
      : [...value.enteIds, id];
    onChange({ ...value, enteIds: ids });
  };

  const clearAll = () => onChange({ ...value, enteIds: [] });

  // ente_hr: locked badge
  if (isEnteHr) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card px-4 py-2.5">
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap uppercase tracking-wide">
            Ente
          </label>
          <span className="rounded-md border border-input bg-muted px-3 py-1.5 text-[12px] text-foreground font-medium min-w-[200px]">
            {profile?.ente_denominazione ?? "Il tuo ente"}
          </span>
        </div>
      </div>
    );
  }

  // DFP: multi-select dropdown
  const selectedEnti = enti.filter((e) => value.enteIds.includes(e.ente_id));
  const label =
    selectedEnti.length === 0
      ? "Tutti gli enti"
      : selectedEnti.length <= 2
        ? selectedEnti.map((e) => e.denominazione).join(", ")
        : `${selectedEnti.length} enti selezionati`;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card px-4 py-2.5">
      <div className="flex items-center gap-2">
        <label className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap uppercase tracking-wide">
          Enti da confrontare
        </label>
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 appearance-none rounded-md border border-input bg-background pl-3 pr-7 py-1.5 text-[12px] text-foreground outline-none focus:ring-1 focus:ring-ring cursor-pointer min-w-[240px] text-left"
          >
            <span className="truncate">{label}</span>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {open && (
            <div className="absolute z-50 mt-1 w-[280px] rounded-md border bg-popover shadow-md">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Seleziona uno o più enti
                </span>
                {selectedEnti.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-[11px] text-destructive hover:underline flex items-center gap-0.5"
                  >
                    <X className="h-3 w-3" /> Deseleziona
                  </button>
                )}
              </div>
              <div className="max-h-52 overflow-auto py-1">
                {enti.map((e) => {
                  const selected = value.enteIds.includes(e.ente_id);
                  return (
                    <button
                      key={e.ente_id}
                      type="button"
                      onClick={() => toggleEnte(e.ente_id)}
                      className={`flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-left hover:bg-muted/60 transition-colors ${
                        selected ? "bg-primary/10 font-semibold text-foreground" : "text-foreground"
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center h-4 w-4 rounded border ${
                          selected ? "bg-primary border-primary" : "border-input"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </span>
                      {e.denominazione}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected chips */}
      {selectedEnti.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedEnti.map((e) => (
            <span
              key={e.ente_id}
              className="inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary px-2.5 py-0.5 text-[11px] font-medium"
            >
              {e.denominazione}
              <button onClick={() => toggleEnte(e.ente_id)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
