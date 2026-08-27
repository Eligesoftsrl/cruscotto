import { useState, useRef, useEffect } from "react";
import { Download, X, ChevronDown, RotateCcw } from "lucide-react";
import { useFilters, type FilterState } from "@/contexts/FilterContext";
import { useAuth } from "@/contexts/AuthContext";
import { filterOptions } from "@/data/mockData";

interface FilterDef {
  key: keyof FilterState;
  label: string;
  options: string[];
  group: "structural" | "benchmark";
}

const FILTER_DEFS: FilterDef[] = [
  {
    key: "macrocategoria",
    label: "Macrocategoria",
    options: filterOptions.macrocategorie,
    group: "structural",
  },
  { key: "categoria", label: "Categoria", options: filterOptions.categorie, group: "structural" },
  { key: "genere", label: "Genere", options: ["Tutti", "Uomini", "Donne"], group: "structural" },
  {
    key: "anno",
    label: "Anno",
    options: ["2023", "2022", "2021", "2020", "2019", "2018"],
    group: "structural",
  },
  { key: "comparto", label: "Comparto", options: filterOptions.comparti, group: "benchmark" },
  { key: "regione", label: "Regione", options: filterOptions.regioni, group: "benchmark" },
];

const defaultValues: Record<string, string> = {
  macrocategoria: "Tutte",
  categoria: "Tutte",
  comparto: "Tutti",
  regione: "Tutte",
  genere: "Tutti",
  anno: "2023",
};

const DropdownPill = ({ def }: { def: FilterDef }) => {
  const { filters, setFilter } = useFilters();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const value = filters[def.key];
  const isActive = value !== defaultValues[def.key];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] transition-colors ${
          isActive
            ? "border-primary bg-primary/5 text-primary"
            : "text-muted-foreground hover:border-primary hover:text-primary"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-primary" : "bg-muted-foreground/40"}`}
        />
        {isActive ? `${def.label}: ${value}` : def.label}
        {isActive ? (
          <X
            className="h-3 w-3 ml-0.5 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setFilter(def.key, defaultValues[def.key]);
            }}
          />
        ) : (
          <ChevronDown className="h-3 w-3 ml-0.5" />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] bg-card border rounded-lg shadow-lg py-1 max-h-[240px] overflow-y-auto">
          {def.options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                setFilter(def.key, opt);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${
                value === opt
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const FilterPills = () => {
  const { activeCount, resetFilters, filters } = useFilters();
  const { profile } = useAuth();
  const isEnteHr = profile?.role === "ente_hr";
  const structural = FILTER_DEFS.filter((d) => d.group === "structural");
  const benchmark = isEnteHr ? [] : FILTER_DEFS.filter((d) => d.group === "benchmark");

  return (
    <div className="bg-card border-b px-5 py-2 flex items-center gap-2 flex-wrap">
      {structural.map((def) => (
        <DropdownPill key={def.key} def={def} />
      ))}

      {benchmark.length > 0 && (
        <>
          <div className="w-px h-5 bg-border" />
          {benchmark.map((def) => (
            <DropdownPill key={def.key} def={def} />
          ))}
        </>
      )}

      {activeCount > 0 && (
        <>
          <div className="w-px h-5 bg-border" />
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] text-muted-foreground hover:text-destructive transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset ({activeCount})
          </button>
        </>
      )}

      <div className="ml-auto flex items-center gap-2">
        <span className="text-[10.5px] text-muted-foreground/60">Dati al 31/12/{filters.anno}</span>
        <button className="px-3 py-[5px] bg-primary text-primary-foreground rounded text-[11px] font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity">
          <Download className="h-3 w-3" /> Esporta
        </button>
      </div>
    </div>
  );
};
