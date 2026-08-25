import { FilterBar } from "../FilterBar";
import { KpiCard } from "../KpiCard";
import { formazione } from "@/data/mockData";
import { GraduationCap, Clock, Users } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";

export const FormazioneSection = () => {
  return (
    <div className="space-y-6">
      <FilterBar showMacrocategoria />

      <div className="grid gap-4 sm:grid-cols-4">
        <KpiCard title="% Formati" value={formazione.formatiPerc} suffix="%" icon={GraduationCap} accent />
        <KpiCard title="Personale Formato" value={formazione.formatiTotale} icon={Users} />
        <KpiCard title="Ore Totali" value={formazione.oreFormazione.toLocaleString("it-IT")} icon={Clock} />
        <KpiCard title="Ore pro-capite" value={formazione.oreProCapite} suffix="h" icon={Clock} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="chart-container">
          <h3 className="section-title mb-4">% Personale Formato — Serie Storica</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formazione.serieStorica}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="anno" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Line type="monotone" dataKey="formatiPerc" name="% Formati" stroke="hsl(38,80%,55%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(38,80%,55%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 className="section-title mb-4">Formati per Anno (valori assoluti)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formazione.serieStorica.map(d => ({
              ...d,
              formati: Math.round(12450 * d.formatiPerc / 100)
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="anno" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="formati" name="Formati" fill="hsl(220,60%,50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
