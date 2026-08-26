import { FilterBar } from "../FilterBar";
import { useProgressioniData } from "@/hooks/useProgressioniData";
import { ArrowUpRight } from "lucide-react";
import { KpiCard } from "../KpiCard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line
} from "recharts";

export const ProgressioniSection = () => {
  const { progressioni, isLoading, error } = useProgressioniData();

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Caricamento dati…</div>;
  if (error) return <div className="p-6 text-sm text-destructive">Errore nel caricamento dei dati.</div>;

  if (!progressioni.length) {
    return (
      <div className="space-y-6">
        <FilterBar showMacrocategoria />
        <div className="p-6 text-sm text-muted-foreground">Nessun dato disponibile.</div>
      </div>
    );
  }

  const latest = progressioni[progressioni.length - 1];

  return (
    <div className="space-y-6">
      <FilterBar showMacrocategoria />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard title="Progressioni Verticali 2023" value={latest.verticali} icon={ArrowUpRight} accent />
        <KpiCard title="Progressioni Orizzontali 2023" value={latest.orizzontali} icon={ArrowUpRight} />
        <KpiCard title="Totale Progressioni" value={latest.verticali + latest.orizzontali} icon={ArrowUpRight} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="chart-container">
          <h3 className="section-title mb-4">Progressioni per Anno</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressioni}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="anno" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="verticali" name="Verticali" fill="hsl(220,60%,25%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="orizzontali" name="Orizzontali" fill="hsl(38,80%,55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 className="section-title mb-4">Trend Progressioni</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressioni}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="anno" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconType="circle" iconSize={8} />
              <Line type="monotone" dataKey="verticali" name="Verticali" stroke="hsl(220,60%,25%)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="orizzontali" name="Orizzontali" stroke="hsl(38,80%,55%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
