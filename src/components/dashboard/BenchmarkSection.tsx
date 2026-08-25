import { useState } from "react";
import { filterOptions, benchmarkData, distribuzioneEta } from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const VIEWS = ["cluster", "complesso"] as const;
type ViewMode = typeof VIEWS[number];

// Mock benchmark distribution data per fascia di età
const getBenchmarkEtaData = (mode: ViewMode) => {
  const clusterData = [
    { fascia: "Fino a 35 anni", valore: 4.2 },
    { fascia: "35 - 50", valore: 34.8 },
    { fascia: "50 - 55", valore: 28.5 },
    { fascia: "55-60", valore: 22.1 },
    { fascia: "Oltre 65 anni", valore: 10.4 },
  ];
  const complessoData = [
    { fascia: "Fino a 35 anni", valore: 5.1 },
    { fascia: "35 - 50", valore: 32.0 },
    { fascia: "50 - 55", valore: 30.2 },
    { fascia: "55-60", valore: 21.5 },
    { fascia: "Oltre 65 anni", valore: 11.2 },
  ];
  return mode === "cluster" ? clusterData : complessoData;
};

const totalPersonale = distribuzioneEta.reduce((s, r) => s + r.totale, 0);
const totalUomini = distribuzioneEta.reduce((s, r) => s + r.uomini, 0);
const totalDonne = distribuzioneEta.reduce((s, r) => s + r.donne, 0);

const adminTotale = distribuzioneEta.map(r => ({
  fascia: r.fascia,
  valore: Number(((r.totale / totalPersonale) * 100).toFixed(1)),
}));
const adminUomini = distribuzioneEta.map(r => ({
  fascia: r.fascia,
  valore: Number(((r.uomini / totalUomini) * 100).toFixed(1)),
}));
const adminDonne = distribuzioneEta.map(r => ({
  fascia: r.fascia,
  valore: Number(((r.donne / totalDonne) * 100).toFixed(1)),
}));

export const BenchmarkSection = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("cluster");
  const [comparto, setComparto] = useState("Tutti");
  const [tipologia, setTipologia] = useState("Tutte");
  const [regione, setRegione] = useState("Tutte");
  const [dimensione, setDimensione] = useState("Tutte");

  const benchEta = getBenchmarkEtaData(viewMode);

  // Merge admin + benchmark data for comparison charts
  const mergedTotale = adminTotale.map((r, i) => ({
    fascia: r.fascia,
    amministrazione: r.valore,
    benchmark: benchEta[i].valore,
  }));
  const mergedUomini = adminUomini.map((r, i) => ({
    fascia: r.fascia,
    amministrazione: r.valore,
    benchmark: Number((benchEta[i].valore * 0.95).toFixed(1)),
  }));
  const mergedDonne = adminDonne.map((r, i) => ({
    fascia: r.fascia,
    amministrazione: r.valore,
    benchmark: Number((benchEta[i].valore * 1.05).toFixed(1)),
  }));

  const renderComparisonChart = (
    title: string,
    data: { fascia: string; amministrazione: number; benchmark: number }[],
    etaMediaAmm: string,
    etaMediaBench: string,
  ) => (
    <div className="flex-1 min-w-[260px]">
      <h4 className="text-sm font-semibold text-foreground mb-1 text-center">{title}</h4>
      <div className="flex justify-center gap-4 mb-2 text-[10px] text-muted-foreground">
        <span>Età media amm.: <strong className="text-foreground">{etaMediaAmm}</strong></span>
        <span>Età media {viewMode === "cluster" ? "cluster" : "PA"}: <strong className="text-foreground">{etaMediaBench}</strong></span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 15, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
          <XAxis dataKey="fascia" tick={{ fontSize: 9 }} interval={0} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(v: number) => `${v}%`} />
          <Bar dataKey="amministrazione" fill="hsl(280,45%,55%)" radius={[3, 3, 0, 0]} name="Tua amministrazione" />
          <Bar dataKey="benchmark" fill="hsl(220,15%,75%)" radius={[3, 3, 0, 0]} name={viewMode === "cluster" ? "Cluster" : "Complesso PA"} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        I dati di benchmarking sono preimpostati di default rispetto al <strong className="text-foreground">cluster di riferimento</strong> della tua amministrazione.
        Puoi visualizzare i dati per il complesso delle PA o filtrare per Comparto, Tipologia, Dimensione e Regione.
      </p>

      {/* Toggle cluster / complesso */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name="benchView"
            checked={viewMode === "complesso"}
            onChange={() => setViewMode("complesso")}
            className="rounded border-border"
          />
          <span className="text-xs text-foreground">Dati nel complesso</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name="benchView"
            checked={viewMode === "cluster"}
            onChange={() => setViewMode("cluster")}
            className="rounded border-border"
          />
          <span className="text-xs text-foreground">Cluster di appartenenza</span>
        </label>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: "Per Comparto", value: comparto, setter: setComparto, options: filterOptions.comparti },
          { label: "Per Tipologia amministrazione", value: tipologia, setter: setTipologia, options: filterOptions.tipologie },
          { label: "Per Regione", value: regione, setter: setRegione, options: filterOptions.regioni },
          { label: "Per Dimensione amministrazione", value: dimensione, setter: setDimensione, options: filterOptions.dimensioni },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-2">
            <label className="text-xs font-medium text-foreground whitespace-nowrap">{f.label}:</label>
            <select
              value={f.value}
              onChange={(e) => f.setter(e.target.value)}
              className="rounded border bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring min-w-[200px]"
            >
              {f.options.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(280,45%,55%)" }} />
          Tua amministrazione
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(220,15%,75%)" }} />
          {viewMode === "cluster" ? "Cluster di appartenenza" : "Complesso PA"}
        </span>
      </div>

      {/* Three comparison bar charts */}
      <div className="flex gap-4 flex-wrap">
        {renderComparisonChart("Totale", mergedTotale, "49,8", viewMode === "cluster" ? "51,2" : "50,5")}
        {renderComparisonChart("Uomini", mergedUomini, "50,2", viewMode === "cluster" ? "52,0" : "51,1")}
        {renderComparisonChart("Donne", mergedDonne, "49,1", viewMode === "cluster" ? "50,5" : "49,8")}
      </div>
    </div>
  );
};
