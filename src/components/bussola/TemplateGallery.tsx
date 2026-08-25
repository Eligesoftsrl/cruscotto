import { Copy, BookOpen, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { journeyTemplates, type JourneyTemplate } from "@/data/journeyTemplates";

interface TemplateGalleryProps {
  onSelectTemplate: (template: JourneyTemplate) => void;
}

const categoryConfig = {
  attention: { label: "Allerta", color: "bg-destructive/10 text-destructive border-destructive/30" },
  explore: { label: "Analisi", color: "bg-primary/10 text-primary border-primary/30" },
  plan: { label: "Programmazione", color: "bg-[hsl(142,71%,90%)] text-[hsl(142,71%,30%)] border-[hsl(142,71%,60%)]" },
};

const difficultyConfig = {
  base: { label: "Base", color: "bg-[hsl(142,71%,90%)] text-[hsl(142,71%,30%)]" },
  intermedio: { label: "Intermedio", color: "bg-[hsl(45,100%,90%)] text-[hsl(45,100%,30%)]" },
  avanzato: { label: "Avanzato", color: "bg-destructive/10 text-destructive" },
};

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-foreground mb-1">Template predefiniti</h3>
        <p className="text-xs text-muted-foreground">Scegli un modello come punto di partenza e personalizzalo nel wizard di creazione</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {journeyTemplates.map(tpl => {
          const catCfg = categoryConfig[tpl.category];
          const diffCfg = difficultyConfig[tpl.difficulty];
          const totalIndicators = tpl.steps.reduce((sum, s) => sum + s.indicatorIds.length, 0);

          return (
            <div
              key={tpl.id}
              className="border rounded-xl p-4 bg-card hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={`text-[9px] ${catCfg.color}`}>{catCfg.label}</Badge>
                <Badge variant="secondary" className={`text-[9px] ${diffCfg.color}`}>{diffCfg.label}</Badge>
              </div>

              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg">{tpl.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-foreground leading-tight">{tpl.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tpl.question}</p>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground/80 leading-snug mb-3 line-clamp-2">{tpl.description}</p>

              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                <span className="flex items-center gap-0.5">
                  <BookOpen className="h-3 w-3" />
                  {tpl.steps.length} tappe
                </span>
                <span>·</span>
                <span>{totalIndicators} indicatori</span>
              </div>

              {tpl.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap mb-3">
                  <Tag className="h-3 w-3 text-muted-foreground/40" />
                  {tpl.tags.map(tag => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{tag}</span>
                  ))}
                </div>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelectTemplate(tpl)}
                className="w-full text-xs h-8 gap-1.5"
              >
                <Copy className="h-3 w-3" /> Usa come base
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
