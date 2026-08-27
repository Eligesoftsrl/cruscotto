import React, { useMemo } from "react";
import { Target, Activity, Award, BarChart3, Layers, Route } from "lucide-react";
import { pillarToJourney } from "@/data/guidedJourneys";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useFilters } from "@/contexts/FilterContext";
import { ExecutiveKpiCard } from "./executive/ExecutiveKpiCards";
import { BulletBar } from "./executive/ExecutiveKpiCards";
import { KpiPositioningMatrix } from "./executive/KpiPositioningMatrix";
import {
  executiveIndicesStatic,
  radarData,
  kpiSuccessData,
  trendData,
} from "./executive/executiveData";
import { useD1Calculations } from "@/hooks/useD1Calculations";

/* ── Dimension grouping config — 6 Pillar ── */
const dimensionGroups = [
  {
    id: "D1",
    label: "D1 · Classificazione professioni e competenze",
    colorVar: "--chart-teal",
    pillars: ["D1"],
  },
  {
    id: "D2",
    label: "D2 · Programmazione fabbisogno personale",
    colorVar: "--chart-blue",
    pillars: ["D2"],
  },
  {
    id: "D3",
    label: "D3 · Recruiting e selezione",
    colorVar: "--chart-green",
    pillars: ["D3"],
  },
  {
    id: "D4",
    label: "D4 · Sviluppo professionale e competenze",
    colorVar: "--chart-orange",
    pillars: ["D4"],
  },
  {
    id: "D5",
    label: "D5 · Rewarding e dinamicità carriera",
    colorVar: "--chart-purple",
    pillars: ["D5"],
  },
  {
    id: "D6",
    label: "D6 · Capacity building e sostenibilità",
    colorVar: "--chart-red",
    pillars: ["D6"],
  },
];

export const ExecutiveView = ({
  onDrillDown,
  onStartJourney,
}: {
  onDrillDown?: (pillar: string, indicatorId?: string) => void;
  onStartJourney?: (journeyId: string) => void;
}) => {
  const { profile } = useAuth();
  const { filters } = useFilters();

  const d1Filters = useMemo(
    () => ({
      comparto: filters.comparto,
      regione: filters.regione,
      dimensione_pa: filters.dimensione_pa,
      anno: filters.anno,
      ente_id: profile?.role === "ente_hr" ? profile.ente_id : null,
    }),
    [filters.comparto, filters.regione, filters.dimensione_pa, filters.anno, profile],
  );

  const { data: d1Data } = useD1Calculations(d1Filters);

  /* Merge dynamic D1 data into static indices */
  const allIndices = useMemo(() => {
    if (!d1Data) return executiveIndicesStatic;
    const d1Ids = ["IAC", "IIMP/R", "ICPR", "ICVC", "IACU"] as const;
    return executiveIndicesStatic.map((idx) => {
      if (
        d1Ids.includes(idx.id as (typeof d1Ids)[number]) &&
        d1Data[idx.id as keyof typeof d1Data]
      ) {
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

  /* Executive view shows ONLY executive-level indicators per pillar (as per methodology docs) */
  const executiveIndices = allIndices.filter((idx) => idx.indicatorLevel === "executive");

  /* Group indices by dimension */
  const groupedIndices = dimensionGroups
    .map((group) => ({
      ...group,
      indices: executiveIndices.filter((idx) => group.pillars.includes(idx.pillar)),
    }))
    .filter((g) => g.indices.length > 0);

  return (
    <div className="p-6 space-y-6 flex-1">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Vista Executive</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            <span className="inline-flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-primary text-primary-foreground">
                EX
              </span>
              {executiveIndices.length} Indicatori · 6 Pillar · Anno {filters.anno}
              {filters.comparto !== "Tutti" && (
                <span className="text-primary font-semibold">· {filters.comparto}</span>
              )}
              {filters.regione !== "Tutte" && (
                <span className="text-primary font-semibold">· {filters.regione}</span>
              )}
              {filters.dimensione_pa !== "Tutte" && (
                <span className="text-primary font-semibold">· {filters.dimensione_pa}</span>
              )}
            </span>
          </p>
        </div>
      </div>

      {/* ── Dimension-grouped Executive KPI Cards ── */}
      <div className="space-y-5" data-tour="executive-grid">
        {groupedIndices.map((group, gi) => (
          <div
            key={group.id}
            className="rounded-xl border-2 overflow-hidden shadow-sm"
            style={{ borderColor: `hsl(var(${group.colorVar}) / 0.4)` }}
          >
            {/* Dimension group header */}
            <div
              className="flex items-center gap-2.5 px-5 py-3"
              style={{
                background: `linear-gradient(135deg, hsl(var(${group.colorVar}) / 0.12), hsl(var(${group.colorVar}) / 0.04))`,
                borderBottom: `2px solid hsl(var(${group.colorVar}) / 0.25)`,
              }}
            >
              <div
                className="flex items-center justify-center h-7 w-7 rounded-md"
                style={{ background: `hsl(var(${group.colorVar}))` }}
              >
                <Layers className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-foreground tracking-wide">{group.label}</span>
              <span className="ml-auto flex items-center gap-2">
                {pillarToJourney[group.id] && onStartJourney && (
                  <button
                    onClick={() => onStartJourney(pillarToJourney[group.id])}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors hover:opacity-80"
                    style={{
                      background: `hsl(var(${group.colorVar}))`,
                      color: "hsl(var(--primary-foreground))",
                    }}
                  >
                    <Route className="h-3.5 w-3.5" />
                    Percorso guidato
                  </button>
                )}
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{
                    background: `hsl(var(${group.colorVar}) / 0.12)`,
                    color: `hsl(var(${group.colorVar}))`,
                  }}
                >
                  {group.indices.length} {group.indices.length === 1 ? "indicatore" : "indicatori"}
                </span>
              </span>
            </div>
            {/* Cards inside group */}
            <div
              className={`p-4 grid gap-4 bg-card ${
                group.indices.length === 1
                  ? "grid-cols-1 max-w-2xl"
                  : group.indices.length === 2
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
              }`}
            >
              {group.indices.map((idx, ii) => (
                <ExecutiveKpiCard
                  key={idx.id}
                  idx={idx}
                  variant="executive"
                  onDrillDown={(pillar) => onDrillDown?.(pillar, idx.id)}
                  {...(gi === 0 && ii === 0 ? { "data-tour": "kpi-card" } : {})}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Two-column: Radar + Bullet chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="tableau-card">
          <div className="tableau-card-header flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            KPI Success Rate per Dimensione
          </div>
          <div className="tableau-card-body">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="68%">
                  <PolarGrid stroke="hsl(var(--tableau-grid))" />
                  <PolarAngleAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Radar
                    name="Score %"
                    dataKey="score"
                    stroke="hsl(var(--chart-blue))"
                    fill="hsl(var(--chart-blue))"
                    fillOpacity={0.15}
                    strokeWidth={2}
                    dot={{ r: 3, fill: "hsl(var(--chart-blue))" }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="tableau-card">
          <div className="tableau-card-header flex items-center gap-2">
            <Target className="h-4 w-4" />
            Confronto Target vs Raggiunto
          </div>
          <div className="tableau-card-body space-y-3">
            {kpiSuccessData.map((d) => (
              <div key={d.dim}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-foreground">
                    <span className="text-primary font-bold">{d.dim}</span> {d.label}
                  </span>
                  <span className="text-[11px] font-bold text-foreground">{d.actual}%</span>
                </div>
                <BulletBar actual={d.actual} target={d.target} />
                <div className="flex justify-end mt-0.5">
                  <span className="text-[9px] text-muted-foreground">Target: {d.target}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Positioning Matrix ── */}
      <KpiPositioningMatrix />

      {/* ── Trend storico ── */}
      <div className="tableau-card">
        <div className="tableau-card-header flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Trend Storico per Pillar (2019–2023)
        </div>
        <div className="tableau-card-body">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                <XAxis
                  dataKey="anno"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  domain={[0, 1]}
                  tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                  formatter={(v: number) => `${(v * 100).toFixed(1)}%`}
                />
                <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="D1"
                  name="D1 Classificazione"
                  fill="hsl(var(--chart-teal))"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="D2"
                  name="D2 Fabbisogno"
                  fill="hsl(var(--chart-blue))"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="D3"
                  name="D3 Recruiting"
                  fill="hsl(var(--chart-green))"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="D4"
                  name="D4 Sviluppo"
                  fill="hsl(var(--chart-orange))"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="D5"
                  name="D5 Rewarding"
                  fill="hsl(var(--chart-purple))"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="D6"
                  name="D6 Sostenibilità"
                  fill="hsl(var(--chart-red))"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Distribuzione KPI ── */}
      <div className="tableau-card">
        <div className="tableau-card-header flex items-center gap-2">
          <Award className="h-4 w-4" />
          Distribuzione KPI per Stato di Raggiungimento
        </div>
        <div className="tableau-card-body">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={kpiSuccessData.map((d) => ({
                  ...d,
                  raggiunto: d.actual,
                  gap: Math.max(0, d.target - d.actual),
                }))}
                layout="vertical"
                margin={{ left: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--tableau-grid))"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="dim"
                  tick={{ fontSize: 11, fill: "hsl(var(--foreground))", fontWeight: 700 }}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="raggiunto"
                  name="Raggiunto"
                  stackId="a"
                  fill="hsl(var(--chart-blue))"
                />
                <Bar
                  dataKey="gap"
                  name="Gap vs Target"
                  stackId="a"
                  fill="hsl(var(--chart-orange) / 0.5)"
                  radius={[0, 2, 2, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
