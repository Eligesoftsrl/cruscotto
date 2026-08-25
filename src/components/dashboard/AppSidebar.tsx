import { useState } from "react";
import {
  BarChart3, ChevronDown, ChevronRight, Home,
  ClipboardList, Target, PenTool, BookOpen, Star, BarChart2,
  FileText, Scale, FlaskConical, FolderOpen, Monitor, LogOut,
  Gauge, Layers, Activity, GraduationCap, HelpCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { resetOnboardingTour } from "./OnboardingTour";
import { GlossaryDialog } from "./GlossaryDialog";

/* ── NavState ── */
export interface NavState {
  level: "executive" | "synthetic" | "operational" | "guided";
  pillar?: string;
  source?: string;
  indicator?: string;
  journeyId?: string;
}

/* ── Pillar definitions ── */
const pillars = [
  { id: "D1", label: "Rilevazione e classificazione", icon: ClipboardList },
  { id: "D2", label: "Programmazione fabbisogno", icon: Target },
  { id: "D3", label: "Recruiting", icon: PenTool },
  { id: "D4", label: "Sviluppo professionale", icon: GraduationCap },
  { id: "D5", label: "Rewarding e carriera", icon: Star },
  { id: "D6", label: "Capacity building e performance", icon: BarChart2 },
];

/* ── Synthetic indicators per pillar (from PDF methodology) ── */
export const syntheticIndicators: Record<string, { id: string; label: string }[]> = {
  D1: [
    { id: "IAC", label: "Indice di adesione attiva al modello" },
    { id: "IIMP/R", label: "Implementazione modello professionale e ruoli" },
    { id: "ICPR", label: "Copertura sistema professionale" },
    { id: "ICVC", label: "Copertura valutazioni di competenza" },
    { id: "IACU", label: "Distribuzione adeguatezza capitale umano" },
    { id: "ICSP/R", label: "Copertura sotto-profili e ruoli" },
    { id: "ICCR", label: "Copertura profili di ruolo" },
    { id: "ICCOMP", label: "Copertura competenze" },
  ],
  D2: [
    { id: "IGF", label: "Governo strategico del fabbisogno (Executive)" },
    { id: "IRS", label: "Indice di replica strutturale" },
    { id: "IDP_Norm", label: "Indice di direzione della progressività" },
    { id: "PTI", label: "Peso del tempo indeterminato sul reclutamento" },
    { id: "IRG_Norm", label: "Indice di ricambio generazionale" },
  ],
  D3: [
    { id: "IAR", label: "Attivazione reclutamento vs ricambio generazionale" },
    { id: "DDP", label: "Distribuzione domanda professionale per profilo" },
    { id: "IAP", label: "Attrattività delle posizioni" },
    { id: "IAT", label: "Attrazione territoriale" },
    { id: "ISC", label: "Sovra-qualificazione candidature" },
    { id: "TSC", label: "Selettività procedure concorsuali" },
    { id: "TCP", label: "Tempo completamento procedure" },
    { id: "TCPB", label: "Copertura posti banditi" },
    { id: "TUG", label: "Tasso utilizzo graduatorie" },
  ],
  D4: [
    { id: "CGC", label: "Capacità di gestione delle competenze (Executive)" },
    { id: "TCF", label: "Tasso di copertura formativa" },
    { id: "IFM_Norm", label: "Intensità formativa media" },
    { id: "DPI_Norm", label: "Dinamicità del personale interna" },
    { id: "CQT", label: "Coerenza qualifiche e titoli di studio" },
    { id: "ISCP", label: "Sviluppo capitale professionale (Executive)" },
    { id: "ISTP_Norm", label: "Sviluppo tecnico-professionale (Minerva)" },
    { id: "IDFP", label: "Diversificazione famiglie professionali (Minerva)" },
    { id: "ICRP", label: "Copertura ruoli professionali (Minerva)" },
    { id: "IESF", label: "Efficacia sviluppo formativo (Executive)" },
    { id: "IEF_Norm", label: "Efficacia formativa (Syllabus)" },
    { id: "ICQ", label: "Completamento qualificato (Syllabus)" },
    { id: "ICEC", label: "Coerenza evolutiva competenze (Syllabus)" },
  ],
  D5: [
    { id: "IDC", label: "Dinamicità della carriera (Executive)" },
    { id: "DPI_Norm_D5", label: "Dinamicità interna (progressioni)" },
    { id: "ICS_Norm", label: "Indice di crescita strutturale" },
  ],
  D6: [
    { id: "TVO", label: "Tasso di variazione dell'organico" },
    { id: "ISG", label: "Indice di squilibrio generazionale" },
    { id: "TEP", label: "Tasso di esposizione al pensionamento" },
    { id: "IQP", label: "Indice qualificazione personale" },
    { id: "IEQ", label: "Indice evoluzione della qualificazione" },
    { id: "VQF", label: "Variazione quota femminile nell'organico" },
    { id: "IPD", label: "Indice di parità dirigenziale" },
    { id: "TEPD", label: "Evoluzione della parità dirigenziale" },
    { id: "IRG_genere", label: "Riequilibrio di genere nel ricambio" },
    { id: "IFL", label: "Indice di flessibilità del lavoro" },
    { id: "TFL", label: "Tasso evoluzione flessibilità lavoro" },
    { id: "IDLA", label: "Indice di diffusione del lavoro agile" },
    { id: "TDLA", label: "Tasso evoluzione del lavoro agile" },
  ],
};

/* ── Operational sources with indicators ── */
const contoAnnualeIndicators = [
  { id: "analisi-eta", label: "Analisi per età" },
  { id: "analisi-anzianita", label: "Anzianità di servizio" },
  { id: "cessazioni", label: "Cessazioni dal servizio" },
  { id: "previsione-cessazioni", label: "Previsione cessazioni" },
  { id: "assunti-causale", label: "Assunti per causale" },
  { id: "tasso-turnover", label: "Tasso di turnover" },
  { id: "tasso-sostituzione", label: "Tasso sostituzione" },
  { id: "formati-personale", label: "Formati su personale" },
  { id: "progressioni", label: "Progressioni" },
  { id: "analisi-personale", label: "Analisi del personale" },
  { id: "lavoro-flessibile", label: "Lavoro flessibile" },
  { id: "lavoro-agile", label: "Lavoro agile" },
  { id: "analisi-genere", label: "Analisi per genere" },
];

const siproIndicators = [
  { id: "sipro-benchmark-dfp", label: "🏛️ Benchmark DFP (Multi-Ente)" },
  { id: "sipro-organigramma", label: "Organigramma UO" },
  { id: "sipro-stato-org", label: "Stato Organizzazione" },
  { id: "sipro-provvedimenti", label: "Provvedimenti Organizzativi" },
  { id: "sipro-fte", label: "FTE Programmati vs Assegnati" },
  { id: "sipro-copertura", label: "Copertura Profili di Ruolo" },
  { id: "sipro-dotazione-uo", label: "Dotazione Risorse UO" },
  { id: "sipro-catalogo-profili", label: "Catalogo Profili di Ruolo" },
  { id: "sipro-fabbisogno", label: "Fabbisogno per Profilo" },
  { id: "sipro-famiglie", label: "Famiglie Professionali" },
  { id: "sipro-profili-minerva", label: "Profili Professionali Minerva" },
  { id: "sipro-ambiti-ruolo", label: "Ambiti e Profili di Ruolo" },
  { id: "sipro-aree-contrattuali", label: "Aree Contrattuali" },
  { id: "sipro-evoluzione-profili", label: "Evoluzione Profili" },
  { id: "sipro-mappatura-processi", label: "Mappatura Processi" },
  { id: "sipro-fasi-processi", label: "Fasi dei Processi" },
  { id: "sipro-criticita-processi", label: "Criticità Processi" },
  { id: "sipro-criticita-uo", label: "Criticità UO" },
  { id: "sipro-digitalizzazione", label: "Digitalizzazione Fasi" },
  { id: "sipro-lavoro-agile", label: "Lavoro Agile Processi" },
  { id: "sipro-outsourcing", label: "Outsourcing Fasi" },
  { id: "sipro-semplificazione", label: "Semplificazione Processi" },
  { id: "sipro-tempi-picchi", label: "Tempi e Picchi" },
];

export const operationalSources = [
  { id: "conto-annuale", label: "Conto Annuale", icon: FileText, indicators: contoAnnualeIndicators },
  { id: "inpa", label: "InPA", icon: FolderOpen, indicators: [
    { id: "inpa-amministrazioni", label: "% PA attive su InPA" },
    { id: "inpa-bandi", label: "Bandi pubblicati" },
    { id: "inpa-categorie", label: "Distribuzione % categorie" },
    { id: "inpa-figure-ricercate", label: "Figure professionali ricercate" },
    { id: "inpa-candidature", label: "Candidature ricevute" },
    { id: "inpa-domanda-offerta", label: "Bilanciamento domanda/offerta" },
    { id: "inpa-efficacia", label: "Saturazione bandi" },
    { id: "inpa-graduatorie", label: "Graduatorie e completamento" },
    { id: "inpa-durata", label: "Durata procedure" },
    { id: "inpa-tempi-dettaglio", label: "Tempi per area" },
    { id: "inpa-attrattivita", label: "Analisi attrattività" },
  ]},
  { id: "minerva", label: "Minerva", icon: FlaskConical, indicators: [
    { id: "minerva-catalogo", label: "Profili e catalogo" },
    { id: "minerva-competenze", label: "Mappatura competenze" },
    { id: "minerva-assegnazioni", label: "Assegnazioni profili" },
    { id: "minerva-assessment", label: "Assessment competenze" },
    { id: "minerva-gap-analysis", label: "Gap Analysis competenze" },
    { id: "minerva-fabbisogno", label: "Copertura e fabbisogno" },
  ]},
  { id: "sipro", label: "SIPrO", icon: ClipboardList, indicators: siproIndicators },
  { id: "syllabus", label: "Syllabus", icon: BookOpen, indicators: [
    { id: "syllabus-amministrazioni", label: "Amministrazioni partecipanti" },
    { id: "syllabus-corsi", label: "Catalogo formativo" },
    { id: "syllabus-discenti", label: "Discenti" },
    { id: "syllabus-assessment", label: "Assessment e progressi" },
    { id: "syllabus-gap-formazione", label: "Fabbisogno formativo" },
  ]},
  { id: "kpi-riforma", label: "KPI Riforma PA", icon: Activity, indicators: [
    { id: "kpi-success-rate", label: "KPI Success Rate" },
    { id: "kpi-abilitanti", label: "KPI Abilitanti (Blocchi)" },
    { id: "kpi-benchmark", label: "Benchmark KPI tra enti" },
  ]},
  { id: "lavoro-pubblico", label: "Lavoro Pubblico", icon: Scale, indicators: [
    { id: "lp-distribuzione", label: "Distribuzione personale" },
    { id: "lp-dotazione", label: "Dotazione vs effettivi" },
  ]},
];

interface AppSidebarProps {
  nav: NavState;
  onNavigate: (nav: NavState) => void;
}

export const AppSidebar = ({ nav, onNavigate }: AppSidebarProps) => {
  const { profile, signOut } = useAuth();
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);

  const isExec = nav.level === "executive";

  const navBtn = (active: boolean, onClick: () => void, children: React.ReactNode, indent = 0) => (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className="flex items-center gap-2.5 w-full py-2.5 text-[12.5px] transition-all hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/40"
      style={{
        paddingLeft: `${20 + indent * 16}px`,
        paddingRight: "12px",
        color: active ? "#fff" : "hsl(210 15% 65%)",
        background: active ? "hsl(var(--primary) / 0.18)" : undefined,
        borderLeft: active ? "3px solid hsl(var(--primary))" : "3px solid transparent",
      }}
    >
      {children}
    </button>
  );

  const sectionLabel = (text: string) => (
    <div
      className="px-5 pt-5 pb-2 text-[10px] uppercase tracking-[0.12em] font-bold"
      style={{ color: "hsl(210 30% 50%)" }}
    >
      {text}
    </div>
  );

  return (
    <nav
      className="w-[260px] flex-shrink-0 flex flex-col fixed top-0 left-0 bottom-0 z-50 overflow-y-auto"
      style={{ background: "hsl(var(--sidebar-bg))" }}
      aria-label="Navigazione principale"
    >
      {/* ── Brand ── */}
      <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md flex items-center justify-center text-sm font-bold text-primary-foreground" style={{ background: "hsl(var(--primary))" }}>
            <span className="text-lg">🏛️</span>
          </div>
          <div>
            <div className="text-[14px] font-bold text-white tracking-tight leading-tight">Cruscotto HR</div>
            <div className="text-[10px] font-light tracking-wide uppercase" style={{ color: "hsl(210 60% 70%)" }}>
              PA Digitale 2026
            </div>
          </div>
        </div>
      </div>

      {/* ── Executive ── */}
      {navBtn(isExec, () => {
        onNavigate({ level: "executive" });
        setExpandedPillar(null);
        setExpandedSource(null);
      }, <>
        <Gauge className="h-[18px] w-[18px]" style={{ color: isExec ? "hsl(var(--primary))" : undefined }} />
        <span className="font-semibold">Vista Executive</span>
      </>)}

      {/* ── Synthetic ── */}
      <div data-tour="sidebar-synthetic">
      {sectionLabel("Vista Sintetica")}
      {pillars.map((p) => {
        const PIcon = p.icon;
        const isExp = expandedPillar === p.id;
        const isPillarActive = nav.level === "synthetic" && nav.pillar === p.id;
        const indicators = syntheticIndicators[p.id] || [];

        return (
          <div key={p.id}>
            <button
              onClick={() => {
                const opening = expandedPillar !== p.id;
                setExpandedPillar(opening ? p.id : null);
                if (opening) {
                  setExpandedSource(null);
                  onNavigate({ level: "synthetic", pillar: p.id });
                }
              }}
              className="flex items-center gap-2 w-full px-5 py-2 text-[12px] transition-all hover:bg-white/[0.06]"
              style={{ color: isPillarActive ? "#fff" : "hsl(210 15% 65%)" }}
            >
              {isExp ? <ChevronDown className="h-3 w-3 flex-shrink-0" style={{ color: "hsl(210 30% 50%)" }} /> : <ChevronRight className="h-3 w-3 flex-shrink-0" style={{ color: "hsl(210 30% 50%)" }} />}
              <PIcon className="h-4 w-4 flex-shrink-0" style={{ color: isPillarActive ? "hsl(var(--primary))" : "hsl(210 20% 55%)" }} />
              <span className="text-left leading-tight">
                <span className="font-bold">{p.id}</span>
                <span className="ml-1 font-normal opacity-80">{p.label}</span>
              </span>
            </button>

            {isExp && (
              <div className="ml-8 border-l" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
                {indicators.map((ind) => {
                  const isActive = nav.level === "synthetic" && nav.pillar === p.id && nav.indicator === ind.id;
                  return (
                    <button
                      key={ind.id}
                      onClick={() => onNavigate({ level: "synthetic", pillar: p.id, indicator: ind.id })}
                      className="flex items-center gap-2 w-full pl-4 pr-3 py-[6px] text-[11px] transition-all hover:bg-white/[0.04]"
                      style={{
                        color: isActive ? "#fff" : "hsl(210 15% 55%)",
                        background: isActive ? "hsl(var(--primary) / 0.15)" : undefined,
                        borderLeft: isActive ? "2px solid hsl(var(--primary))" : "2px solid transparent",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: isActive ? "hsl(var(--primary))" : "hsl(210 20% 35%)" }} />
                      <span className={isActive ? "font-semibold" : ""}>{ind.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      </div>
      {/* ── Operational ── */}
      <div data-tour="sidebar-operational">
      {sectionLabel("Vista Operativa")}
      {operationalSources.map((src) => {
        const SrcIcon = src.icon;
        const isExp = expandedSource === src.id;
        const isSrcActive = nav.level === "operational" && nav.source === src.id;
        const hasInd = src.indicators.length > 0;

        return (
          <div key={src.id}>
            <button
              onClick={() => {
                const opening = expandedSource !== src.id;
                setExpandedSource(opening ? src.id : null);
                if (opening) {
                  setExpandedPillar(null);
                  if (hasInd) {
                    onNavigate({ level: "operational", source: src.id, indicator: src.indicators[0].id });
                  } else {
                    onNavigate({ level: "operational", source: src.id });
                  }
                }
              }}
              className="flex items-center gap-2 w-full px-5 py-2 text-[12px] transition-all hover:bg-white/[0.06]"
              style={{ color: isSrcActive ? "#fff" : "hsl(210 15% 65%)" }}
            >
              {hasInd ? (
                isExp ? <ChevronDown className="h-3 w-3 flex-shrink-0" style={{ color: "hsl(210 30% 50%)" }} /> : <ChevronRight className="h-3 w-3 flex-shrink-0" style={{ color: "hsl(210 30% 50%)" }} />
              ) : <div className="w-3" />}
              <SrcIcon className="h-4 w-4 flex-shrink-0" style={{ color: isSrcActive ? "hsl(var(--primary))" : "hsl(210 20% 55%)" }} />
              <span className={isSrcActive ? "font-semibold" : ""}>{src.label}</span>
              {!hasInd && <span className="ml-auto text-[9px] opacity-40 italic">soon</span>}
            </button>

            {hasInd && isExp && (
              <div className="ml-8 border-l" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
                {src.indicators.map((ind) => {
                  const isActive = nav.level === "operational" && nav.source === src.id && nav.indicator === ind.id;
                  return (
                    <button
                      key={ind.id}
                      onClick={() => onNavigate({ level: "operational", source: src.id, indicator: ind.id })}
                      className="flex items-center gap-2 w-full pl-4 pr-3 py-[6px] text-[11px] transition-all hover:bg-white/[0.04]"
                      style={{
                        color: isActive ? "#fff" : "hsl(210 15% 55%)",
                        background: isActive ? "hsl(var(--primary) / 0.15)" : undefined,
                        borderLeft: isActive ? "2px solid hsl(var(--primary))" : "2px solid transparent",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: isActive ? "hsl(var(--primary))" : "hsl(210 20% 35%)" }} />
                      <span className={isActive ? "font-semibold" : ""}>{ind.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      </div>

      <div className="flex-1" />

      {/* ── User ── */}
      {profile && (
        <div className="px-5 py-3.5 border-t flex items-center gap-2.5" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground" style={{ background: "hsl(var(--primary))" }}>
            {profile.full_name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-white/90 truncate">{profile.full_name}</div>
            <div className="text-[10px] font-light" style={{ color: "hsl(210 25% 55%)" }}>
              {profile?.role === "dfp" ? "DFP" : profile?.ente_denominazione ?? "Ente HR"}
            </div>
          </div>
          <button onClick={signOut} className="p-1.5 rounded-md hover:bg-white/10 transition" title="Esci">
            <LogOut className="h-4 w-4" style={{ color: "hsl(210 25% 55%)" }} />
          </button>
        </div>
      )}
      <div className="px-5 py-2.5 text-[10px] border-t flex gap-2" style={{ borderColor: "hsl(var(--sidebar-border))", color: "hsl(210 25% 50%)" }}>
        <a href="#" className="hover:underline hover:text-white/70 transition-colors focus:outline-none focus:ring-1 focus:ring-white/40 focus:rounded-sm">Metadati</a>
        <span>·</span>
        <GlossaryDialog />
        <span>·</span>
        <button
          onClick={resetOnboardingTour}
          className="hover:underline hover:text-white/70 transition-colors focus:outline-none focus:ring-1 focus:ring-white/40 focus:rounded-sm inline-flex items-center gap-1"
        >
          <HelpCircle className="h-3 w-3" aria-hidden="true" />
          Guida
        </button>
      </div>
    </nav>
  );
};
