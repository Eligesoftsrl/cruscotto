import { Route, Trash2, Globe, Lock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useCustomJourneys, type CustomJourney } from "@/hooks/useCustomJourneys";
import { useState } from "react";

interface CommunityJourneysProps {
  onFollowJourney: (journey: CustomJourney) => void;
  refreshKey?: number;
}

const categoryConfig = {
  attention: { label: "Allerta", color: "bg-destructive/10 text-destructive border-destructive/30" },
  explore: { label: "Analisi", color: "bg-primary/10 text-primary border-primary/30" },
  plan: { label: "Programmazione", color: "bg-[hsl(142,71%,90%)] text-[hsl(142,71%,30%)] border-[hsl(142,71%,60%)]" },
};

type SortBy = "recent";
type FilterTab = "all" | "mine";

export function CommunityJourneys({ onFollowJourney, refreshKey }: CommunityJourneysProps) {
  const { journeys, loading, deleteJourney, incrementUsage } = useCustomJourneys(refreshKey);
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");

  const handleDelete = async (id: string) => {
    await deleteJourney(id);
    toast({ title: "Percorso eliminato" });
  };

  const handleFollow = async (j: CustomJourney) => {
    await incrementUsage(j.id);
    onFollowJourney(j);
  };

  let filtered = journeys;
  if (filterTab === "mine") filtered = journeys.filter(j => !j.is_public);

  const sorted = [...filtered].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">Caricamento percorsi...</p>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12">
        <Route className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Nessun percorso personalizzato</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Crea il tuo primo percorso con il pulsante "+" in basso</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-4">
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          {([
            { value: "all" as const, label: "Tutti" },
            { value: "mine" as const, label: "I miei" },
          ]).map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilterTab(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                filterTab === tab.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Journey cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sorted.map(j => {
          const cfg = categoryConfig[j.category];
          const totalIndicators = j.steps.reduce((sum, s) => sum + s.indicators.length, 0);

          return (
            <div
              key={j.id}
              className="border rounded-xl p-4 bg-card hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[9px] ${cfg.color}`}>{cfg.label}</Badge>
                  {j.is_public ? (
                    <Globe className="h-3 w-3 text-muted-foreground/50" />
                  ) : (
                    <Lock className="h-3 w-3 text-muted-foreground/50" />
                  )}
                </div>
                <button onClick={() => handleDelete(j.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive transition">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <h4 className="text-sm font-bold text-foreground mb-1 leading-tight">{j.title}</h4>
              {j.question && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{j.question}</p>}

              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                <span>{j.steps.length} tappe</span>
                <span>·</span>
                <span>{totalIndicators} indicatori</span>
                <span>·</span>
                <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{j.usage_count}</span>
              </div>

              <div className="flex items-center justify-end">
                <Button size="sm" variant="outline" onClick={() => handleFollow(j)} className="text-xs h-7 gap-1">
                  <Route className="h-3 w-3" /> Segui
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
