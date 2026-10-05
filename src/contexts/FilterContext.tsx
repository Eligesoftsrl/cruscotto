import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { fetchAnni } from "@/services/ca/filtriService";

export interface FilterState {
  macrocategoria: string;
  categoria: string;
  comparto: string;
  regione: string;
  genere: string;
  anno: string;
  dimensione_pa: string;
  cluster: string;
}

const defaultFilters: FilterState = {
  macrocategoria: "Tutte",
  categoria: "Tutte",
  comparto: "Tutti",
  regione: "Tutte",
  genere: "Tutti",
  anno: "",
  dimensione_pa: "Tutte",
  cluster: "Tutti",
};

interface FilterContextType {
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: string) => void;
  resetFilters: () => void;
  activeCount: number;
  /** Ultimo anno disponibile nei dati (default dinamico del filtro Anno). */
  latestYear: string;
}

const FilterContext = createContext<FilterContextType | null>(null);

export const useFilters = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used within FilterProvider");
  return ctx;
};

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [latestYear, setLatestYear] = useState<string>("");
  const userSetAnno = useRef(false);

  // Default anno DINAMICO: l'ultimo anno effettivamente disponibile nei dati
  // (non più il 2023 hardcoded). Impostato una volta recuperati gli anni da mv_filtri.
  useEffect(() => {
    let active = true;
    fetchAnni()
      .then((anni) => {
        if (!active || !anni.length) return;
        const max = String(Math.max(...anni));
        setLatestYear(max);
        setFilters((prev) =>
          prev.anno === "" && !userSetAnno.current ? { ...prev, anno: max } : prev,
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const setFilter = (key: keyof FilterState, value: string) => {
    if (key === "anno") userSetAnno.current = true;
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    userSetAnno.current = false;
    setFilters({ ...defaultFilters, anno: latestYear });
  };

  // Baseline per il conteggio filtri attivi: l'anno di default è l'ultimo disponibile.
  const baseline: FilterState = { ...defaultFilters, anno: latestYear };
  const activeCount = Object.entries(filters).filter(
    ([key, val]) => val !== baseline[key as keyof FilterState],
  ).length;

  return (
    <FilterContext.Provider value={{ filters, setFilter, resetFilters, activeCount, latestYear }}>
      {children}
    </FilterContext.Provider>
  );
};
