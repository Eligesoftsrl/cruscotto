import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  variation?: number;
  icon?: LucideIcon;
  accent?: boolean;
}

export const KpiCard = ({ title, value, suffix = "", variation, icon: Icon, accent }: KpiCardProps) => {
  const getTrendIcon = () => {
    if (variation === undefined) return null;
    if (variation > 0) return <TrendingUp className="h-3.5 w-3.5" />;
    if (variation < 0) return <TrendingDown className="h-3.5 w-3.5" />;
    return <Minus className="h-3.5 w-3.5" />;
  };

  const getTrendColor = () => {
    if (variation === undefined) return "";
    if (variation > 0) return "text-kpi-up";
    if (variation < 0) return "text-kpi-down";
    return "text-kpi-neutral";
  };

  return (
    <div className={`kpi-card group ${accent ? "border-accent/30 bg-accent/5" : ""}`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
        {Icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-foreground">{typeof value === 'number' ? value.toLocaleString('it-IT') : value}</span>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
      {variation !== undefined && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>{variation > 0 ? "+" : ""}{variation}%</span>
          <span className="text-muted-foreground font-normal ml-1">vs anno prec.</span>
        </div>
      )}
    </div>
  );
};
