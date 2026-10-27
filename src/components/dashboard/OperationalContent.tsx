import type { ComponentType } from "react";
import { FilterPills } from "@/components/dashboard/FilterPills";

import { AnalisiEtaContent } from "@/components/dashboard/AnalisiEtaContent";
import { AnzianitaContent } from "@/components/dashboard/AnzianitaContent";
import { CessazioniContent } from "@/components/dashboard/CessazioniContent";
import { PrevisioneCessazioniSection } from "@/components/dashboard/sections/PrevisioneCessazioniSection";
import { AssuntiCausaleContent } from "@/components/dashboard/AssuntiCausaleContent";
import { TassoTurnoverContent } from "@/components/dashboard/TassoTurnoverContent";
import { TassoSostituzioneContent } from "@/components/dashboard/TassoSostituzioneContent";
import { FormazioneContent } from "@/components/dashboard/FormazioneContent";
import { ProgressioniContent } from "@/components/dashboard/ProgressioniContent";
import { AnalisiPersonaleContent } from "@/components/dashboard/AnalisiPersonaleContent";
import { LavoroFlessibileContent } from "@/components/dashboard/LavoroFlessibileContent";
import { LavoroAgileContent } from "@/components/dashboard/LavoroAgileContent";
import { AnalisiGenereContent } from "@/components/dashboard/AnalisiGenereContent";
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
import { KpiAbilitantiSection } from "@/components/dashboard/sections/kpi/KpiAbilitantiSection";
import { LpDistribuzioneSection } from "@/components/dashboard/sections/lavoropubblico/LpDistribuzioneSection";
import { LpDotazioneSection } from "@/components/dashboard/sections/lavoropubblico/LpDotazioneSection";
import { Info, Construction } from "lucide-react";

import { NdMode } from "./NdMode";
import { BottomUpNav } from "./BottomUpNav";
import { useAdminState } from "@/services/admin/adminStore";
import { CA_INDICATOR_FLAG, KPI_INDICATOR_FLAG } from "@/config/schedeFlags";

interface OperationalContentProps {
  source: string;
  indicator?: string;
  onGoExecutive?: () => void;
  onGoSynthetic?: (pillar?: string) => void;
}

/** Schede per fonte: id indicatore -> componente. */
const CA_SECTIONS: Record<string, ComponentType> = {
  "analisi-eta": AnalisiEtaContent,
  "analisi-anzianita": AnzianitaContent,
  "cessazioni": CessazioniContent,
  "previsione-cessazioni": PrevisioneCessazioniSection,
  "assunti-causale": AssuntiCausaleContent,
  "tasso-turnover": TassoTurnoverContent,
  "tasso-sostituzione": TassoSostituzioneContent,
  "formati-personale": FormazioneContent,
  "progressioni": ProgressioniContent,
  "analisi-personale": AnalisiPersonaleContent,
  "lavoro-flessibile": LavoroFlessibileContent,
  "lavoro-agile": LavoroAgileContent,
  "analisi-genere": AnalisiGenereContent,
};
const INPA_SECTIONS: Record<string, ComponentType> = {
  "inpa-amministrazioni": InpaAmministrazioniSection,
  "inpa-bandi": InpaBandiSection,
  "inpa-candidature": InpaCandidatureSection,
  "inpa-categorie": InpaCategorieSection,
  "inpa-figure-ricercate": InpaFigureRicercateSection,
  "inpa-domanda-offerta": InpaDomandaOffertaSection,
  "inpa-efficacia": InpaEfficaciaSection,
  "inpa-graduatorie": InpaGraduatorieSection,
  "inpa-durata": InpaDurataSection,
  "inpa-tempi-dettaglio": InpaTempiDettaglioSection,
  "inpa-attrattivita": InpaAttrattivitaSection,
};
const MINERVA_SECTIONS: Record<string, ComponentType> = {
  "minerva-catalogo": MinervaCatalogoSection,
  "minerva-competenze": MinervaCompetenzeSection,
  "minerva-assegnazioni": MinervaAssegnazioniSection,
  "minerva-assessment": MinervaAssessmentSection,
  "minerva-gap-analysis": MinervaGapAnalysisSection,
  "minerva-fabbisogno": MinervaFabbisognoSection,
};
const SYLLABUS_SECTIONS: Record<string, ComponentType> = {
  "syllabus-amministrazioni": SyllabusAmministrazioniSection,
  "syllabus-corsi": SyllabusCorsiSection,
  "syllabus-discenti": SyllabusDiscentiSection,
  "syllabus-assessment": SyllabusAssessmentSection,
  "syllabus-gap-formazione": SyllabusGapFormazioneSection,
};
const LP_SECTIONS: Record<string, ComponentType> = {
  "lp-distribuzione": LpDistribuzioneSection,
  "lp-dotazione": LpDotazioneSection,
};

const ND_SOURCE_SECTIONS: Record<string, Record<string, ComponentType>> = {
  "inpa": INPA_SECTIONS,
  "minerva": MINERVA_SECTIONS,
  "syllabus": SYLLABUS_SECTIONS,
  "lavoro-pubblico": LP_SECTIONS,
};

/** true se il flag esiste ed è spento (flag sconosciuto o assente = attivo). */
const isFlagDisabled = (flags: { key: string; enabled: boolean }[], key?: string) => {
  if (!key) return false;
  return !(flags.find((f) => f.key === key)?.enabled ?? true);
};

const renderSection = (sections: Record<string, ComponentType>, indicator?: string) => {
  const Section = indicator ? sections[indicator] : undefined;
  return Section ? <Section /> : null;
};

export const OperationalContent = ({
  source,
  indicator,
  onGoExecutive,
  onGoSynthetic,
}: OperationalContentProps) => {
  const { flags } = useAdminState();
  const isFlagOff = (key?: string) => isFlagDisabled(flags, key);

  // Map source to related pillar for bottom-up nav
  const sourcePillarMap: Record<string, string> = {
    "conto-annuale": "D2",
    sipro: "D6",
    inpa: "D3",
    minerva: "D1",
    syllabus: "D4",
    "kpi-riforma": "D6",
    "lavoro-pubblico": "D2",
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
    return (
      <>
        <SiproContentRouter indicator={indicator} />
        {bottomUpNav}
      </>
    );
  }

  // Conto Annuale — overview landing
  if (source === "conto-annuale" && !indicator) {
    return <OverviewHome />;
  }

  // Conto Annuale
  if (source === "conto-annuale" && indicator) {
    // Genere ombreggiato/bloccato nelle schede in cui non è utilizzato.
    const lockGenere = [
      "progressioni",
      "lavoro-flessibile",
      "lavoro-agile",
      "analisi-genere",
    ].includes(indicator);
    const wrap = (children: React.ReactNode) => (
      <>
        <FilterPills lockGenere={lockGenere} />
        {/* Riflusso (WCAG 1.4.10): a 320 px le colonne e le intestazioni delle card vanno a capo
            invece di generare scorrimento orizzontale. */}
        <div className="p-3 sm:p-4 flex-1 min-w-0 [&_.grid>*]:min-w-0 [&_.justify-between]:flex-wrap [&_.justify-between]:gap-y-2">
          {children}
        </div>
        {bottomUpNav}
      </>
    );

    // Feature flag: scheda disattivata dall'Admin -> avviso, niente dati.
    if (isFlagOff(CA_INDICATOR_FLAG[indicator])) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="tableau-card max-w-md w-full">
            <div className="tableau-card-header flex items-center gap-2">
              <Construction aria-hidden="true" className="h-4 w-4" />
              Funzione disattivata
            </div>
            <div className="p-8 text-center">
              <Construction
                aria-hidden="true"
                className="h-10 w-10 text-muted-foreground/70 mx-auto mb-4"
              />
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Questa scheda è stata disattivata dall'amministratore nel Pannello di
                Amministrazione. Riattivala dalla sezione «Funzionalità» per visualizzarne i dati.
              </p>
            </div>
          </div>
        </div>
      );
    }

    const CaSection = CA_SECTIONS[indicator];
    if (CaSection) return wrap(<CaSection />);
  }




  // KPI Riforma PA
  // Per ora resta solo la scheda «KPI Abilitanti e di Successo» (mappatura kpi-riforma_3):
  // ogni link della sezione (anche i vecchi kpi-success-rate / kpi-benchmark) porta qui.
  if (source === "kpi-riforma") {
    // Feature flag: scheda disattivata dall'Admin (Pannello → Schede → KPI Riforma PA)
    if (isFlagOff(KPI_INDICATOR_FLAG["kpi-abilitanti"])) {
      return (
        <div className="flex-1 flex items-center justify-center p-8" data-testid="kpi-disattivata">
          <div className="tableau-card max-w-md w-full">
            <div className="tableau-card-header flex items-center gap-2">
              <Construction aria-hidden="true" className="h-4 w-4" />
              Funzione disattivata
            </div>
            <div className="p-8 text-center">
              <Construction
                aria-hidden="true"
                className="h-10 w-10 text-muted-foreground/70 mx-auto mb-4"
              />
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Questa scheda è stata disattivata dall'amministratore nel Pannello di
                Amministrazione. Riattivala dalla sezione «Schede» per visualizzarne i dati.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return <KpiAbilitantiSection />;
  }


  // InPA, Minerva, Syllabus, Lavoro Pubblico — placeholder N/D (fonti dati non ancora disponibili)
  const ndSections = ND_SOURCE_SECTIONS[source];
  if (ndSections) return <NdMode>{renderSection(ndSections, indicator)}</NdMode>;

  // Fallback: select an indicator
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="tableau-card max-w-md w-full">
        <div className="tableau-card-header flex items-center gap-2">
          <Info aria-hidden="true" className="h-4 w-4" />
          Seleziona un indicatore
        </div>
        <div className="p-8 text-center">
          <Info aria-hidden="true" className="h-10 w-10 text-muted-foreground/70 mx-auto mb-4" />
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Clicca su uno degli indicatori disponibili nella sidebar sinistra per visualizzare il
            dettaglio operativo.
          </p>
        </div>
      </div>
    </div>
  );
};
