import { SiproIndicatorSection } from "@/components/dashboard/sections/SiproIndicatorSection";
import { SiproBenchmarkView } from "@/components/dashboard/sections/SiproBenchmarkView";
import { UoDistributionChart } from "@/components/dashboard/charts/UoDistributionChart";
import { FteDotazioneChart } from "@/components/dashboard/charts/FteDotazioneChart";
import { CriticitaUoChart } from "@/components/dashboard/charts/CriticitaUoChart";
import { ProcessiDistribuzioneChart } from "@/components/dashboard/charts/ProcessiDistribuzioneChart";
import { ProcessiDettaglioTable } from "@/components/dashboard/charts/ProcessiDettaglioTable";
import { TempiPicchiChart } from "@/components/dashboard/charts/TempiPicchiChart";
import { CoinvolgimentoUoChart } from "@/components/dashboard/charts/CoinvolgimentoUoChart";
import { DigitalizzazioneFasiChart } from "@/components/dashboard/charts/DigitalizzazioneFasiChart";
import { CriticitaProcessiChart } from "@/components/dashboard/charts/CriticitaProcessiChart";
import { ProfiliRuoloCatalogoChart } from "@/components/dashboard/charts/ProfiliRuoloCatalogoChart";
import { ProfiliRuoloProcessoChart } from "@/components/dashboard/charts/ProfiliRuoloProcessoChart";

const siproIndicatorIds = [
  "sipro-stato-org", "sipro-provvedimenti",
  "sipro-fte", "sipro-copertura",
  "sipro-fabbisogno",
  "sipro-famiglie", "sipro-profili-minerva", "sipro-ambiti-ruolo",
  "sipro-aree-contrattuali", "sipro-evoluzione-profili",
];

const chartMap: Record<string, React.FC> = {
  "sipro-organigramma": UoDistributionChart,
  "sipro-dotazione-uo": FteDotazioneChart,
  "sipro-criticita-uo": CriticitaUoChart,
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
