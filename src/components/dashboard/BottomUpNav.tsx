import { useState } from "react";
import { ArrowUp, Gauge, Layers, X } from "lucide-react";

interface BottomUpNavProps {
  currentLevel: "synthetic" | "operational";
  pillar?: string;
  source?: string;
  onGoExecutive?: () => void;
  onGoSynthetic?: (pillar?: string) => void;
}

/**
 * Floating Action Button for bottom-up navigation.
 * Shows in bottom-right when below Executive level.
 */
export const BottomUpNav = ({ currentLevel, pillar, onGoExecutive, onGoSynthetic }: BottomUpNavProps) => {
  const [open, setOpen] = useState(false);

  const hasOptions = onGoExecutive || (currentLevel === "operational" && onGoSynthetic && pillar);
  if (!hasOptions) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Dropdown menu */}
      {open && (
        <div className="bg-card border border-border rounded-xl shadow-lg p-2 space-y-1 animate-in fade-in-0 slide-in-from-bottom-2 duration-200 min-w-[200px]">
          {currentLevel === "operational" && onGoSynthetic && pillar && (
            <button
              onClick={() => { onGoSynthetic(pillar); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <Layers className="h-4 w-4 text-primary" />
              Vista Sintetica · {pillar}
            </button>
          )}
          {onGoExecutive && (
            <button
              onClick={() => { onGoExecutive(); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <Gauge className="h-4 w-4 text-primary" />
              Vista Executive
            </button>
          )}
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
          open
            ? "bg-muted text-muted-foreground rotate-45"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
        title="Risali al livello superiore"
        aria-label="Navigazione verso livelli superiori"
      >
        {open ? <X className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />}
      </button>
    </div>
  );
};
