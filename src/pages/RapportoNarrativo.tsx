import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Compass,
  Printer,
  Eye,
  Check,
  ChevronDown,
  ChevronRight,
  StickyNote,
  X,
  ArrowLeft,
  ArrowRight,
  Users,
  FileText,
  BarChart3,
  Table2,
  AlignLeft,
  LayoutGrid,
  Star,
  AlertTriangle,
  Download,
  RotateCcw,
  GripVertical,
  HelpCircle,
  Database,
  Lightbulb,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { TopBar } from "@/components/dashboard/TopBar";
import {
  reportSectionsCatalog,
  reportAudienceProfiles,
  reportThemes,
  type ReportAudience,
  type RepresentationMode,
  type ReportSectionDef,
} from "@/data/reportSections";

/* ═══ Wizard Steps ═══ */
import {
  STEPS,
  StepAudience,
  StepSections,
  StepCustomize,
  StepPreview,
  SectionRenderer,
  type WizardStep,
} from "@/pages/reportWizardSteps";

const RapportoNarrativo = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState<WizardStep>("audience");
  const [audience, setAudience] = useState<ReportAudience | null>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [sectionRepresentations, setSectionRepresentations] = useState<
    Record<string, RepresentationMode>
  >({});
  const [annotations, setAnnotations] = useState<Record<string, string>>({});
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState("Rapporto di Monitoraggio HR");
  const [isPrintView, setIsPrintView] = useState(false);

  const orgLabel =
    profile?.role === "dfp"
      ? "Dipartimento della Funzione Pubblica"
      : (profile?.ente_denominazione ?? "Il tuo Ente");

  const stepIdx = STEPS.findIndex((s) => s.key === step);

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
    const defaults = reportSectionsCatalog.filter((s) => s.defaultFor.includes(a)).map((s) => s.id);
    setSelectedSections(defaults);
    // Set default representations
    const reprs: Record<string, RepresentationMode> = {};
    reportSectionsCatalog.forEach((s) => {
      reprs[s.id] = s.defaultRepresentation[a];
    });
    setSectionRepresentations(reprs);
  };

  /* ─── Section toggle ─── */
  const toggleSection = (id: string) => {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  /* ─── Reorder sections ─── */
  const moveSection = (id: string, dir: -1 | 1) => {
    setSelectedSections((prev) => {
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
    .map((id) => reportSectionsCatalog.find((s) => s.id === id)!)
    .filter(Boolean);

  const audienceProfile = audience ? reportAudienceProfiles[audience] : null;

  /* ═══ Print View ═══ */
  if (isPrintView) {
    return (
      <div
        className="bg-white min-h-screen p-12 print:p-8"
        style={{ fontFamily: "'Titillium Web', sans-serif" }}
      >
        <div className="max-w-[800px] mx-auto">
          {/* Print header */}
          <div className="border-b-2 border-primary pb-6 mb-8">
            <div className="text-[10px] font-bold tracking-[.1em] uppercase text-muted-foreground">
              Presidenza del Consiglio dei Ministri · Dipartimento della Funzione Pubblica
            </div>
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
            Sistema di Monitoraggio HR · PA Digitale 2026 · Generato il{" "}
            {new Date().toLocaleDateString("it-IT")}
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
          <button
            onClick={resetWizard}
            className="flex items-center gap-1.5 text-[10px] text-white/50 hover:text-white/90 transition"
          >
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
              <span
                className={`w-[22px] h-[22px] rounded-full text-[10px] font-bold flex items-center justify-center ${
                  s.key === step
                    ? "bg-primary text-white"
                    : i < stepIdx
                      ? "bg-[hsl(142,71%,35%)] text-white"
                      : "bg-white/10 text-white/50"
                }`}
              >
                {i < stepIdx ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              {s.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Content area */}
      <main className="max-w-[1100px] mx-auto px-6 py-8 pb-28">
        {step === "audience" && <StepAudience audience={audience} onSelect={selectAudience} />}
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
            onRepresentationChange={(id, repr) =>
              setSectionRepresentations((prev) => ({ ...prev, [id]: repr }))
            }
            annotations={annotations}
            onAnnotationChange={(id, text) => setAnnotations((prev) => ({ ...prev, [id]: text }))}
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
              <button
                onClick={goPrev}
                className="flex items-center gap-1.5 px-4 py-2 rounded border text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
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
