import { useModalitaLavoro } from "@/hooks/useModalitaLavoro";
import { Clock, Users, TrendingUp } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { SectionLoading, SectionError, SectionEmpty } from "../SectionStates";
import { KpiStat, KpiGrid } from "../KpiStat";
import { ChartCard } from "../ChartCard";
import { tooltipStyle } from "../chartTheme";
import { formatIT, formatPct } from "@/lib/format";
import { CURRENT_YEAR } from "@/config/constants";

const COLORS = ["hsl(var(--chart-blue))", "hsl(var(--chart-red))"];

export const LavoroFlessibileSection = () => {
  const { lavoroFlessibile, isLoading, error } = useModalitaLavoro(CURRENT_YEAR);

  if (isLoading) return <SectionLoading />;
  if (error) return <SectionError />;

  const { flessibiliPerc, flessibiliTotale, donneFlessibiliPerc, uominiFlessibiliPerc, serieStorica } = lavoroFlessibile;
  if (!serieStorica.length) return <SectionEmpty />;

  const base = serieStorica[0].flessibili;
  const crescita = base > 0 ? `+${(((flessibiliTotale - base) / base) * 100).toFixed(0)}%` : "0%";
  const genereData = [
    { name: "Donne", value: donneFlessibiliPerc },
    { name: "Uomini", value: uominiFlessibiliPerc },
  ];

  return (
    <div className="space-y-4">
      <KpiGrid>
        <KpiStat label="Personale flessibile" value={formatPct(flessibiliPerc)} icon={Clock} color="hsl(var(--chart-blue))" sub={`${formatIT(flessibiliTotale)} unità`} />
        <KpiStat label="% Donne" value={formatPct(donneFlessibiliPerc)} icon={Users} color="hsl(var(--chart-red))" />
        <KpiStat label="% Uomini" value={formatPct(uominiFlessibiliPerc)} icon={Users} color="hsl(var(--chart-blue))" />
        <KpiStat label="Crescita vs primo anno" value={crescita} icon={TrendingUp} color="hsl(var(--chart-teal))" />
      </KpiGrid>

      <div className="grid grid-cols-12 gap-3">
        <ChartCard title="Evoluzione Lavoro Flessibile" className="col-span-8">
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
        </ChartCard>

        <ChartCard title="Distribuzione per Genere" className="col-span-4">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={genereData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value"
                label={({ name, value }) => `${name} ${value}%`} style={{ fontSize: 11 }}>
                {genereData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [`${val}%`, undefined]} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};
