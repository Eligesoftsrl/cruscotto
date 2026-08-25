import { FilterPills } from "@/components/dashboard/FilterPills";
import { KpiStrip } from "@/components/dashboard/KpiStrip";
import { PyramidChart } from "@/components/dashboard/PyramidChart";
import { EtaLineChart } from "@/components/dashboard/EtaLineChart";
import { BenchmarkDotPlot } from "@/components/dashboard/BenchmarkDotPlot";
import { GenereTable } from "@/components/dashboard/GenereTable";
import { AnzianitaSection } from "@/components/dashboard/sections/AnzianitaSection";
import { CessazioniSection } from "@/components/dashboard/sections/CessazioniSection";
import { PrevisioneCessazioniSection } from "@/components/dashboard/sections/PrevisioneCessazioniSection";
import { AssuntiCausaleSection } from "@/components/dashboard/sections/AssuntiCausaleSection";
import { TassoTurnoverSection } from "@/components/dashboard/sections/TassoTurnoverSection";
import { TassoSostituzioneSection } from "@/components/dashboard/sections/TassoSostituzioneSection";
import { FormatiPersonaleSection } from "@/components/dashboard/sections/FormatiPersonaleSection";
import { ProgressioniSection } from "@/components/dashboard/sections/ProgressioniSection";
import { AnalisiPersonaleSection } from "@/components/dashboard/sections/AnalisiPersonaleSection";
import { LavoroFlessibileSection } from "@/components/dashboard/sections/LavoroFlessibileSection";
import { LavoroAgileSection } from "@/components/dashboard/sections/LavoroAgileSection";
import { AnalisiGenereSection } from "@/components/dashboard/sections/AnalisiGenereSection";
import { SiproContentRouter } from "@/components/dashboard/SiproContentRouter";
import { OverviewHome } from "@/components/dashboard/OverviewHome";
import { InpaBandiSection } from "@/components/dashboard/sections/inpa/InpaBandiSection";
import { InpaCandidatureSection } from "@/components/dashboard/sections/inpa/InpaCandidatureSection";
import { InpaCategorieSection } from "@/components/dashboard/sections/inpa/InpaCategorieSection";
import { InpaDomandaOffertaSection } from "@/components/dashboard/sections/inpa/InpaDomandaOffertaSection";
import { InpaEfficaciaSection } from "@/components/dashboard/sections/inpa/InpaEfficaciaSection";
import { InpaGraduatorieSection } from "@/components/dashboard/sections/inpa/InpaGraduatorieSection";
import { InpaDurataSection } from "@/components/dashboard/sections/inpa/InpaDurataSection";
import { InpaTempiDettaglioSection } from "@/components/dashboard/sections/inpa/InpaTempiDettaglioSection";
import { InpaAttrattivitaSection } from "@/components/dashboard/sections/inpa/InpaAttrattivitaSection";
import { InpaAmministrazioniSection } from "@/components/dashboard/sections/inpa/InpaAmministrazioniSection";
import { InpaFigureRicercateSection } from "@/components/dashboard/sections/inpa/InpaFigureRicercateSection";
import { MinervaCatalogoSection } from "@/components/dashboard/sections/minerva/MinervaCatalogoSection";
import { MinervaCompetenzeSection } from "@/components/dashboard/sections/minerva/MinervaCompetenzeSection";
import { MinervaGapAnalysisSection } from "@/components/dashboard/sections/minerva/MinervaGapAnalysisSection";
import { MinervaFabbisognoSection } from "@/components/dashboard/sections/minerva/MinervaFabbisognoSection";
import { MinervaAssegnazioniSection } from "@/components/dashboard/sections/minerva/MinervaAssegnazioniSection";
import { MinervaAssessmentSection } from "@/components/dashboard/sections/minerva/MinervaAssessmentSection";
import { SyllabusAmministrazioniSection } from "@/components/dashboard/sections/syllabus/SyllabusAmministrazioniSection";
import { SyllabusCorsiSection } from "@/components/dashboard/sections/syllabus/SyllabusCorsiSection";
import { SyllabusDiscentiSection } from "@/components/dashboard/sections/syllabus/SyllabusDiscentiSection";
import { SyllabusAssessmentSection } from "@/components/dashboard/sections/syllabus/SyllabusAssessmentSection";
import { SyllabusGapFormazioneSection } from "@/components/dashboard/sections/syllabus/SyllabusGapFormazioneSection";
import { KpiSuccessRateSection } from "@/components/dashboard/sections/kpi/KpiSuccessRateSection";
import { KpiAbilitantiSection } from "@/components/dashboard/sections/kpi/KpiAbilitantiSection";
import { KpiBenchmarkSection } from "@/components/dashboard/sections/kpi/KpiBenchmarkSection";
import { LpDistribuzioneSection } from "@/components/dashboard/sections/lavoropubblico/LpDistribuzioneSection";
import { LpDotazioneSection } from "@/components/dashboard/sections/lavoropubblico/LpDotazioneSection";
import { Info, Construction } from "lucide-react";

import { BottomUpNav } from "./BottomUpNav";

interface OperationalContentProps {
  source: string;
  indicator?: string;
  onGoExecutive?: () => void;
  onGoSynthetic?: (pillar?: string) => void;
}

export const OperationalContent = ({ source, indicator, onGoExecutive, onGoSynthetic }: OperationalContentProps) => {
  // Map source to related pillar for bottom-up nav
  const sourcePillarMap: Record<string, string> = {
    "conto-annuale": "D2", sipro: "D6", inpa: "D3", minerva: "D1",
    syllabus: "D4", "kpi-riforma": "D6", "lavoro-pubblico": "D2",
  };
  const relatedPillar = sourcePillarMap[source];
  const bottomUpNav = (
    <BottomUpNav
      currentLevel="operational"
      pillar={relatedPillar}
      onGoExecutive={onGoExecutive}
      onGoSynthetic={onGoSynthetic}
    />
  );

  // SIPrO
  if (source === "sipro" && indicator) {
    return <><SiproContentRouter indicator={indicator} />{bottomUpNav}</>;
  }

  // Conto Annuale — overview landing
  if (source === "conto-annuale" && !indicator) {
    return <OverviewHome />;
  }

  // Conto Annuale
  if (source === "conto-annuale" && indicator) {
    const wrap = (children: React.ReactNode) => (
      <>
        <FilterPills />
        <div className="p-4 flex-1">{children}</div>
        {bottomUpNav}
      </>
    );

    switch (indicator) {
      case "analisi-eta":
        return (
          <>
            <FilterPills />
            <div className="p-4 grid grid-cols-12 gap-3 flex-1">
              <KpiStrip />
              <PyramidChart />
              <EtaLineChart />
              <BenchmarkDotPlot />
              <GenereTable />
            </div>
          </>
        );
      case "analisi-anzianita": return wrap(<AnzianitaSection />);
      case "cessazioni": return wrap(<CessazioniSection />);
      case "previsione-cessazioni": return wrap(<PrevisioneCessazioniSection />);
      case "assunti-causale": return wrap(<AssuntiCausaleSection />);
      case "tasso-turnover": return wrap(<TassoTurnoverSection />);
      case "tasso-sostituzione": return wrap(<TassoSostituzioneSection />);
      case "formati-personale": return wrap(<FormatiPersonaleSection />);
      case "progressioni": return wrap(<ProgressioniSection />);
      case "analisi-personale": return wrap(<AnalisiPersonaleSection />);
      case "lavoro-flessibile": return wrap(<LavoroFlessibileSection />);
      case "lavoro-agile": return wrap(<LavoroAgileSection />);
      case "analisi-genere": return wrap(<AnalisiGenereSection />);
    }
  }

  // InPA
  if (source === "inpa") {
    switch (indicator) {
      case "inpa-amministrazioni": return <InpaAmministrazioniSection />;
      case "inpa-bandi": return <InpaBandiSection />;
      case "inpa-candidature": return <InpaCandidatureSection />;
      case "inpa-categorie": return <InpaCategorieSection />;
      case "inpa-figure-ricercate": return <InpaFigureRicercateSection />;
      case "inpa-domanda-offerta": return <InpaDomandaOffertaSection />;
      case "inpa-efficacia": return <InpaEfficaciaSection />;
      case "inpa-graduatorie": return <InpaGraduatorieSection />;
      case "inpa-durata": return <InpaDurataSection />;
      case "inpa-tempi-dettaglio": return <InpaTempiDettaglioSection />;
      case "inpa-attrattivita": return <InpaAttrattivitaSection />;
    }
  }

  // Minerva
  if (source === "minerva") {
    switch (indicator) {
      case "minerva-catalogo": return <MinervaCatalogoSection />;
      case "minerva-competenze": return <MinervaCompetenzeSection />;
      case "minerva-assegnazioni": return <MinervaAssegnazioniSection />;
      case "minerva-assessment": return <MinervaAssessmentSection />;
      case "minerva-gap-analysis": return <MinervaGapAnalysisSection />;
      case "minerva-fabbisogno": return <MinervaFabbisognoSection />;
    }
  }

  // Syllabus
  if (source === "syllabus") {
    switch (indicator) {
      case "syllabus-amministrazioni": return <SyllabusAmministrazioniSection />;
      case "syllabus-corsi": return <SyllabusCorsiSection />;
      case "syllabus-discenti": return <SyllabusDiscentiSection />;
      case "syllabus-assessment": return <SyllabusAssessmentSection />;
      case "syllabus-gap-formazione": return <SyllabusGapFormazioneSection />;
    }
  }

  // KPI Riforma PA
  if (source === "kpi-riforma") {
    switch (indicator) {
      case "kpi-success-rate": return <KpiSuccessRateSection />;
      case "kpi-abilitanti": return <KpiAbilitantiSection />;
      case "kpi-benchmark": return <KpiBenchmarkSection />;
    }
  }

  // Lavoro Pubblico
  if (source === "lavoro-pubblico") {
    switch (indicator) {
      case "lp-distribuzione": return <LpDistribuzioneSection />;
      case "lp-dotazione": return <LpDotazioneSection />;
    }
  }

  // Fallback: select an indicator
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="tableau-card max-w-md w-full">
        <div className="tableau-card-header flex items-center gap-2">
          <Info className="h-4 w-4" />
          Seleziona un indicatore
        </div>
        <div className="p-8 text-center">
          <Info className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Clicca su uno degli indicatori disponibili nella sidebar sinistra per visualizzare il dettaglio operativo.
          </p>
        </div>
      </div>
    </div>
  );
};
