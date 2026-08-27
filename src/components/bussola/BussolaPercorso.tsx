import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  X,
  ChevronDown,
  BookOpen,
  Database,
  Calculator,
} from "lucide-react";
import {
  bussolaPercorsi,
  type BussolaStep,
  type BussolaIndicator,
  type BussolaProjection,
} from "@/data/bussolaPercorsi";
import { useAuth } from "@/contexts/AuthContext";
import { useBussolaData } from "@/hooks/useBussolaData";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ReferenceLine,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { NavState } from "@/components/dashboard/AppSidebar";

interface BussolaPercorsoProps {
  percorsoId: string;
  initialStep?: number;
  initialIndicatorId?: string;
  onBack: () => void;
  onGoToDashboard: (nav?: NavState, currentStep?: number, originIndicatorId?: string) => void;
}

export const BussolaPercorso = ({
  percorsoId,
  initialStep,
  initialIndicatorId,
  onBack,
  onGoToDashboard,
}: BussolaPercorsoProps) => {
  const { profile } = useAuth();
  const percorso = bussolaPercorsi.find((p) => p.id === percorsoId);
  const [currentStep, setCurrentStep] = useState(initialStep ?? 0);

  useEffect(() => {
    setCurrentStep(initialStep ?? 0);
  }, [percorsoId, initialStep]);

  if (!percorso) return null;

  const step = percorso.steps[currentStep];
  const totalSteps = percorso.steps.length;

  const handleCta = (cta: BussolaStep["cta"]) => {
    if (!cta) return;
    if (cta.source) {
      onGoToDashboard({ level: "operational", source: cta.source }, currentStep);
    } else if (cta.pillar) {
      onGoToDashboard({ level: "synthetic", pillar: cta.pillar }, currentStep);
    } else {
      onGoToDashboard({ level: "executive" }, currentStep);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[hsl(213,50%,20%)] px-5 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">
            Percorso guidato
          </p>
          <h2 className="text-sm font-bold text-white leading-tight">{percorso.question}</h2>
        </div>
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-white/10 transition">
          <X className="h-4 w-4 text-white/70" />
        </button>
      </div>

      {totalSteps > 1 && (
        <div className="flex items-center gap-2 px-5 pt-4 pb-2">
          {percorso.steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentStep ? "w-8 bg-primary" : "w-2 bg-primary/30"
              }`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">
            {currentStep + 1} / {totalSteps}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{step.description}</p>

        <div className="mb-5">
          <div className="text-[10px] font-bold tracking-[.1em] uppercase text-muted-foreground mb-3">
            Indicatori chiave
          </div>
          <div className="flex flex-col gap-1.5">
            {step.indicators.map((ind) => (
              <IndicatorRow
                key={ind.id}
                indicator={ind}
                onGoToDashboard={onGoToDashboard}
                currentStep={currentStep}
                isInitiallyFocused={initialIndicatorId === ind.id}
              />
            ))}
          </div>
        </div>

        {step.projection && <ProjectionChart projection={step.projection} />}

        <InsightBlock insight={step.insight} />

        {step.cta && (
          <button
            onClick={() => handleCta(step.cta)}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition"
          >
            {step.cta.label}
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex justify-between items-center px-5 py-4 border-t bg-card flex-shrink-0">
        {currentStep > 0 ? (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-4 w-4" /> Precedente
          </button>
        ) : (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-4 w-4" /> Chiudi
          </button>
        )}

        {currentStep < totalSteps - 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition"
          >
            Prossimo <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => onGoToDashboard({ level: "executive" }, currentStep)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[hsl(142,71%,35%)] text-white text-sm font-bold hover:opacity-90 transition"
          >
            Vista Analitica <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

function ProjectionChart({ projection }: { projection: BussolaProjection }) {
  const historicalData = projection.data.filter((d) => !d.projected);
  const projectedData = projection.data.filter((d) => d.projected);
  const chartData = projection.data.map((d) => ({
    anno: d.anno,
    storico: d.projected ? undefined : d.valore,
    proiezione: d.projected ? d.valore : undefined,
    ...(d.anno === historicalData[historicalData.length - 1]?.anno ? { proiezione: d.valore } : {}),
  }));

  const combined = projection.data.map((d, i) => {
    const isLastHistorical =
      !d.projected && (i + 1 >= projection.data.length || projection.data[i + 1]?.projected);
    return {
      anno: d.anno,
      storico: d.projected ? null : d.valore,
      proiezione: d.projected || isLastHistorical ? d.valore : null,
    };
  });

  return (
    <div className="bg-card border rounded-lg p-4 mb-5">
      <div className="text-[10px] font-bold tracking-[.1em] uppercase text-muted-foreground mb-1">
        {projection.label}
      </div>
      {projection.thresholdLabel && (
        <div className="text-[10px] text-muted-foreground mb-3">
          Linea tratteggiata = {projection.thresholdLabel}
        </div>
      )}
      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={combined} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gradHistoric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="anno" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={45} />
            <RechartsTooltip
              contentStyle={{
                fontSize: 11,
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 6,
              }}
            />
            {projection.threshold != null && (
              <ReferenceLine
                y={projection.threshold}
                stroke="hsl(var(--destructive))"
                strokeDasharray="5 5"
                strokeWidth={1.5}
              />
            )}
            <Area
              type="monotone"
              dataKey="storico"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#gradHistoric)"
              connectNulls={false}
              dot={{ r: 3, fill: "hsl(var(--primary))" }}
              isAnimationActive={true}
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="proiezione"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              strokeDasharray="6 4"
              fill="url(#gradProjected)"
              connectNulls={false}
              dot={{ r: 3, fill: "hsl(var(--destructive))", strokeDasharray: "0" }}
              isAnimationActive={true}
              animationDuration={800}
              animationBegin={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-primary rounded" />
          <span className="text-[10px] text-muted-foreground">Storico</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-destructive rounded" style={{ borderTop: "2px dashed" }} />
          <span className="text-[10px] text-muted-foreground">Proiezione</span>
        </div>
      </div>
    </div>
  );
}

function IndicatorRow({
  indicator,
  onGoToDashboard,
  currentStep,
  isInitiallyFocused,
}: {
  indicator: BussolaIndicator;
  onGoToDashboard: (nav?: NavState, currentStep?: number, originIndicatorId?: string) => void;
  currentStep?: number;
  isInitiallyFocused: boolean;
}) {
  const [expanded, setExpanded] = useState(isInitiallyFocused);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const statusColors = {
    green: {
      bar: "bg-[hsl(142,71%,35%)]",
      text: "text-[hsl(142,71%,35%)]",
      icon: "hsl(142,71%,35%)",
    },
    yellow: {
      bar: "bg-[hsl(45,100%,42%)]",
      text: "text-[hsl(45,80%,30%)]",
      icon: "hsl(45,100%,42%)",
    },
    red: { bar: "bg-destructive", text: "text-destructive", icon: "hsl(var(--destructive))" },
  };
  const c = statusColors[indicator.status];
  const pct = Math.round(indicator.value * 100);
  const hasDrilldown = indicator.trend || indicator.numerator != null || indicator.methodology;

  const StatusIcon =
    indicator.status === "green"
      ? CheckCircle
      : indicator.status === "red"
        ? AlertTriangle
        : Lightbulb;

  useEffect(() => {
    if (!isInitiallyFocused) return;
    setExpanded(true);
    const timer = window.setTimeout(() => {
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 180);
    return () => window.clearTimeout(timer);
  }, [isInitiallyFocused]);

  return (
    <div
      ref={containerRef}
      className={`border rounded-lg overflow-hidden ${isInitiallyFocused ? "ring-1 ring-primary/40 bg-primary/5" : ""}`}
    >
      <button
        onClick={() => hasDrilldown && setExpanded(!expanded)}
        className={`w-full text-left px-3 py-2.5 ${hasDrilldown ? "cursor-pointer hover:bg-muted/50" : ""} transition-colors`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <StatusIcon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: c.icon }} />
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-[10px] font-bold text-primary cursor-help border-b border-dotted border-primary/40">
                    {indicator.id}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-xs font-bold mb-1">
                    {indicator.id} — {indicator.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {indicator.description}
                  </p>
                  {indicator.methodology && (
                    <p className="text-[11px] text-muted-foreground leading-snug mt-1 italic">
                      {indicator.methodology}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-xs text-foreground">{indicator.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold ${c.text}`}>{pct}%</span>
            {hasDrilldown && (
              <ChevronDown
                className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              />
            )}
          </div>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden mb-1">
          <div
            className={`h-full rounded-full ${c.bar} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-[10px] text-muted-foreground">{indicator.description}</div>
      </button>

      {expanded && hasDrilldown && (
        <div className="px-3 pb-3 pt-1 border-t bg-muted/30 animate-in slide-in-from-top-2 duration-200 space-y-3">
          {indicator.numerator != null &&
            indicator.denominator != null &&
            indicator.denominator !== 1 && (
              <div className="bg-card rounded-md px-3 py-2 border">
                <div className="text-[9px] font-bold tracking-wider uppercase text-muted-foreground mb-1">
                  Formula
                </div>
                <div className="text-sm font-mono text-foreground">
                  <span className="text-primary font-bold">
                    {indicator.numerator.toLocaleString("it-IT")}
                  </span>
                  <span className="text-muted-foreground mx-1.5">÷</span>
                  <span className="text-primary font-bold">
                    {indicator.denominator.toLocaleString("it-IT")}
                  </span>
                  <span className="text-muted-foreground mx-1.5">=</span>
                  <span className={`font-bold ${c.text}`}>
                    {(indicator.numerator / indicator.denominator).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

          {indicator.trend && indicator.trend.length > 0 && (
            <div className="bg-card rounded-md px-3 py-2 border">
              <div className="text-[9px] font-bold tracking-wider uppercase text-muted-foreground mb-1">
                Trend storico
              </div>
              <div className="h-[80px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={indicator.trend}
                    margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
                  >
                    <XAxis
                      dataKey="anno"
                      tick={{ fontSize: 9 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 9 }}
                      stroke="hsl(var(--muted-foreground))"
                      width={35}
                      domain={["auto", "auto"]}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 10,
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 6,
                      }}
                    />
                    {indicator.benchmark != null && (
                      <ReferenceLine
                        y={indicator.benchmark}
                        stroke="hsl(var(--muted-foreground))"
                        strokeDasharray="4 4"
                        strokeWidth={1}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="valore"
                      stroke={c.icon}
                      strokeWidth={2}
                      dot={{ r: 2.5, fill: c.icon }}
                      isAnimationActive
                      animationDuration={600}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {indicator.benchmark != null && (
            <div className="bg-card rounded-md px-3 py-2 border">
              <div className="text-[9px] font-bold tracking-wider uppercase text-muted-foreground mb-1">
                Benchmark {indicator.benchmarkLabel ? `· ${indicator.benchmarkLabel}` : ""}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-muted rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 h-full w-0.5 bg-muted-foreground z-10"
                    style={{ left: `${Math.min(indicator.benchmark * 100, 100)}%` }}
                  />
                  <div
                    className={`h-full rounded-full ${c.bar} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-[10px] whitespace-nowrap">
                  <span className={`font-bold ${c.text}`}>{pct}%</span>
                  <span className="text-muted-foreground"> vs </span>
                  <span className="font-medium text-foreground">
                    {Math.round(indicator.benchmark * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {indicator.methodology && (
            <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
              <BookOpen className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>{indicator.methodology}</span>
            </div>
          )}

          {indicator.dataSource && (
            <div className="bg-card rounded-md px-3 py-2 border border-primary/20">
              <div className="text-[9px] font-bold tracking-wider uppercase text-primary/70 mb-1.5">
                Provenienza dato
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px]">
                  <Database className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Tabella:</span>
                  <span className="font-mono text-foreground font-medium">
                    {indicator.dataSource.table}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <Calculator className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Calcolo:</span>
                  <span className="font-mono text-foreground font-medium">
                    {indicator.dataSource.formula}
                  </span>
                </div>
              </div>
            </div>
          )}

          {(indicator.pillar || indicator.source) && (
            <div className="flex flex-wrap items-center gap-3">
              {indicator.pillar && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGoToDashboard(
                      { level: "synthetic", pillar: indicator.pillar!, indicator: indicator.id },
                      currentStep,
                      indicator.id,
                    );
                  }}
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Vedi indicatore nel cruscotto
                </button>
              )}
              {indicator.source && indicator.indicatorTarget && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGoToDashboard(
                      {
                        level: "operational",
                        source: indicator.source!,
                        indicator: indicator.indicatorTarget!,
                      },
                      currentStep,
                      indicator.id,
                    );
                  }}
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:underline"
                >
                  <Database className="h-3 w-3" />
                  Vai al dato operativo
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InsightBlock({ insight }: { insight: BussolaStep["insight"] }) {
  const styles = {
    success: { bg: "bg-[hsl(142,71%,95%)]", border: "border-[hsl(142,71%,35%)]", icon: "💡" },
    warning: { bg: "bg-[hsl(45,100%,95%)]", border: "border-[hsl(45,100%,42%)]", icon: "💡 ⚠" },
    danger: { bg: "bg-destructive/5", border: "border-destructive", icon: "💡 ⚠" },
  };
  const s = styles[insight.type];

  return (
    <div
      className={`${s.bg} border-l-4 ${s.border} rounded-r-md px-4 py-3 text-sm text-foreground/80`}
    >
      <span className="mr-1">{s.icon}</span> {insight.text}
    </div>
  );
}
