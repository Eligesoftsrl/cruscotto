import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CircleDot, Circle } from "lucide-react";
import { PillarExecutiveSummary } from "./PillarExecutiveSummary";

import type { GuidedJourneyDef } from "@/data/guidedJourneys";

import type { NavState } from "./AppSidebar";

import { StepPanel } from "./guidedJourneyParts";
import { pickFirst } from "@/lib/conditional";

/** Icona di stato della tappa: completata, attiva o da fare. */
const StepIcon = ({
  isActive,
  isCompleted,
  colorVar,
  size,
}: {
  isActive: boolean;
  isCompleted: boolean;
  colorVar: string;
  size: string;
}) => {
  if (isCompleted) return <Check aria-hidden="true" className={`${size} text-primary`} />;
  if (isActive) {
    return <CircleDot aria-hidden="true" className={size} style={{ color: `hsl(var(${colorVar}))` }} />;
  }
  return <Circle aria-hidden="true" className={`${size} text-muted-foreground/70`} />;
};

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
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> {embedded ? "Chiudi" : "Executive"}
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
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-left transition-all whitespace-nowrap flex-shrink-0 ${pickFirst(
                      [
                        [isActive, "bg-primary/10 border border-primary/30"],
                        [isCompleted, "bg-muted/50"],
                      ],
                      "hover:bg-muted/30",
                    )}`}
                  >
                    <span className="flex-shrink-0">
                      <StepIcon isActive={isActive} isCompleted={isCompleted} colorVar={journey.colorVar} size="h-4 w-4" />
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
                        <StepIcon isActive={isActive} isCompleted={isCompleted} colorVar={journey.colorVar} size="h-5 w-5" />
                      </span>
                      <div className="flex flex-col">
                        <span
                          className={`text-xs font-extrabold ${pickFirst([[isActive, "text-foreground"], [isCompleted, "text-primary"]], "text-muted-foreground")}`}
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
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Precedente
        </button>
        <button
          onClick={() => setCurrentStep((p) => Math.min(steps.length - 1, p + 1))}
          disabled={currentStep === steps.length - 1}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Successivo <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
