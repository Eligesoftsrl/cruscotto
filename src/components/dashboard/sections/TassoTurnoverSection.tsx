import { KpiStat, KpiGrid } from "../KpiStat";
import { SectionEmpty, SectionError, SectionLoading } from "../SectionStates";
import { tooltipStyle } from "../chartTheme";
import { useCessatiData } from "@/hooks/useCessatiData";
import { useAssuntiData } from "@/hooks/useAssuntiData";
import { TrendingUp, TrendingDown, ArrowRightLeft, Activity } from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  BarChart,
} from "recharts";

export const TassoTurnoverSection = () => {
  const { serieStoricaCessati, kpiOverview, isLoading, error } = useCessatiData(2023);
  const { serieStoricaTurnover: serieAssunti } = useAssuntiData(2023);

  if (isLoading) return <SectionLoading />;
  if (error) return <SectionError />;

  const anni = Array.from(
    new Set([...serieStoricaCessati.map((r) => r.anno), ...serieAssunti.map((r) => r.anno)]),
  ).sort((a, b) => a - b);
  const serieStoricaTurnover = anni.map((anno) => {
    const cessati = serieStoricaCessati.find((r) => r.anno === anno)?.cessati ?? 0;
    const assunti = serieAssunti.find((r) => r.anno === anno)?.assunti ?? 0;
    return { anno, assunti, cessati, saldo: assunti - cessati };
  });

  if (!serieStoricaTurnover.length) {
    return <SectionEmpty />;
  }

  const personale = kpiOverview.personaleTotale || 1;
  const ultimo = serieStoricaTurnover[serieStoricaTurnover.length - 1];
  const penultimo = serieStoricaTurnover[serieStoricaTurnover.length - 2] ?? ultimo;
  const turnoverRate = ((ultimo.cessati / personale) * 100).toFixed(1);
  const turnoverRatePrev = ((penultimo.cessati / personale) * 100).toFixed(1);
  const deltaRate = (parseFloat(turnoverRate) - parseFloat(turnoverRatePrev)).toFixed(1);

  const serieConTasso = serieStoricaTurnover.map((r) => ({
    ...r,
    tassoTurnover: parseFloat(((r.cessati / personale) * 100).toFixed(1)),
    tassoIngresso: parseFloat(((r.assunti / personale) * 100).toFixed(1)),
  }));

  const saldoCumulato = serieStoricaTurnover.reduce<
    { anno: number; saldo: number; cumulato: number }[]
  >((acc, r) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].cumulato : 0;
    acc.push({ anno: r.anno, saldo: r.saldo, cumulato: prev + r.saldo });
    return acc;
  }, []);

  return (
    <div className="space-y-4">
      <KpiGrid>
        {[
          {
            label: "Tasso Turnover 2023",
            value: `${turnoverRate}%`,
            icon: Activity,
            color: "hsl(var(--chart-orange))",
            sub: `${parseFloat(deltaRate) >= 0 ? "+" : ""}${deltaRate} pp vs anno prec.`,
          },
          {
            label: "Cessati 2023",
            value: ultimo.cessati.toLocaleString("it-IT"),
            icon: TrendingDown,
            color: "hsl(var(--chart-red))",
          },
          {
            label: "Assunti 2023",
            value: ultimo.assunti.toLocaleString("it-IT"),
            icon: TrendingUp,
            color: "hsl(var(--chart-teal))",
          },
          {
            label: "Saldo netto 2023",
            value: (ultimo.saldo >= 0 ? "+" : "") + ultimo.saldo.toLocaleString("it-IT"),
            icon: ArrowRightLeft,
            color: ultimo.saldo >= 0 ? "hsl(var(--chart-teal))" : "hsl(var(--chart-red))",
          },
        ].map((k, i) => (
          <KpiStat
            key={i}
            label={k.label}
            value={k.value}
            icon={k.icon}
            color={k.color}
            sub={k.sub}
          />
        ))}
      </KpiGrid>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-8 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">
            Assunti vs Cessati e Tasso di Turnover
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={serieConTasso}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="anno" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                unit="%"
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar
                yAxisId="left"
                dataKey="assunti"
                name="Assunti"
                fill="hsl(var(--chart-teal))"
                barSize={20}
                radius={[3, 3, 0, 0]}
              />
              <Bar
                yAxisId="left"
                dataKey="cessati"
                name="Cessati"
                fill="hsl(var(--chart-red))"
                barSize={20}
                radius={[3, 3, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="tassoTurnover"
                name="Tasso Turnover %"
                stroke="hsl(var(--chart-orange))"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "hsl(var(--chart-orange))" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-4 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Saldo Netto Cumulato</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={saldoCumulato}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="anno" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
              <Bar
                dataKey="cumulato"
                name="Cumulato"
                barSize={24}
                radius={[3, 3, 0, 0]}
                fill="hsl(var(--chart-teal))"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-xs font-semibold text-foreground mb-3">Serie Storica Turnover</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Anno", "Assunti", "Cessati", "Saldo", "Tasso Turnover", "Tasso Ingresso"].map(
                  (h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-2.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground ${i === 0 ? "text-left" : "text-right"}`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {serieConTasso.map((r) => (
                <tr
                  key={r.anno}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-2.5 font-medium text-foreground">{r.anno}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">
                    {r.assunti.toLocaleString("it-IT")}
                  </td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">
                    {r.cessati.toLocaleString("it-IT")}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-semibold ${r.saldo >= 0 ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {r.saldo >= 0 ? "+" : ""}
                    {r.saldo.toLocaleString("it-IT")}
                  </td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">
                    {r.tassoTurnover}%
                  </td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">
                    {r.tassoIngresso}%
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
