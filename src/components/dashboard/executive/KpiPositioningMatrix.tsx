import React from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from "recharts";
import { kpiAbilitantiData } from "./executiveData";

const quadrantColors = {
  topRight: "hsl(var(--chart-green) / 0.08)",
  topLeft: "hsl(var(--chart-blue) / 0.08)",
  bottomRight: "hsl(var(--chart-orange) / 0.08)",
  bottomLeft: "hsl(var(--destructive) / 0.08)",
};

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="hsl(var(--chart-blue))" stroke="hsl(var(--card))" strokeWidth={2} />
      <text x={cx + 10} y={cy - 8} fontSize={9} fill="hsl(var(--muted-foreground))" fontWeight={600}>
        {payload.ente?.replace("Comune di ", "")}
      </text>
    </g>
  );
};

export const KpiPositioningMatrix = () => {
  return (
    <div className="tableau-card">
      <div className="tableau-card-header flex items-center gap-2">
        Matrice di Posizionamento KPI · Strategici vs Abilitanti
      </div>
      <div className="tableau-card-body">
        <div className="grid grid-cols-2 gap-0 mb-3 text-[9px] text-muted-foreground text-center">
          <div className="p-1.5 rounded-tl" style={{ background: quadrantColors.topLeft }}>
            <span className="font-bold text-[hsl(var(--chart-blue))]">Area dello Sviluppo</span>
            <br />Basi solide, risultati in costruzione
          </div>
          <div className="p-1.5 rounded-tr" style={{ background: quadrantColors.topRight }}>
            <span className="font-bold text-[hsl(var(--chart-green))]">Area della Maturità</span>
            <br />Risultati e basi eccellenti
          </div>
          <div className="p-1.5 rounded-bl" style={{ background: quadrantColors.bottomLeft }}>
            <span className="font-bold text-[hsl(var(--destructive))]">Area della Priorità</span>
            <br />Intervento urgente necessario
          </div>
          <div className="p-1.5 rounded-br" style={{ background: quadrantColors.bottomRight }}>
            <span className="font-bold text-[hsl(var(--chart-orange))]">Area del Rafforzamento</span>
            <br />Buoni risultati, basi da consolidare
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis
                type="number" dataKey="successRate" domain={[0, 100]}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v: number) => `${v}%`}
              >
                <Label value="KPI Success Rate (%)" position="bottom" offset={15} style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              </XAxis>
              <YAxis
                type="number" dataKey="abilitantiRate" domain={[0, 100]}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v: number) => `${v}%`}
              >
                <Label value="KPI Abilitanti Rate (%)" angle={-90} position="insideLeft" offset={0} style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              </YAxis>
              <ReferenceLine x={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" strokeOpacity={0.5} />
              <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" strokeOpacity={0.5} />
              <Tooltip
                contentStyle={{ fontSize: 11, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                formatter={(value: number, name: string) => [`${value}%`, name === "successRate" ? "Success Rate" : "Abilitanti Rate"]}
                labelFormatter={() => ""}
              />
              <Scatter data={kpiAbilitantiData} shape={<CustomDot />} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
