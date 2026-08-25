import { useState } from "react";
import { distribuzioneEta, serieStoricaEta, filterOptions, benchmarkData } from "@/data/mockData";
import { BenchmarkSection } from "./BenchmarkSection";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from "recharts";

const AGE_BANDS = ["Fino a 35 anni", "35 - 50", "50 - 55", "55-60", "Oltre 65 anni"] as const;
const BAND_COLORS = [
  "hsl(220,60%,50%)",   // blue
  "hsl(25,85%,55%)",    // orange
  "hsl(145,50%,42%)",   // green
  "hsl(195,80%,50%)",   // cyan
  "hsl(280,45%,55%)",   // purple
];

export const AnalisiEtaContent = () => {
  const [serieMode, setSerieMode] = useState<"totale" | "uomini" | "donne">("totale");

  const totalPersonale = distribuzioneEta.reduce((s, r) => s + r.totale, 0);
  const totalUomini = distribuzioneEta.reduce((s, r) => s + r.uomini, 0);
  const totalDonne = distribuzioneEta.reduce((s, r) => s + r.donne, 0);

  const etaPercTotale = distribuzioneEta.map(r => ({
    fascia: r.fascia,
    valore: Number(((r.totale / totalPersonale) * 100).toFixed(1)),
  }));
  const etaPercUomini = distribuzioneEta.map(r => ({
    fascia: r.fascia,
    valore: Number(((r.uomini / totalUomini) * 100).toFixed(1)),
  }));
  const etaPercDonne = distribuzioneEta.map(r => ({
    fascia: r.fascia,
    valore: Number(((r.donne / totalDonne) * 100).toFixed(1)),
  }));

  const renderBarChart = (
    title: string,
    data: { fascia: string; valore: number }[],
    color: string,
    showLabel?: boolean
  ) => (
    <div className="chart-container flex-1 min-w-[220px]">
      <h4 className="text-sm font-semibold text-foreground mb-3 text-center">{title}</h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 15, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
          <XAxis dataKey="fascia" tick={{ fontSize: 9 }} interval={0} angle={0} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(v: number) => `${v}%`} />
          <Bar
            dataKey="valore"
            fill={color}
            radius={[3, 3, 0, 0]}
            label={showLabel !== false ? { position: "top", fontSize: 10, formatter: (v: number) => `${v}%` } : undefined}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header description */}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          Dati del Conto Annuale - Rilevazione censuaria sulle amministrazioni pubbliche, effettuata dal Dipartimento della Ragioneria Generale dello Stato.
        </p>
      </div>

      {/* ═══════════ PARTE 1: Indicatori di sintesi amministrazione ═══════════ */}
      <div className="rounded-lg border bg-card p-5 space-y-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-6 w-1 rounded-full bg-primary" />
          <h3 className="text-base font-bold text-foreground">Dati dell'amministrazione</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Ultimo aggiornamento anno 2023 · Serie storica 2012 - 2023
        </p>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-foreground whitespace-nowrap">Macrocategoria:</label>
          <select className="rounded border bg-background px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring min-w-[300px]">
            {filterOptions.macrocategorie.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-foreground whitespace-nowrap">Categoria:</label>
          <select className="rounded border bg-background px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring min-w-[300px]">
            {filterOptions.categorie.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Three bar charts — percentuali */}
      <div className="flex gap-4 flex-wrap">
        {renderBarChart("Totale", etaPercTotale, "hsl(280,45%,55%)")}
        {renderBarChart("Uomini", etaPercUomini, "hsl(220,60%,50%)")}
        {renderBarChart("Donne", etaPercDonne, "hsl(195,80%,50%)")}
      </div>

      {/* Stacked area chart — serie storica */}
      <div className="chart-container">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-foreground">Totale personale</h4>
          <div className="flex items-center gap-4">
            {(["uomini", "donne", "totale"] as const).map((mode) => (
              <label key={mode} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={serieMode === mode}
                  onChange={() => setSerieMode(mode)}
                  className="rounded border-border"
                />
                <span className="text-xs text-foreground capitalize">{mode === "totale" ? "Totale" : mode === "uomini" ? "Uomini" : "Donne"}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mb-2 flex-wrap">
          {AGE_BANDS.map((band, i) => (
            <span key={band} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: BAND_COLORS[i] }} />
              {band}
            </span>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={serieStoricaEta}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
            <XAxis dataKey="anno" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} />
            <Tooltip />
            {AGE_BANDS.map((band, i) => (
              <Area
                key={band}
                type="monotone"
                dataKey={band}
                stackId="1"
                fill={BAND_COLORS[i]}
                stroke={BAND_COLORS[i]}
                fillOpacity={0.85}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

        {/* Right side links */}
        <div className="chart-container">
          <h4 className="text-sm font-semibold text-foreground mb-3">Approfondimenti</h4>
          <ul className="space-y-1.5">
            {[
              "Indicatori per singola amministrazione",
              "Distribuzione del personale per fascia di età",
              "Distribuzione del personale per anzianità lavorativa",
              "Cessati e assunti",
              "Previsione uscite",
            ].map((link) => (
              <li key={link}>
                <button className="text-xs text-primary hover:underline text-left">{link}</button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[10px] text-muted-foreground italic">
            Nota: le classi di età e di anzianità sono state rielaborate rispetto a quelle del conto annuale.
            Sulle previsioni di uscite si deve fare un approfondimento.
          </p>
        </div>
      </div>
      {/* ═══════════ Fine PARTE 1 ═══════════ */}

      {/* Separatore visivo */}
      <div className="flex items-center gap-4 py-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Analisi di Benchmarking</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* ═══════════ PARTE 2: Benchmarking ═══════════ */}
      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-1 rounded-full bg-accent" />
          <h3 className="text-base font-bold text-foreground">Indicatori per cluster di amministrazione pubblica</h3>
        </div>
        <BenchmarkSection />
      </div>
    </div>
  );
};
