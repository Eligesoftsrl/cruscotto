import { ShieldAlert } from "lucide-react";
import { BenchmarkView } from "@/components/dashboard/sipro/BenchmarkView";
import { EnteSelector } from "@/components/dashboard/EnteSelector";
import { LoadingSpinner, ErrorBox } from "@/components/dashboard/sipro/_shared";
import { SiproAccessoProvider, useSiproAccessoQuery } from "@/hooks/useSiproAccesso";
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

// Cataloghi Minerva (globali, senza filtro ente/regione)
const FamiglieView = () => <MinervaCatalogoView tipo="famiglia" titolo="Elenco famiglie professionali" kpiLabel="Famiglie professionali" colonnaLabel="Famiglia professionale" />;
const ProfiliMinervaView = () => <MinervaCatalogoView tipo="profilo_professionale" titolo="Elenco profili professionali Minerva" kpiLabel="Profili professionali" colonnaLabel="Profilo professionale" />;
const AmbitiRuoloView = () => <MinervaCatalogoView tipo="ambito" titolo="Elenco ambiti" kpiLabel="Ambiti" colonnaLabel="Ambito" />;
const AreeContrattualiView = () => <MinervaCatalogoView tipo="area" titolo="Elenco aree contrattuali" kpiLabel="Aree contrattuali" colonnaLabel="Area contrattuale" />;

// Riuso: S22 (semplificazione) e S20 (lavoro agile) condividono layout con S17 e S19
const SemplificazioneProcessiView = () => <CriticitaProcessiView title="Semplificazione dei processi" />;
const LavoroAgileView = () => <DigitalizzazioneFasiView title="Lavoro agile nelle fasi dei processi" />;

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
  "sipro-famiglie": FamiglieView,
  "sipro-profili-minerva": ProfiliMinervaView,
  "sipro-ambiti-ruolo": AmbitiRuoloView,
  "sipro-aree-contrattuali": AreeContrattualiView,
  "sipro-evoluzione-profili": EvoluzioneProfiliView,
};
/** Avviso per l'utente di ente non accreditato in SIPrO: nessun dato visibile. */
const NonAccreditato = ({ accreditati }: { accreditati: number }) => (
  <div className="p-4 flex-1 space-y-4" data-testid="sipro-non-accreditato">
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card px-4 py-2.5">
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Filtri</span>
      <EnteSelector className="ml-auto" />
    </div>
    <div className="tableau-card max-w-xl mx-auto">
      <div className="tableau-card-header flex items-center gap-2">
        <ShieldAlert className="h-4 w-4" /> Ente non accreditato in SIPrO
      </div>
      <div className="p-6 text-sm text-muted-foreground leading-relaxed space-y-2">
        <p>L'ente selezionato non risulta tra gli enti accreditati in SIPrO: i dati di questa sezione non sono disponibili.</p>
        {accreditati > 0 && (
          <p>
            Hai {accreditati === 1 ? "un altro ente accreditato" : `${accreditati} enti accreditati`}: selezionalo dal
            menu «Ente» in alto a destra.
          </p>
        )}
      </div>
    </div>
  </div>
);

export const SiproContentRouter = ({ indicator }: { indicator: string }) => {
  const accesso = useSiproAccessoQuery();

  if (accesso.stato === "loading") {
    return (
      <div className="p-4 flex-1">
        <LoadingSpinner />
      </div>
    );
  }
  if (accesso.stato === "errore") {
    return (
      <div className="p-4 flex-1">
        <ErrorBox error={new Error("impossibile verificare l'accreditamento SIPrO dell'ente")} />
      </div>
    );
  }
  if (accesso.stato === "non-accreditato") {
    return <NonAccreditato accreditati={accesso.accreditati.length} />;
  }

  return (
    <SiproAccessoProvider value={accesso}>
      {/* key: al cambio ente le viste ripartono con il nuovo perimetro bloccato */}
      <SiproRoutes key={accesso.ente?.codiceFiscale ?? "dfp"} indicator={indicator} />
    </SiproAccessoProvider>
  );
};

const SiproRoutes = ({ indicator }: { indicator: string }) => {
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

  return null;
};
