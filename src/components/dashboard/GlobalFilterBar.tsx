import { useEffect, useState } from "react";
import { Filter, RotateCcw } from "lucide-react";
import { useFilters } from "@/contexts/FilterContext";
import { useAuth } from "@/contexts/AuthContext";
import { fetchEnteFilterOptions } from "@/services/dw/enteService";

export const GlobalFilterBar = () => {
  const { filters, setFilter, resetFilters, activeCount } = useFilters();
  const { profile } = useAuth();
  const isDfp = profile?.role === "dfp";

  const [comparti, setComparti] = useState<string[]>([]);
  const [regioni, setRegioni] = useState<string[]>([]);
  const [dimensioni, setDimensioni] = useState<string[]>([]);

  useEffect(() => {
    fetchEnteFilterOptions().then(({ comparti, regioni, dimensioni }) => {
      setComparti(comparti);
      setRegioni(regioni);
      setDimensioni(dimensioni);
    });
  }, []);

  const selectClass =
    "h-8 px-2 text-[11px] bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div
      className="sticky top-12 z-30 bg-card/95 backdrop-blur border-b px-6 py-2 flex items-center gap-3 flex-wrap"
      role="toolbar"
      aria-label="Filtri globali"
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Filter className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="text-[11px] font-semibold uppercase tracking-wide">Filtri</span>
        {activeCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
            {activeCount}
          </span>
        )}
      </div>

      <label className="sr-only" htmlFor="filter-anno">
        Anno
      </label>
      <select
        id="filter-anno"
        value={filters.anno}
        onChange={(e) => setFilter("anno", e.target.value)}
        className={selectClass}
      >
        {["2023", "2022", "2021", "2020", "2019"].map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>

      {isDfp && (
        <>
          <label className="sr-only" htmlFor="filter-comparto">
            Comparto
          </label>
          <select
            id="filter-comparto"
            value={filters.comparto}
            onChange={(e) => setFilter("comparto", e.target.value)}
            className={selectClass}
          >
            <option value="Tutti">Tutti i comparti</option>
            {comparti.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </>
      )}

      {isDfp && (
        <>
          <label className="sr-only" htmlFor="filter-regione">
            Regione
          </label>
          <select
            id="filter-regione"
            value={filters.regione}
            onChange={(e) => setFilter("regione", e.target.value)}
            className={selectClass}
          >
            <option value="Tutte">Tutte le regioni</option>
            {regioni.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </>
      )}

      {isDfp && (
        <>
          <label className="sr-only" htmlFor="filter-dimensione">
            Categoria PA
          </label>
          <select
            id="filter-dimensione"
            value={filters.dimensione_pa}
            onChange={(e) => setFilter("dimensione_pa", e.target.value)}
            className={selectClass}
          >
            <option value="Tutte">Tutte le categorie</option>
            {dimensioni.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </>
      )}

      {activeCount > 0 && (
        <button
          onClick={resetFilters}
          className="ml-auto flex items-center gap-1 text-[11px] text-primary hover:underline underline-offset-2"
          aria-label="Ripristina tutti i filtri"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Reset
        </button>
      )}
    </div>
  );
};
