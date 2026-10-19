import { useState, useRef, useEffect } from "react";
import { EnteSelector } from "./EnteSelector";
import { X, ChevronDown, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useFilters } from "@/contexts/FilterContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchAnni, fetchComparti, fetchRegioni, fetchMacrocategorie, fetchCategorie,
} from "@/services/ca/filtriService";

interface Opt { value: string; label: string }

const ALL_COMP = "Tutti";
const ALL_F = "Tutte";

const Pill = ({
  label, value, display, options, onChange, onClear, active, disabled, title,
}: {
  label: string; value: string; display: string; options: Opt[];
  onChange: (v: string) => void; onClear: () => void; active: boolean; disabled?: boolean; title?: string;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = `pill-list-${label.replace(/\W+/g, "-").toLowerCase()}`;
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  // Tastiera: all'apertura il focus va sull'opzione selezionata (o sulla prima).
  useEffect(() => {
    if (!open) return;
    const list = ref.current?.querySelector<HTMLElement>(`#${listId}`);
    (list?.querySelector<HTMLElement>('[aria-selected="true"]') ?? list?.querySelector<HTMLElement>("button"))?.focus();
  }, [open, listId]);
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };
  const onListKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("button"));
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); items[Math.min(items.length - 1, i + 1)]?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); items[Math.max(0, i - 1)]?.focus(); }
    else if (e.key === "Home") { e.preventDefault(); items[0]?.focus(); }
    else if (e.key === "End") { e.preventDefault(); items[items.length - 1]?.focus(); }
    else if (e.key === "Tab") setOpen(false);
  };
  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        title={title}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) { e.preventDefault(); setOpen(true); }
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] transition-colors disabled:opacity-40 ${
          active ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground hover:border-primary hover:text-primary"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-primary" : "bg-muted-foreground/40"}`} />
        {active ? `${label}: ${display}` : label}
        {active ? (
          <X aria-hidden="true" className="h-3 w-3 ml-0.5 hover:text-destructive" onClick={(e) => { e.stopPropagation(); onClear(); }} />
        ) : (
          <ChevronDown aria-hidden="true" className="h-3 w-3 ml-0.5" />
        )}
      </button>
      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label={label}
          onKeyDown={onListKey}
          className="absolute top-full left-0 mt-1 z-50 min-w-[200px] bg-card border rounded-lg shadow-lg py-1 max-h-[260px] overflow-y-auto"
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={value === o.value}
              onClick={() => { onChange(o.value); close(); }}
              className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${
                value === o.value ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const FilterPills = ({
  lockGenere = false,
  variant = "full",
}: {
  lockGenere?: boolean;
  /** "executive": solo Anno · Regione · Comparto (genere e macro/categoria non esposti). */
  variant?: "full" | "executive";
} = {}) => {
  const isExec = variant === "executive";
  const { filters, setFilter, resetFilters, activeCount, latestYear } = useFilters();
  const { profile } = useAuth();
  const isEnteHr = profile?.role === "ente_hr";
  const anno = Number(filters.anno) || Number(latestYear) || 2023;

  const anniQ = useQuery({ queryKey: ["mvf", "anni"], queryFn: fetchAnni });
  const compartiQ = useQuery({ queryKey: ["mvf", "comparti", anno], queryFn: () => fetchComparti(anno) });
  const regioniQ = useQuery({ queryKey: ["mvf", "regioni", anno], queryFn: () => fetchRegioni(anno) });
  const macroQ = useQuery({
    queryKey: ["mvf", "macro", anno, filters.comparto],
    queryFn: () => fetchMacrocategorie(anno, `comparto:${filters.comparto}`),
    enabled: filters.comparto !== ALL_COMP,
  });
  const macroChiave = (macroQ.data ?? []).find((m) => m.codice === filters.macrocategoria)?.chiave;
  const categorieQ = useQuery({
    queryKey: ["mvf", "cat", anno, macroChiave],
    queryFn: () => fetchCategorie(anno, macroChiave!),
    enabled: Boolean(macroChiave),
  });

  const opt = (rows: { codice: string; descrizione: string }[] | undefined, allLabel: string, allVal: string): Opt[] =>
    [{ value: allVal, label: allLabel }, ...(rows ?? []).map((r) => ({ value: r.codice, label: r.descrizione }))];
  const lbl = (rows: { codice: string; descrizione: string }[] | undefined, v: string) =>
    (rows ?? []).find((r) => r.codice === v)?.descrizione ?? v;

  return (
    <div className="bg-card border-b px-5 py-2 flex items-center gap-2 flex-wrap">
      {/* Anno */}
      <Pill label="Anno" value={filters.anno} display={filters.anno || "—"} active={!!latestYear && filters.anno !== latestYear}
        options={(anniQ.data ?? (latestYear ? [Number(latestYear)] : [])).map((y) => ({ value: String(y), label: String(y) }))}
        onChange={(v) => { setFilter("anno", v); setFilter("comparto", ALL_COMP); setFilter("macrocategoria", ALL_F); setFilter("categoria", ALL_F); }}
        onClear={() => setFilter("anno", latestYear)} />

      {/* Genere (ombreggiato e bloccato nelle schede in cui non è utilizzato,
          mantenendo il valore eventualmente selezionato altrove) */}
      {!isExec && <Pill label="Genere" value={filters.genere} display={filters.genere}
        active={filters.genere !== "Tutti"} disabled={lockGenere}
        title={lockGenere ? "Filtro non utilizzato in questa scheda" : undefined}
        options={[{ value: "Tutti", label: "Tutti" }, { value: "Uomini", label: "Uomini" }, { value: "Donne", label: "Donne" }]}
        onChange={(v) => setFilter("genere", v)} onClear={() => setFilter("genere", "Tutti")} />}

      {!isEnteHr && (
        <>
          {/* Regione */}
          <Pill label="Regione" value={filters.regione} display={lbl(regioniQ.data, filters.regione)}
            active={filters.regione !== ALL_F} options={opt(regioniQ.data, "Tutte le regioni", ALL_F)}
            onChange={(v) => setFilter("regione", v)} onClear={() => setFilter("regione", ALL_F)} />
          {/* Comparto (avvia la cascata Comparto -> Macrocategoria -> Categoria) */}
          <Pill label="Comparto" value={filters.comparto} display={lbl(compartiQ.data, filters.comparto)}
            active={filters.comparto !== ALL_COMP} options={opt(compartiQ.data, "Tutti i comparti", ALL_COMP)}
            onChange={(v) => { setFilter("comparto", v); setFilter("macrocategoria", ALL_F); setFilter("categoria", ALL_F); }}
            onClear={() => { setFilter("comparto", ALL_COMP); setFilter("macrocategoria", ALL_F); setFilter("categoria", ALL_F); }} />
        </>
      )}

      {!isExec && (
        <>
      {/* Separatore tra i filtri di contesto e la cascata Macrocategoria/Categoria */}
      <div className="w-px h-5 bg-border" />

      {/* Macrocategoria (dipende da Comparto) */}
      <Pill label="Macrocategoria" value={filters.macrocategoria} display={lbl(macroQ.data, filters.macrocategoria)}
        active={filters.macrocategoria !== ALL_F} disabled={filters.comparto === ALL_COMP}
        options={opt(macroQ.data, "Tutte", ALL_F)}
        onChange={(v) => { setFilter("macrocategoria", v); setFilter("categoria", ALL_F); }}
        onClear={() => { setFilter("macrocategoria", ALL_F); setFilter("categoria", ALL_F); }} />

      {/* Categoria (dipende da Macrocategoria) */}
      <Pill label="Categoria" value={filters.categoria} display={lbl(categorieQ.data, filters.categoria)}
        active={filters.categoria !== ALL_F} disabled={!macroChiave}
        options={opt(categorieQ.data, "Tutte", ALL_F)}
        onChange={(v) => setFilter("categoria", v)} onClear={() => setFilter("categoria", ALL_F)} />

        </>
      )}

      {activeCount > 0 && (
        <>
          <div className="w-px h-5 bg-border" />
          <button onClick={resetFilters} className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] text-muted-foreground hover:text-destructive transition-colors">
            <RotateCcw aria-hidden="true" className="h-3 w-3" /> Reset ({activeCount})
          </button>
        </>
      )}

      <div className="ml-auto flex items-center gap-3">
        <span className="text-[10.5px] text-muted-foreground/70 whitespace-nowrap">Dati al 31/12/{filters.anno || latestYear}</span>
        <EnteSelector />
      </div>
    </div>
  );
};
