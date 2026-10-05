import { SiproIndicatorSection } from "@/components/dashboard/sections/SiproIndicatorSection";
import { BenchmarkView } from "@/components/dashboard/sipro/BenchmarkView";
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
// Sezione "Profili e Cataloghi" (S05-S14) — nuove viste su RPC reali sipro_*
import { FteView } from "@/components/dashboard/sipro/FteView";
import { CoperturaView } from "@/components/dashboard/sipro/CoperturaView";
import { CatalogoProfiliView } from "@/components/dashboard/sipro/CatalogoProfiliView";
import { EvoluzioneProfiliView } from "@/components/dashboard/sipro/EvoluzioneProfiliView";
import { MinervaCatalogoView } from "@/components/dashboard/sipro/MinervaCatalogoView";
import { FabbisognoView } from "@/components/dashboard/sipro/FabbisognoView";

// Cataloghi Minerva (globali, senza filtro ente/regione)
const FamiglieView = () => <MinervaCatalogoView tipo="famiglia" titolo="Elenco famiglie professionali" kpiLabel="Famiglie professionali" colonnaLabel="Famiglia professionale" />;
const ProfiliMinervaView = () => <MinervaCatalogoView tipo="profilo_professionale" titolo="Elenco profili professionali Minerva" kpiLabel="Profili professionali" colonnaLabel="Profilo professionale" />;
const AmbitiRuoloView = () => <MinervaCatalogoView tipo="ambito" titolo="Elenco ambiti" kpiLabel="Ambiti" colonnaLabel="Ambito" />;
const AreeContrattualiView = () => <MinervaCatalogoView tipo="area" titolo="Elenco aree contrattuali" kpiLabel="Aree contrattuali" colonnaLabel="Area contrattuale" />;

// Riuso: S22 (semplificazione) e S20 (lavoro agile) condividono layout con S17 e S19
const SemplificazioneProcessiView = () => <CriticitaProcessiView title="Semplificazione dei processi" />;
const LavoroAgileView = () => <DigitalizzazioneFasiView title="Lavoro agile nelle fasi dei processi" />;

const siproIndicatorIds: string[] = [];

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
  "sipro-fte": FteView,
  "sipro-copertura": CoperturaView,
  "sipro-catalogo-profili": CatalogoProfiliView,
  "sipro-fabbisogno": FabbisognoView,
  "sipro-famiglie": FamiglieView,
  "sipro-profili-minerva": ProfiliMinervaView,
  "sipro-ambiti-ruolo": AmbitiRuoloView,
  "sipro-aree-contrattuali": AreeContrattualiView,
  "sipro-evoluzione-profili": EvoluzioneProfiliView,
};
export const SiproContentRouter = ({ indicator }: { indicator: string }) => {
  if (indicator === "sipro-benchmark-dfp") {
    return (
      <div className="p-4 flex-1">
        <BenchmarkView />
      </div>
    );
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
