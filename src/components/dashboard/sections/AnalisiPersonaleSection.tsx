import {
  personaleMacrocategoria,
  personaleTitoloStudio,
  serieStoricaPersonale,
  kpiOverview,
} from "@/fixtures";
import { DemoDataBadge } from "@/components/dashboard/DemoDataBadge";
import { Users, Building2, GraduationCap, TrendingUp } from "lucide-react";
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
  LineChart,
  Line,
} from "recharts";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 11,
};

const COLORS = [
  "hsl(var(--chart-blue))",
  "hsl(var(--chart-teal))",
  "hsl(var(--chart-orange))",
  "hsl(var(--chart-purple))",
  "hsl(var(--chart-red))",
];

export const AnalisiPersonaleSection = () => {
  const totale = personaleMacrocategoria.reduce((s, r) => s + r.value, 0);

  return (
    <div className="space-y-4">
      <DemoDataBadge note="Dati dimostrativi: titolo di studio, macrocategoria e serie storica del personale non sono ancora disponibili nelle tabelle dw_* (previste in ca_*)." />
      {/* KPI */}
      <div className="grid grid-cols-12 gap-3">
        {[
          {
            label: "Personale totale",
            value: kpiOverview.personaleTotale.toLocaleString("it-IT"),
            icon: Users,
            color: "hsl(var(--chart-blue))",
          },
          {
            label: "Dirigenti",
            value: kpiOverview.personaleDirigente.toLocaleString("it-IT"),
            icon: Building2,
            color: "hsl(var(--chart-orange))",
          },
          {
            label: "Non dirigenti",
            value: kpiOverview.personaleNonDirigente.toLocaleString("it-IT"),
            icon: Users,
            color: "hsl(var(--chart-teal))",
          },
          {
            label: "Variazione vs anno prec.",
            value: `+${kpiOverview.personaleTotaleVar}%`,
            icon: TrendingUp,
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
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Macrocategoria bar */}
        <div className="col-span-7 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">
            Personale per Macrocategoria
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={personaleMacrocategoria} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis
                type="category"
                dataKey="categoria"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                width={130}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" name="Personale" barSize={22} radius={[0, 4, 4, 0]}>
                {personaleMacrocategoria.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Titolo di studio donut */}
        <div className="col-span-5 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">
            Distribuzione per Titolo di Studio
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={personaleTitoloStudio}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="titolo"
                label={({ titolo, percent }) => `${titolo} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 0.5 }}
                style={{ fontSize: 10 }}
              >
                {personaleTitoloStudio.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Serie storica */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-xs font-semibold text-foreground mb-3">
          Evoluzione Personale (×1.000) — 2012–2023
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={serieStoricaPersonale}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="anno" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="totale"
              name="Totale"
              stroke="hsl(var(--chart-purple))"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="uomini"
              name="Uomini"
              stroke="hsl(var(--chart-blue))"
              strokeWidth={1.5}
              dot={{ r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="donne"
              name="Donne"
              stroke="hsl(var(--chart-red))"
              strokeWidth={1.5}
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
