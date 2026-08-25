import { useState, useMemo } from "react";
import {
  Users, Calendar, UserCheck, TrendingUp, GraduationCap, Briefcase,
  ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import {
  kpiOverview, serieStoricaPersonale, personaleMacrocategoria, benchmarkData,
} from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { DfpOverviewFilters, DFP_FILTER_DEFAULTS, type DfpOverviewFilterValues } from "./DfpOverviewFilters";

/** Deterministic hash to generate filter-dependent variation */
function filterSeed(filters: DfpOverviewFilterValues): number {
  const s = `${filters.comparto}|${filters.area}|${filters.dimensione}`;
  if (!s.replace(/\|/g, "")) return 1; // no filters = base data
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return 0.6 + (Math.abs(h) % 40) / 50; // range 0.6–1.4
}

function buildSummaryCards(factor: number) {
  const pt = Math.round(kpiOverview.personaleTotale * factor);
  const eta = +(kpiOverview.etaMedia + (factor - 1) * 8).toFixed(1);
  const donne = +(kpiOverview.donnePerc + (factor - 1) * 12).toFixed(1);
  const turnover = +(kpiOverview.turnoverRate * (0.5 + factor * 0.5)).toFixed(1);
  const formazione = +(kpiOverview.formazionePerc + (factor - 1) * 15).toFixed(1);
  const agile = +(kpiOverview.lavoroAgilePerc * (0.4 + factor * 0.6)).toFixed(1);
  return [
    { label: "Personale Totale", value: pt.toLocaleString("it-IT"), delta: `${kpiOverview.personaleTotaleVar > 0 ? "+" : ""}${kpiOverview.personaleTotaleVar}%`, deltaType: kpiOverview.personaleTotaleVar > 0 ? "up" : "down", icon: Users, accent: "var(--chart-blue)" },
    { label: "Età Media", value: `${eta}`, suffix: "anni", delta: `${kpiOverview.etaMediaVar > 0 ? "+" : ""}${kpiOverview.etaMediaVar}`, deltaType: "neutral" as const, icon: Calendar, accent: "var(--chart-orange)" },
    { label: "% Donne", value: `${donne}%`, icon: UserCheck, accent: "var(--chart-red)" },
    { label: "Tasso Turnover", value: `${turnover}%`, delta: `${kpiOverview.turnoverVar > 0 ? "+" : ""}${kpiOverview.turnoverVar}%`, deltaType: kpiOverview.turnoverVar > 0 ? "up" : "down", icon: TrendingUp, accent: "var(--chart-green)" },
    { label: "% Formati", value: `${formazione}%`, delta: `${kpiOverview.formazioneVar > 0 ? "+" : ""}${kpiOverview.formazioneVar}%`, deltaType: "up" as const, icon: GraduationCap, accent: "var(--chart-purple)" },
    { label: "Lavoro Agile", value: `${agile}%`, delta: `${kpiOverview.lavoroAgileVar > 0 ? "+" : ""}${kpiOverview.lavoroAgileVar}%`, deltaType: "up" as const, icon: Briefcase, accent: "var(--chart-teal)" },
  ];
}

const MACRO_COLORS = [
  "hsl(var(--chart-blue))",
  "hsl(var(--chart-blue) / 0.7)",
  "hsl(var(--chart-orange))",
  "hsl(var(--chart-green))",
  "hsl(var(--chart-purple))",
];

const DeltaIcon = ({ type }: { type?: string }) => {
  if (type === "up") return <ArrowUpRight className="h-3 w-3" />;
  if (type === "down") return <ArrowDownRight className="h-3 w-3" />;
  return <Minus className="h-3 w-3" />;
};

export const OverviewHome = () => {
  const { profile } = useAuth();
  const isDfp = profile?.role === "dfp";
  const [dfpFilters, setDfpFilters] = useState<DfpOverviewFilterValues>(DFP_FILTER_DEFAULTS);

  const factor = useMemo(() => isDfp ? filterSeed(dfpFilters) : 1, [isDfp, dfpFilters]);
  const summaryCards = useMemo(() => buildSummaryCards(factor), [factor]);

  const filteredSerie = useMemo(() =>
    serieStoricaPersonale.map((d) => ({
      ...d,
      uomini: Math.round(d.uomini * factor),
      donne: Math.round(d.donne * factor),
      totale: Math.round(d.totale * factor),
    })),
    [factor]
  );

  const filteredMacro = useMemo(() =>
    personaleMacrocategoria.map((d) => ({
      ...d,
      value: Math.round(d.value * factor),
    })),
    [factor]
  );

  const filteredBenchmark = useMemo(() => {
    const offset = (factor - 1) * 3;
    return {
      etaMedia: { amministrazione: +(benchmarkData.etaMedia.amministrazione + offset).toFixed(1), cluster: benchmarkData.etaMedia.cluster },
      donnePerc: { amministrazione: +(benchmarkData.donnePerc.amministrazione + offset * 2).toFixed(1), cluster: benchmarkData.donnePerc.cluster },
      turnover: { amministrazione: +(benchmarkData.turnover.amministrazione + offset).toFixed(1), cluster: benchmarkData.turnover.cluster },
      formazionePerc: { amministrazione: +(benchmarkData.formazionePerc.amministrazione + offset * 1.5).toFixed(1), cluster: benchmarkData.formazionePerc.cluster },
      lavoroAgilePerc: { amministrazione: +(benchmarkData.lavoroAgilePerc.amministrazione + offset * 2).toFixed(1), cluster: benchmarkData.lavoroAgilePerc.cluster },
    };
  }, [factor]);

  // Active filter label for subtitle
  const activeFilterParts: string[] = [];
  if (dfpFilters.comparto) activeFilterParts.push(dfpFilters.comparto);
  if (dfpFilters.area) activeFilterParts.push(dfpFilters.area);
  if (dfpFilters.dimensione) activeFilterParts.push(dfpFilters.dimensione);
  const filterLabel = isDfp && activeFilterParts.length > 0
    ? ` · Filtro: ${activeFilterParts.join(", ")}`
    : "";

  return (
    <div className="p-5 space-y-5">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Analisi d'Insieme</h1>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          Panoramica sintetica dello stato del personale · Dati al 31/12/2023{filterLabel}
        </p>
      </div>

      {/* DFP Filters */}
      {isDfp && (
        <DfpOverviewFilters value={dfpFilters} onChange={setDfpFilters} />
      )}

      {/* KPI Summary Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-card border rounded-lg p-4 relative overflow-hidden group hover:shadow-md transition-shadow"
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                style={{ background: `hsl(${card.accent})` }}
              />
              <div className="pl-2 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] text-muted-foreground font-medium uppercase tracking-wide">
                    {card.label}
                  </span>
                  <Icon className="h-3.5 w-3.5 text-muted-foreground/40" />
                </div>
                <div className="text-2xl font-bold font-mono leading-none">
                  {card.value}
                  {card.suffix && (
                    <span className="text-xs font-normal text-muted-foreground font-sans ml-1">{card.suffix}</span>
                  )}
                </div>
                {card.delta && (
                  <div
                    className="text-[11px] flex items-center gap-0.5"
                    style={{
                      color:
                        card.deltaType === "up"
                          ? "hsl(var(--chart-green))"
                          : card.deltaType === "down"
                          ? "hsl(var(--kpi-up))"
                          : "hsl(var(--kpi-neutral))",
                    }}
                  >
                    <DeltaIcon type={card.deltaType} />
                    {card.delta} vs 2022
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Serie Storica Personale */}
        <div className="bg-card border rounded-lg p-5">
          <h3 className="text-[13px] font-semibold text-foreground mb-1">Trend Personale in Servizio</h3>
          <p className="text-[10.5px] text-muted-foreground mb-4">Serie storica 2012–2023 (valori in migliaia)</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={filteredSerie}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="anno" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="uomini" name="Uomini" stroke="hsl(var(--chart-blue))" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="donne" name="Donne" stroke="hsl(var(--chart-red))" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="totale" name="Totale" stroke="hsl(var(--chart-orange))" strokeWidth={2.5} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuzione per macrocategoria */}
        <div className="bg-card border rounded-lg p-5">
          <h3 className="text-[13px] font-semibold text-foreground mb-1">Personale per Macrocategoria</h3>
          <p className="text-[10.5px] text-muted-foreground mb-4">Distribuzione al 2023</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={filteredMacro} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="categoria" tick={{ fontSize: 10 }} width={110} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="value" name="Personale" radius={[0, 4, 4, 0]} barSize={20}>
                {filteredMacro.map((_, i) => (
                  <Cell key={i} fill={MACRO_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Benchmark summary */}
      <div className="bg-card border rounded-lg p-5">
        <h3 className="text-[13px] font-semibold text-foreground mb-4">Confronto Benchmark Sintetico</h3>
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Età Media", key: "etaMedia" as const, suffix: " anni" },
            { label: "% Donne", key: "donnePerc" as const, suffix: "%" },
            { label: "Turnover", key: "turnover" as const, suffix: "%" },
            { label: "% Formati", key: "formazionePerc" as const, suffix: "%" },
            { label: "% Lavoro Agile", key: "lavoroAgilePerc" as const, suffix: "%" },
          ].map((item) => {
            const data = filteredBenchmark[item.key];
            const gap = data.amministrazione - data.cluster;
            return (
              <div key={item.key} className="text-center">
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-2">
                  {item.label}
                </div>
                <div className="text-lg font-bold font-mono">
                  {data.amministrazione}{item.suffix}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  Cluster: {data.cluster}{item.suffix}
                </div>
                <div
                  className="text-[11px] font-semibold mt-0.5"
                  style={{
                    color: gap > 0 ? "hsl(var(--chart-green))" : gap < 0 ? "hsl(var(--kpi-up))" : "hsl(var(--kpi-neutral))",
                  }}
                >
                  Gap: {gap > 0 ? "+" : ""}{gap.toFixed(1)} {item.suffix.replace("%", "pp")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
