import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";

const data = [
  { anno: "'12", amm: 47.8, cluster: 47.5, pa: 47.2 },
  { anno: "'13", amm: 48.1, cluster: 47.7, pa: 47.4 },
  { anno: "'14", amm: 48.4, cluster: 48.0, pa: 47.6 },
  { anno: "'15", amm: 48.8, cluster: 48.3, pa: 47.9 },
  { anno: "'16", amm: 49.2, cluster: 48.7, pa: 48.2 },
  { anno: "'17", amm: 49.5, cluster: 49.0, pa: 48.5 },
  { anno: "'18", amm: 49.9, cluster: 49.3, pa: 48.8 },
  { anno: "'19", amm: 50.2, cluster: 49.6, pa: 49.1 },
  { anno: "'20", amm: 50.5, cluster: 49.8, pa: 49.3 },
  { anno: "'21", amm: 50.8, cluster: 50.0, pa: 49.5 },
  { anno: "'22", amm: 51.0, cluster: 50.2, pa: 49.7 },
  { anno: "'23", amm: 51.2, cluster: 50.4, pa: 49.8 },
];

const views = ["Uomini+Donne", "Uomini", "Donne"] as const;

export const EtaLineChart = () => {
  const [activeView, setActiveView] = useState<string>(views[0]);

  return (
    <div className="bg-card border rounded-lg flex flex-col col-span-7">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <div className="text-[13px] font-semibold text-foreground">
            Evoluzione età media 2012–2023
          </div>
          <div className="text-[10.5px] text-muted-foreground/60 mt-0.5">
            Confronto con cluster e totale PA
          </div>
        </div>
        <div className="flex gap-1">
          {views.map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`px-2 py-[3px] text-[10.5px] rounded border transition-colors ${
                activeView === v
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 px-4 py-3">
        {/* Legend */}
        <div className="flex gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="w-[18px] h-0.5" style={{ background: "hsl(var(--chart-blue))" }} />
            Questa amm.
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="w-[18px] h-0.5" style={{ background: "hsl(var(--chart-orange))" }} />
            Cluster
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="w-[18px] h-0.5 bg-border" />
            Totale PA
          </div>
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,91%)" />
            <XAxis dataKey="anno" tick={{ fontSize: 9 }} />
            <YAxis domain={[46, 53]} tick={{ fontSize: 9 }} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 6 }}
              formatter={(v: number, name: string) => [
                `${v} anni`,
                name === "amm" ? "Amministrazione" : name === "cluster" ? "Cluster" : "PA",
              ]}
            />
            <Area
              type="monotone"
              dataKey="amm"
              fill="hsl(210,64%,41%)"
              fillOpacity={0.06}
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="pa"
              stroke="hsl(220,16%,91%)"
              strokeWidth={1.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="cluster"
              stroke="hsl(var(--chart-orange))"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="amm"
              stroke="hsl(var(--chart-blue))"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
