import { useAssuntiData } from "@/hooks/useAssuntiData";
import { useFilters } from "@/contexts/FilterContext";
import { UserPlus, Users, Award, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const COLORS = [
  "hsl(var(--chart-blue))",
  "hsl(var(--chart-teal))",
  "hsl(var(--chart-orange))",
  "hsl(var(--chart-purple))",
  "hsl(var(--chart-red))",
];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 11,
};

export const AssuntiCausaleSection = () => {
  const { filters } = useFilters();
  const genere = filters.genere;

  const { assuntiPerCausale, serieStoricaTurnover, kpiOverview, isLoading, error } = useAssuntiData(
    Number(filters.anno) || 2023,
  );

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Caricamento dati…</div>;
  if (error)
    return <div className="p-6 text-sm text-destructive">Errore nel caricamento dei dati.</div>;

  const data = assuntiPerCausale.map((r) => ({
    ...r,
    uomini: genere === "Donne" ? 0 : r.uomini,
    donne: genere === "Uomini" ? 0 : r.donne,
    totale: genere === "Donne" ? r.donne : genere === "Uomini" ? r.uomini : r.totale,
  }));

  const totaleAssunti = data.reduce((s, r) => s + r.totale, 0);
  const causaleMax = data.length
    ? data.reduce((a, b) => (b.totale > a.totale ? b : a))
    : { causale: "—", uomini: 0, donne: 0, totale: 0 };
  const percDonne =
    genere === "Uomini" || totaleAssunti === 0
      ? "0.0"
      : ((data.reduce((s, r) => s + r.donne, 0) / totaleAssunti) * 100).toFixed(1);
  const showBoth = genere === "Tutti";

  const pieData = data.map((r) => ({ name: r.causale, value: r.totale }));
  const serieAssunti = serieStoricaTurnover.map((r) => ({ anno: r.anno, assunti: r.assunti }));

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-12 gap-3">
        {[
          {
            label: `Totale assunti ${filters.anno}`,
            value: totaleAssunti.toLocaleString("it-IT"),
            icon: UserPlus,
            color: "hsl(var(--chart-teal))",
          },
          {
            label: "Causale prevalente",
            value: causaleMax.causale,
            icon: Award,
            color: "hsl(var(--chart-blue))",
          },
          {
            label: "% Donne assunzioni",
            value: `${percDonne}%`,
            icon: Users,
            color: "hsl(var(--chart-red))",
          },
          {
            label: "Personale totale",
            value: kpiOverview.personaleTotale.toLocaleString("it-IT"),
            icon: BarChart3,
            color: "hsl(var(--chart-purple))",
          },
        ].map((k, i) => (
          <div key={i} className="col-span-3 bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {k.label}
              </div>
              <k.icon className="h-4 w-4" style={{ color: k.color }} />
            </div>
            <div className="text-xl font-bold text-foreground mt-1">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-7 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">
            Assunzioni per Causale — {genere === "Tutti" ? "Uomini vs Donne" : genere}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis
                type="category"
                dataKey="causale"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                width={120}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              {(showBoth || genere === "Uomini") && (
                <Bar
                  dataKey="uomini"
                  name="Uomini"
                  fill="hsl(var(--chart-blue))"
                  stackId="a"
                  barSize={22}
                />
              )}
              {(showBoth || genere === "Donne") && (
                <Bar
                  dataKey="donne"
                  name="Donne"
                  fill="hsl(var(--chart-red))"
                  stackId="a"
                  radius={[0, 3, 3, 0]}
                  barSize={22}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-5 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Composizione per Causale</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 0.5 }}
                style={{ fontSize: 10 }}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-xs font-semibold text-foreground mb-3">Trend Assunzioni</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={serieAssunti}>
            <defs>
              <linearGradient id="gradAssunti" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-teal))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-teal))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="anno" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="assunti"
              name="Assunti"
              stroke="hsl(var(--chart-teal))"
              strokeWidth={2.5}
              fill="url(#gradAssunti)"
              dot={{ r: 3, fill: "hsl(var(--chart-teal))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-xs font-semibold text-foreground mb-3">
          Dettaglio Assunzioni per Causale
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Causale
                </th>
                {showBoth && (
                  <th className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Uomini
                  </th>
                )}
                {showBoth && (
                  <th className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Donne
                  </th>
                )}
                <th className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Totale
                </th>
                <th className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  % sul totale
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr
                  key={r.causale}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-2.5 font-medium text-foreground">{r.causale}</td>
                  {showBoth && (
                    <td className="px-4 py-2.5 text-right text-muted-foreground">
                      {r.uomini.toLocaleString("it-IT")}
                    </td>
                  )}
                  {showBoth && (
                    <td className="px-4 py-2.5 text-right text-muted-foreground">
                      {r.donne.toLocaleString("it-IT")}
                    </td>
                  )}
                  <td className="px-4 py-2.5 text-right font-semibold text-foreground">
                    {r.totale.toLocaleString("it-IT")}
                  </td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">
                    {totaleAssunti > 0 ? ((r.totale / totaleAssunti) * 100).toFixed(1) : "0.0"}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
