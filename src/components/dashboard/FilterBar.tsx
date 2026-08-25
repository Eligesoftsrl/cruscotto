import { filterOptions } from "@/data/mockData";

interface FilterBarProps {
  showMacrocategoria?: boolean;
  showComparto?: boolean;
}

export const FilterBar = ({ showMacrocategoria = true, showComparto = false }: FilterBarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
      {showMacrocategoria && (
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Macrocategoria:</label>
          <select className="rounded-md border bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring">
            {filterOptions.macrocategorie.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      )}
      {showComparto && (
        <>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Comparto:</label>
            <select className="rounded-md border bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring">
              {filterOptions.comparti.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Regione:</label>
            <select className="rounded-md border bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring">
              {filterOptions.regioni.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </>
      )}
    </div>
  );
};
