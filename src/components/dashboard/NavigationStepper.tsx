import { Gauge, Layers, BarChart3, ChevronRight } from "lucide-react";
import type { NavState } from "./AppSidebar";
import { syntheticIndicators } from "./AppSidebar";

const pillarLabels: Record<string, string> = {
  D1: "Classificazione",
  D2: "Fabbisogno",
  D3: "Recruiting",
  D4: "Sviluppo",
  D5: "Rewarding",
  D6: "Capacity",
};

interface Step {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  completed: boolean;
  onClick?: () => void;
}

interface NavigationStepperProps {
  nav: NavState;
  onNavigate: (nav: NavState) => void;
}

export const NavigationStepper = ({ nav, onNavigate }: NavigationStepperProps) => {
  const steps: Step[] = [];

  // Step 1: Executive (always present)
  steps.push({
    id: "executive",
    label: "Executive",
    icon: <Gauge className="h-4 w-4" />,
    active: nav.level === "executive",
    completed: nav.level !== "executive",
    onClick: () => onNavigate({ level: "executive" }),
  });

  // Step 2: Pillar (if synthetic or deeper)
  if (nav.level === "synthetic" && nav.pillar) {
    steps.push({
      id: "pillar",
      label: `${nav.pillar} · ${pillarLabels[nav.pillar] ?? nav.pillar}`,
      icon: <Layers className="h-4 w-4" />,
      active: !nav.indicator,
      completed: !!nav.indicator,
      onClick: () => onNavigate({ level: "synthetic", pillar: nav.pillar }),
    });

    // Step 3: Indicator (if selected)
    if (nav.indicator) {
      const ind = syntheticIndicators[nav.pillar]?.find((i) => i.id === nav.indicator);
      steps.push({
        id: "indicator",
        label: ind?.label ?? nav.indicator,
        icon: <BarChart3 className="h-4 w-4" />,
        active: true,
        completed: false,
      });
    }
  }

  // For operational view
  if (nav.level === "operational" && nav.source) {
    steps.push({
      id: "operational",
      label: `Operativa · ${nav.source}`,
      icon: <Layers className="h-4 w-4" />,
      active: true,
      completed: false,
    });
  }

  // For guided journey
  if (nav.level === "guided" && nav.journeyId) {
    steps.push({
      id: "guided",
      label: `Percorso guidato`,
      icon: <Layers className="h-4 w-4" />,
      active: true,
      completed: false,
    });
  }

  // Don't show stepper if only 1 step
  if (steps.length <= 1) return null;

  return (
    <div className="bg-card border-b px-6 py-2.5 sticky top-12 z-30">
      <nav className="flex items-center gap-1" aria-label="Livello di navigazione">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight className="h-4 w-4 text-border mx-1 flex-shrink-0" aria-hidden="true" />
            )}
            <button
              onClick={step.onClick}
              disabled={step.active || !step.onClick}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                step.active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : step.completed
                    ? "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                    : "bg-muted text-muted-foreground"
              }`}
              aria-current={step.active ? "step" : undefined}
            >
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  step.active
                    ? "bg-primary-foreground/20"
                    : step.completed
                      ? "bg-primary/20"
                      : "bg-muted-foreground/20"
                }`}
              >
                {step.icon}
              </span>
              <span className="max-w-[200px] truncate">{step.label}</span>
            </button>
          </div>
        ))}
      </nav>
    </div>
  );
};
