import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  X,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Info,
  ExternalLink,
  Database,
} from "lucide-react";
import { indicatorCatalog, type CatalogIndicator } from "@/data/indicatorCatalog";
import { Badge } from "@/components/ui/badge";
import type { NavState } from "@/components/dashboard/AppSidebar";

interface CustomJourneyStep {
  step_order: number;
  title: string;
  description: string;
  indicators: string[];
  insight_text: string;
  insight_type: string;
}

interface CustomJourney {
  id: string;
  title: string;
  question: string;
  subtitle: string;
  category: string;
  steps: CustomJourneyStep[];
  author: string;
}

interface CustomJourneyViewerProps {
  journey: CustomJourney;
  initialStep?: number;
  initialIndicatorId?: string;
  onBack: () => void;
  onGoToDashboard?: (nav?: NavState, currentStep?: number, originIndicatorId?: string) => void;
}

const insightIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  danger: AlertTriangle,
  info: Info,
};

const insightColors = {
  success: "bg-[hsl(142,71%,95%)] border-[hsl(142,71%,60%)] text-[hsl(142,71%,25%)]",
  warning: "bg-[hsl(45,100%,95%)] border-[hsl(45,100%,60%)] text-[hsl(45,80%,25%)]",
  danger: "bg-destructive/5 border-destructive/30 text-destructive",
  info: "bg-primary/5 border-primary/30 text-primary",
};

const statusConfig = {
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

const indicatorTargetMap: Record<string, string> = {
  // D1 — Minerva
  IAC: "minerva-catalogo",
  "IIMP/R": "minerva-catalogo",
  ICPR: "minerva-catalogo",
  "ICSP/R": "minerva-assessment",
  IACU: "minerva-catalogo",
  ICCOMP: "minerva-competenze",
  // D2 — Conto Annuale
  IGF: "analisi-personale",
  IRS: "analisi-personale",
  IDP_Norm: "assunti-causale",
  PTI: "assunti-causale",
  IRG_Norm: "analisi-eta",
  // D3 — InPA
  IAR: "inpa-bandi",
  DDP: "inpa-domanda-offerta",
  IAP: "inpa-attrattivita",
  IAT: "inpa-attrattivita",
  TSC: "inpa-efficacia",
  TCP: "inpa-tempi-dettaglio",
  TCPB: "inpa-graduatorie",
  ISC: "inpa-candidature",
  IER: "inpa-efficacia",
  IES: "inpa-durata",
  // D4 — Syllabus / Minerva / Conto Annuale
  IQP: "syllabus-discenti",
  CGC: "syllabus-gap-formazione",
  TCF: "syllabus-corsi",
  IFM_Norm: "formati-personale",
  ICQ: "analisi-personale",
  ICRP: "minerva-fabbisogno",
  ICVC: "syllabus-assessment",
  VQF: "syllabus-corsi",
  S_GAP: "syllabus-gap-formazione",
  S_CORSI: "syllabus-corsi",
  S_FORM: "syllabus-discenti",
  S_BADGE: "syllabus-assessment",
  // D5 — Conto Annuale
  IDC: "progressioni",
  ISCP: "progressioni",
  IEQ: "analisi-genere",
  IDLA: "lavoro-agile",
  DPI_Norm_D5: "progressioni",
  IRG_genere: "analisi-genere",
  ICCR: "progressioni",
  ICEC: "analisi-genere",
  IPO: "progressioni",
  IPV: "progressioni",
  ILA: "lavoro-agile",
  // D6 — Conto Annuale
  TVO: "tasso-turnover",
  TEP: "previsione-cessazioni",
  ISG: "analisi-eta",
  IEF_Norm: "analisi-personale",
  TEPD: "previsione-cessazioni",
  ICS_Norm: "tasso-sostituzione",
  ISTP_Norm: "previsione-cessazioni",
  IDFP: "analisi-personale",
  IFL: "lavoro-flessibile",
  DPI_Norm: "progressioni",
  IPD: "analisi-personale",
  TDLA: "lavoro-agile",
  TFL: "lavoro-flessibile",
  IESF: "syllabus-corsi",
  CQT: "analisi-personale",
};

const sourceToOperational: Record<string, string> = {
  "Conto Annuale": "conto-annuale",
  InPA: "inpa",
  Syllabus: "syllabus",
  Minerva: "minerva",
  "KPI Rilevazione": "kpi-riforma",
  "Lavoro Pubblico": "lavoro-pubblico",
};

export function CustomJourneyViewer({
  journey,
  initialStep,
  initialIndicatorId,
  onBack,
  onGoToDashboard,
}: CustomJourneyViewerProps) {
  const [currentStep, setCurrentStep] = useState(initialStep ?? 0);

  useEffect(() => {
    setCurrentStep(initialStep ?? 0);
  }, [journey.id, initialStep]);

  const step = journey.steps[currentStep];
  const totalSteps = journey.steps.length;
  const stepIndicators = step.indicators
    .map((id) => indicatorCatalog.find((c) => c.id === id))
    .filter(Boolean) as CatalogIndicator[];

  const InsightIcon = insightIcons[step.insight_type as keyof typeof insightIcons] || Info;
  const insightColor =
    insightColors[step.insight_type as keyof typeof insightColors] || insightColors.info;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[hsl(213,50%,20%)] px-5 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">
            Percorso community · {journey.author}
          </p>
          <h2 className="text-sm font-bold text-white leading-tight">{journey.title}</h2>
        </div>
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-white/10 transition">
          <X className="h-4 w-4 text-white/70" />
        </button>
      </div>

      {totalSteps > 1 && (
        <div className="flex items-center gap-2 px-5 pt-4 pb-2">
          {journey.steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-2 rounded-full transition-all ${i === currentStep ? "w-8 bg-primary" : "w-2 bg-primary/30"}`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">
            {currentStep + 1} / {totalSteps}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
        {step.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">{step.description}</p>
        )}

        {stepIndicators.length > 0 && (
          <div className="mb-5">
            <div className="text-[10px] font-bold tracking-[.1em] uppercase text-muted-foreground mb-3">
              Indicatori chiave
            </div>
            <div className="flex flex-col gap-1.5">
              {stepIndicators.map((ind) => (
                <IndicatorCard
                  key={ind.id}
                  indicator={ind}
                  currentStep={currentStep}
                  isInitiallyFocused={initialIndicatorId === ind.id}
                  onGoToDashboard={onGoToDashboard}
                />
              ))}
            </div>
          </div>
        )}

        {step.insight_text && (
          <div className={`flex gap-3 p-3 rounded-lg border ${insightColor}`}>
            <InsightIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">{step.insight_text}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center px-5 py-4 border-t bg-card flex-shrink-0">
        {currentStep > 0 ? (
          <button
            onClick={() => setCurrentStep((c) => c - 1)}
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
            onClick={() => setCurrentStep((c) => c + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition"
          >
            Prossimo <ArrowRight className="h-4 w-4" />
          </button>
        ) : onGoToDashboard ? (
          <button
            onClick={() => onGoToDashboard({ level: "executive" }, currentStep)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[hsl(142,71%,35%)] text-white text-sm font-bold hover:opacity-90 transition"
          >
            Vista Analitica <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[hsl(142,71%,35%)] text-white text-sm font-bold hover:opacity-90 transition"
          >
            Fine percorso <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function IndicatorCard({
  indicator,
  currentStep,
  isInitiallyFocused,
  onGoToDashboard,
}: {
  indicator: CatalogIndicator;
  currentStep: number;
  isInitiallyFocused: boolean;
  onGoToDashboard?: (nav?: NavState, currentStep?: number, originIndicatorId?: string) => void;
}) {
  const [expanded, setExpanded] = useState(isInitiallyFocused);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const c = statusConfig[indicator.status];
  const pct = Math.round(indicator.value * 100);
  const StatusIcon =
    indicator.status === "green"
      ? CheckCircle
      : indicator.status === "red"
        ? AlertTriangle
        : Lightbulb;
  const operationalSource = sourceToOperational[indicator.source];
  const indicatorTarget = indicatorTargetMap[indicator.id];
  const hasDeepLink = !!onGoToDashboard && (indicator.pillar || operationalSource);

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
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full text-left px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <StatusIcon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: c.icon }} />
            <span className="text-[10px] font-bold text-primary">{indicator.id}</span>
            <span className="text-xs text-foreground">{indicator.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold ${c.text}`}>{pct}%</span>
            <ChevronDown
              className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
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

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t bg-muted/30 animate-in slide-in-from-top-2 duration-200 space-y-3">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
              {indicator.pillar}
            </Badge>
            <span className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              {indicator.source}
            </span>
          </div>

          <div className="bg-card rounded-md px-3 py-2 border">
            <div className="text-[9px] font-bold tracking-wider uppercase text-muted-foreground mb-1">
              Posizionamento
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-muted rounded-full relative overflow-hidden">
                <div
                  className="absolute top-0 h-full w-px bg-[hsl(45,100%,42%)]"
                  style={{ left: "40%" }}
                />
                <div
                  className="absolute top-0 h-full w-px bg-[hsl(142,71%,45%)]"
                  style={{ left: "60%" }}
                />
                <div
                  className={`h-full rounded-full ${c.bar} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={`text-xs font-bold ${c.text} whitespace-nowrap`}>{pct}%</span>
            </div>
          </div>

          {hasDeepLink && (
            <div className="flex flex-wrap items-center gap-3">
              {indicator.pillar && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGoToDashboard?.(
                      { level: "synthetic", pillar: indicator.pillar, indicator: indicator.id },
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
              {operationalSource && indicatorTarget && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGoToDashboard?.(
                      {
                        level: "operational",
                        source: operationalSource,
                        indicator: indicatorTarget,
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
