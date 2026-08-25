import { ClipboardList, Target, PenTool, BookOpen, Star, BarChart2 } from "lucide-react";
import { dimensioni } from "@/data/mockData";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  clipboard: ClipboardList,
  target: Target,
  pencil: PenTool,
  "book-open": BookOpen,
  star: Star,
  "bar-chart-2": BarChart2,
};

interface DimensionNavProps {
  active: string;
  onChange: (id: string) => void;
}

export const DimensionNav = ({ active, onChange }: DimensionNavProps) => {
  return (
    <div className="flex items-stretch gap-1 border-b bg-card px-4 pt-3">
      {dimensioni.map((d) => {
        const Icon = iconMap[d.icon];
        const isActive = active === d.id;
        return (
          <button
            key={d.id}
            onClick={() => onChange(d.id)}
            className={`group flex flex-col items-center gap-1.5 rounded-t-lg px-5 py-3 text-center transition-all min-w-[120px] ${
              isActive
                ? "border border-b-0 border-primary bg-background shadow-sm"
                : "border border-transparent hover:bg-muted/60"
            }`}
          >
            {Icon && (
              <Icon
                className={`h-5 w-5 ${
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
            )}
            <span
              className={`text-xs font-semibold leading-tight ${
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              }`}
            >
              {d.id}
            </span>
            <span
              className={`text-[10px] leading-tight max-w-[100px] ${
                isActive ? "text-foreground" : "text-muted-foreground/70"
              }`}
            >
              {d.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
