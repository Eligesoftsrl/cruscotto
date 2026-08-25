import { useState } from "react";
import { Search, Check, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { indicatorCatalog, pillars, sources, type CatalogIndicator } from "@/data/indicatorCatalog";

interface IndicatorPickerProps {
  selected: string[];
  onToggle: (id: string) => void;
}

const statusColors = {
  green: "bg-[hsl(142,71%,90%)] text-[hsl(142,71%,30%)] border-[hsl(142,71%,60%)]",
  yellow: "bg-[hsl(45,100%,90%)] text-[hsl(45,80%,30%)] border-[hsl(45,100%,60%)]",
  red: "bg-destructive/10 text-destructive border-destructive/40",
};

export function IndicatorPicker({ selected, onToggle }: IndicatorPickerProps) {
  const [search, setSearch] = useState("");
  const [pillarFilter, setPillarFilter] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);

  const filtered = indicatorCatalog.filter(i => {
    if (pillarFilter && i.pillar !== pillarFilter) return false;
    if (sourceFilter && i.source !== sourceFilter) return false;
    if (search && !i.label.toLowerCase().includes(search.toLowerCase()) && !i.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by pillar
  const grouped = filtered.reduce<Record<string, CatalogIndicator[]>>((acc, i) => {
    (acc[i.pillar] = acc[i.pillar] || []).push(i);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cerca indicatore..."
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        <div className="flex items-center gap-1 mr-2">
          <Filter className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Pillar</span>
        </div>
        {pillars.map(p => (
          <button
            key={p}
            onClick={() => setPillarFilter(prev => prev === p ? null : p)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
              pillarFilter === p ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-transparent hover:border-border"
            }`}
          >
            {p}
          </button>
        ))}
        <div className="w-px h-4 bg-border mx-1 self-center" />
        {sources.map(s => (
          <button
            key={s}
            onClick={() => setSourceFilter(prev => prev === s ? null : s)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition ${
              sourceFilter === s ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-transparent hover:border-border"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Selected count */}
      <div className="text-xs text-muted-foreground">
        {selected.length} indicatori selezionati · {filtered.length} visualizzati
      </div>

      {/* Indicators grid */}
      <div className="max-h-[320px] overflow-y-auto space-y-4 pr-1">
        {Object.entries(grouped).map(([pillar, indicators]) => (
          <div key={pillar}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 sticky top-0 bg-background py-1">
              {pillar}
            </div>
            <div className="grid grid-cols-1 gap-1">
              {indicators.map(ind => {
                const isSelected = selected.includes(ind.id);
                return (
                  <button
                    key={ind.id}
                    onClick={() => onToggle(ind.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all text-sm ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${
                      isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                    }`}>
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-primary">{ind.id}</span>
                        <span className="text-xs font-medium text-foreground truncate">{ind.label}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{ind.description}</p>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      ind.status === "green" ? "bg-[hsl(142,71%,45%)]" :
                      ind.status === "yellow" ? "bg-[hsl(45,100%,42%)]" :
                      "bg-destructive"
                    }`} />
                    <span className="text-[10px] font-bold text-muted-foreground w-8 text-right">
                      {Math.round(ind.value * 100)}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
