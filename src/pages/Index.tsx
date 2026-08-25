import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Compass, ArrowLeft } from "lucide-react";
import { FilterProvider } from "@/contexts/FilterContext";
import { AppSidebar, type NavState } from "@/components/dashboard/AppSidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { ExecutiveView } from "@/components/dashboard/ExecutiveView";
import { SyntheticPillarView } from "@/components/dashboard/SyntheticPillarView";
import { OperationalContent } from "@/components/dashboard/OperationalContent";
import { GuidedJourney } from "@/components/dashboard/GuidedJourney";
import { guidedJourneys } from "@/data/guidedJourneys";
import { GlobalFilterBar } from "@/components/dashboard/GlobalFilterBar";
import { NavigationStepper } from "@/components/dashboard/NavigationStepper";
import { OnboardingTour } from "@/components/dashboard/OnboardingTour";

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bussolaPercorso = searchParams.get("from_bussola");
  const bussolaStep = searchParams.get("bussola_step");
  const bussolaIndicator = searchParams.get("bussola_indicator");
  const fromJourney = searchParams.get("from_journey");
  const journeyStep = searchParams.get("journey_step");
  const fromCustomJourney = searchParams.get("from_custom_journey");
  const customJourneyId = searchParams.get("custom_journey");
  const customStep = searchParams.get("custom_step");
  const customIndicator = searchParams.get("custom_indicator");

  const handleReturnToBussola = () => {
    const params = new URLSearchParams();
    if (bussolaPercorso) params.set("percorso", bussolaPercorso);
    if (bussolaStep) params.set("step", bussolaStep);
    if (bussolaIndicator) params.set("indicator", bussolaIndicator);
    if (fromJourney) params.set("journey", fromJourney);
    if (journeyStep) params.set("journey_step", journeyStep);
    if (customJourneyId) params.set("custom_journey", customJourneyId);
    if (customStep) params.set("custom_step", customStep);
    if (customIndicator) params.set("custom_indicator", customIndicator);
    navigate(`/bussola?${params.toString()}`);
  };

  const showReturnButton = bussolaPercorso || fromJourney || fromCustomJourney || customJourneyId;

  const getInitialNav = (): NavState => {
    const level = searchParams.get("level") as NavState["level"] | null;
    if (level === "synthetic") {
      return { level: "synthetic", pillar: searchParams.get("pillar") ?? undefined, indicator: searchParams.get("indicator") ?? undefined };
    }
    if (level === "operational") {
      return { level: "operational", source: searchParams.get("source") ?? undefined, indicator: searchParams.get("indicator") ?? undefined };
    }
    return { level: "executive" };
  };

  const [nav, setNav] = useState<NavState>(getInitialNav);

  const renderContent = () => {
    if (nav.level === "guided" && nav.journeyId && guidedJourneys[nav.journeyId]) {
      return (
        <GuidedJourney
          journey={guidedJourneys[nav.journeyId]}
          onNavigate={(nextNav) => setNav(nextNav)}
          onExit={() => setNav({ level: "executive" })}
        />
      );
    }

    if (nav.level === "executive") {
      return (
        <ExecutiveView
          onDrillDown={(pillar, indicatorId) => setNav({ level: "synthetic", pillar, indicator: indicatorId })}
          onStartJourney={(journeyId) => setNav({ level: "guided", journeyId })}
        />
      );
    }

    if (nav.level === "synthetic") {
      if (nav.pillar) {
        return (
          <SyntheticPillarView
            pillar={nav.pillar}
            selectedIndicator={nav.indicator}
            onSelectIndicator={(id) => setNav({ level: "synthetic", pillar: nav.pillar, indicator: id })}
            onGoExecutive={() => setNav({ level: "executive" })}
          />
        );
      }
      return <ExecutiveView />;
    }

    if (nav.level === "operational" && nav.source) {
      return (
        <OperationalContent
          source={nav.source}
          indicator={nav.indicator}
          onGoExecutive={() => setNav({ level: "executive" })}
          onGoSynthetic={(pillar) => setNav({ level: "synthetic", pillar })}
        />
      );
    }

    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-card border rounded-lg p-10 text-center max-w-md">
          <h3 className="text-base font-semibold text-foreground mb-2">Seleziona una vista</h3>
          <p className="text-sm text-muted-foreground">
            Utilizza la sidebar per navigare tra Vista Executive, Sintetica e Operativa.
          </p>
        </div>
      </div>
    );
  };

  return (
    <FilterProvider>
      <div className="flex min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-semibold"
        >
          Vai al contenuto principale
        </a>

        <AppSidebar nav={nav} onNavigate={setNav} />
        <div className="ml-[260px] flex-1 flex flex-col min-h-screen">
          <TopBar nav={nav} onNavigate={setNav} />
          <NavigationStepper nav={nav} onNavigate={setNav} />
          <GlobalFilterBar />
          <main id="main-content" className="flex-1 flex flex-col" role="main">
            {renderContent()}
          </main>
        </div>

        <OnboardingTour />

        {showReturnButton && (
          <button
            onClick={handleReturnToBussola}
            className="fixed bottom-6 left-[280px] z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-all text-sm font-bold animate-in slide-in-from-bottom-4 duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <Compass className="h-4 w-4" />
            Torna al Pannello di Governo
          </button>
        )}
      </div>
    </FilterProvider>
  );
};

export default Index;
