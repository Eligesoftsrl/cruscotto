import { distribuzioneEta, kpiOverview } from "@/fixtures";
import { DemoDataBadge } from "@/components/dashboard/DemoDataBadge";
import { AlertTriangle, CalendarClock, Users, TrendingDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  ReferenceLine,
  AreaChart,
  Area,
} from "recharts";

// Simulated forecast data
const previsioneCessazioni = [
  { anno: "2024", cessazioni: 580, cumulate: 580 },
  { anno: "2025", cessazioni: 620, cumulate: 1200 },
  { anno: "2026", cessazioni: 710, cumulate: 1910 },
  { anno: "2027", cessazioni: 780, cumulate: 2690 },
  { anno: "2028", cessazioni: 830, cumulate: 3520 },
  { anno: "2029", cessazioni: 750, cumulate: 4270 },
  { anno: "2030", cessazioni: 680, cumulate: 4950 },
];

const cessazioniPerFascia = [
  { fascia: "55-59", uomini: 420, donne: 380, totale: 800 },
  { fascia: "60-61", uomini: 350, donne: 310, totale: 660 },
  { fascia: "62-64", uomini: 520, donne: 480, totale: 1000 },
  { fascia: "65-66", uomini: 380, donne: 340, totale: 720 },
  { fascia: "67+", uomini: 450, donne: 320, totale: 770 },
];

const scenari = [
  { anno: "2024", base: 580, ottimistico: 520, pessimistico: 640 },
  { anno: "2025", base: 620, ottimistico: 550, pessimistico: 700 },
  { anno: "2026", base: 710, ottimistico: 620, pessimistico: 810 },
  { anno: "2027", base: 780, ottimistico: 670, pessimistico: 900 },
  { anno: "2028", base: 830, ottimistico: 700, pessimistico: 970 },
  { anno: "2029", base: 750, ottimistico: 640, pessimistico: 870 },
  { anno: "2030", base: 680, ottimistico: 580, pessimistico: 790 },
];

export const PrevisioneCessazioniSection = () => {
  const totPreviste = previsioneCessazioni.reduce((s, r) => s + r.cessazioni, 0);
  const piccoAnno = previsioneCessazioni.reduce((a, b) => (b.cessazioni > a.cessazioni ? b : a));
  const percPersonale = ((totPreviste / kpiOverview.personaleTotale) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      <DemoDataBadge note="Proiezione dimostrativa: le previsioni di cessazione sono uno scenario simulato, non dati di tabella." />
      {/* KPI */}
      <div className="grid grid-cols-12 gap-3">
        {[
          {
            label: "Cessazioni previste 2024-2030",
            value: totPreviste.toLocaleString("it-IT"),
            icon: CalendarClock,
            color: "hsl(var(--chart-orange))",
          },
          {
            label: "Anno di picco",
            value: piccoAnno.anno,
            sub: `${piccoAnno.cessazioni} cessazioni`,
            icon: AlertTriangle,
            color: "hsl(var(--chart-red))",
          },
          {
            label: "% organico attuale",
            value: `${percPersonale}%`,
            icon: Users,
            color: "hsl(var(--chart-blue))",
          },
          {
            label: "Media annua prevista",
            value: Math.round(totPreviste / 7).toLocaleString("it-IT"),
            icon: TrendingDown,
            color: "hsl(var(--chart-teal))",
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
            {k.sub && <div className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">
            Previsione cessazioni annue e cumulate
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={previsioneCessazioni}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="anno" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 11,
                }}
              />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
              <Bar
                yAxisId="left"
                dataKey="cessazioni"
                name="Cessazioni annue"
                fill="hsl(var(--chart-red))"
                radius={[3, 3, 0, 0]}
                fillOpacity={0.8}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulate"
                name="Cumulate"
                stroke="hsl(var(--chart-navy))"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-6 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">
            Cessazioni previste per fascia d'età
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={cessazioniPerFascia} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="fascia"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 11,
                }}
              />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="uomini"
                name="Uomini"
                fill="hsl(var(--chart-blue))"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="donne"
                name="Donne"
                fill="hsl(var(--chart-red))"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scenario analysis */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-xs font-semibold text-foreground mb-3">
          Analisi per scenari (2024–2030)
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={scenari}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="anno" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 11,
              }}
            />
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="pessimistico"
              name="Pessimistico"
              fill="hsl(var(--chart-red))"
              stroke="hsl(var(--chart-red))"
              fillOpacity={0.1}
              strokeDasharray="4 4"
            />
            <Area
              type="monotone"
              dataKey="base"
              name="Base"
              fill="hsl(var(--chart-blue))"
              stroke="hsl(var(--chart-blue))"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="ottimistico"
              name="Ottimistico"
              fill="hsl(var(--chart-teal))"
              stroke="hsl(var(--chart-teal))"
              fillOpacity={0.1}
              strokeDasharray="4 4"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
