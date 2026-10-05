import { SiproIndicatorSection } from "@/components/dashboard/sections/SiproIndicatorSection";
import { SiproBenchmarkView } from "@/components/dashboard/sections/SiproBenchmarkView";
// Sezione "Organizzazione" — nuove viste su RPC reali sipro_* (service + hook + component)
import { OrganigrammaUoView } from "@/components/dashboard/sipro/OrganigrammaUoView";
import { StatoOrganizzazioneView } from "@/components/dashboard/sipro/StatoOrganizzazioneView";
import { ProvvedimentiView } from "@/components/dashboard/sipro/ProvvedimentiView";
import { DotazioneUoView } from "@/components/dashboard/sipro/DotazioneUoView";
import { CriticitaUoView } from "@/components/dashboard/sipro/CriticitaUoView";
// Sezione "Processi" (S15-S23) — nuove viste su RPC reali sipro_*
import { MappaturaProcessiView } from "@/components/dashboard/sipro/MappaturaProcessiView";
import { FasiProcessiView } from "@/components/dashboard/sipro/FasiProcessiView";
import { CriticitaProcessiView } from "@/components/dashboard/sipro/CriticitaProcessiView";
import { DigitalizzazioneFasiView } from "@/components/dashboard/sipro/DigitalizzazioneFasiView";
import { OutsourcingFasiView } from "@/components/dashboard/sipro/OutsourcingFasiView";
import { TempiPicchiView } from "@/components/dashboard/sipro/TempiPicchiView";
import { ProfiliRuoloCatalogoChart } from "@/components/dashboard/charts/ProfiliRuoloCatalogoChart";
import { ProfiliRuoloProcessoChart } from "@/components/dashboard/charts/ProfiliRuoloProcessoChart";

// Riuso: S22 (semplificazione) e S20 (lavoro agile) condividono layout con S17 e S19
const SemplificazioneProcessiView = () => <CriticitaProcessiView title="Semplificazione dei processi" />;
const LavoroAgileView = () => <DigitalizzazioneFasiView title="Lavoro agile nelle fasi dei processi" />;

const siproIndicatorIds = [
  "sipro-fte",
  "sipro-copertura",
  "sipro-fabbisogno",
  "sipro-famiglie",
  "sipro-profili-minerva",
  "sipro-ambiti-ruolo",
  "sipro-aree-contrattuali",
  "sipro-evoluzione-profili",
];

const chartMap: Record<string, React.FC> = {
  "sipro-organigramma": OrganigrammaUoView,
  "sipro-stato-org": StatoOrganizzazioneView,
  "sipro-provvedimenti": ProvvedimentiView,
  "sipro-dotazione-uo": DotazioneUoView,
  "sipro-criticita-uo": CriticitaUoView,
  "sipro-mappatura-processi": MappaturaProcessiView,
  "sipro-fasi-processi": FasiProcessiView,
  "sipro-tempi-picchi": TempiPicchiView,
  "sipro-criticita-processi": CriticitaProcessiView,
  "sipro-digitalizzazione": DigitalizzazioneFasiView,
  "sipro-lavoro-agile": LavoroAgileView,
  "sipro-outsourcing": OutsourcingFasiView,
  "sipro-semplificazione": SemplificazioneProcessiView,
  "sipro-catalogo-profili": ProfiliRuoloCatalogoChart,
  "sipro-profili-processo": ProfiliRuoloProcessoChart,
};
export const SiproContentRouter = ({ indicator }: { indicator: string }) => {
  if (indicator === "sipro-benchmark-dfp") {
    return <SiproBenchmarkView />;
  }

  const ChartComponent = chartMap[indicator];
  if (ChartComponent) {
    return (
      <div className="p-4 flex-1 space-y-4">
        <ChartComponent />
      </div>
    );
  }

  if (siproIndicatorIds.includes(indicator)) {
    return (
      <div className="p-4 flex-1">
        <SiproIndicatorSection indicatorId={indicator} />
      </div>
    );
  }

  return null;
};
