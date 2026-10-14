import React, { useMemo } from "react";
import { Target, Activity, Award, BarChart3, Layers } from "lucide-react";
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
import { useExecScoreMulti, useExecScoreFiltri } from "@/hooks/useExecScore";
import {
  EXEC_SCORE_PILLARS,
  badgeColor,
  fmtIndex,
  resolveExecCode,
} from "./executive/score/execScoreConfig";

import { PILLAR_COLORS, PILLAR_LABELS } from "./executive/executiveInterconnessioni";

import { useAdminState } from "@/services/admin/adminStore";
import { FilterPills } from "./FilterPills";
import { EXEC_FLAG_BY_CODE } from "@/config/execIndiciCatalog";

const EXEC_PILLARS = Object.keys(EXEC_SCORE_PILLARS);
/** Dimensioni con layout gerarchico (sintesi da 2 + componenti da 3) richiesto dal cliente. */
const HIERARCHY_PILLARS = ["D2", "D5"];

/**
 * Testo di lettura della card Executive (valori restituiti dall'API):
 * "Indice 0,57 (dominio [0;1]) → score 54 su 100 · <formula del composito | famiglia di scala>."
 */
const letturaScore = (
  r: {
    valore: number | null;
    dominio: string | null;
    famiglia_score: string | null;
    formula: string | null;
  },
  score: number,
  composito = false,
) => {
  const coda = composito
    ? (r.formula?.split("\n")[0]?.replace(/^[^=]*=\s*/, "") ?? "")
    : (r.famiglia_score ?? "");
  return `Indice ${fmtIndex(r.valore)}${r.dominio ? ` (dominio ${r.dominio})` : ""} → score ${Math.round(score)} su 100${coda ? ` · ${coda.replace(/\.$/, "")}` : ""}.`;
};

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
}: {
  onDrillDown?: (pillar: string, indicatorId?: string) => void;
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

  /* Indici disattivati dall'Admin (Pannello → Schede → Indici Dx) esclusi dalla Vista Executive */
  const { flags: adminFlags } = useAdminState();
  const isIndiceOn = (pillar: string, id: string) => {
    const k = EXEC_FLAG_BY_CODE[`${pillar}.${resolveExecCode(pillar, id)}`];
    return !k || (adminFlags.find((f) => f.key === k)?.enabled ?? true);
  };

  /* Pillar con score reali (RPC fa_ca_exec_<dx>_indicatori_score, score [0-100]) */
  const { filtri: execFiltri } = useExecScoreFiltri();
  const execRows = useExecScoreMulti(EXEC_PILLARS, execFiltri);

  /* Merge dynamic D1 data into static indices */
  const allIndices = useMemo(() => {
    // chiave = id RPC completo (es. "D5.DPI_Norm"): evita collisioni tra pillar
    const realScore = new Map(execRows.map((r) => [r.id, r]));
    const withExec = (list: typeof executiveIndicesStatic): typeof executiveIndicesStatic => {
      const mapped = list
        .filter((idx) => !EXEC_SCORE_PILLARS[idx.pillar]?.ritirati?.includes(idx.id))
        .map((idx) => {
          const cfg = EXEC_SCORE_PILLARS[idx.pillar];
          if (cfg?.mock?.includes(idx.id)) return { ...idx, isMock: true };
          const r = cfg && realScore.get(`${idx.pillar}.${resolveExecCode(idx.pillar, idx.id)}`);
          if (!r) return idx;
          const score = r.score ?? 0;
          const code = resolveExecCode(idx.pillar, idx.id) as string;
          // Interconnessioni dall'API (escluso il pillar corrente), motivazioni dai dati statici
          const reasons = new Map(
            (idx.interconnections?.connections ?? []).map((c) => [c.pillar, c]),
          );
          const apiConn = (r.interconnessioni ?? []).filter((x) => x !== idx.pillar);
          return {
            ...idx,
            displayId: code,
            label: r.nome ?? idx.label,
            ...(apiConn.length
              ? {
                  interconnections: {
                    ...(idx.interconnections ?? {}),
                    connections: apiConn.map(
                      (x) =>
                        reasons.get(x) ?? { pillar: x, label: PILLAR_LABELS[x] ?? x, reason: "" },
                    ),
                  },
                }
              : {}),
            value: score / 100,
            prev: (score - (r.var_score ?? 0)) / 100,
            subIndicators: (cfg.componenti[idx.id] ?? []).map((c) => ({
              key: c,
              value: (realScore.get(`${idx.pillar}.${c}`)?.score ?? 0) / 100,
              color: badgeColor(realScore.get(`${idx.pillar}.${c}`)?.badge),
            })),
            assessment: {
              level: r.badge ?? "N/D",
              color: badgeColor(r.badge),
              text: letturaScore(r, score, (cfg.componenti[idx.id] ?? []).length > 0),
            },
          };
        });
      // Indici reali restituiti dalla RPC ma assenti dai dati statici (es. D6: RTG, RRG, IRIC)
      const known = new Set(mapped.map((i) => `${i.pillar}.${resolveExecCode(i.pillar, i.id)}`));
      const extras = EXEC_PILLARS.flatMap((p) => {
        const cfg = EXEC_SCORE_PILLARS[p];
        return [...cfg.sintetici, ...cfg.intermedi]
          .filter(
            (c) => !cfg.mock?.includes(c) && !known.has(`${p}.${c}`) && realScore.has(`${p}.${c}`),
          )
          .map((c) => {
            const r = realScore.get(`${p}.${c}`)!;
            const score = r.score ?? 0;
            return {
              id: c,
              label: r.nome ?? c,
              pillar: p,
              indicatorLevel: "executive" as const,
              dynamic: true,
              value: score / 100,
              prev: (score - (r.var_score ?? 0)) / 100,
              color: PILLAR_COLORS[p] ?? cfg.color,
              fonte: cfg.fonte[c] ?? "Fonte: Conto Annuale",
              formula: r.formula?.split("\n")[0] ?? "",
              subIndicators: [],
              assessment: {
                level: r.badge ?? "N/D",
                color: badgeColor(r.badge),
                text: letturaScore(r, score),
              },
              interconnections: {
                connections: (r.interconnessioni ?? [])
                  .filter((x) => x !== p)
                  .map((x) => ({ pillar: x, label: PILLAR_LABELS[x] ?? x, reason: "" })),
              },
            };
          });
      });
      return [...mapped, ...extras];
    };
    if (!d1Data) return withExec(executiveIndicesStatic);
    const d1Ids = ["IAC", "IIMP/R", "ICPR", "ICVC", "IACU"] as const;
    return withExec(executiveIndicesStatic).map((idx) => {
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
  }, [d1Data, execRows]);

  /* Executive view shows ONLY executive-level indicators per pillar (as per methodology docs) */
  const executiveIndices = allIndices.filter(
    (idx) => idx.indicatorLevel === "executive" && isIndiceOn(idx.pillar, idx.id),
  );

  /*
   * Pillar gerarchici (con indice di sintesi, es. D2 · D4 · D5): nella Vista Executive
   * si mostrano l'indice di sintesi (riga da 2 card) e, subito dopo, gli indici
   * componenti (righe da 3 card), nell'ordine della configurazione del pillar.
   */
  const hierarchy = (pillar: string) => {
    const cfg = EXEC_SCORE_PILLARS[pillar];
    if (!HIERARCHY_PILLARS.includes(pillar) || !cfg || cfg.sintetici.length === 0) return null;
    const byCode = new Map(
      allIndices
        .filter((i) => i.pillar === pillar)
        .map((i) => [resolveExecCode(pillar, i.id) as string, i]),
    );
    const pick = (codes: string[]) =>
      codes
        .map((c) => byCode.get(c))
        .filter((i): i is (typeof allIndices)[number] => !!i && isIndiceOn(pillar, i.id));
    const sintesi = pick(cfg.sintetici);
    const componenti = pick(
      cfg.gruppiIntermedi ? cfg.gruppiIntermedi.flatMap((g) => g.codici) : cfg.intermedi,
    );
    return sintesi.length + componenti.length > 0 ? { sintesi, componenti } : null;
  };

  /* Group indices by dimension */
  const groupedIndices = dimensionGroups
    .map((group) => {
      const h = hierarchy(group.id);
      return {
        ...group,
        hierarchy: h,
        indices: h
          ? [...h.sintesi, ...h.componenti]
          : executiveIndices.filter((idx) => group.pillars.includes(idx.pillar)),
      };
    })
    .filter((g) => g.indices.length > 0);
  const totaleIndicatori = groupedIndices.reduce((n, g) => n + g.indices.length, 0);

  return (
    <div className="flex-1 flex flex-col" data-testid="executive-view">
      {/* Filtri identici alla Vista Sintetica: Anno · Regione · Comparto (+ Ente a destra) */}
      <FilterPills variant="executive" />
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
                {totaleIndicatori} Indicatori · 6 Pillar · Anno {filters.anno}
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
                <span className="text-sm font-bold text-foreground tracking-wide">
                  {group.label}
                </span>
                <span className="ml-auto flex items-center gap-2">
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{
                      background: `hsl(var(${group.colorVar}) / 0.12)`,
                      color: `hsl(var(${group.colorVar}))`,
                    }}
                  >
                    {group.indices.length}{" "}
                    {group.indices.length === 1 ? "indicatore" : "indicatori"}
                  </span>
                </span>
              </div>
              {/* Cards inside group */}
              {group.hierarchy ? (
                <div className="p-4 bg-card space-y-4" data-testid={`exec-hier-${group.id}`}>
                  {group.hierarchy.sintesi.length > 0 && (
                    <div>
                      <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.12em] mb-2">
                        Indice di sintesi
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {group.hierarchy.sintesi.map((idx, ii) => (
                          <ExecutiveKpiCard
                            key={idx.id}
                            idx={idx}
                            variant="executive"
                            sintesi
                            onDrillDown={(pillar) => onDrillDown?.(pillar, idx.id)}
                            {...(gi === 0 && ii === 0 ? { "data-tour": "kpi-card" } : {})}
                          />
                        ))}
                        {group.hierarchy.sintesi.length % 2 === 1 && (
                          <div
                            className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground space-y-2"
                            data-testid={`exec-hier-legend-${group.id}`}
                          >
                            <p className="font-semibold text-foreground">
                              Come leggere questa dimensione
                            </p>
                            <p>
                              {group.hierarchy.sintesi.length === 1 ? (
                                <>
                                  La card a sinistra è l'
                                  <b className="text-foreground">indice di sintesi</b>: il suo score
                                  combina gli score degli indici componenti, riportati sotto e
                                  riepilogati nel riquadro "Composto da".
                                </>
                              ) : (
                                <>
                                  Le card qui sopra sono gli{" "}
                                  <b className="text-foreground">indici di sintesi</b>: lo score di
                                  ciascuno combina gli score dei propri indici componenti, riportati
                                  sotto e riepilogati nel riquadro "Composto da".
                                </>
                              )}
                            </p>
                            <p>
                              Gli indici componenti sono disposti su righe da tre, come nelle altre
                              dimensioni.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {group.hierarchy.componenti.length > 0 && (
                    <div>
                      <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.12em] mb-2">
                        Indici componenti
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {group.hierarchy.componenti.map((idx) => (
                          <ExecutiveKpiCard
                            key={idx.id}
                            idx={idx}
                            variant="executive"
                            onDrillDown={(pillar) => onDrillDown?.(pillar, idx.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
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
              )}
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
    </div>
  );
};
