import { lavoroAgile } from "@/data/mockData";
import { Laptop, Users, TrendingDown, AlertTriangle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceLine,
  PieChart, Pie,
} from "recharts";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 11,
};

const COLORS = ["hsl(var(--chart-red))", "hsl(var(--chart-blue))"];

export const LavoroAgileSection = () => {
  const { agiliPerc, agiliTotale, donneAgiliPerc, uominiAgiliPerc, serieStorica } = lavoroAgile;
  const picco = serieStorica.reduce((a, b) => (b.agili > a.agili ? b : a));
  const genereData = [
    { name: "Donne", value: donneAgiliPerc },
    { name: "Uomini", value: uominiAgiliPerc },
  ];

  // Variazione anno su anno
  const serieConDelta = serieStorica.map((r, i) => ({
    ...r,
    delta: i === 0 ? 0 : r.agili - serieStorica[i - 1].agili,
  }));

  return (
    <div className="space-y-4">
      {/* KPI */}
      <div className="grid grid-cols-12 gap-3">
        {[
          { label: "Lavoro agile 2023", value: `${agiliPerc}%`, icon: Laptop, color: "hsl(var(--chart-teal))", sub: `${agiliTotale.toLocaleString("it-IT")} unità` },
          { label: "% Donne in smart working", value: `${donneAgiliPerc}%`, icon: Users, color: "hsl(var(--chart-red))" },
          { label: "Picco (anno COVID)", value: `${picco.agili.toLocaleString("it-IT")}`, icon: AlertTriangle, color: "hsl(var(--chart-orange))", sub: picco.anno },
          { label: "Trend post-COVID", value: `${(((agiliTotale - picco.agili) / picco.agili) * 100).toFixed(0)}%`, icon: TrendingDown, color: "hsl(var(--chart-red))" },
        ].map((k, i) => (
          <div key={i} className="col-span-3 bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{k.label}</div>
              <k.icon className="h-4 w-4" style={{ color: k.color }} />
            </div>
            <div className="text-xl font-bold text-foreground mt-1">{k.value}</div>
            {k.sub && <div className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Area trend */}
        <div className="col-span-5 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Evoluzione Lavoro Agile (2019–2023)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={serieStorica}>
              <defs>
                <linearGradient id="gradAgile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-teal))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-teal))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="anno" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="agili" name="Smart workers" stroke="hsl(var(--chart-teal))" strokeWidth={2.5} fill="url(#gradAgile)" dot={{ r: 4, fill: "hsl(var(--chart-teal))", stroke: "hsl(var(--card))", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Variazione annuale waterfall */}
        <div className="col-span-4 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Variazione Annuale</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serieConDelta.slice(1)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="anno" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
              <Bar dataKey="delta" name="Δ annuale" barSize={28} radius={[4, 4, 0, 0]}>
                {serieConDelta.slice(1).map((entry, i) => (
                  <Cell key={i} fill={entry.delta >= 0 ? "hsl(var(--chart-teal))" : "hsl(var(--chart-red))"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gender donut */}
        <div className="col-span-3 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Per Genere</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={genereData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value"
                label={({ name, value }) => `${name} ${value}%`} style={{ fontSize: 10 }}>
                {genereData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [`${val}%`, undefined]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
