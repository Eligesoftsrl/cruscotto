import { SiproIndicatorSection } from "@/components/dashboard/sections/SiproIndicatorSection";
import { SiproBenchmarkView } from "@/components/dashboard/sections/SiproBenchmarkView";
// Sezione "Organizzazione" — nuove viste su RPC reali sipro_* (service + hook + component)
import { OrganigrammaUoView } from "@/components/dashboard/sipro/OrganigrammaUoView";
import { StatoOrganizzazioneView } from "@/components/dashboard/sipro/StatoOrganizzazioneView";
import { ProvvedimentiView } from "@/components/dashboard/sipro/ProvvedimentiView";
import { DotazioneUoView } from "@/components/dashboard/sipro/DotazioneUoView";
import { CriticitaUoView } from "@/components/dashboard/sipro/CriticitaUoView";
import { ProcessiDistribuzioneChart } from "@/components/dashboard/charts/ProcessiDistribuzioneChart";
import { ProcessiDettaglioTable } from "@/components/dashboard/charts/ProcessiDettaglioTable";
import { TempiPicchiChart } from "@/components/dashboard/charts/TempiPicchiChart";
import { CoinvolgimentoUoChart } from "@/components/dashboard/charts/CoinvolgimentoUoChart";
import { DigitalizzazioneFasiChart } from "@/components/dashboard/charts/DigitalizzazioneFasiChart";
import { CriticitaProcessiChart } from "@/components/dashboard/charts/CriticitaProcessiChart";
import { ProfiliRuoloCatalogoChart } from "@/components/dashboard/charts/ProfiliRuoloCatalogoChart";
import { ProfiliRuoloProcessoChart } from "@/components/dashboard/charts/ProfiliRuoloProcessoChart";

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
  "sipro-mappatura-processi": ProcessiDistribuzioneChart,
  "sipro-fasi-processi": ProcessiDettaglioTable,
  "sipro-tempi-picchi": TempiPicchiChart,
  "sipro-criticita-processi": CriticitaProcessiChart,
  "sipro-digitalizzazione": DigitalizzazioneFasiChart,
  "sipro-lavoro-agile": DigitalizzazioneFasiChart,
  "sipro-outsourcing": CoinvolgimentoUoChart,
  "sipro-semplificazione": CriticitaProcessiChart,
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
