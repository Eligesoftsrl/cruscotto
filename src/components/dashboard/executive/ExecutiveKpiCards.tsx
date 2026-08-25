import React, { useState } from "react";
import { ArrowRight, Info, ChevronDown, Link2, Search, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { PillarConnection } from "./executiveInterconnessioni";
import { PILLAR_COLORS } from "./executiveInterconnessioni";
import type { DrilldownData } from "@/hooks/useD1Calculations";

/* ── Gauge Arc ── */
export const GaugeArc = ({ value, color, size = 80 }: { value: number; color: string; size?: number }) => {
  const r = size * 0.38;
  const circumference = Math.PI * r;
  const dashLen = value * circumference;
  return (
    <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
      <path
        d={`M ${size * 0.1} ${size * 0.55} A ${r} ${r} 0 1 1 ${size * 0.9} ${size * 0.55}`}
        fill="none" stroke="hsl(var(--muted))" strokeWidth={size * 0.08} strokeLinecap="round"
      />
      <path
        d={`M ${size * 0.1} ${size * 0.55} A ${r} ${r} 0 1 1 ${size * 0.9} ${size * 0.55}`}
        fill="none" stroke={color} strokeWidth={size * 0.08} strokeLinecap="round"
        strokeDasharray={`${dashLen} ${circumference}`}
      />
      <text x={size / 2} y={size * 0.48} textAnchor="middle" className="font-bold" style={{ fontSize: size * 0.2, fill: "hsl(var(--foreground))" }}>
        {value.toFixed(2).replace(".", ",")}
      </text>
    </svg>
  );
};

/* ── Sub-indicator bar ── */
export const SubIndicatorBar = ({ label, value, color }: { label: string; value: number; color: string }) => {
  const isLow = value < 0.5;
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="text-sm font-medium text-muted-foreground w-24 text-right shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value * 100}%`, background: color }} />
      </div>
      <span className={`text-sm font-bold w-10 text-right ${isLow ? "text-[hsl(var(--chart-orange))]" : "text-foreground"}`}>
        {value.toFixed(2).replace(".", ",")}
      </span>
    </div>
  );
};

/* ── Bullet Bar (target vs actual) ── */
export const BulletBar = ({ actual, target, max = 100 }: { actual: number; target: number; max?: number }) => {
  const aPct = (actual / max) * 100;
  const tPct = (target / max) * 100;
  const isGood = actual >= target * 0.9;
  return (
    <div className="relative h-5 w-full bg-muted rounded-sm overflow-hidden">
      <div className="absolute inset-0 flex">
        <div className="h-full" style={{ width: "33%", background: "hsl(var(--muted))" }} />
        <div className="h-full" style={{ width: "34%", background: "hsl(var(--muted) / 0.6)" }} />
        <div className="h-full" style={{ width: "33%", background: "hsl(var(--muted) / 0.3)" }} />
      </div>
      <div className="absolute top-1 bottom-1 left-0 rounded-sm" style={{ width: `${aPct}%`, background: isGood ? "hsl(var(--chart-blue))" : "hsl(var(--chart-orange))" }} />
      <div className="absolute top-0 bottom-0 w-0.5" style={{ left: `${tPct}%`, background: "hsl(var(--foreground))" }} />
    </div>
  );
};

/* ── Formula Breakdown type ── */
export interface FormulaBreakdown {
  numeratorLabel: string;
  numeratorValue: number;
  denominatorLabel: string;
  denominatorValue: number;
  resultLabel: string;
  resultText: string;
  numeratorDrilldown?: DrilldownData;
  denominatorDrilldown?: DrilldownData;
}

/* ── Drilldown Table (inline expandable) ── */
const DrilldownTable = ({ data }: { data: DrilldownData }) => {
  const [search, setSearch] = useState("");
  const filtered = search
    ? data.rows.filter(r => 
        r.label.toLowerCase().includes(search.toLowerCase()) ||
        String(r.id).includes(search) ||
        Object.values(r.extra ?? {}).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
      )
    : data.rows;

  return (
    <div className="space-y-2 animate-in fade-in-0 slide-in-from-top-1 duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-primary">{data.title}</span>
        <span className="text-xs text-muted-foreground">{filtered.length} record</span>
      </div>
      {data.rows.length > 5 && (
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cerca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-xs rounded border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}
      <div className="max-h-[300px] overflow-auto rounded border border-border">
        <table className="w-full text-xs">
          <thead className="bg-muted/60 sticky top-0">
            <tr>
              {data.columns.map(col => (
                <th key={col.key} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((row, i) => (
              <tr key={row.id ?? i} className="hover:bg-muted/30 transition-colors">
                {data.columns.map(col => {
                  let val: string | number = "";
                  if (col.key === "id") val = row.id;
                  else if (col.key === "label") val = row.label;
                  else if (col.key === "value") val = row.value ?? "";
                  else val = row.extra?.[col.key] ?? "";
                  return (
                    <td key={col.key} className="px-3 py-1.5 text-foreground whitespace-nowrap">
                      {typeof val === "number" && val >= 1000 ? val.toLocaleString("it-IT") : val}
                    </td>
                  );
                })}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={data.columns.length} className="px-3 py-4 text-center text-muted-foreground">Nessun risultato</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export interface ContextInfo {
  label: string;
  value: number;
  text: string;
}

/* ── Indicator level: executive (composite/strategic) vs synthetic (atomic component) vs operative/gestionale ── */
export type IndicatorLevel = "executive" | "synthetic" | "operative" | "gestionale";

/* ── Executive Index type ── */
export interface ExecutiveIndex {
  id: string;
  label: string;
  pillar: string;
  value: number;
  prev: number;
  color: string;
  fonte: string;
  formula: string;
  subIndicators: { key: string; value: number; color: string }[];
  assessment: { level: string; color: string; text: string };
  dynamic?: boolean;
  indicatorLevel?: IndicatorLevel;
  isPlaceholder?: boolean;
  formulaBreakdown?: FormulaBreakdown;
  context?: ContextInfo;
  metodologia?: {
    definizione: string;
    calcolo: string;
    interpretazione: string;
    note?: string;
  };
  interconnections?: {
    connections: PillarConnection[];
    bridgeNote?: string;
  };
}

/* ── Methodology Tab Names ── */
const TABS = ["Definizione", "Calcolo", "Lettura", "Note"] as const;
type TabKey = typeof TABS[number];
const TAB_FIELD_MAP: Record<TabKey, keyof NonNullable<ExecutiveIndex["metodologia"]>> = {
  "Definizione": "definizione",
  "Calcolo": "calcolo",
  "Lettura": "interpretazione",
  "Note": "note",
};

/* ── Methodology Panel ── */
const MetodologiaPanel = ({ metodologia }: { metodologia: NonNullable<ExecutiveIndex["metodologia"]> }) => {
  const [tab, setTab] = useState<TabKey>("Definizione");
  const availableTabs = TABS.filter((t) => {
    const field = TAB_FIELD_MAP[t];
    return metodologia[field] && metodologia[field]!.trim().length > 0;
  });
  const content = metodologia[TAB_FIELD_MAP[tab]] || "";

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5 flex-wrap">
        {availableTabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              tab === t
                ? "bg-primary text-primary-foreground"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
};

/* ── Executive KPI Card ── */
export const ExecutiveKpiCard = ({ idx, onDrillDown, variant = "executive", ...rest }: { idx: ExecutiveIndex; onDrillDown?: (pillar: string, indicatorId?: string) => void; variant?: "executive" | "synthetic" } & React.HTMLAttributes<HTMLDivElement>) => {
  const [open, setOpen] = useState(false);
  const isCompact = variant === "executive";

  /* ════════════════════════════════════════════════════
   * EXECUTIVE (compact): valore + gauge + assessment badge inline + interconnessioni + drill-down
   * Nessuna formula, nessun breakdown, nessuna metodologia
   * ════════════════════════════════════════════════════ */
  if (isCompact) {
    const isClickable = !!onDrillDown;
    return (
      <div
        className={`tableau-card border-t-2 flex flex-col group transition-all ${idx.isPlaceholder ? "opacity-60 border-dashed" : ""} ${isClickable ? "cursor-pointer hover:shadow-lg hover:-translate-y-0.5" : ""}`}
        style={{ borderTopColor: idx.color }}
        onClick={() => onDrillDown?.(idx.pillar, idx.id)}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onDrillDown?.(idx.pillar, idx.id); } } : undefined}
        {...rest}
      >
        <div className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-foreground">{idx.id}</span>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: `${idx.color}20`, color: idx.color }}>
                  {idx.pillar}
                </span>
                {idx.isPlaceholder && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-dashed border-border">
                    Placeholder
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-tight">{idx.label}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <div className="text-right">
                <span className="text-3xl font-bold text-foreground">{idx.value.toFixed(2).replace(".", ",")}</span>
                <div className="text-xs text-muted-foreground">Score [0-1]</div>
              </div>
              <GaugeArc value={idx.value} color={idx.color} size={64} />
            </div>
          </div>
        </div>

        {/* Assessment badge inline */}
        <div className="mx-4 mb-2 flex items-center gap-2">
          <span className="shrink-0 px-2.5 py-1 rounded text-xs font-bold text-primary-foreground" style={{ background: idx.assessment.color }}>
            {idx.assessment.level}
          </span>
          <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{idx.assessment.text}</p>
        </div>

        {/* Interconnessioni (compatte) */}
        {idx.interconnections && idx.interconnections.connections.length > 0 && (
          <div className="mx-4 mb-2">
            <TooltipProvider delayDuration={200}>
              <div className="flex flex-wrap gap-1">
                {idx.interconnections.connections.map((c) => (
                  <Tooltip key={c.pillar}>
                    <TooltipTrigger asChild>
                    <span
                        className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold border border-border/40 bg-card cursor-help"
                        style={{ borderLeftWidth: 2, borderLeftColor: PILLAR_COLORS[c.pillar] }}
                      >
                        <span style={{ color: PILLAR_COLORS[c.pillar] }}>{c.pillar}</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[280px] p-3">
                      <p className="text-xs font-semibold text-foreground mb-0.5">{c.label}</p>
                      <p className="text-xs text-muted-foreground">{c.reason}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>
        )}

        <div className="px-4 pb-3 mt-auto">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:underline">
            <ArrowRight className="h-3.5 w-3.5" /> Approfondisci
          </span>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════
   * SYNTHETIC (dettagliata): tutto il contenuto come da specifica
   * Formula, breakdown, contesto, sub-indicators, metodologia, interconnessioni
   * ════════════════════════════════════════════════════ */
  return (
    <div className={`tableau-card border-t-2 flex flex-col ${idx.isPlaceholder ? "opacity-60 border-dashed" : ""}`} style={{ borderTopColor: idx.color }} {...rest}>
      <div className="p-4 pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-foreground">{idx.id}</span>
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: `${idx.color}20`, color: idx.color }}>
                {idx.pillar}
              </span>
              {idx.isPlaceholder && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-dashed border-border">
                  Placeholder
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-tight whitespace-pre-line">{idx.label}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">{idx.fonte}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-3">
            <div className="text-right">
              <span className="text-4xl font-bold text-foreground">{idx.value.toFixed(2).replace(".", ",")}</span>
              <div className="text-xs text-muted-foreground">Score [0-1]</div>
            </div>
            <GaugeArc value={idx.value} color={idx.color} size={80} />
          </div>
        </div>
      </div>

      {/* Formula */}
      <div className="mx-4 mb-3 px-3 py-2 rounded border border-border/50 bg-muted/30">
        <code className="text-xs text-muted-foreground font-mono leading-tight">{idx.formula}</code>
      </div>

      {/* Scomposizione formula — clickable drill-down */}
      {idx.formulaBreakdown && (() => {
        const fb = idx.formulaBreakdown;
        const [drillNum, setDrillNum] = React.useState(false);
        const [drillDen, setDrillDen] = React.useState(false);
        const fmtVal = (v: number) => v >= 1000 ? v.toLocaleString("it-IT") : v;
        const hasNumDrill = !!fb.numeratorDrilldown;
        const hasDenDrill = !!fb.denominatorDrilldown;

        return (
          <div className="mx-4 mb-3 px-3 py-3 rounded border border-primary/20 bg-primary/5 space-y-2">
            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Scomposizione formula</div>
            
            {/* Numerator row */}
            <button
              onClick={hasNumDrill ? () => { setDrillNum(!drillNum); setDrillDen(false); } : undefined}
              disabled={!hasNumDrill}
              className={`flex items-center justify-between w-full text-left rounded px-2 py-1.5 -mx-2 transition-colors ${
                hasNumDrill ? "hover:bg-primary/10 cursor-pointer group" : ""
              } ${drillNum ? "bg-primary/10" : ""}`}
            >
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                {fb.numeratorLabel}
                {hasNumDrill && <Search className="h-3 w-3 text-primary/50 group-hover:text-primary transition-colors" />}
              </span>
              <span className={`text-sm font-bold ${hasNumDrill ? "text-primary underline decoration-dotted underline-offset-2" : "text-foreground"}`}>
                {fmtVal(fb.numeratorValue)}
                {hasNumDrill && (drillNum ? <ChevronUp className="inline h-3 w-3 ml-1" /> : <ChevronDown className="inline h-3 w-3 ml-1" />)}
              </span>
            </button>
            {drillNum && fb.numeratorDrilldown && (
              <div className="ml-1 mr-1 mb-1">
                <DrilldownTable data={fb.numeratorDrilldown} />
              </div>
            )}

            {/* Denominator row */}
            <button
              onClick={hasDenDrill ? () => { setDrillDen(!drillDen); setDrillNum(false); } : undefined}
              disabled={!hasDenDrill}
              className={`flex items-center justify-between w-full text-left rounded px-2 py-1.5 -mx-2 transition-colors ${
                hasDenDrill ? "hover:bg-primary/10 cursor-pointer group" : ""
              } ${drillDen ? "bg-primary/10" : ""}`}
            >
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                {fb.denominatorLabel}
                {hasDenDrill && <Search className="h-3 w-3 text-primary/50 group-hover:text-primary transition-colors" />}
              </span>
              <span className={`text-sm font-bold ${hasDenDrill ? "text-primary underline decoration-dotted underline-offset-2" : "text-foreground"}`}>
                {fmtVal(fb.denominatorValue)}
                {hasDenDrill && (drillDen ? <ChevronUp className="inline h-3 w-3 ml-1" /> : <ChevronDown className="inline h-3 w-3 ml-1" />)}
              </span>
            </button>
            {drillDen && fb.denominatorDrilldown && (
              <div className="ml-1 mr-1 mb-1">
                <DrilldownTable data={fb.denominatorDrilldown} />
              </div>
            )}

            {/* Result */}
            <div className="border-t border-primary/20 pt-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-primary">{fb.resultLabel}</span>
              <span className="text-sm font-bold text-primary">{fb.resultText}</span>
            </div>
          </div>
        );
      })()}

      {/* Contesto */}
      {idx.context && (
        <div className="mx-4 mb-3 px-3 py-2.5 rounded border border-border/30 bg-muted/20">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Contesto</div>
          <p className="text-sm text-muted-foreground">{idx.context.text}</p>
        </div>
      )}

      {/* Sub-indicators */}
      {idx.subIndicators.length > 0 && (
        <div className="px-4 pb-3 space-y-0">
          {idx.subIndicators.map((sub) => (
            <SubIndicatorBar key={sub.key} label={sub.key} value={sub.value} color={sub.color} />
          ))}
        </div>
      )}

      {/* Assessment */}
      <div className="mx-4 mb-3 p-3 rounded bg-muted/40 border border-border/30">
        <div className="flex items-start gap-2">
          <span className="shrink-0 px-2.5 py-1 rounded text-xs font-bold text-primary-foreground" style={{ background: idx.assessment.color }}>
            {idx.assessment.level}
          </span>
          <p className="text-sm text-muted-foreground leading-snug">{idx.assessment.text}</p>
        </div>
      </div>

      {/* Scheda metodologica */}
      {idx.metodologia && (
        <Collapsible open={open} onOpenChange={setOpen} className="mx-4 mb-3">
          <CollapsibleTrigger className="flex items-center gap-1.5 w-full px-3 py-2 rounded border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors text-left">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-semibold text-primary flex-1">Scheda metodologica</span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 px-3 py-2.5 rounded border border-border/30 bg-muted/20">
            <MetodologiaPanel metodologia={idx.metodologia} />
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Interconnessioni */}
      {idx.interconnections && idx.interconnections.connections.length > 0 && (
        <div className="mx-4 mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interconnessioni</span>
          </div>
          <TooltipProvider delayDuration={200}>
            <div className="flex flex-wrap gap-1.5">
              {idx.interconnections.connections.map((c) => (
                <Tooltip key={c.pillar}>
                  <TooltipTrigger asChild>
                    <button
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border/40 bg-card hover:bg-muted/50 transition-colors cursor-help"
                      style={{ borderLeftWidth: 3, borderLeftColor: PILLAR_COLORS[c.pillar] }}
                    >
                      <span className="text-xs font-bold" style={{ color: PILLAR_COLORS[c.pillar] }}>{c.pillar}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">{c.label}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[300px] p-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: `${PILLAR_COLORS[c.pillar]}20`, color: PILLAR_COLORS[c.pillar] }}>{c.pillar}</span>
                        <span className="text-sm font-semibold text-foreground">{c.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{c.reason}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
          {idx.interconnections.bridgeNote && (
            <p className="mt-1.5 text-xs text-primary/80 italic leading-snug">🔗 {idx.interconnections.bridgeNote}</p>
          )}
        </div>
      )}

      <div className="px-4 pb-3 mt-auto">
        <button
          onClick={() => onDrillDown?.(idx.pillar)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowRight className="h-3.5 w-3.5" /> Dettaglio {idx.pillar}
        </button>
      </div>
    </div>
  );
};
