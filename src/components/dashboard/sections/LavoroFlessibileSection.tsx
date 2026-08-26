import { useModalitaLavoro } from "@/hooks/useModalitaLavoro";
import { Clock, Users, TrendingUp } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 11,
};

const COLORS = ["hsl(var(--chart-blue))", "hsl(var(--chart-red))"];

export const LavoroFlessibileSection = () => {
  const { lavoroFlessibile, isLoading, error } = useModalitaLavoro(2023);

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Caricamento dati…</div>;
  if (error) return <div className="p-6 text-sm text-destructive">Errore nel caricamento dei dati.</div>;

  const { flessibiliPerc, flessibiliTotale, donneFlessibiliPerc, uominiFlessibiliPerc, serieStorica } = lavoroFlessibile;

  if (!serieStorica.length) {
    return <div className="p-6 text-sm text-muted-foreground">Nessun dato disponibile.</div>;
  }

  const base = serieStorica[0].flessibili;
  const genereData = [
    { name: "Donne", value: donneFlessibiliPerc },
    { name: "Uomini", value: uominiFlessibiliPerc },
  ];

  return (
    <div className="space-y-4">
      {/* KPI */}
      <div className="grid grid-cols-12 gap-3">
        {[
          { label: "Personale flessibile", value: `${flessibiliPerc}%`, icon: Clock, color: "hsl(var(--chart-blue))", sub: `${flessibiliTotale.toLocaleString("it-IT")} unità` },
          { label: "% Donne", value: `${donneFlessibiliPerc}%`, icon: Users, color: "hsl(var(--chart-red))" },
          { label: "% Uomini", value: `${uominiFlessibiliPerc}%`, icon: Users, color: "hsl(var(--chart-blue))" },
          { label: "Crescita vs primo anno", value: `${base > 0 ? "+" + (((flessibiliTotale - base) / base) * 100).toFixed(0) : 0}%`, icon: TrendingUp, color: "hsl(var(--chart-teal))" },
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
        <div className="col-span-8 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Evoluzione Lavoro Flessibile</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={serieStorica}>
              <defs>
                <linearGradient id="gradFlex" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-blue))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--chart-blue))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="anno" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="flessibili" name="Flessibili" stroke="hsl(var(--chart-blue))" strokeWidth={2.5} fill="url(#gradFlex)" dot={{ r: 4, fill: "hsl(var(--chart-blue))", stroke: "hsl(var(--card))", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gender split donut */}
        <div className="col-span-4 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Distribuzione per Genere</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={genereData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value"
                label={({ name, value }) => `${name} ${value}%`} style={{ fontSize: 11 }}>
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
