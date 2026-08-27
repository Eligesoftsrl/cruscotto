import { useState, useEffect } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Globe,
  Lock,
  Route,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IndicatorPicker } from "./IndicatorPicker";
import { indicatorCatalog } from "@/data/indicatorCatalog";
import { toast } from "@/hooks/use-toast";
import { useCustomJourneys } from "@/hooks/useCustomJourneys";
import type { JourneyTemplate } from "@/data/journeyTemplates";

interface JourneyCreatorWizardProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  template?: JourneyTemplate | null;
}

interface StepDraft {
  title: string;
  description: string;
  indicatorIds: string[];
  insightText: string;
  insightType: "success" | "warning" | "danger" | "info";
}

const categoryOptions = [
  { value: "attention" as const, label: "Allerta", icon: "🔴", desc: "Criticità da monitorare" },
  { value: "explore" as const, label: "Analisi", icon: "🔵", desc: "Approfondimenti tematici" },
  { value: "plan" as const, label: "Programmazione", icon: "🟢", desc: "Scenari e proiezioni" },
];

export function JourneyCreatorWizard({
  open,
  onClose,
  onCreated,
  template,
}: JourneyCreatorWizardProps) {
  const { createJourney } = useCustomJourneys();
  const [wizardStep, setWizardStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1 fields
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState<"attention" | "explore" | "plan">("explore");
  const [isPublic, setIsPublic] = useState(false);

  // Step 2 fields
  const [steps, setSteps] = useState<StepDraft[]>([
    { title: "", description: "", indicatorIds: [], insightText: "", insightType: "info" },
  ]);
  const [expandedStep, setExpandedStep] = useState(0);

  // Pre-fill from template
  useEffect(() => {
    if (template && open) {
      setTitle(template.title + " (copia)");
      setQuestion(template.question);
      setCategory(template.category);
      setSteps(
        template.steps.map((s) => ({
          title: s.title,
          description: s.description,
          indicatorIds: [...s.indicatorIds],
          insightText: s.insightText,
          insightType: s.insightType,
        })),
      );
      setExpandedStep(0);
      setWizardStep(0);
    }
  }, [template, open]);

  const addStep = () => {
    const newIdx = steps.length;
    setSteps((prev) => [
      ...prev,
      { title: "", description: "", indicatorIds: [], insightText: "", insightType: "info" },
    ]);
    setExpandedStep(newIdx);
  };

  const removeStep = (idx: number) => {
    if (steps.length <= 1) return;
    setSteps((prev) => prev.filter((_, i) => i !== idx));
    setExpandedStep(Math.min(expandedStep, steps.length - 2));
  };

  const updateStep = (idx: number, updates: Partial<StepDraft>) => {
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, ...updates } : s)));
  };

  const toggleIndicator = (stepIdx: number, id: string) => {
    const current = steps[stepIdx].indicatorIds;
    updateStep(stepIdx, {
      indicatorIds: current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    });
  };

  const canProceed = () => {
    if (wizardStep === 0) return title.trim().length > 0;
    if (wizardStep === 1) return steps.every((s) => s.indicatorIds.length > 0);
    return true;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const id = await createJourney({
        title,
        question,
        category,
        is_public: isPublic,
        steps: steps.map((s) => ({
          title: s.title,
          description: s.description,
          indicatorIds: s.indicatorIds,
          insightText: s.insightText,
          insightType: s.insightType,
        })),
      });

      if (!id) throw new Error("save failed");

      toast({
        title: "Percorso creato!",
        description: isPublic
          ? "Visibile a tutti nella community"
          : "Salvato tra i tuoi percorsi privati",
      });
      onCreated?.();
      onClose();

      // Reset
      setWizardStep(0);
      setTitle("");
      setQuestion("");
      setCategory("explore");
      setSteps([
        { title: "", description: "", indicatorIds: [], insightText: "", insightType: "info" },
      ]);
      setExpandedStep(0);
      setIsPublic(false);
    } catch {
      toast({
        title: "Errore",
        description: "Impossibile salvare il percorso",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const totalIndicators = steps.reduce((sum, s) => sum + s.indicatorIds.length, 0);

  const stepLabels = ["Informazioni", "Indicatori"];

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[560px] md:w-[640px] lg:w-[720px] p-0 flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[hsl(213,50%,20%)] to-[hsl(213,50%,28%)] px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[hsl(45,100%,70%)]" />
              <span className="text-sm font-semibold text-white">Nuovo percorso</span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10">
              <X className="h-4 w-4 text-white/70" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="flex gap-2">
            {stepLabels.map((label, i) => (
              <button
                key={i}
                onClick={() => i < wizardStep && setWizardStep(i)}
                className="flex-1 text-left"
                disabled={i > wizardStep}
              >
                <div
                  className={`h-1 rounded-full mb-1.5 transition-colors ${
                    i <= wizardStep ? "bg-primary" : "bg-white/20"
                  }`}
                />
                <span
                  className={`text-[11px] ${
                    i === wizardStep
                      ? "text-white font-semibold"
                      : i < wizardStep
                        ? "text-white/70"
                        : "text-white/30"
                  }`}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* STEP 0: Name + Category + Visibility */}
          {wizardStep === 0 && (
            <div className="space-y-5">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Dai un nome al tuo percorso e scegli il tipo di analisi. Nel passo successivo
                  selezionerai gli indicatori.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Nome del percorso *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="es. Analisi rischio organizzativo"
                  className="h-10"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Domanda guida{" "}
                  <span className="text-muted-foreground font-normal">(opzionale)</span>
                </label>
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="es. Quanto è resiliente la mia organizzazione?"
                  className="h-10"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block">
                  Tipo di percorso
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categoryOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setCategory(opt.value)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        category === opt.value
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <span className="text-xl block mb-1">{opt.icon}</span>
                      <div className="text-xs font-bold text-foreground">{opt.label}</div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block">
                  Visibilità
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsPublic(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      !isPublic
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-foreground">Privato</div>
                      <p className="text-[10px] text-muted-foreground">Solo per te</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setIsPublic(true)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      isPublic
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-foreground">Community</div>
                      <p className="text-[10px] text-muted-foreground">Condiviso con tutti</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Steps + Indicators (accordion) */}
          {wizardStep === 1 && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Ogni tappa rappresenta un'area di analisi. Seleziona almeno un indicatore per
                  ciascuna tappa.
                </p>
              </div>

              {steps.map((s, idx) => {
                const isExpanded = expandedStep === idx;
                return (
                  <div
                    key={idx}
                    className={`border rounded-xl overflow-hidden transition-all ${
                      isExpanded ? "border-primary/40 shadow-sm" : "border-border"
                    }`}
                  >
                    {/* Accordion header */}
                    <button
                      onClick={() => setExpandedStep(isExpanded ? -1 : idx)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition"
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          s.indicatorIds.length > 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-foreground">
                          {s.title || `Tappa ${idx + 1}`}
                        </span>
                        {s.indicatorIds.length > 0 && (
                          <span className="ml-2 text-[10px] text-muted-foreground">
                            {s.indicatorIds.length} indicatori
                          </span>
                        )}
                      </div>
                      {steps.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStep(idx);
                          }}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>

                    {/* Accordion body */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 border-t bg-muted/10">
                        <div className="pt-3">
                          <Input
                            value={s.title}
                            onChange={(e) => updateStep(idx, { title: e.target.value })}
                            placeholder={`Nome tappa (es. "Struttura organico")`}
                            className="h-9 text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                            Indicatori
                          </label>
                          <IndicatorPicker
                            selected={s.indicatorIds}
                            onToggle={(id) => toggleIndicator(idx, id)}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                            Nota/Commento <span className="font-normal">(opzionale)</span>
                          </label>
                          <Input
                            value={s.insightText}
                            onChange={(e) => updateStep(idx, { insightText: e.target.value })}
                            placeholder="Aggiungi un commento per questa tappa..."
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add step button */}
              <button
                onClick={addStep}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 hover:border-primary/50 transition"
              >
                <Plus className="h-4 w-4" />
                Aggiungi tappa
              </button>

              {/* Summary */}
              <div className="flex items-center justify-between px-1 pt-2 text-xs text-muted-foreground border-t">
                <span>
                  {steps.length} {steps.length === 1 ? "tappa" : "tappe"}
                </span>
                <span>{totalIndicators} indicatori selezionati</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-5 py-4 border-t bg-card">
          {wizardStep > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWizardStep((s) => s - 1)}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Indietro
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Annulla
            </Button>
          )}

          {wizardStep < 1 ? (
            <Button
              onClick={() => setWizardStep((s) => s + 1)}
              disabled={!canProceed()}
              className="gap-1.5"
            >
              Avanti <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving || !canProceed()} className="gap-1.5">
              {saving ? "Salvataggio..." : "Crea percorso"} <Sparkles className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
