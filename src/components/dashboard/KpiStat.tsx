import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface KpiStatProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  color?: string;
  sub?: ReactNode;
}

/** Card KPI riutilizzabile (sostituisce le griglie di card duplicate nelle sezioni). */
export const KpiStat = ({ label, value, icon: Icon, color, sub }: KpiStatProps) => (
  <div className="bg-card border rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </div>
      <Icon className="h-4 w-4" style={color ? { color } : undefined} />
    </div>
    <div className="text-xl font-bold text-foreground mt-1">{value}</div>
    {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
  </div>
);

/** Griglia responsive per le KPI card. */
export const KpiGrid = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{children}</div>
);
