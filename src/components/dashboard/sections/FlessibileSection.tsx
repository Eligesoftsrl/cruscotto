import { FilterBar } from "../FilterBar";
import { KpiCard } from "../KpiCard";
import { lavoroFlessibile, lavoroAgile } from "@/data/mockData";
import { Briefcase, Home } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";

const GENDER_COLORS = ["hsl(220,60%,50%)", "hsl(350,65%,55%)"];

export const FlessibileSection = () => {
  const flessGender = [
    { name: "Uomini", value: lavoroFlessibile.uominiFlessibiliPerc },
    { name: "Donne", value: lavoroFlessibile.donneFlessibiliPerc },
  ];
  const agileGender = [
    { name: "Uomini", value: lavoroAgile.uominiAgiliPerc },
    { name: "Donne", value: lavoroAgile.donneAgiliPerc },
  ];

  return (
    <div className="space-y-6">
      <FilterBar showMacrocategoria />

      {/* Lavoro Flessibile */}
      <h3 className="section-title">Lavoro Flessibile</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard title="% Flessibili" value={lavoroFlessibile.flessibiliPerc} suffix="%" icon={Briefcase} accent />
        <KpiCard title="Totale Flessibili" value={lavoroFlessibile.flessibiliTotale} icon={Briefcase} />
        <KpiCard title="% Donne Flessibili" value={lavoroFlessibile.donneFlessibiliPerc} suffix="%" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="chart-container">
          <h3 className="section-title mb-4">Flessibili per Genere</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={flessGender} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {flessGender.map((_, i) => <Cell key={i} fill={GENDER_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 className="section-title mb-4">Serie Storica Lavoro Flessibile</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lavoroFlessibile.serieStorica}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="anno" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="flessibili" name="Flessibili" stroke="hsl(175,50%,42%)" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lavoro Agile */}
      <h3 className="section-title mt-4">Lavoro Agile (Smart Working)</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard title="% Agili" value={lavoroAgile.agiliPerc} suffix="%" icon={Home} accent />
        <KpiCard title="Totale Agili" value={lavoroAgile.agiliTotale} icon={Home} />
        <KpiCard title="% Donne Agili" value={lavoroAgile.donneAgiliPerc} suffix="%" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="chart-container">
          <h3 className="section-title mb-4">Agili per Genere</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={agileGender} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {agileGender.map((_, i) => <Cell key={i} fill={GENDER_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 className="section-title mb-4">Serie Storica Lavoro Agile</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lavoroAgile.serieStorica}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="anno" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="agili" name="Agili" stroke="hsl(270,45%,55%)" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
