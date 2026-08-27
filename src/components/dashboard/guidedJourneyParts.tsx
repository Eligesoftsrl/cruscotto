/**
 * Parti interne del percorso guidato (GuidedJourney): helper di stile, badge di
 * trend/interconnessione, card KPI narrativa/impatto/correlazione e StepPanel.
 * Estratte da GuidedJourney.tsx per ridurne la dimensione (refactor strutturale).
 */
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers,
  Compass,
  CircleDot,
  Circle,
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  SlidersHorizontal,
} from "lucide-react";
import { PillarExecutiveSummary } from "./PillarExecutiveSummary";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import type {
  GuidedJourneyDef,
  JourneyStep,
  CrossImpact,
  OperativeCorrelation,
} from "@/data/guidedJourneys";
import { executiveIndicesStatic } from "./executive/executiveData";
import { getNarrative, narrativeThresholds } from "@/data/narrativeGenerators";
import { interconnessioni, PILLAR_COLORS } from "./executive/executiveInterconnessioni";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { NavState } from "./AppSidebar";

const assessmentStyles: Record<
  string,
  { bg: string; text: string; dot: string; progressColor: string }
> = {
  Buono: {
    bg: "bg-[hsl(var(--chart-green))]/10",
    text: "text-[hsl(var(--chart-green))]",
    dot: "bg-[hsl(var(--chart-green))]",
    progressColor: "hsl(var(--chart-green))",
  },
  Moderato: {
    bg: "bg-[hsl(var(--chart-orange))]/10",
    text: "text-[hsl(var(--chart-orange))]",
    dot: "bg-[hsl(var(--chart-orange))]",
    progressColor: "hsl(var(--chart-orange))",
  },
  Basso: {
    bg: "bg-[hsl(var(--destructive))]/10",
    text: "text-[hsl(var(--destructive))]",
    dot: "bg-[hsl(var(--destructive))]",
    progressColor: "hsl(var(--destructive))",
  },
  Critico: {
    bg: "bg-[hsl(var(--destructive))]/10",
    text: "text-[hsl(var(--destructive))]",
    dot: "bg-[hsl(var(--destructive))]",
    progressColor: "hsl(var(--destructive))",
  },
};

const getStyle = (level: string) => assessmentStyles[level] ?? assessmentStyles["Moderato"];

/* ── Trend delta component ── */
const TrendDelta = ({ current, prev }: { current: number; prev: number }) => {
  const delta = Math.round((current - prev) * 100);
  if (delta === 0)
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Minus className="h-3 w-3" /> Stabile rispetto all'anno precedente
      </span>
    );
  const positive = delta > 0;
  return (
    <span
      className={`text-xs font-semibold flex items-center gap-1 ${positive ? "text-[hsl(var(--chart-green))]" : "text-[hsl(var(--destructive))]"}`}
    >
      {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {positive ? "+" : ""}
      {delta}pp rispetto all'anno precedente
    </span>
  );
};

/* ── Cross-pillar interconnection badges ── */
const InterconnectionBadges = ({ indicatorId }: { indicatorId: string }) => {
  const conns = interconnessioni[indicatorId];
  if (!conns || conns.connections.length === 0) return null;
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-[9px] text-muted-foreground/70 mr-0.5">↔</span>
        {conns.connections.map((c) => (
          <Tooltip key={c.pillar}>
            <TooltipTrigger asChild>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full cursor-help"
                style={{
                  background: `${PILLAR_COLORS[c.pillar]}20`,
                  color: PILLAR_COLORS[c.pillar],
                }}
              >
                {c.pillar}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs font-bold">
                {c.pillar} — {c.label}
              </p>
              <p className="text-[11px] text-muted-foreground">{c.reason}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

/* ── Narrative KPI Card (for decision-makers) ── */
const NarrativeKpiCard = ({
  id,
  insight,
  onNavigate,
}: {
  id: string;
  insight?: string;
  onNavigate?: (nav: NavState) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simValue, setSimValue] = useState<number | null>(null);
  const idx = executiveIndicesStatic.find((i) => i.id === id);
  if (!idx) return null;

  const effectiveValue = simValue !== null ? simValue : idx.value;
  const pct = Math.round(effectiveValue * 100);

  // Recalculate assessment level for simulated value
  const thresholds = narrativeThresholds[id];
  const simLevel = thresholds
    ? (() => {
        const tIdx = thresholds.findIndex((t) => effectiveValue < t.max);
        const level = tIdx === -1 ? thresholds.length - 1 : tIdx;
        return ["Critico", "Basso", "Moderato", "Buono"][level] ?? "Moderato";
      })()
    : idx.assessment.level;

  const style = getStyle(simValue !== null ? simLevel : idx.assessment.level);
  const generated = getNarrative(id, effectiveValue);
  const narrativeText = generated || insight || idx.assessment.text;

  // Extract clean source name from "Fonte: XYZ · detail"
  const cleanFonte = idx.fonte
    .replace(/^Fonte:\s*/, "")
    .split("·")[0]
    .trim();

  // Get interpretation key from metodologia
  const interpretation = idx.metodologia?.interpretazione;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={`rounded-xl border bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md ${simValue !== null ? "ring-2 ring-primary/30" : ""}`}
      >
        {/* Always-visible summary */}
        <div className="p-4 space-y-3">
          {/* Row 1: Semaphore + value */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
              <span className={`text-xs font-bold uppercase tracking-wide ${style.text}`}>
                {simValue !== null ? simLevel : idx.assessment.level}
              </span>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-[10px] text-muted-foreground font-mono cursor-help border-b border-dotted border-muted-foreground/40">
                      {idx.id}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="text-xs font-bold mb-1">
                      {idx.id} — {idx.label.replace(/\n/g, " ")}
                    </p>
                    {idx.metodologia?.interpretazione && (
                      <p className="text-[11px] text-muted-foreground leading-snug whitespace-pre-line">
                        {idx.metodologia.interpretazione.split("\n").slice(0, 3).join("\n")}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {simValue !== null && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                  SIM
                </span>
              )}
            </div>
            <span className="text-2xl font-extrabold text-foreground">{pct}%</span>
          </div>

          {/* Cross-pillar interconnections */}
          <InterconnectionBadges indicatorId={id} />

          {/* Progress bar */}
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(pct, 100)}%`, background: style.progressColor }}
            />
          </div>

          {/* Narrative text */}
          <p className="text-sm text-foreground leading-snug">{narrativeText}</p>

          {/* Trend */}
          {simValue === null && <TrendDelta current={idx.value} prev={idx.prev} />}
          {simValue !== null && (
            <span className="text-xs text-primary flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3" />
              Valore reale: {Math.round(idx.value * 100)}% → Simulato: {pct}%
            </span>
          )}
        </div>

        {/* Expandable "Cosa implica" */}
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {open ? "Chiudi dettagli" : "Cosa implica"}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3 border-t bg-muted/5">
            {/* Simulation slider */}
            <div className="pt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <SlidersHorizontal className="h-3 w-3" /> Simula valore
                </p>
                {simValue !== null && (
                  <button
                    onClick={() => {
                      setSimValue(null);
                      setSimulating(false);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 font-semibold transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
              <Slider
                value={[Math.round((simValue ?? idx.value) * 100)]}
                onValueChange={([v]) => setSimValue(v / 100)}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>0%</span>
                {thresholds?.slice(0, -1).map((t, i) => (
                  <span key={i} className="border-l border-border pl-1">
                    {Math.round(t.max * 100)}%
                  </span>
                ))}
                <span>100%</span>
              </div>
            </div>

            {/* Dimensional context */}
            {idx.context && (
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                  Dimensione del fenomeno
                </p>
                <p className="text-sm text-foreground">{idx.context.text}</p>
              </div>
            )}

            {/* Interpretation key */}
            {interpretation && (
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1 flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> Come leggere questo dato
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {interpretation.split("\n").slice(0, 4).join("\n")}
                </p>
              </div>
            )}

            {/* Source */}
            <p className="text-[10px] text-muted-foreground/70 pt-1 border-t border-border/50">
              Fonte: {cleanFonte}
            </p>

            {/* Navigate to indicator detail */}
            {onNavigate && idx.pillar && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate({ level: "synthetic", pillar: idx.pillar, indicator: idx.id });
                }}
                className="w-full flex items-center justify-center gap-1.5 mt-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Approfondisci nel cruscotto
              </button>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

/* ── Enriched Cross-impact card ── */
const ImpactCard = ({
  impact,
  onNavigate,
}: {
  impact: CrossImpact;
  onNavigate: (nav: NavState) => void;
}) => {
  const idx = executiveIndicesStatic.find((i) => i.id === impact.indicatorId);
  const pct = idx && typeof idx.value === "number" ? Math.round(idx.value * 100) : null;
  const style = idx ? getStyle(idx.assessment.level) : null;

  return (
    <button
      onClick={() =>
        onNavigate({ level: "synthetic", pillar: impact.pillar, indicator: impact.indicatorId })
      }
      className="rounded-xl border bg-card hover:bg-accent/40 transition-all hover:shadow-sm p-4 text-left flex flex-col gap-2 group"
    >
      {/* Header: semaphore + pillar + label + value */}
      <div className="flex items-center gap-2 flex-wrap">
        {style && <span className={`h-2 w-2 rounded-full ${style.dot}`} />}
        {style && (
          <span className={`text-[10px] font-bold uppercase ${style.text}`}>
            {idx!.assessment.level}
          </span>
        )}
        <span className="text-xs font-extrabold text-primary">{impact.pillar}</span>
        <span className="text-[10px] text-muted-foreground">·</span>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs font-bold text-foreground cursor-help border-b border-dotted border-muted-foreground/40">
                {impact.indicatorId} — {impact.label}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="text-xs font-bold mb-1">
                {impact.indicatorId} — {impact.label}
              </p>
              {idx?.metodologia?.interpretazione && (
                <p className="text-[11px] text-muted-foreground leading-snug whitespace-pre-line">
                  {idx.metodologia.interpretazione.split("\n").slice(0, 3).join("\n")}
                </p>
              )}
              {!idx?.metodologia?.interpretazione && idx?.assessment?.text && (
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {idx.assessment.text}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {pct !== null && (
          <span className="ml-auto text-base font-extrabold text-foreground">{pct}%</span>
        )}
      </div>

      {/* Narrative assessment */}
      {idx?.assessment?.text && (
        <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
          {idx.assessment.text}
        </p>
      )}

      {/* Reason */}
      <p className="text-[11px] text-muted-foreground/80 leading-snug italic">
        Perché incide: {impact.reason}
      </p>

      <span className="text-[10px] text-primary font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        Approfondisci <ChevronRight className="h-3 w-3" />
      </span>
    </button>
  );
};

/* ── Operative correlation card ── */
const OperativeCorrelationCard = ({
  corr,
  onNavigate,
}: {
  corr: OperativeCorrelation;
  onNavigate: (nav: NavState) => void;
}) => (
  <button
    onClick={() => corr.drillTarget && onNavigate(corr.drillTarget as NavState)}
    disabled={!corr.drillTarget}
    className="rounded-lg border bg-card hover:bg-accent/30 transition-all p-3 text-left flex flex-col gap-1.5 group disabled:opacity-70 disabled:cursor-default"
  >
    <span className="text-xs font-bold text-foreground">{corr.label}</span>
    {corr.relatedKpiId && <InterconnectionBadges indicatorId={corr.relatedKpiId} />}
    <span className="text-[11px] text-muted-foreground leading-snug">{corr.description}</span>
    {corr.drillTarget && (
      <span className="text-[10px] text-primary font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        Vai al dettaglio <ChevronRight className="h-3 w-3" />
      </span>
    )}
  </button>
);

/* ── Step content panel ── */
export const StepPanel = ({
  step,
  journey,
  onNavigate,
}: {
  step: JourneyStep;
  journey: GuidedJourneyDef;
  onNavigate: (nav: NavState) => void;
}) => (
  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
    {/* Question */}
    <div
      className="rounded-xl border-2 p-5"
      style={{
        borderColor: `hsl(var(${journey.colorVar}) / 0.35)`,
        background: `hsl(var(${journey.colorVar}) / 0.04)`,
      }}
    >
      <h3 className="text-lg font-extrabold text-foreground mb-1">{step.title}</h3>
      <p className="text-base font-semibold" style={{ color: `hsl(var(${journey.colorVar}))` }}>
        {step.question}
      </p>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{step.description}</p>

      {/* Conditional narratives for IGF-like indicators */}
      {step.conditionalNarratives && (
        <div className="mt-3 space-y-2 border-t pt-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Lettura per fascia
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="rounded-lg bg-[hsl(var(--chart-green))]/10 p-2.5">
              <p className="text-[10px] font-bold text-[hsl(var(--chart-green))] mb-1">
                IGF ≥ 0,70
              </p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {step.conditionalNarratives.high}
              </p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--chart-orange))]/10 p-2.5">
              <p className="text-[10px] font-bold text-[hsl(var(--chart-orange))] mb-1">
                IGF 0,40–0,60
              </p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {step.conditionalNarratives.medium}
              </p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--destructive))]/10 p-2.5">
              <p className="text-[10px] font-bold text-[hsl(var(--destructive))] mb-1">
                IGF ≤ 0,30
              </p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {step.conditionalNarratives.low}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* KPI cards */}
    {step.kpiIds.length > 0 && (
      <div>
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4" /> Indicatori chiave
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {step.kpiIds.map((id) => (
            <NarrativeKpiCard
              key={id}
              id={id}
              insight={step.insights?.[id]}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    )}

    {/* Operative correlations (from client matrix) */}
    {step.operativeCorrelations && step.operativeCorrelations.length > 0 && (
      <div>
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <ExternalLink className="h-4 w-4" /> Indicatori operativi correlati
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {step.operativeCorrelations.map((corr, i) => (
            <OperativeCorrelationCard key={i} corr={corr} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    )}

    {/* Cross-pillar impacts */}
    {step.impacts.length > 0 && (
      <div>
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Compass className="h-4 w-4" /> Impatti trasversali
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {step.impacts.map((imp) => (
            <ImpactCard
              key={`${imp.pillar}-${imp.indicatorId}`}
              impact={imp}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    )}

    {/* Drill target */}
    {step.drillTarget && (
      <button
        onClick={() => onNavigate(step.drillTarget as NavState)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
        Vai al dato di dettaglio
      </button>
    )}
  </div>
);

/* ── Main component ── */
