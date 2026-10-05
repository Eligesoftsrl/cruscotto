import { Loader2 } from "lucide-react";

export const PIE_COLORS = [
  "hsl(210, 64%, 30%)", "hsl(330, 55%, 55%)", "hsl(40, 90%, 55%)",
  "hsl(120, 45%, 45%)", "hsl(210, 64%, 50%)", "hsl(175, 60%, 50%)",
  "hsl(0, 60%, 55%)", "hsl(270, 50%, 55%)",
];
export const BAR_COLOR = "hsl(175, 60%, 50%)";
export const TOOLTIP_STYLE = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
} as const;

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

export const KpiBox = ({ label, value }: { label: string; value: number | string }) => (
  <div className="bg-card border rounded-lg p-4">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{label}</div>
    <div className="text-xl font-bold text-foreground">
      {typeof value === "number" ? value.toLocaleString("it-IT") : value}
    </div>
  </div>
);

export const ErrorBox = ({ error }: { error: unknown }) => (
  <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 text-sm">
    Errore nel caricamento dei dati: {error instanceof Error ? error.message : "sconosciuto"}
  </div>
);

export const Pager = ({
  page, totalPages, onPage, total,
}: { page: number; totalPages: number; onPage: (p: number) => void; total: number }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-2">
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(0)} disabled={page === 0} className="px-2 py-1 text-xs rounded border disabled:opacity-40">«</button>
        <button onClick={() => onPage(Math.max(0, page - 1))} disabled={page === 0} className="px-2 py-1 text-xs rounded border disabled:opacity-40">‹</button>
        <span className="px-2 text-[11px] text-muted-foreground">Pag. {page + 1} di {totalPages}</span>
        <button onClick={() => onPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-2 py-1 text-xs rounded border disabled:opacity-40">›</button>
        <button onClick={() => onPage(totalPages - 1)} disabled={page >= totalPages - 1} className="px-2 py-1 text-xs rounded border disabled:opacity-40">»</button>
      </div>
      <span className="text-[11px] text-muted-foreground">{total} elementi</span>
    </div>
  );
};
