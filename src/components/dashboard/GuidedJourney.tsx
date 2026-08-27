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

import { StepPanel } from "./guidedJourneyParts";

interface GuidedJourneyProps {
  journey: GuidedJourneyDef;
  onNavigate: (nav: NavState, currentStep?: number) => void;
  onExit: () => void;
  initialStep?: number;
  embedded?: boolean;
}

/* ── Assessment color mapping to semantic classes ── */
export const GuidedJourney = ({
  journey,
  onNavigate,
  onExit,
  initialStep = 0,
  embedded,
}: GuidedJourneyProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const steps = journey.steps;
  const step = steps[currentStep];

  useEffect(() => {
    const nextStep = Number.isFinite(initialStep)
      ? Math.min(Math.max(initialStep, 0), steps.length - 1)
      : 0;
    setCurrentStep(nextStep);
  }, [initialStep, steps.length, journey.id]);

  const handleNavigateFromStep = (nav: NavState) => onNavigate(nav, currentStep);

  return (
    <div className={embedded ? "flex flex-col h-full" : "flex-1 p-6 space-y-4"}>
      {/* Header */}
      <div
        className={`flex items-center justify-between ${embedded ? "bg-[hsl(213,50%,20%)] px-5 py-4 flex-shrink-0" : ""}`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
              embedded
                ? "bg-white/10 hover:bg-white/20 text-white/80"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            <ArrowLeft className="h-4 w-4" /> {embedded ? "Chiudi" : "Executive"}
          </button>
          <div>
            <h2
              className={`text-lg font-extrabold flex items-center gap-2 ${embedded ? "text-white" : "text-foreground"}`}
            >
              <span
                className="px-2 py-0.5 rounded text-xs font-extrabold text-primary-foreground"
                style={{ background: `hsl(var(${journey.colorVar}))` }}
              >
                {journey.pillar}
              </span>
              {journey.title}
            </h2>
            <p className={`text-sm ${embedded ? "text-white/60" : "text-muted-foreground"}`}>
              {journey.subtitle}
            </p>
          </div>
        </div>
        <span
          className={`text-sm font-bold ${embedded ? "text-white/60" : "text-muted-foreground"}`}
        >
          {currentStep + 1} / {steps.length}
        </span>
      </div>

      {/* Content area */}
      <div className={embedded ? "flex-1 overflow-y-auto p-5 space-y-4" : ""}>
        {embedded ? (
          <>
            <PillarExecutiveSummary journey={journey} />
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {steps.map((s, i) => {
                const isActive = i === currentStep;
                const isCompleted = i < currentStep;
                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentStep(i)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-left transition-all whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? "bg-primary/10 border border-primary/30"
                        : isCompleted
                          ? "bg-muted/50"
                          : "hover:bg-muted/30"
                    }`}
                  >
                    <span className="flex-shrink-0">
                      {isCompleted ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : isActive ? (
                        <CircleDot
                          className="h-4 w-4"
                          style={{ color: `hsl(var(${journey.colorVar}))` }}
                        />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground/40" />
                      )}
                    </span>
                    <span
                      className={`text-xs font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {i + 1}. {s.title}
                    </span>
                  </button>
                );
              })}
            </div>
            <StepPanel step={step} journey={journey} onNavigate={handleNavigateFromStep} />
          </>
        ) : (
          <div className="space-y-6">
            <PillarExecutiveSummary journey={journey} />
            <div className="flex gap-6">
              <nav
                className="hidden md:flex flex-col gap-0 min-w-[220px]"
                aria-label="Step del percorso"
              >
                {steps.map((s, i) => {
                  const isActive = i === currentStep;
                  const isCompleted = i < currentStep;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setCurrentStep(i)}
                      className={`flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                        isActive ? "bg-primary/10" : "hover:bg-muted/50"
                      }`}
                    >
                      <span className="mt-0.5 flex-shrink-0">
                        {isCompleted ? (
                          <Check className="h-5 w-5 text-primary" />
                        ) : isActive ? (
                          <CircleDot
                            className="h-5 w-5"
                            style={{ color: `hsl(var(${journey.colorVar}))` }}
                          />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground/40" />
                        )}
                      </span>
                      <div className="flex flex-col">
                        <span
                          className={`text-xs font-extrabold ${isActive ? "text-foreground" : isCompleted ? "text-primary" : "text-muted-foreground"}`}
                        >
                          Tappa {i + 1}
                        </span>
                        <span
                          className={`text-[11px] leading-tight ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {s.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>
              <div className="flex-1 min-w-0">
                <StepPanel step={step} journey={journey} onNavigate={handleNavigateFromStep} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div
        className={`flex items-center justify-between pt-2 border-t ${embedded ? "px-5 pb-4 flex-shrink-0" : ""}`}
      >
        <button
          onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
          disabled={currentStep === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Precedente
        </button>
        <button
          onClick={() => setCurrentStep((p) => Math.min(steps.length - 1, p + 1))}
          disabled={currentStep === steps.length - 1}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Successivo <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
