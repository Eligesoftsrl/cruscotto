import React, { useMemo, useState, useCallback } from "react";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  BarChart3,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { getPillarSummary, type PillarSummaryResult } from "@/data/narrativeGenerators";
import { executiveIndicesStatic } from "./executive/executiveData";
import type { GuidedJourneyDef } from "@/data/guidedJourneys";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const levelColors: Record<string, { dot: string; text: string; bg: string }> = {
  Buono: {
    dot: "bg-[hsl(var(--chart-green))]",
    text: "text-[hsl(var(--chart-green))]",
    bg: "bg-[hsl(var(--chart-green))]/10",
  },
  Moderato: {
    dot: "bg-[hsl(var(--chart-orange))]",
    text: "text-[hsl(var(--chart-orange))]",
    bg: "bg-[hsl(var(--chart-orange))]/10",
  },
  Basso: {
    dot: "bg-[hsl(var(--destructive))]",
    text: "text-[hsl(var(--destructive))]",
    bg: "bg-[hsl(var(--destructive))]/10",
  },
  Critico: {
    dot: "bg-[hsl(var(--destructive))]",
    text: "text-[hsl(var(--destructive))]",
    bg: "bg-[hsl(var(--destructive))]/10",
  },
};

const levelOrder = ["Buono", "Moderato", "Basso", "Critico"] as const;

interface Props {
  journey: GuidedJourneyDef;
}

export const PillarExecutiveSummary = ({ journey }: Props) => {
  const [simOpen, setSimOpen] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  // Collect all unique KPI ids for simulation sliders
  const allKpiIds = useMemo(() => {
    return [...new Set(journey.steps.flatMap((s) => s.kpiIds))];
  }, [journey.steps]);

  const hasOverrides = Object.keys(overrides).length > 0;

  const summary = useMemo<PillarSummaryResult>(() => {
    return getPillarSummary(
      journey.id,
      journey.steps,
      executiveIndicesStatic,
      hasOverrides ? overrides : undefined,
    );
  }, [journey.id, journey.steps, overrides, hasOverrides]);

  const baseSummary = useMemo<PillarSummaryResult | null>(() => {
    if (!hasOverrides) return null;
    return getPillarSummary(journey.id, journey.steps, executiveIndicesStatic);
  }, [journey.id, journey.steps, hasOverrides]);

  const handleSliderChange = useCallback((kpiId: string, pct: number) => {
    setOverrides((prev) => ({ ...prev, [kpiId]: pct / 100 }));
  }, []);

  const resetAll = useCallback(() => {
    setOverrides({});
  }, []);

  if (summary.totalKpis === 0) return null;

  const style = levelColors[summary.overallLevel] ?? levelColors.Moderato;
  const changed = hasOverrides && baseSummary && baseSummary.overallLevel !== summary.overallLevel;

  return (
    <div
      className="rounded-xl border-2 bg-card shadow-sm overflow-hidden"
      style={{ borderColor: `hsl(var(${journey.colorVar}) / 0.3)` }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center gap-2 border-b"
        style={{ background: `hsl(var(${journey.colorVar}) / 0.06)` }}
      >
        <FileText className="h-4 w-4" style={{ color: `hsl(var(${journey.colorVar}))` }} />
        <span className="text-sm font-extrabold text-foreground">Executive Summary</span>
        {hasOverrides && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
            SIMULAZIONE
          </span>
        )}
        <span
          className={`ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}
        >
          <span className={`h-2 w-2 rounded-full ${style.dot}`} />
          {summary.overallLevel}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        {/* Level change indicator */}
        {changed && baseSummary && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-primary font-semibold">
              Giudizio cambiato: {baseSummary.overallLevel} → {summary.overallLevel} (media{" "}
              {baseSummary.avgPct}% → {summary.avgPct}%)
            </span>
          </div>
        )}

        {/* Narrative text */}
        <p className="text-sm text-foreground leading-relaxed">{summary.summaryText}</p>

        {/* Distribution mini-dashboard */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            <BarChart3 className="h-3.5 w-3.5" />
            {summary.totalKpis} indicatori:
          </div>
          {levelOrder.map((level) => {
            const count = summary.distribution[level];
            if (count === 0) return null;
            const lc = levelColors[level];
            return (
              <div key={level} className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${lc.dot}`} />
                <span className={`text-xs font-bold ${lc.text}`}>{count}</span>
                <span className="text-[10px] text-muted-foreground">{level}</span>
              </div>
            );
          })}
        </div>

        {/* Best & Worst */}
        {(summary.best || summary.worst) && (
          <div className="flex gap-3 flex-wrap">
            {summary.best && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--chart-green))]/8 text-xs">
                <TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--chart-green))]" />
                <span className="font-bold text-[hsl(var(--chart-green))]">Miglior risultato:</span>
                <span className="font-semibold text-foreground">
                  {summary.best.id} ({Math.round(summary.best.value * 100)}%)
                </span>
              </div>
            )}
            {summary.worst && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--destructive))]/8 text-xs">
                <TrendingDown className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" />
                <span className="font-bold text-[hsl(var(--destructive))]">Area critica:</span>
                <span className="font-semibold text-foreground">
                  {summary.worst.id} ({Math.round(summary.worst.value * 100)}%)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Simulation panel */}
        <Collapsible open={simOpen} onOpenChange={setSimOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-center gap-1.5 py-2 border-t text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors rounded-b-lg">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {simOpen ? "Chiudi simulazione" : "Simula variazione indicatori"}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pt-3 space-y-3 border-t">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Modifica i valori per vedere come cambia il giudizio
                </p>
                {hasOverrides && (
                  <button
                    onClick={resetAll}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 font-semibold transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> Reset
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allKpiIds.map((kpiId) => {
                  const idx = executiveIndicesStatic.find((i) => i.id === kpiId);
                  if (!idx) return null;
                  const currentVal = overrides[kpiId] !== undefined ? overrides[kpiId] : idx.value;
                  const pct = Math.round(currentVal * 100);
                  const isModified = overrides[kpiId] !== undefined;
                  return (
                    <div
                      key={kpiId}
                      className={`p-2.5 rounded-lg border ${isModified ? "border-primary/30 bg-primary/5" : "border-border/50"}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-foreground">{kpiId}</span>
                        <span
                          className={`text-xs font-extrabold ${isModified ? "text-primary" : "text-foreground"}`}
                        >
                          {pct}%
                        </span>
                      </div>
                      <Slider
                        value={[pct]}
                        onValueChange={([v]) => handleSliderChange(kpiId, v)}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};
