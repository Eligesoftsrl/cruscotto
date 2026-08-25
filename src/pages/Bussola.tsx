import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BussolaHome } from "@/components/bussola/BussolaHome";
import { BussolaPercorso } from "@/components/bussola/BussolaPercorso";
import { TopBar } from "@/components/dashboard/TopBar";
import { GuidedJourney } from "@/components/dashboard/GuidedJourney";
import { guidedJourneys } from "@/data/guidedJourneys";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { JourneyCreatorWizard } from "@/components/bussola/JourneyCreatorWizard";
import { CustomJourneyViewer } from "@/components/bussola/CustomJourneyViewer";
import { useCustomJourneys } from "@/hooks/useCustomJourneys";
import type { NavState } from "@/components/dashboard/AppSidebar";
import type { JourneyTemplate } from "@/data/journeyTemplates";

const Bussola = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { fetchById } = useCustomJourneys();
  const [activePercorso, setActivePercorso] = useState<string | null>(null);
  const [activeJourney, setActiveJourney] = useState<string | null>(null);
  const [activeJourneyStep, setActiveJourneyStep] = useState<number>(0);
  const [initialStep, setInitialStep] = useState<number | undefined>(undefined);
  const [initialIndicatorId, setInitialIndicatorId] = useState<string | undefined>(undefined);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activeCustomJourney, setActiveCustomJourney] = useState<any>(null);
  const [initialCustomJourneyStep, setInitialCustomJourneyStep] = useState<number | undefined>(undefined);
  const [initialCustomJourneyIndicatorId, setInitialCustomJourneyIndicatorId] = useState<string | undefined>(undefined);
  const [communityRefreshKey, setCommunityRefreshKey] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<JourneyTemplate | null>(null);

  useEffect(() => {
    const percorso = searchParams.get("percorso");
    const step = searchParams.get("step");
    const indicator = searchParams.get("indicator");
    const journey = searchParams.get("journey");
    const journeyStep = searchParams.get("journey_step");
    const customJourneyId = searchParams.get("custom_journey");
    const customStep = searchParams.get("custom_step");
    const customIndicator = searchParams.get("custom_indicator");

    if (percorso) {
      setActivePercorso(percorso);
      setInitialStep(step ? parseInt(step, 10) : undefined);
      setInitialIndicatorId(indicator ?? undefined);
    }

    if (journey && guidedJourneys[journey]) {
      setActiveJourney(journey);
      setActiveJourneyStep(journeyStep ? parseInt(journeyStep, 10) : 0);
    }

    if (customJourneyId) {
      (async () => {
        const found = await fetchById(customJourneyId);
        if (found) {
          setActiveCustomJourney(found);
          setInitialCustomJourneyStep(customStep ? parseInt(customStep, 10) : 0);
          setInitialCustomJourneyIndicatorId(customIndicator ?? undefined);
        }
      })();
    }

    if (percorso || journey || customJourneyId) {
      setSearchParams({}, { replace: true });
    }
  }, []);

  const handleGoToDashboard = (
    nav?: NavState,
    percorsoId?: string,
    step?: number,
    journeyStep?: number,
    originIndicatorId?: string,
  ) => {
    const params = new URLSearchParams();

    if (nav) {
      params.set("level", nav.level);
      if (nav.pillar) params.set("pillar", nav.pillar);
      if (nav.source) params.set("source", nav.source);
      if (nav.indicator) params.set("indicator", nav.indicator);
    }

    if (percorsoId) {
      params.set("from_bussola", percorsoId);
      if (step !== undefined) params.set("bussola_step", String(step));
      if (originIndicatorId) params.set("bussola_indicator", originIndicatorId);
    }

    if (activeJourney) params.set("from_journey", activeJourney);
    if (journeyStep !== undefined) params.set("journey_step", String(journeyStep));

    if (activeCustomJourney) {
      params.set("from_custom_journey", "true");
      params.set("custom_journey", activeCustomJourney.id);
      if (step !== undefined) params.set("custom_step", String(step));
      if (originIndicatorId) params.set("custom_indicator", originIndicatorId);
    }

    navigate(`/dashboard?${params.toString()}`);
  };

  if (activeJourney && guidedJourneys[activeJourney]) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col">
        <TopBar nav={{ level: "executive" }} />
        <div className="flex-1">
          <GuidedJourney
            journey={guidedJourneys[activeJourney]}
            initialStep={activeJourneyStep}
            onNavigate={(nav, step) => handleGoToDashboard(nav, undefined, undefined, step)}
            onExit={() => setActiveJourney(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <TopBar nav={{ level: "executive" }} />
      <BussolaHome
        onSelectPercorso={(id) => {
          setInitialStep(undefined);
          setInitialIndicatorId(undefined);
          setActivePercorso(id);
        }}
        onStartGuidedJourney={(journeyId) => {
          setActiveJourneyStep(0);
          setActiveJourney(journeyId);
        }}
        onCreateJourney={() => {
          setSelectedTemplate(null);
          setWizardOpen(true);
        }}
        onFollowCustomJourney={(j) => {
          setInitialCustomJourneyStep(undefined);
          setInitialCustomJourneyIndicatorId(undefined);
          setActiveCustomJourney(j);
        }}
        onUseTemplate={(tpl) => {
          setSelectedTemplate(tpl);
          setWizardOpen(true);
        }}
        communityRefreshKey={communityRefreshKey}
      />

      <Sheet open={!!activePercorso} onOpenChange={(open) => !open && setActivePercorso(null)}>
        <SheetContent side="right" className="w-full sm:w-[560px] md:w-[640px] lg:w-[720px] p-0 overflow-y-auto">
          {activePercorso && (
            <BussolaPercorso
              percorsoId={activePercorso}
              initialStep={initialStep}
              initialIndicatorId={initialIndicatorId}
              onBack={() => setActivePercorso(null)}
              onGoToDashboard={(nav, stepIndex, indicatorId) => handleGoToDashboard(nav, activePercorso, stepIndex, undefined, indicatorId)}
            />
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!activeCustomJourney} onOpenChange={(open) => !open && setActiveCustomJourney(null)}>
        <SheetContent side="right" className="w-full sm:w-[560px] md:w-[640px] lg:w-[720px] p-0 overflow-y-auto">
          {activeCustomJourney && (
            <CustomJourneyViewer
              journey={activeCustomJourney}
              initialStep={initialCustomJourneyStep}
              initialIndicatorId={initialCustomJourneyIndicatorId}
              onBack={() => setActiveCustomJourney(null)}
              onGoToDashboard={(nav, stepIndex, indicatorId) => handleGoToDashboard(nav, undefined, stepIndex, undefined, indicatorId)}
            />
          )}
        </SheetContent>
      </Sheet>

      <JourneyCreatorWizard
        open={wizardOpen}
        onClose={() => {
          setWizardOpen(false);
          setSelectedTemplate(null);
        }}
        onCreated={() => setCommunityRefreshKey((k) => k + 1)}
        template={selectedTemplate}
      />
    </div>
  );
};

export default Bussola;
