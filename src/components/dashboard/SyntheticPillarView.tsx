import React, { useState, useMemo } from "react";
import { syntheticIndicators } from "./AppSidebar";
import { BottomUpNav } from "./BottomUpNav";
import { QuadroSinotticoView } from "./sections/QuadroSinotticoView";
import { executiveIndicesStatic } from "./executive/executiveData";
import { ExecutiveKpiCard } from "./executive/ExecutiveKpiCards";
import type { ExecutiveIndex } from "./executive/ExecutiveKpiCards";
import { useD1Calculations } from "@/hooks/useD1Calculations";
import { useAuth } from "@/contexts/AuthContext";
import { useFilters } from "@/contexts/FilterContext";
import { TrendingUp, TrendingDown, Minus, ArrowRight, ChevronDown, ExternalLink, Info, FileText } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend,
} from "recharts";

const pillarMeta: Record<string, { label: string; description: string; color: string }> = {
  D1: { label: "Rilevazione e classificazione", description: "Adozione catalogo, profili professionali, competenze e ruoli dell'organizzazione", color: "hsl(var(--chart-blue))" },
  D2: { label: "Programmazione fabbisogno", description: "Governo strategico del fabbisogno, dotazione organica e pianificazione triennale", color: "hsl(var(--chart-teal))" },
  D3: { label: "Recruiting", description: "Attrazione, selezione, tempi procedurali e copertura posti nelle procedure concorsuali", color: "hsl(var(--chart-green))" },
  D4: { label: "Sviluppo professionale", description: "Copertura formativa, competenze digitali, efficacia Syllabus e diversificazione percorsi", color: "hsl(var(--chart-orange))" },
  D5: { label: "Rewarding e carriera", description: "Dinamicità delle progressioni di carriera e crescita stipendiale", color: "hsl(var(--chart-purple))" },
  D6: { label: "Capacity building e performance", description: "Efficienza organizzativa, digitalizzazione, flessibilità e qualità dei processi", color: "hsl(var(--chart-red))" },
};

function mockTrend(id: string, value: number): { anno: number; valore: number }[] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return [2019, 2020, 2021, 2022, 2023].map((anno, i) => ({
    anno,
    valore: Math.round((value - 0.12 + i * 0.03 + (Math.abs(h >> (i * 3)) % 5) / 100) * 100),
  }));
}

const DeltaIcon = ({ diff }: { diff: number }) => {
  if (diff > 0) return <TrendingUp className="h-3 w-3" />;
  if (diff < 0) return <TrendingDown className="h-3 w-3" />;
  return <Minus className="h-3 w-3" />;
};

interface SyntheticPillarViewProps {
  pillar: string;
  selectedIndicator?: string;
  onSelectIndicator?: (indicatorId: string) => void;
  onGoExecutive?: () => void;
}

export const SyntheticPillarView = ({ pillar, selectedIndicator, onSelectIndicator, onGoExecutive }: SyntheticPillarViewProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(selectedIndicator ?? null);
  const [showMethodology, setShowMethodology] = useState(false);
  const { profile } = useAuth();
  const { filters } = useFilters();

  // Dynamic D1 calculations from DB
  const d1Filters = useMemo(() => ({
    comparto: filters.comparto,
    regione: filters.regione,
    dimensione_pa: filters.dimensione_pa,
    anno: filters.anno,
    ente_id: profile?.role === "ente_hr" ? profile.ente_id : null,
  }), [filters, profile]);

  const { data: d1Data } = useD1Calculations(d1Filters);

  // Merge dynamic D1 data into static indices (same logic as ExecutiveView)
  const allIndices = useMemo(() => {
    if (!d1Data) return executiveIndicesStatic;
    const d1Ids = ["IAC", "IIMP/R", "ICPR", "ICVC", "IACU"] as const;
    return executiveIndicesStatic.map((idx) => {
      if (d1Ids.includes(idx.id as typeof d1Ids[number]) && d1Data[idx.id as keyof typeof d1Data]) {
        const dyn = d1Data[idx.id as keyof typeof d1Data];
        return {
          ...idx,
          value: dyn.value,
          prev: dyn.prev,
          subIndicators: dyn.subIndicators,
          assessment: dyn.assessment,
          ...(dyn.formulaBreakdown ? { formulaBreakdown: dyn.formulaBreakdown } : {}),
          ...(dyn.context ? { context: dyn.context } : {}),
        };
      }
      return idx;
    });
  }, [d1Data]);

  // Get ALL indicators for this pillar from merged data (not static)
  const syntheticFromData = useMemo(() => {
    return allIndices.filter(
      (idx) => idx.pillar === pillar
    );
  }, [pillar, allIndices]);

  // Fallback: sidebar synthetic list for indicators NOT in executiveData
  const sidebarIndicators = syntheticIndicators[pillar] || [];

  // Build enriched list: use real data from executiveData when available, mock otherwise
  const enriched = useMemo(() => {
    return sidebarIndicators.map((ind) => {
      const fromData = syntheticFromData.find(
        (d) => d.id === ind.id || d.id.replace("/", "-") === ind.id || ind.id.replace("-", "/") === d.id
      );
      if (fromData) {
        return {
          id: ind.id,
          label: ind.label,
          value: fromData.value,
          prev: fromData.prev,
          target: Math.min(1, fromData.value + 0.15),
          hasRealData: true,
          formulaBreakdown: fromData.formulaBreakdown,
          context: fromData.context,
          formula: fromData.formula,
        };
      }
      // Mock fallback for indicators not yet in executiveData
      let h = 0;
      for (let i = 0; i < ind.id.length; i++) h = ((h << 5) - h + ind.id.charCodeAt(i)) | 0;
      const v = 0.3 + (Math.abs(h) % 55) / 100;
      const prev = Math.max(0.1, v - 0.02 + (Math.abs(h >> 4) % 8) / 100);
      const target = Math.min(1, v + 0.05 + (Math.abs(h >> 8) % 10) / 100);
      return {
        id: ind.id,
        label: ind.label,
        value: +v.toFixed(3),
        prev: +prev.toFixed(3),
        target: +target.toFixed(3),
        hasRealData: false,
        formulaBreakdown: undefined as any,
        context: undefined as any,
        formula: undefined as string | undefined,
      };
    });
  }, [sidebarIndicators, syntheticFromData]);
  // Sync with external navigation (sidebar clicks or deep-link)
  const prevExtRef = React.useRef<string | undefined>(undefined);
  React.useEffect(() => {
    if (selectedIndicator && selectedIndicator !== prevExtRef.current) {
      setSelectedId(selectedIndicator);
      setTimeout(() => {
        document.getElementById(`synth-card-${selectedIndicator}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    }
    prevExtRef.current = selectedIndicator;
  }, [selectedIndicator]);

  const meta = pillarMeta[pillar] || { label: pillar, description: "", color: "hsl(var(--primary))" };
  const indicators = syntheticIndicators[pillar] || [];

  const barData = enriched.map((ind) => ({
    id: ind.id,
    label: ind.label,
    value: Math.round(ind.value * 100),
    target: Math.round(ind.target * 100),
  }));

  const selectedInd = enriched.find((ind) => ind.id === selectedId);

  const handleCardClick = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-6 space-y-6 flex-1">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-[18px] font-bold"
          style={{ background: `${meta.color}15`, color: meta.color }}
        >
          {pillar}
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">{meta.label}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{meta.description}</p>
        </div>
        <button
          onClick={() => setShowMethodology((v) => !v)}
          className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
            showMethodology
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <FileText className="h-4 w-4" />
          Quadro Sinottico
        </button>
      </div>

      {/* ── Methodology Sheet ── */}
      {showMethodology && (
        <QuadroSinotticoView pillar={pillar} />
      )}

      {/* ── Summary Bar Chart with highlight ── */}
      {barData.length > 1 && (
        <div className="tableau-card">
          <div className="tableau-card-header flex items-center justify-between">
            <span>Panoramica Indicatori · {pillar}</span>
            {selectedId && (
              <button
                onClick={() => setSelectedId(null)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Mostra tutti
              </button>
            )}
          </div>
          <div className="tableau-card-body">
            <div style={{ height: Math.max(200, barData.length * 38) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: number) => `${v}%`} />
                  <YAxis type="category" dataKey="id" tick={{ fontSize: 13, fill: "hsl(var(--foreground))", fontWeight: 700 }} width={65} />
                  <Tooltip
                    contentStyle={{ fontSize: 13, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    formatter={(v: number, name: string) => [`${v}%`, name === "value" ? "Attuale" : "Target"]}
                    labelFormatter={(label: string) => barData.find((d) => d.id === label)?.label || label}
                  />
                  <Bar dataKey="value" name="Attuale" fill={meta.color} radius={[0, 3, 3, 0]} barSize={16}>
                    {barData.map((d, i) => {
                      const isSelected = !selectedId || d.id === selectedId;
                      const baseColor = d.value >= d.target * 0.9 ? meta.color : "hsl(var(--chart-orange))";
                      return (
                        <Cell
                          key={i}
                          fill={baseColor}
                          fillOpacity={isSelected ? 1 : 0.2}
                          cursor="pointer"
                          onClick={() => handleCardClick(d.id)}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Selected Indicator Detail Panel — uses full ExecutiveKpiCard ── */}
      {selectedInd && (() => {
        const fullIdx = syntheticFromData.find(
          (d) => d.id === selectedInd.id || d.id.replace("/", "-") === selectedInd.id || selectedInd.id.replace("-", "/") === d.id
        );

        return (
          <div className="space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
            {/* Full card with variant="synthetic" for complete detail */}
            {fullIdx ? (
              <ExecutiveKpiCard idx={fullIdx} variant="synthetic" />
            ) : (
              /* Fallback for indicators not in executiveData */
              <div className="tableau-card" style={{ borderLeft: `4px solid ${meta.color}` }}>
                <div className="tableau-card-header flex items-center gap-2">
                  <span className="font-bold">{selectedInd.id}</span>
                  <span className="text-muted-foreground">·</span>
                  <span>{selectedInd.label}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-tableau-number text-foreground">{Math.round(selectedInd.value * 100)}%</span>
                    {(() => {
                      const diff = selectedInd.value - selectedInd.prev;
                      const diffColor = diff > 0 ? "hsl(var(--chart-green))" : diff < 0 ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))";
                      return (
                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold pb-1" style={{ color: diffColor }}>
                          <DeltaIcon diff={diff} />
                          {diff > 0 ? "+" : ""}{(diff * 100).toFixed(1)}pp vs 2022
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Trend chart below the card */}
            <div className="tableau-card" style={{ borderLeft: `4px solid ${meta.color}` }}>
              <div className="tableau-card-header">Trend Storico · {selectedInd.id}</div>
              <div className="tableau-card-body">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockTrend(selectedInd.id, selectedInd.value)} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                      <XAxis dataKey="anno" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: number) => `${v}%`} />
                      <Tooltip
                        contentStyle={{ fontSize: 13, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                        formatter={(v: number) => [`${v}%`, "Valore"]}
                      />
                      <Line type="monotone" dataKey="valore" stroke={meta.color} strokeWidth={2.5} dot={{ r: 4, fill: meta.color, stroke: "hsl(var(--card))", strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Indicator Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {enriched.map((ind) => {
          const pct = Math.round(ind.value * 100);
          const tgtPct = Math.round(ind.target * 100);
          const diff = ind.value - ind.prev;
          const isGood = ind.value >= ind.target * 0.9;
          const isSelected = selectedId === ind.id;
          const isDimmed = selectedId !== null && !isSelected;
          const diffColor = diff > 0 ? "hsl(var(--chart-green))" : diff < 0 ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))";

          return (
            <button
              id={`synth-card-${ind.id}`}
              key={ind.id}
              onClick={() => handleCardClick(ind.id)}
              aria-pressed={isSelected}
              className={`tableau-card text-left transition-all group relative ${
                isSelected
                  ? "ring-2 ring-primary shadow-md"
                  : isDimmed
                  ? "opacity-40 hover:opacity-70"
                  : "hover:shadow-md"
              }`}
              style={{ borderTop: `3px solid ${isGood ? meta.color : "hsl(var(--chart-orange))"}` }}
            >
              {isSelected && (
                <div className="absolute -top-1 right-3">
                  <ChevronDown className="h-4 w-4 text-primary animate-bounce" />
                </div>
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">{ind.id}</span>
                    <h3 className="text-sm font-semibold text-foreground leading-tight mt-0.5">{ind.label}</h3>
                  </div>
                  <ArrowRight className={`h-4 w-4 flex-shrink-0 mt-0.5 transition-colors ${
                    isSelected ? "text-primary" : "text-muted-foreground/30 group-hover:text-primary"
                  }`} />
                </div>

                <div className="flex items-end justify-between">
                  <span className="text-2xl font-tableau-number text-foreground">{pct}%</span>
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold" style={{ color: diffColor }}>
                    <DeltaIcon diff={diff} />
                    {diff > 0 ? "+" : ""}{(diff * 100).toFixed(1)}pp
                  </span>
                </div>

                <div className="relative h-2 bg-muted rounded-sm overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-sm"
                    style={{ width: `${pct}%`, background: isGood ? meta.color : "hsl(var(--chart-orange))" }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5"
                    style={{ left: `${tgtPct}%`, background: "hsl(var(--foreground))" }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {indicators.length === 0 && (
        <div className="tableau-card">
          <div className="p-10 text-center">
            <Info className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nessun indicatore sintetico configurato per {pillar}</p>
          </div>
        </div>
      )}

      <BottomUpNav currentLevel="synthetic" pillar={pillar} onGoExecutive={onGoExecutive} />
    </div>
  );
};
