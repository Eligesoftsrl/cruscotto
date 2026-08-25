import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Compass, Printer, Eye, Check, ChevronDown, ChevronRight,
  StickyNote, X, ArrowLeft, ArrowRight, Users, FileText,
  BarChart3, Table2, AlignLeft, LayoutGrid, Star, AlertTriangle,
  Download, RotateCcw, GripVertical, HelpCircle, Database,
  Lightbulb, BookOpen, Sparkles,
} from "lucide-react";
import { TopBar } from "@/components/dashboard/TopBar";
import {
  reportSectionsCatalog, reportAudienceProfiles, reportThemes,
  type ReportAudience, type RepresentationMode, type ReportSectionDef,
} from "@/data/reportSections";

/* ═══ Wizard Steps ═══ */
type WizardStep = "audience" | "sections" | "customize" | "preview";
const STEPS: { key: WizardStep; label: string; icon: React.ReactNode }[] = [
  { key: "audience", label: "Destinatario", icon: <Users className="h-4 w-4" /> },
  { key: "sections", label: "Contenuti", icon: <FileText className="h-4 w-4" /> },
  { key: "customize", label: "Personalizza", icon: <StickyNote className="h-4 w-4" /> },
  { key: "preview", label: "Anteprima", icon: <Eye className="h-4 w-4" /> },
];

const REPR_ICONS: Record<RepresentationMode, { icon: React.ReactNode; label: string }> = {
  narrative: { icon: <AlignLeft className="h-3.5 w-3.5" />, label: "Narrativo" },
  chart: { icon: <BarChart3 className="h-3.5 w-3.5" />, label: "Grafico" },
  table: { icon: <Table2 className="h-3.5 w-3.5" />, label: "Tabella" },
  kpi_strip: { icon: <LayoutGrid className="h-3.5 w-3.5" />, label: "KPI Strip" },
};

const CATEGORY_LABELS: Record<string, string> = {
  overview: "Panoramica",
  demographic: "Demografica e Organico",
  recruiting: "Reclutamento",
  development: "Sviluppo e Competenze",
  organization: "Organizzazione",
  strategic: "Strategia e Raccomandazioni",
};

const RapportoNarrativo = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState<WizardStep>("audience");
  const [audience, setAudience] = useState<ReportAudience | null>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [sectionRepresentations, setSectionRepresentations] = useState<Record<string, RepresentationMode>>({});
  const [annotations, setAnnotations] = useState<Record<string, string>>({});
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState("Rapporto di Monitoraggio HR");
  const [isPrintView, setIsPrintView] = useState(false);

  const orgLabel = profile?.role === "dfp"
    ? "Dipartimento della Funzione Pubblica"
    : profile?.ente_denominazione ?? "Il tuo Ente";

  const stepIdx = STEPS.findIndex(s => s.key === step);

  /* ─── Step navigation ─── */
  const canNext = () => {
    if (step === "audience") return !!audience;
    if (step === "sections") return selectedSections.length > 0;
    return true;
  };

  const goNext = () => {
    const idx = stepIdx;
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key);
  };

  const goPrev = () => {
    const idx = stepIdx;
    if (idx > 0) setStep(STEPS[idx - 1].key);
  };

  /* ─── Audience selection ─── */
  const selectAudience = (a: ReportAudience) => {
    setAudience(a);
    // Pre-select sections appropriate for this audience
    const defaults = reportSectionsCatalog
      .filter(s => s.defaultFor.includes(a))
      .map(s => s.id);
    setSelectedSections(defaults);
    // Set default representations
    const reprs: Record<string, RepresentationMode> = {};
    reportSectionsCatalog.forEach(s => {
      reprs[s.id] = s.defaultRepresentation[a];
    });
    setSectionRepresentations(reprs);
  };

  /* ─── Section toggle ─── */
  const toggleSection = (id: string) => {
    setSelectedSections(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  /* ─── Reorder sections ─── */
  const moveSection = (id: string, dir: -1 | 1) => {
    setSelectedSections(prev => {
      const idx = prev.indexOf(id);
      if (idx < 0) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  /* ─── Reset ─── */
  const resetWizard = () => {
    setStep("audience");
    setAudience(null);
    setSelectedSections([]);
    setSectionRepresentations({});
    setAnnotations({});
    setReportTitle("Rapporto di Monitoraggio HR");
    setIsPrintView(false);
  };

  /* ─── Print ─── */
  const handlePrint = () => {
    setIsPrintView(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrintView(false), 500);
    }, 300);
  };

  const selectedSectionDefs = selectedSections
    .map(id => reportSectionsCatalog.find(s => s.id === id)!)
    .filter(Boolean);

  const audienceProfile = audience ? reportAudienceProfiles[audience] : null;

  /* ═══ Print View ═══ */
  if (isPrintView) {
    return (
      <div className="bg-white min-h-screen p-12 print:p-8" style={{ fontFamily: "'Titillium Web', sans-serif" }}>
        <div className="max-w-[800px] mx-auto">
          {/* Print header */}
          <div className="border-b-2 border-primary pb-6 mb-8">
            <div className="text-[10px] font-bold tracking-[.1em] uppercase text-muted-foreground">Presidenza del Consiglio dei Ministri · Dipartimento della Funzione Pubblica</div>
            <h1 className="text-2xl font-bold text-foreground mt-2">{reportTitle}</h1>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span>{orgLabel}</span>
              <span>Anno 2023</span>
              <span>Formato: {audienceProfile?.label}</span>
            </div>
          </div>

          {selectedSectionDefs.map((sec, i) => (
            <div key={sec.id} className="mb-8 break-inside-avoid">
              <SectionRenderer
                section={sec}
                representation={sectionRepresentations[sec.id]}
                annotation={annotations[sec.id]}
                index={i}
                audience={audience!}
                isPrint
              />
            </div>
          ))}

          {/* Print footer */}
          <div className="border-t pt-4 mt-12 text-[10px] text-muted-foreground text-center">
            Sistema di Monitoraggio HR · PA Digitale 2026 · Generato il {new Date().toLocaleDateString("it-IT")}
          </div>
        </div>
      </div>
    );
  }

  /* ═══ Main Wizard UI ═══ */
  return (
    <div className="min-h-screen bg-muted/30" style={{ fontFamily: "'Titillium Web', sans-serif" }}>
      <TopBar nav={{ level: "executive" }} />

      {/* Sub-header */}
      <header className="sticky top-[88px] z-40 bg-[hsl(213,50%,20%)] border-b-[3px] border-primary">
        <div className="flex items-center justify-between px-8 h-[44px]">
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-white/70" />
            <span className="text-sm font-bold text-white">Costruisci il tuo Rapporto</span>
            {audience && (
              <span className="text-[10px] font-bold tracking-[.08em] uppercase px-2.5 py-1 rounded border border-white/20 text-white/70 bg-primary/40">
                {audienceProfile?.icon} {audienceProfile?.label}
              </span>
            )}
          </div>
          <button onClick={resetWizard} className="flex items-center gap-1.5 text-[10px] text-white/50 hover:text-white/90 transition">
            <RotateCcw className="h-3 w-3" /> Ricomincia
          </button>
        </div>

        {/* Step indicator */}
        <nav className="bg-black/20 flex items-center px-8 h-10 gap-0">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => {
                if (i <= stepIdx || (i === stepIdx + 1 && canNext())) setStep(s.key);
              }}
              className={`flex items-center gap-2 px-4 h-10 text-[11px] font-semibold tracking-[.04em] whitespace-nowrap transition border-b-2 ${
                s.key === step
                  ? "text-white border-primary bg-primary/10"
                  : i < stepIdx
                  ? "text-white/60 border-transparent hover:text-white/80"
                  : "text-white/30 border-transparent cursor-default"
              }`}
            >
              <span className={`w-[22px] h-[22px] rounded-full text-[10px] font-bold flex items-center justify-center ${
                s.key === step ? "bg-primary text-white" : i < stepIdx ? "bg-[hsl(142,71%,35%)] text-white" : "bg-white/10 text-white/50"
              }`}>
                {i < stepIdx ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              {s.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Content area */}
      <main className="max-w-[1100px] mx-auto px-6 py-8 pb-28">
        {step === "audience" && (
          <StepAudience audience={audience} onSelect={selectAudience} />
        )}
        {step === "sections" && audience && (
          <StepSections
            audience={audience}
            selectedSections={selectedSections}
            onToggle={toggleSection}
          />
        )}
        {step === "customize" && audience && (
          <StepCustomize
            selectedSections={selectedSections}
            sectionRepresentations={sectionRepresentations}
            onRepresentationChange={(id, repr) => setSectionRepresentations(prev => ({ ...prev, [id]: repr }))}
            annotations={annotations}
            onAnnotationChange={(id, text) => setAnnotations(prev => ({ ...prev, [id]: text }))}
            editingAnnotation={editingAnnotation}
            setEditingAnnotation={setEditingAnnotation}
            onMoveSection={moveSection}
            reportTitle={reportTitle}
            onReportTitleChange={setReportTitle}
            audience={audience}
          />
        )}
        {step === "preview" && audience && (
          <StepPreview
            selectedSections={selectedSectionDefs}
            sectionRepresentations={sectionRepresentations}
            annotations={annotations}
            audience={audience}
            audienceProfile={audienceProfile!}
            orgLabel={orgLabel}
            reportTitle={reportTitle}
          />
        )}
      </main>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg print:hidden">
        <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            {stepIdx > 0 && (
              <button onClick={goPrev} className="flex items-center gap-1.5 px-4 py-2 rounded border text-sm font-medium text-muted-foreground hover:text-foreground transition">
                <ArrowLeft className="h-4 w-4" /> Indietro
              </button>
            )}
            <span className="text-xs text-muted-foreground">
              {selectedSections.length} sezioni selezionate
              {annotations && Object.values(annotations).filter(Boolean).length > 0 && (
                <> · {Object.values(annotations).filter(Boolean).length} note</>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {step === "preview" && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 rounded bg-[hsl(213,50%,20%)] text-white text-sm font-bold hover:opacity-90 transition"
              >
                <Printer className="h-4 w-4" /> Stampa / PDF
              </button>
            )}
            {stepIdx < STEPS.length - 1 && (
              <button
                onClick={goNext}
                disabled={!canNext()}
                className="flex items-center gap-2 px-5 py-2.5 rounded bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {STEPS[stepIdx + 1]?.label} <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RapportoNarrativo;

/* ═══════════════════════════════════════════════════════════════
   STEP 1: Scelta destinatario
   ═══════════════════════════════════════════════════════════════ */

function StepAudience({ audience, onSelect }: {
  audience: ReportAudience | null;
  onSelect: (a: ReportAudience) => void;
}) {
  return (
    <div>
      <TagStep>Passo 1 di 4</TagStep>
      <h2 className="text-2xl font-bold text-foreground mb-2">A chi è destinato il rapporto?</h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-[640px]">
        Il sistema adatterà automaticamente i contenuti proposti, il livello di dettaglio e la modalità di rappresentazione in base al destinatario scelto.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {(Object.entries(reportAudienceProfiles) as [ReportAudience, typeof reportAudienceProfiles.executive][]).map(([key, prof]) => {
          const isSelected = audience === key;
          const defaultCount = reportSectionsCatalog.filter(s => s.defaultFor.includes(key)).length;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`text-left rounded-lg border-2 p-6 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                  : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
              }`}
            >
              <div className="text-3xl mb-3">{prof.icon}</div>
              <div className="text-base font-bold text-foreground mb-1">{prof.label}</div>
              <div className="text-xs font-semibold text-primary mb-2">{prof.subtitle}</div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{prof.description}</p>
              <div className="flex gap-2 text-[10px]">
                <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                  ~{defaultCount} sezioni
                </span>
                <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                  Preferenza: {REPR_ICONS[prof.preferredRepresentation].label}
                </span>
              </div>
              {isSelected && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-primary font-bold">
                  <Check className="h-4 w-4" /> Selezionato
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 2: Selezione sezioni (con temi preconfezionati e descrizioni estese)
   ═══════════════════════════════════════════════════════════════ */

function StepSections({ audience, selectedSections, onToggle }: {
  audience: ReportAudience;
  selectedSections: string[];
  onToggle: (id: string) => void;
}) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showThemes, setShowThemes] = useState(true);

  const grouped = reportSectionsCatalog.reduce((acc, sec) => {
    (acc[sec.category] ??= []).push(sec);
    return acc;
  }, {} as Record<string, ReportSectionDef[]>);

  const categoryOrder = ["overview", "demographic", "recruiting", "development", "organization", "strategic"];

  const applyTheme = (sectionIds: string[]) => {
    // Deselect all, then select theme sections
    sectionIds.forEach(id => {
      if (!selectedSections.includes(id)) onToggle(id);
    });
    selectedSections.forEach(id => {
      if (!sectionIds.includes(id)) onToggle(id);
    });
    setShowThemes(false);
  };

  return (
    <div>
      <TagStep>Passo 2 di 4</TagStep>
      <h2 className="text-2xl font-bold text-foreground mb-2">Quali contenuti includere?</h2>
      <p className="text-sm text-muted-foreground mb-2 max-w-[720px]">
        Il sistema ha pre-selezionato le sezioni più rilevanti per il profilo <strong className="text-foreground">{reportAudienceProfiles[audience].label}</strong>. Puoi partire da un <strong className="text-foreground">tema preconfezionato</strong> oppure personalizzare liberamente la selezione. Espandi ogni sezione per leggere il dettaglio dei contenuti.
      </p>
      <div className="flex items-center gap-2 mb-6">
        <span className="flex items-center gap-1 text-[10px] font-bold text-destructive"><AlertTriangle className="h-3 w-3" /> Critico</span>
        <span className="flex items-center gap-1 text-[10px] font-bold text-[hsl(45,80%,30%)]"><Star className="h-3 w-3" /> Notevole</span>
        <span className="text-[10px] text-muted-foreground ml-2">— Il sistema evidenzia le sezioni che richiedono attenzione in base ai dati</span>
      </div>

      {/* ─── Preset themes ─── */}
      <div className="mb-8">
        <button
          onClick={() => setShowThemes(!showThemes)}
          className="flex items-center gap-2 text-xs font-bold text-primary mb-3 hover:underline"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Temi preconfezionati — selezione rapida
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showThemes ? "rotate-180" : ""}`} />
        </button>
        {showThemes && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {reportThemes.map(theme => (
              <button
                key={theme.id}
                onClick={() => applyTheme(theme.sectionIds)}
                className="text-left rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-sm p-3.5 transition-all group"
              >
                <div className="text-xl mb-1.5">{theme.icon}</div>
                <div className="text-xs font-bold text-foreground mb-1 group-hover:text-primary transition">{theme.label}</div>
                <p className="text-[10px] text-muted-foreground leading-snug mb-2">{theme.description}</p>
                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                  <BookOpen className="h-3 w-3" />
                  <span>{theme.sectionIds.length} capitoli</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Section categories ─── */}
      {categoryOrder.map(cat => {
        const sections = grouped[cat];
        if (!sections) return null;
        return (
          <div key={cat} className="mb-6">
            <div className="text-[10px] font-bold tracking-[.12em] uppercase text-muted-foreground mb-2 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-primary rounded" />
              {CATEGORY_LABELS[cat]}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {sections.map(sec => {
                const isSelected = selectedSections.includes(sec.id);
                const isExpanded = expandedSection === sec.id;
                return (
                  <div key={sec.id} className={`rounded-lg border transition-all ${
                    isSelected
                      ? "border-primary/40 bg-primary/5"
                      : "border-border bg-card hover:border-primary/20 opacity-70 hover:opacity-100"
                  }`}>
                    {/* Main row */}
                    <button
                      onClick={() => onToggle(sec.id)}
                      className="text-left w-full p-3.5 flex gap-3"
                    >
                      <div className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center flex-shrink-0 border ${
                        isSelected ? "bg-primary border-primary text-primary-foreground" : "border-border bg-muted"
                      }`}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-foreground">{sec.title}</span>
                          {sec.relevance === "critical" && (
                            <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">Critico</span>
                          )}
                          {sec.relevance === "notable" && (
                            <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[hsl(45,100%,92%)] text-[hsl(45,80%,30%)]">Notevole</span>
                          )}
                          {sec.pillar && (
                            <span className="flex-shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{sec.pillar}</span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground leading-snug">{sec.description}</div>
                        {sec.relevanceReason && sec.relevance !== "normal" && (
                          <div className="text-[10px] text-primary font-semibold mt-1">💡 {sec.relevanceReason}</div>
                        )}
                        {/* Question answered — always visible */}
                        <div className="flex items-start gap-1.5 mt-1.5">
                          <HelpCircle className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-[10px] text-foreground/70 italic leading-snug">«{sec.questionAnswered}»</span>
                        </div>
                      </div>
                      {/* Expand button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedSection(isExpanded ? null : sec.id); }}
                        className="flex-shrink-0 mt-0.5 p-1 rounded hover:bg-muted transition"
                        title="Mostra dettagli"
                      >
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 ml-8 border-t border-dashed border-border/50 pt-3 space-y-3">
                        <div>
                          <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Lightbulb className="h-3 w-3 text-primary" /> Contenuto informativo
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{sec.extendedDescription}</p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          <div>
                            <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <Database className="h-3 w-3 text-primary" /> Fonti dati
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {sec.dataSources.map(ds => (
                                <span key={ds} className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{ds}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-1">Rappresentazioni</div>
                            <div className="flex gap-1.5">
                              {sec.representations.map(r => (
                                <span key={r} className="flex items-center gap-1 text-[9px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                  {REPR_ICONS[r].icon} {REPR_ICONS[r].label}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        {/* KPI preview if available */}
                        {sec.data.kpis && sec.data.kpis.length > 0 && (
                          <div>
                            <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-1">Anteprima indicatori</div>
                            <div className="flex flex-wrap gap-2">
                              {sec.data.kpis.slice(0, 4).map(kpi => (
                                <div key={kpi.label} className="flex items-center gap-1.5 text-[9px] px-2 py-1 rounded bg-muted/60">
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    kpi.status === "green" ? "bg-[hsl(142,71%,45%)]" : kpi.status === "yellow" ? "bg-[hsl(45,93%,47%)]" : "bg-destructive"
                                  }`} />
                                  <span className="font-semibold text-foreground">{kpi.label}:</span>
                                  <span className="text-muted-foreground">{kpi.value}</span>
                                  {kpi.cluster && <span className="text-muted-foreground/60">vs {kpi.cluster}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 3: Personalizzazione (rappresentazione, note, ordine)
   ═══════════════════════════════════════════════════════════════ */

function StepCustomize({
  selectedSections, sectionRepresentations, onRepresentationChange,
  annotations, onAnnotationChange, editingAnnotation, setEditingAnnotation,
  onMoveSection, reportTitle, onReportTitleChange, audience,
}: {
  selectedSections: string[];
  sectionRepresentations: Record<string, RepresentationMode>;
  onRepresentationChange: (id: string, repr: RepresentationMode) => void;
  annotations: Record<string, string>;
  onAnnotationChange: (id: string, text: string) => void;
  editingAnnotation: string | null;
  setEditingAnnotation: (id: string | null) => void;
  onMoveSection: (id: string, dir: -1 | 1) => void;
  reportTitle: string;
  onReportTitleChange: (t: string) => void;
  audience: ReportAudience;
}) {
  const sectionDefs = selectedSections
    .map(id => reportSectionsCatalog.find(s => s.id === id)!)
    .filter(Boolean);

  return (
    <div>
      <TagStep>Passo 3 di 4</TagStep>
      <h2 className="text-2xl font-bold text-foreground mb-2">Personalizza il rapporto</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-[640px]">
        Per ogni sezione puoi scegliere la modalità di rappresentazione, aggiungere note personali e riordinare i contenuti.
      </p>

      {/* Report title */}
      <div className="mb-8">
        <label className="text-[10px] font-bold tracking-[.1em] uppercase text-muted-foreground mb-1.5 block">Titolo del rapporto</label>
        <input
          type="text"
          value={reportTitle}
          onChange={e => onReportTitleChange(e.target.value)}
          className="w-full max-w-[500px] px-3 py-2 border rounded text-sm font-semibold text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Section cards */}
      <div className="flex flex-col gap-3">
        {sectionDefs.map((sec, i) => {
          const currentRepr = sectionRepresentations[sec.id];
          const isEditing = editingAnnotation === sec.id;
          const hasNote = !!annotations[sec.id];

          return (
            <div key={sec.id} className="border rounded-lg bg-card overflow-hidden">
              {/* Section header */}
              <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => onMoveSection(sec.id, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition">
                    <ChevronDown className="h-3 w-3 rotate-180" />
                  </button>
                  <button onClick={() => onMoveSection(sec.id, 1)} disabled={i === sectionDefs.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition">
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                <span className="w-6 h-6 rounded bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-foreground">{sec.title}</div>
                  <div className="text-[10px] text-muted-foreground">{sec.description}</div>
                </div>
                {sec.relevance === "critical" && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">Critico</span>
                )}
              </div>

              <div className="p-4">
                {/* Representation selector */}
                <div className="mb-3">
                  <div className="text-[10px] font-bold tracking-[.08em] uppercase text-muted-foreground mb-2">Modalità di rappresentazione</div>
                  <div className="flex gap-1.5">
                    {sec.representations.map(repr => (
                      <button
                        key={repr}
                        onClick={() => onRepresentationChange(sec.id, repr)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-semibold transition ${
                          currentRepr === repr
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {REPR_ICONS[repr].icon}
                        {REPR_ICONS[repr].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Annotation */}
                <div>
                  <div className="text-[10px] font-bold tracking-[.08em] uppercase text-muted-foreground mb-1.5">Nota personale</div>
                  {isEditing ? (
                    <div className="flex gap-2 items-start">
                      <textarea
                        autoFocus
                        defaultValue={annotations[sec.id] || ""}
                        onBlur={(e) => { onAnnotationChange(sec.id, e.target.value); setEditingAnnotation(null); }}
                        className="flex-1 text-xs border rounded p-2 min-h-[60px] bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Aggiungi un commento, un'osservazione o un'indicazione operativa..."
                      />
                      <button onClick={() => setEditingAnnotation(null)} className="p-1 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingAnnotation(sec.id)}
                        className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition"
                      >
                        <StickyNote className="h-3 w-3" />
                        {hasNote ? "Modifica nota" : "Aggiungi nota"}
                      </button>
                      {hasNote && (
                        <div className="flex-1 bg-[hsl(45,100%,96%)] border-l-2 border-[hsl(45,100%,42%)] rounded-r px-3 py-1.5 text-[11px] text-foreground/70 italic truncate">
                          📝 {annotations[sec.id]}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 4: Anteprima
   ═══════════════════════════════════════════════════════════════ */

function StepPreview({
  selectedSections, sectionRepresentations, annotations, audience,
  audienceProfile, orgLabel, reportTitle,
}: {
  selectedSections: ReportSectionDef[];
  sectionRepresentations: Record<string, RepresentationMode>;
  annotations: Record<string, string>;
  audience: ReportAudience;
  audienceProfile: typeof reportAudienceProfiles.executive;
  orgLabel: string;
  reportTitle: string;
}) {
  return (
    <div>
      <TagStep>Passo 4 di 4</TagStep>
      <h2 className="text-2xl font-bold text-foreground mb-2">Anteprima del rapporto</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Verifica il contenuto prima di stampare. Puoi tornare ai passi precedenti per modificare.
      </p>

      {/* Simulated document */}
      <div className="bg-white border shadow-lg rounded-lg overflow-hidden max-w-[860px] mx-auto">
        {/* Document header */}
        <div className="p-10 border-b-2 border-primary">
          <div className="text-[10px] font-bold tracking-[.1em] uppercase text-muted-foreground">
            Presidenza del Consiglio dei Ministri · Dipartimento della Funzione Pubblica
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-3">{reportTitle}</h1>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">{audienceProfile.icon} {audienceProfile.label}</span>
            <span>Ente: {orgLabel}</span>
            <span>Anno 2023</span>
            <span>{selectedSections.length} sezioni</span>
          </div>
        </div>

        {/* Sections */}
        <div className="p-10">
          {selectedSections.map((sec, i) => (
            <div key={sec.id} className="mb-10 last:mb-0">
              <SectionRenderer
                section={sec}
                representation={sectionRepresentations[sec.id]}
                annotation={annotations[sec.id]}
                index={i}
                audience={audience}
              />
            </div>
          ))}
        </div>

        {/* Document footer */}
        <div className="px-10 py-6 bg-muted/30 border-t text-center text-[10px] text-muted-foreground">
          Sistema di Monitoraggio HR · PA Digitale 2026 · Generato il {new Date().toLocaleDateString("it-IT")}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Section Renderer — adatta il contenuto in base alla rappresentazione
   ═══════════════════════════════════════════════════════════════ */

function SectionRenderer({ section, representation, annotation, index, audience, isPrint }: {
  section: ReportSectionDef;
  representation: RepresentationMode;
  annotation?: string;
  index: number;
  audience: ReportAudience;
  isPrint?: boolean;
}) {
  const d = section.data;
  const repr = representation || "narrative";

  return (
    <div>
      {/* Section title */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">{index + 1}</span>
        <h3 className="text-base font-bold text-foreground">{section.title}</h3>
        {section.pillar && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{section.pillar}</span>}
      </div>

      {/* KPI Strip */}
      {repr === "kpi_strip" && d.kpis && (
        <div className={`grid gap-2.5 mb-4 ${d.kpis.length <= 3 ? "grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}>
          {d.kpis.map(kpi => (
            <div key={kpi.label} className="border rounded p-3" style={{
              borderTopWidth: "3px",
              borderTopColor: kpi.status === "green" ? "hsl(142,71%,35%)" : kpi.status === "yellow" ? "hsl(45,100%,42%)" : "hsl(var(--destructive))",
            }}>
              <div className="text-[10px] font-bold tracking-[.08em] uppercase text-muted-foreground mb-1">{kpi.label}</div>
              <div className={`font-mono text-xl font-semibold ${
                kpi.status === "green" ? "text-[hsl(142,71%,35%)]" : kpi.status === "yellow" ? "text-[hsl(45,80%,30%)]" : "text-destructive"
              }`}>{kpi.value}</div>
              {kpi.cluster && <div className="text-[10px] text-muted-foreground mt-0.5">Cluster: {kpi.cluster}</div>}
              {kpi.delta && <div className="text-[10px] font-semibold text-muted-foreground">{kpi.delta}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {repr === "table" && d.tableRows && (
        <div className="border rounded overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[hsl(213,50%,20%)] text-white">
                <th className="text-left px-3 py-2 text-[10px] font-bold tracking-[.08em] uppercase">Stato</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold tracking-[.08em] uppercase">Indicatore</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold tracking-[.08em] uppercase">Valore</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold tracking-[.08em] uppercase">Target</th>
              </tr>
            </thead>
            <tbody>
              {d.tableRows.map((row, i) => (
                <tr key={i} className="border-b last:border-b-0 even:bg-muted/30">
                  <td className="px-3 py-2">
                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                      row.status === "green" ? "bg-[hsl(142,71%,35%)]" : row.status === "yellow" ? "bg-[hsl(45,100%,42%)]" : "bg-destructive"
                    }`} />
                  </td>
                  <td className="px-3 py-2 text-foreground">{row.label}</td>
                  <td className="px-3 py-2 font-mono font-semibold">{row.value}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.target || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Table fallback for sections without tableRows */}
      {repr === "table" && !d.tableRows && d.kpis && (
        <div className="border rounded overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[hsl(213,50%,20%)] text-white">
                <th className="text-left px-3 py-2 text-[10px] font-bold tracking-[.08em] uppercase">Stato</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold tracking-[.08em] uppercase">Indicatore</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold tracking-[.08em] uppercase">Valore</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold tracking-[.08em] uppercase">Cluster</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold tracking-[.08em] uppercase">Var.</th>
              </tr>
            </thead>
            <tbody>
              {d.kpis.map((kpi, i) => (
                <tr key={i} className="border-b last:border-b-0 even:bg-muted/30">
                  <td className="px-3 py-2">
                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                      kpi.status === "green" ? "bg-[hsl(142,71%,35%)]" : kpi.status === "yellow" ? "bg-[hsl(45,100%,42%)]" : "bg-destructive"
                    }`} />
                  </td>
                  <td className="px-3 py-2 text-foreground">{kpi.label}</td>
                  <td className="px-3 py-2 font-mono font-semibold">{kpi.value}</td>
                  <td className="px-3 py-2 text-muted-foreground">{kpi.cluster || "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{kpi.delta || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Chart representation (simplified visual) */}
      {repr === "chart" && d.kpis && (
        <div className="border rounded p-4 mb-4 bg-muted/20">
          {d.kpis.map(kpi => {
            const numVal = parseFloat(kpi.value.replace(/[^0-9.,]/g, "").replace(",", "."));
            const barW = isNaN(numVal) ? 50 : Math.min(numVal, 100);
            return (
              <div key={kpi.label} className="flex items-center gap-3 py-2">
                <span className="text-xs text-muted-foreground w-[140px] truncate">{kpi.label}</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${barW}%`,
                      backgroundColor: kpi.status === "green" ? "hsl(142,71%,35%)" : kpi.status === "yellow" ? "hsl(45,100%,42%)" : "hsl(var(--destructive))",
                    }}
                  />
                </div>
                <span className="font-mono text-xs font-bold w-16 text-right">{kpi.value}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Narrative */}
      {(repr === "narrative" || !d.kpis) && d.narrative && (
        <div className="bg-primary/5 border-l-[3px] border-primary/30 rounded-r px-5 py-4 text-sm text-muted-foreground leading-relaxed mb-4 [&_strong]:text-foreground">
          {d.narrative}
        </div>
      )}

      {/* Insight (always shown if present, regardless of repr) */}
      {d.insight && repr !== "narrative" && (
        <div className="bg-[hsl(45,100%,96%)] border-l-[3px] border-[hsl(45,100%,42%)] rounded-r px-4 py-3 text-xs text-muted-foreground leading-relaxed mb-3">
          💡 {d.insight}
        </div>
      )}

      {/* Annotation */}
      {annotation && (
        <div className="bg-[hsl(45,100%,96%)] border-l-2 border-[hsl(45,100%,42%)] rounded-r px-4 py-2.5 text-xs text-foreground/70 italic">
          📝 Nota: {annotation}
        </div>
      )}
    </div>
  );
}

/* ═══ Shared UI atoms ═══ */

function TagStep({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-bold tracking-[.14em] uppercase text-primary mb-4">
      <span className="w-5 h-0.5 bg-primary" />
      {children}
    </div>
  );
}
