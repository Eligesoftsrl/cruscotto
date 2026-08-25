import * as React from "react";
import {
  AlertTriangle, BarChart3, Users, UserPlus, GraduationCap,
  TrendingUp, Brain, Shield, ClipboardList, ChevronRight, Compass,
  Zap, Target, FileText, Info, BookOpen, Route, ArrowUpRight, ArrowDownRight,
  Plus, Sparkles,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { bussolaPercorsi, type BussolaPercorsoData } from "@/data/bussolaPercorsi";
import { guidedJourneys, type GuidedJourneyDef } from "@/data/guidedJourneys";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { CommunityJourneys } from "./CommunityJourneys";
import { TemplateGallery } from "./TemplateGallery";
import type { JourneyTemplate } from "@/data/journeyTemplates";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle, BarChart3, Users, UserPlus, GraduationCap,
  TrendingUp, Brain, Shield, ClipboardList,
};

interface BussolaHomeProps {
  onSelectPercorso: (percorsoId: string) => void;
  onStartGuidedJourney?: (journeyId: string) => void;
  onCreateJourney?: () => void;
  onFollowCustomJourney?: (journey: any) => void;
  onUseTemplate?: (template: JourneyTemplate) => void;
  communityRefreshKey?: number;
}

/* ── Hero KPI data — dati significativi ed esplicativi ── */
const heroKpis = [
  {
    label: "Score Riforma",
    value: "58%",
    trend: "+2pp vs 2022",
    trendUp: true,
    description: "Indice composito di avanzamento della Riforma PA, calcolato sui 6 Pillar strategici (D1–D6). Misura il grado complessivo di attuazione rispetto ai target ministeriali.",
  },
  {
    label: "Organico in servizio",
    value: "12.847",
    trend: "−3,2% vs anno prec.",
    trendUp: false,
    description: "Personale effettivo a tempo indeterminato e determinato in servizio al 31/12/2023. Il trend negativo segnala un calo netto rispetto alla dotazione organica teorica.",
  },
  {
    label: "Tasso copertura recruiting",
    value: "42%",
    trend: "sotto soglia 60%",
    trendUp: false,
    description: "Rapporto tra assunzioni effettuate e cessazioni dell'anno. Un valore sotto il 60% indica capacità di sostituzione insufficiente, con rischio di erosione progressiva dell'organico.",
  },
  {
    label: "Rischio pensionamento 5 anni",
    value: "31%",
    trend: "571 cessazioni attese",
    trendUp: false,
    description: "Quota di personale che maturerà i requisiti pensionistici entro il 2028. Impatta direttamente sulla programmazione dei fabbisogni (Pillar D2) e sulla pianificazione del recruiting (D3).",
  },
];

/* ── Pillar summary data — con journeyId corretti ── */
const pillarSummary = [
  {
    id: "D1", label: "Classificazione", journeyId: "d1-classificazione",
    score: 72,
    purpose: "Valuta l'adesione dell'Ente al nuovo modello di classificazione professionale introdotto dalla Riforma.",
    whatYouGet: "Scopri se il tuo Ente ha adottato i profili di ruolo e le famiglie professionali previste dal CCNL, e come si posiziona rispetto al benchmark nazionale.",
  },
  {
    id: "D2", label: "Fabbisogno", journeyId: "d2-fabbisogni",
    score: 61,
    purpose: "Analizza la programmazione dell'organico e la capacità di anticipare i fabbisogni futuri di personale.",
    whatYouGet: "Verifica se il Piano Triennale dei Fabbisogni (PTFP) è allineato alle cessazioni previste e alla dotazione organica target.",
  },
  {
    id: "D3", label: "Recruiting", journeyId: "d3-selezione",
    score: 42,
    purpose: "Misura l'attrattività, l'efficacia e la tempestività dei processi di selezione e reclutamento.",
    whatYouGet: "Analizza i bandi InPA, i tempi di completamento concorsuale, il tasso di copertura delle posizioni bandite e la qualità dei candidati attratti.",
  },
  {
    id: "D4", label: "Sviluppo", journeyId: "d4-sviluppo",
    score: 65,
    purpose: "Valuta l'investimento in formazione e sviluppo delle competenze del personale.",
    whatYouGet: "Esplora la copertura formativa Syllabus, il gap di competenze digitali, il tasso di assessment completati e l'efficacia dei percorsi formativi.",
  },
  {
    id: "D5", label: "Carriera", journeyId: "d5-rewarding",
    score: 58,
    purpose: "Monitora le progressioni di carriera, l'equità di genere e le politiche di work-life balance.",
    whatYouGet: "Confronta le progressioni verticali e orizzontali, il gender gap retributivo, la diffusione del lavoro agile e i tassi di partecipazione per genere.",
  },
  {
    id: "D6", label: "Capacity", journeyId: "d6-sostenibilita",
    score: 52,
    purpose: "Verifica la sostenibilità organizzativa e la capacità dell'Ente di mantenere i livelli di servizio.",
    whatYouGet: "Analizza l'indice di vecchiamento, il tasso di turnover sostenibile, il rapporto FTE/servizi erogati e la resilienza organizzativa complessiva.",
  },
];

/* ── Ambito config ── */
const ambitoConfig: Record<"attention" | "explore" | "plan", {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  whatYouGet: string;
  gradient: string;
  iconBg: string;
}> = {
  attention: {
    icon: AlertTriangle,
    title: "Allerta",
    desc: "Criticità e interventi prioritari",
    whatYouGet: "Identifica gli indicatori sotto soglia che richiedono intervento immediato e le aree di rischio organizzativo.",
    gradient: "from-destructive/10 to-destructive/5",
    iconBg: "bg-destructive/15 text-destructive",
  },
  explore: {
    icon: Compass,
    title: "Analisi",
    desc: "Percorsi analitici tematici",
    whatYouGet: "Esplora i dati del personale attraverso percorsi tematici guidati: demografia, reclutamento, competenze, carriere.",
    gradient: "from-primary/10 to-primary/5",
    iconBg: "bg-primary/15 text-primary",
  },
  plan: {
    icon: Target,
    title: "Programmazione",
    desc: "Proiezioni e scenari strategici",
    whatYouGet: "Simula scenari futuri sulle cessazioni, il fabbisogno di personale e l'impatto delle politiche di recruiting.",
    gradient: "from-[hsl(142,71%,45%)]/10 to-[hsl(142,71%,45%)]/5",
    iconBg: "bg-[hsl(142,71%,90%)] text-[hsl(142,71%,35%)]",
  },
};

function getSemaforoColor(score: number): string {
  if (score >= 60) return "hsl(142,71%,45%)";
  if (score >= 50) return "hsl(45,100%,42%)";
  return "hsl(var(--destructive))";
}

function getSemaforoLabel(score: number): string {
  if (score >= 70) return "Buono";
  if (score >= 60) return "Adeguato";
  if (score >= 50) return "Moderato";
  return "Critico";
}

export const BussolaHome = ({ onSelectPercorso, onStartGuidedJourney, onCreateJourney, onFollowCustomJourney, onUseTemplate, communityRefreshKey }: BussolaHomeProps) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [expandedAmbito, setExpandedAmbito] = React.useState<"attention" | "explore" | "plan" | null>(null);
  const [activeTab, setActiveTab] = React.useState<"institutional" | "community">("institutional");
  const orgLabel = profile?.role === "dfp"
    ? "Dipartimento della Funzione Pubblica"
    : profile?.ente_denominazione ?? "Il tuo Ente";

  const grouped = {
    attention: bussolaPercorsi.filter(p => p.category === "attention"),
    explore: bussolaPercorsi.filter(p => p.category === "explore"),
    plan: bussolaPercorsi.filter(p => p.category === "plan"),
  };

  return (
    <TooltipProvider delayDuration={200}>
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">
        {/* Sub-header */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-primary/20 bg-primary/5">
            <Compass className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold tracking-wider uppercase text-primary">Pannello di Governo</span>
          </div>
          <button
            onClick={() => navigate("/demo-narrativi")}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            <Zap className="h-3.5 w-3.5" />
            Demo
          </button>
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">{orgLabel}</span>
        </div>

        {/* ═══ HERO KPI STRIP — con descrizioni esplicative ═══ */}
        <div className="bg-[hsl(213,50%,16%)] rounded-xl px-5 py-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {heroKpis.map((kpi) => (
              <div key={kpi.label} className="flex flex-col gap-1">
                <div className="text-[10px] text-white/50 uppercase tracking-wide leading-tight font-semibold">{kpi.label}</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white leading-none">{kpi.value}</span>
                  <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${kpi.trendUp ? "text-[hsl(142,71%,65%)]" : "text-[hsl(45,100%,70%)]"}`}>
                    {kpi.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {kpi.trend}
                  </span>
                </div>
                <p className="text-[11px] text-white/60 leading-snug mt-0.5">{kpi.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ TAB SWITCHER ═══ */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1 bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab("institutional")}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition ${
                activeTab === "institutional" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Percorsi istituzionali
            </button>
            <button
              onClick={() => setActiveTab("community")}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === "community" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-3 w-3" />
              Percorsi personalizzati
            </button>
          </div>
        </div>

        {activeTab === "community" ? (
          <div className="mb-6 space-y-6">
            <TemplateGallery onSelectTemplate={(tpl) => onUseTemplate?.(tpl)} />
            <div className="border-t pt-4">
              <h3 className="text-sm font-bold text-foreground mb-1">Percorsi della community</h3>
              <p className="text-xs text-muted-foreground mb-3">Percorsi creati e condivisi dagli utenti</p>
              <CommunityJourneys
                onFollowJourney={(j) => onFollowCustomJourney?.(j)}
                refreshKey={communityRefreshKey}
              />
            </div>
          </div>
        ) : (
        <>
        {/* ═══ SEZIONE AMBITI TEMATICI ═══ */}
        <div className="mb-2">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide mb-1">Esplora per ambito</h2>
          <p className="text-xs text-muted-foreground mb-3">Seleziona un ambito per visualizzare i percorsi analitici disponibili</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
          {(["attention", "explore", "plan"] as const).map(cat => {
            const cfg = ambitoConfig[cat];
            const Icon = cfg.icon;
            const count = grouped[cat].length;
            const isExpanded = expandedAmbito === cat;
            return (
              <button
                key={cat}
                onClick={() => setExpandedAmbito(prev => prev === cat ? null : cat)}
                className={`bg-gradient-to-br ${cfg.gradient} border rounded-xl p-5 text-left transition-all hover:shadow-md group ${isExpanded ? "ring-2 ring-primary shadow-md scale-[1.02]" : "hover:scale-[1.02] active:scale-100"}`}
              >
                <div className={`w-11 h-11 rounded-lg ${cfg.iconBg} flex items-center justify-center mb-3`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">{cfg.title}</h3>
                <p className="text-xs text-muted-foreground mb-2 leading-snug">{cfg.desc}</p>
                <p className="text-[11px] text-muted-foreground/80 leading-snug mb-3 italic">{cfg.whatYouGet}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">{count} percorsi disponibili</span>
                  <ChevronRight className={`h-4 w-4 transition ${isExpanded ? "rotate-90 text-primary" : "text-muted-foreground/30 group-hover:text-primary"}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* ═══ INLINE PERCORSI LIST ═══ */}
        {expandedAmbito && (
          <div className="mb-6 bg-card border rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b">
              {(() => {
                const cfg = ambitoConfig[expandedAmbito];
                const Icon = cfg.icon;
                return (
                  <>
                    <div className={`w-7 h-7 rounded-md ${cfg.iconBg} flex items-center justify-center`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-bold text-foreground">{cfg.title}</span>
                    <span className="text-xs text-muted-foreground">· {grouped[expandedAmbito].length} percorsi</span>
                  </>
                );
              })()}
            </div>
            <div className="flex flex-col gap-0.5">
              {grouped[expandedAmbito].map(p => (
                <PercorsoRow key={p.id} percorso={p} onClick={() => onSelectPercorso(p.id)} />
              ))}
            </div>
          </div>
        )}

        {!expandedAmbito && <div className="mb-6" />}

        {/* ═══ SEZIONE PILLAR D1-D6 — con descrizioni ═══ */}
        <div className="mb-2">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide mb-1">I 6 Pillar della Riforma</h2>
          <p className="text-xs text-muted-foreground mb-3">Ogni card ti guida in un percorso di approfondimento sullo stato di attuazione del Pillar</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {pillarSummary.map(p => {
            const color = getSemaforoColor(p.score);
            const levelLabel = getSemaforoLabel(p.score);
            const hasJourney = !!guidedJourneys[p.journeyId];
            return (
              <button
                key={p.id}
                onClick={() => hasJourney && onStartGuidedJourney?.(p.journeyId)}
                disabled={!hasJourney}
                className="bg-card border rounded-xl p-5 text-left transition-all hover:shadow-md hover:scale-[1.02] active:scale-100 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {/* Header: pillar id + score */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-bold text-foreground">{p.id}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-sm font-semibold text-foreground">{p.label}</span>
                  </div>
                  <span
                    className="text-2xl font-bold leading-none"
                    style={{ color }}
                  >
                    {p.score}
                  </span>
                </div>

                {/* Scopo del pillar */}
                <p className="text-xs text-muted-foreground mb-2 leading-snug">{p.purpose}</p>

                {/* Cosa ottieni */}
                <p className="text-[11px] text-primary/80 leading-snug mb-3 font-medium">{p.whatYouGet}</p>

                {/* Progress bar */}
                <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <div className="absolute top-0 bottom-0 w-px bg-foreground/20" style={{ left: "60%" }} />
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${p.score}%`, backgroundColor: color }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                      color,
                    }}
                  >
                    {levelLabel}
                  </span>
                  {hasJourney && (
                    <span className="text-[11px] text-muted-foreground/50 group-hover:text-primary transition flex items-center gap-1">
                      <Route className="h-3 w-3" />
                      Esplora · {guidedJourneys[p.journeyId].steps.length} tappe
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Riga finale: Reportistica */}
        <button
          onClick={() => navigate("/rapporto")}
          className="w-full bg-card border rounded-xl p-5 flex items-center gap-4 text-left transition-all hover:shadow-md hover:scale-[1.01] active:scale-100 group mb-6"
        >
          <div className="w-11 h-11 rounded-lg bg-[hsl(270,60%,92%)] text-[hsl(270,60%,45%)] flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground mb-0.5">Genera Rapporto Narrativo</h3>
            <p className="text-xs text-muted-foreground">
              Executive Summary · Rapporto Esteso · Rapporto Tecnico
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition flex-shrink-0" />
        </button>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground pt-4 border-t">
          Dati aggiornati al 31/12/2023 · Percorsi analitici generati sui dati dell'Amministrazione
        </footer>
        </>
        )}

        {/* FAB: Create Journey */}
        <button
          onClick={() => onCreateJourney?.()}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
          title="Crea percorso personalizzato"
        >
          <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </main>
    </TooltipProvider>
  );
};

/* ── Exported helpers for Sheet drill-down ── */
export function PercorsoRow({ percorso, onClick }: { percorso: BussolaPercorsoData; onClick: () => void }) {
  const Icon = iconMap[percorso.icon] ?? Users;
  const allIndicators = percorso.steps.flatMap(s => s.indicators);
  const redCount = allIndicators.filter(i => i.status === "red").length;
  const greenCount = allIndicators.filter(i => i.status === "green").length;
  const stepsCount = percorso.steps.length;
  const pillars = [...new Set(allIndicators.map(i => i.pillar).filter(Boolean))];

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg px-3 py-3 flex items-start gap-3 text-left transition-all hover:bg-accent/50 group border border-transparent hover:border-border/50"
    >
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground leading-snug mb-0.5">{percorso.question}</div>
        <div className="text-xs text-muted-foreground leading-snug mb-1">{percorso.subtitle}</div>
        <div className="text-xs text-muted-foreground/70 leading-snug italic mb-1.5">{percorso.valueProposition}</div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {stepsCount} {stepsCount === 1 ? "capitolo" : "capitoli"}
          </span>
          {pillars.map(p => (
            <span key={p} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{p}</span>
          ))}
          {redCount > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-destructive/10 text-destructive">{redCount} ⚠</span>
          )}
          {greenCount > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[hsl(142,71%,90%)] text-[hsl(142,71%,30%)]">{greenCount} ✓</span>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition flex-shrink-0 mt-1" />
    </button>
  );
}

export function GuidedJourneyRow({ journey, onClick }: { journey: GuidedJourneyDef; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg px-3 py-3 flex items-start gap-3 text-left transition-all hover:bg-accent/50 group border border-transparent hover:border-border/50"
    >
      <Route className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground leading-snug mb-0.5">{journey.title}</div>
        <div className="text-xs text-muted-foreground leading-snug mb-1">{journey.subtitle}</div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {journey.steps.length} tappe
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{journey.pillar}</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition flex-shrink-0 mt-1" />
    </button>
  );
}
