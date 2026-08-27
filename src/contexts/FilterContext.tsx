import { createContext, useContext, useState, type ReactNode } from "react";

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
  anno: "2023",
  dimensione_pa: "Tutte",
  cluster: "Tutti",
};

interface FilterContextType {
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: string) => void;
  resetFilters: () => void;
  activeCount: number;
}

const FilterContext = createContext<FilterContextType | null>(null);

export const useFilters = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used within FilterProvider");
  return ctx;
};

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const setFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(defaultFilters);

  const activeCount = Object.entries(filters).filter(
    ([key, val]) => val !== defaultFilters[key as keyof FilterState],
  ).length;

  return (
    <FilterContext.Provider value={{ filters, setFilter, resetFilters, activeCount }}>
      {children}
    </FilterContext.Provider>
  );
};
