import { Users, TrendingUp, GraduationCap, Briefcase, Calendar, UserCheck } from "lucide-react";
import { KpiCard } from "../KpiCard";
import { BenchmarkBar } from "../BenchmarkBar";
import {
  kpiOverview, serieStoricaPersonale, personaleMacrocategoria,
  personaleTitoloStudio, benchmarkData
} from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";

const GENDER_COLORS = ["hsl(220,60%,50%)", "hsl(350,65%,55%)"];
const MACRO_COLORS = ["hsl(220,60%,25%)", "hsl(220,60%,50%)", "hsl(38,80%,55%)", "hsl(175,50%,42%)", "hsl(270,45%,55%)"];

export const OverviewSection = () => {
  const genderData = [
    { name: "Uomini", value: kpiOverview.uominiPerc },
    { name: "Donne", value: kpiOverview.donnePerc },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard title="Personale Totale" value={kpiOverview.personaleTotale} variation={kpiOverview.personaleTotaleVar} icon={Users} accent />
        <KpiCard title="Età Media" value={kpiOverview.etaMedia} suffix="anni" variation={kpiOverview.etaMediaVar} icon={Calendar} />
        <KpiCard title="% Donne" value={kpiOverview.donnePerc} suffix="%" icon={UserCheck} />
        <KpiCard title="Tasso Turnover" value={kpiOverview.turnoverRate} suffix="%" variation={kpiOverview.turnoverVar} icon={TrendingUp} />
        <KpiCard title="Formati" value={kpiOverview.formazionePerc} suffix="%" variation={kpiOverview.formazioneVar} icon={GraduationCap} />
        <KpiCard title="Lavoro Agile" value={kpiOverview.lavoroAgilePerc} suffix="%" variation={kpiOverview.lavoroAgileVar} icon={Briefcase} />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Distribuzione per Genere */}
        <div className="chart-container">
          <h3 className="section-title mb-4">Personale per Genere</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={genderData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {genderData.map((_, i) => <Cell key={i} fill={GENDER_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Legend verticalAlign="bottom" height={30} iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Macrocategoria */}
        <div className="chart-container">
          <h3 className="section-title mb-4">Per Macrocategoria</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={personaleMacrocategoria} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="categoria" tick={{ fontSize: 10 }} width={100} />
              <Tooltip />
              <Bar dataKey="value" name="Personale" radius={[0, 4, 4, 0]}>
                {personaleMacrocategoria.map((_, i) => <Cell key={i} fill={MACRO_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Titolo di studio */}
        <div className="chart-container">
          <h3 className="section-title mb-4">Titolo di Studio</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={personaleTitoloStudio} cx="50%" cy="50%" outerRadius={85} paddingAngle={2} dataKey="value" label={({ titolo, percent }) => `${(percent * 100).toFixed(0)}%`}>
                {personaleTitoloStudio.map((_, i) => <Cell key={i} fill={MACRO_COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={30} iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Serie Storica */}
      <div className="chart-container">
        <h3 className="section-title mb-4">Serie Storica Personale in Servizio</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={serieStoricaPersonale}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
            <XAxis dataKey="anno" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend iconType="circle" iconSize={8} />
            <Line type="monotone" dataKey="uomini" name="Uomini" stroke="hsl(220,60%,50%)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="donne" name="Donne" stroke="hsl(350,65%,55%)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="totale" name="Totale" stroke="hsl(38,80%,55%)" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Benchmark */}
      <BenchmarkBar items={[
        { label: "Età Media", ...benchmarkData.etaMedia, suffix: " anni" },
        { label: "% Donne", ...benchmarkData.donnePerc, suffix: "%" },
        { label: "Tasso Turnover", ...benchmarkData.turnover, suffix: "%" },
        { label: "% Formati", ...benchmarkData.formazionePerc, suffix: "%" },
        { label: "% Lavoro Agile", ...benchmarkData.lavoroAgilePerc, suffix: "%" },
      ]} />
    </div>
  );
};
