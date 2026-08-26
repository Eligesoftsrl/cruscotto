import { KpiStat, KpiGrid } from "../KpiStat";
import { SectionError, SectionLoading } from "../SectionStates";
import { tooltipStyle } from "../chartTheme";
import { useCessatiData } from "@/hooks/useCessatiData";
import { useAssuntiData } from "@/hooks/useAssuntiData";
import { useFilters } from "@/contexts/FilterContext";
import { TrendingUp, LogOut, UserPlus, ArrowRightLeft } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, ReferenceLine,
} from "recharts";


export const CessazioniSection = () => {
  const { filters } = useFilters();
  const genere = filters.genere;

  const { cessazioniPerCausale, serieStoricaCessati, kpiOverview, isLoading, error } = useCessatiData(2023);
  const { assuntiPerCausale, serieStoricaTurnover: serieAssunti } = useAssuntiData(2023);

  if (isLoading) return <SectionLoading />;
  if (error) return <SectionError />;

  const filterRow = (r: { uomini: number; donne: number; totale: number }) => ({
    ...r,
    uomini: genere === "Donne" ? 0 : r.uomini,
    donne: genere === "Uomini" ? 0 : r.donne,
    totale: genere === "Donne" ? r.donne : genere === "Uomini" ? r.uomini : r.totale,
  });

  const cessazioni = cessazioniPerCausale.map((r) => ({ ...r, ...filterRow(r) }));
  const assunzioni = assuntiPerCausale.map((r) => ({ ...r, ...filterRow(r) }));

  const totaleCessati = cessazioni.reduce((s, r) => s + r.totale, 0);
  const totaleAssunti = assunzioni.reduce((s, r) => s + r.totale, 0);
  const saldo = totaleAssunti - totaleCessati;
  const showBoth = genere === "Tutti";

  // Serie storica combinata assunti vs cessati (merge per anno)
  const anni = Array.from(new Set([
    ...serieStoricaCessati.map((r) => r.anno),
    ...serieAssunti.map((r) => r.anno),
  ])).sort((a, b) => a - b);
  const serieStoricaTurnover = anni.map((anno) => {
    const cessati = serieStoricaCessati.find((r) => r.anno === anno)?.cessati ?? 0;
    const assunti = serieAssunti.find((r) => r.anno === anno)?.assunti ?? 0;
    return { anno, assunti, cessati, saldo: assunti - cessati };
  });

  const turnoverRate = kpiOverview.personaleTotale > 0
    ? ((totaleCessati / kpiOverview.personaleTotale) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-4">
      {/* KPI */}
      <KpiGrid>
        {[
          { label: "Cessati 2023", value: totaleCessati.toLocaleString("it-IT"), icon: LogOut, color: "hsl(var(--chart-red))" },
          { label: "Assunti 2023", value: totaleAssunti.toLocaleString("it-IT"), icon: UserPlus, color: "hsl(var(--chart-teal))" },
          { label: "Saldo netto", value: (saldo >= 0 ? "+" : "") + saldo.toLocaleString("it-IT"), icon: ArrowRightLeft, color: saldo >= 0 ? "hsl(var(--chart-teal))" : "hsl(var(--chart-red))" },
          { label: "Tasso Turnover", value: `${turnoverRate}%`, icon: TrendingUp, color: "hsl(var(--chart-orange))" },
        ].map((k, i) => (
          <KpiStat key={i} label={k.label} value={k.value} icon={k.icon} color={k.color} />
        ))}
      </KpiGrid>

      {/* Charts row */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Cessazioni per Causale</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cessazioni} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis type="category" dataKey="causale" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={110} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
              {(showBoth || genere === "Uomini") && <Bar dataKey="uomini" name="Uomini" fill="hsl(var(--chart-blue))" stackId="a" />}
              {(showBoth || genere === "Donne") && <Bar dataKey="donne" name="Donne" fill="hsl(var(--chart-red))" stackId="a" radius={[0, 3, 3, 0]} />}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-6 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Assunzioni per Causale</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={assunzioni} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis type="category" dataKey="causale" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={110} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
              {(showBoth || genere === "Uomini") && <Bar dataKey="uomini" name="Uomini" fill="hsl(var(--chart-blue))" stackId="a" />}
              {(showBoth || genere === "Donne") && <Bar dataKey="donne" name="Donne" fill="hsl(var(--chart-red))" stackId="a" radius={[0, 3, 3, 0]} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Serie storica */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-xs font-semibold text-foreground mb-3">Serie Storica Assunti vs Cessati</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={serieStoricaTurnover}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="anno" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.5} />
            <Line type="monotone" dataKey="assunti" name="Assunti" stroke="hsl(var(--chart-teal))" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="cessati" name="Cessati" stroke="hsl(var(--chart-red))" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="saldo" name="Saldo" stroke="hsl(var(--chart-orange))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
