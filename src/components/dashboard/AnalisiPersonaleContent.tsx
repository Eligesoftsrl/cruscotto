import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchEnti } from "@/services/ca/filtriService";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useFilters } from "@/contexts/FilterContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  usePersonaleKpi, usePersonaleCategorie, usePersonaleTitoli, usePersonaleEvoluzione,
} from "@/hooks/useSchedaPersonale";
import type { Genere, PersonaleFiltri } from "@/services/ca/personaleService";

const nf = new Intl.NumberFormat("it-IT");
const n1 = (v: number | null | undefined) =>
  v == null ? "—" : new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 }).format(v);
const signed = (v: number | null | undefined) => (v == null ? "—" : `${v > 0 ? "+" : ""}${n1(v)}`);
const PALETTE = ["hsl(215,70%,50%)", "hsl(175,55%,42%)", "hsl(25,85%,55%)", "hsl(330,65%,55%)", "hsl(260,55%,55%)", "hsl(160,60%,40%)"];

const Kpi = ({ titolo, valore, unita, accent }: { titolo: string; valore: string; unita?: string; accent: string }) => (
  <div className="flex-1 min-w-[190px] rounded-lg border bg-card p-4" style={{ borderLeft: `4px solid ${accent}` }}>
    <p className="text-xs text-muted-foreground">{titolo}</p>
    <p className="mt-1 text-3xl font-bold text-foreground">{valore}{unita ? <span className="ml-1 text-base font-medium text-muted-foreground">{unita}</span> : null}</p>
  </div>
);

export const AnalisiPersonaleContent = () => {
  const { filters } = useFilters();
  const { profile } = useAuth();
  const isDfp = profile?.role === "dfp";
  const [enteTerm, setEnteTerm] = useState("");
  const [ente, setEnte] = useState<{ codice: string; descrizione: string } | null>(null);

  const anno = Number(filters.anno) || 2023;
  const entiQ = useQuery({
    queryKey: ["enti-search", anno, enteTerm],
    queryFn: () => searchEnti(anno, enteTerm),
    enabled: enteTerm.trim().length >= 2,
  });

  const gMap: Record<string, Genere> = { Tutti: "T", Uomini: "U", Donne: "D" };
  const filtri: PersonaleFiltri = {
    anno,
    istituzione: ente?.codice ?? null,
    comparto: filters.comparto !== "Tutti" ? filters.comparto : null,
    macrocategoria: filters.macrocategoria !== "Tutte" ? filters.macrocategoria : null,
    categoria: filters.categoria !== "Tutte" ? filters.categoria : null,
    regione: filters.regione !== "Tutte" ? filters.regione : null,
    genere: gMap[filters.genere] ?? "T",
  };

  const kpi = usePersonaleKpi(filtri);
  const cat = usePersonaleCategorie(filtri);
  const tit = usePersonaleTitoli(filtri);
  const evo = usePersonaleEvoluzione(filtri);
  const k = kpi.data;
  const catRows = (cat.data ?? []).slice().sort((a, b) => b.valore - a.valore);
  const titRows = (tit.data ?? []).slice().sort((a, b) => b.valore - a.valore).slice(0, 6);
  const evoRows = (evo.data ?? []).slice().sort((a, b) => a.anno - b.anno);
  const loading = kpi.isLoading;
  const errored = kpi.isError || cat.isError || tit.isError || evo.isError;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">
          {ente ? <>Amministrazione: <span className="text-primary">{ente.descrizione}</span></> : "Totale PA"} · Conto Annuale RGS · Anno {filtri.anno}
        </p>
        <div className="relative w-[320px] max-w-full" style={{ display: isDfp ? undefined : "none" }}>
          <input value={ente ? ente.descrizione : enteTerm}
            onChange={(e) => { setEnte(null); setEnteTerm(e.target.value); }}
            placeholder="Cerca un ente (es. Roma Capitale)…"
            className="w-full rounded border bg-background px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring" />
          {ente && (
            <button onClick={() => { setEnte(null); setEnteTerm(""); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground hover:text-destructive">✕</button>
          )}
          {!ente && (entiQ.data?.length ?? 0) > 0 && (
            <div className="absolute z-50 mt-1 w-full max-h-[240px] overflow-y-auto rounded-lg border bg-card shadow-lg">
              {entiQ.data!.map((o) => (
                <button key={o.codice} onClick={() => { setEnte({ codice: o.codice, descrizione: o.descrizione }); setEnteTerm(""); }}
                  className="block w-full text-left px-3 py-1.5 text-[11px] text-foreground hover:bg-muted">
                  {o.descrizione} <span className="text-muted-foreground">({o.codice})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {errored && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-xs text-destructive">
          Errore nel caricamento dei dati della scheda.
        </div>
      )}

      {/* KPI */}
      <div className="flex flex-wrap gap-4">
        <Kpi accent="hsl(215,70%,50%)" titolo="Personale totale" valore={loading ? "…" : (k?.personale != null ? nf.format(k.personale) : "—")} />
        <Kpi accent="hsl(25,85%,55%)" titolo="Dirigenti" valore={loading ? "…" : (k?.dirigenti != null ? nf.format(k.dirigenti) : "—")} />
        <Kpi accent="hsl(175,55%,42%)" titolo="Non dirigenti" valore={loading ? "…" : (k?.non_dirigenti != null ? nf.format(k.non_dirigenti) : "—")} />
        <Kpi accent="hsl(160,60%,40%)" titolo="Variazione % vs anno prec." unita="%" valore={loading ? "…" : signed(k?.var_prec_pct)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personale per macrocategoria */}
        <div className="rounded-lg border bg-card p-5">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Personale per macrocategoria</h4>
          <ResponsiveContainer width="100%" height={Math.max(220, catRows.length * 26)}>
            <BarChart data={catRows} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v: number) => nf.format(v)} />
              <YAxis type="category" dataKey="descrizione" tick={{ fontSize: 9 }} width={200} />
              <Tooltip formatter={(v: number) => [nf.format(Number(v)), "Personale"]} />
              <Bar dataKey="valore" name="Personale" fill="hsl(215,70%,50%)" barSize={16} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10.5px] text-muted-foreground mt-2 italic">
            Nota: Per popolare il grafico è necessario selezionare un comparto.
          </p>
        </div>

        {/* Distribuzione per titolo di studio */}
        <div className="rounded-lg border bg-card p-5">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Distribuzione per titolo di studio</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={titRows} dataKey="valore" nameKey="titolo_studio" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {titRows.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number, name) => [nf.format(Number(v)), name]} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Evoluzione personale */}
      <div className="rounded-lg border bg-card p-5">
        <h4 className="mb-3 text-sm font-semibold text-foreground">Evoluzione personale</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={evoRows} margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
            <XAxis dataKey="anno" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => nf.format(v)} />
            <Tooltip formatter={(v: number, name) => [nf.format(Number(v)), name]} />
            <Legend />
            <Line type="monotone" dataKey="tutti" name="Totale" stroke="hsl(215,70%,50%)" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="donne" name="Donne" stroke="hsl(330,65%,55%)" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="uomini" name="Uomini" stroke="hsl(215,45%,45%)" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
