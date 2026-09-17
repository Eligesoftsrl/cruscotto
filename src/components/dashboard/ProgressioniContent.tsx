import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchEnti } from "@/services/ca/filtriService";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { useFilters } from "@/contexts/FilterContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEnteScope } from "@/hooks/useEnteScope";
import { useProgressioniKpi, useProgressioniEvoluzione } from "@/hooks/useSchedaProgressioni";
import type { ProgressioniFiltri } from "@/services/ca/progressioniService";

const nf = new Intl.NumberFormat("it-IT");
const VERT = "hsl(215,70%,50%)";
const ORIZZ = "hsl(175,55%,42%)";
const TOT = "hsl(25,85%,55%)";

const Kpi = ({ titolo, valore, accent }: { titolo: string; valore: string; accent: string }) => (
  <div className="flex-1 min-w-[190px] rounded-lg border bg-card p-4" style={{ borderLeft: `4px solid ${accent}` }}>
    <p className="text-xs text-muted-foreground">{titolo}</p>
    <p className="mt-1 text-3xl font-bold text-foreground">{valore}</p>
  </div>
);

export const ProgressioniContent = () => {
  const { filters } = useFilters();
  const { profile } = useAuth();
  const isDfp = profile?.role === "dfp";
  const enteScope = useEnteScope();
  const [enteTerm, setEnteTerm] = useState("");
  const [ente, setEnte] = useState<{ codice: string; descrizione: string } | null>(null);

  const anno = Number(filters.anno) || 2023;
  const entiQ = useQuery({
    queryKey: ["enti-search", anno, enteTerm],
    queryFn: () => searchEnti(anno, enteTerm),
    enabled: enteTerm.trim().length >= 2,
  });

  // NB: nessun p_genere (la scheda non usa il filtro Genere).
  const filtri: ProgressioniFiltri = {
    anno,
    istituzione: ente?.codice ?? null,
    codiceFiscale: enteScope.codiceFiscale,
    comparto: filters.comparto !== "Tutti" ? filters.comparto : null,
    macrocategoria: filters.macrocategoria !== "Tutte" ? filters.macrocategoria : null,
    categoria: filters.categoria !== "Tutte" ? filters.categoria : null,
    regione: filters.regione !== "Tutte" ? filters.regione : null,
  };

  const kpi = useProgressioniKpi(filtri);
  const evo = useProgressioniEvoluzione(filtri);
  const k = kpi.data;
  const evoRows = (evo.data ?? []).slice().sort((a, b) => a.anno - b.anno);
  const primoAnno = evoRows[0]?.anno;
  const ultimoAnno = evoRows[evoRows.length - 1]?.anno;
  const rangeLabel = primoAnno && ultimoAnno ? ` (${primoAnno}–${ultimoAnno})` : "";

  const loading = kpi.isLoading || evo.isLoading;
  const errored = kpi.isError || evo.isError;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">
          {ente ? <>Amministrazione: <span className="text-primary">{ente.descrizione}</span></> : enteScope.label ? <>Amministrazione: <span className="text-primary">{enteScope.label}</span></> : "Totale PA"} · Conto Annuale RGS · Anno {filtri.anno}
        </p>
        {enteScope.control}
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

      {/* KPI (3 card, una sola chiamata). Le etichette non riportano l'anno. */}
      <div className="flex flex-wrap gap-4">
        <Kpi accent={VERT} titolo="Progressioni Verticali" valore={loading ? "…" : (k ? nf.format(k.verticali) : "N/D")} />
        <Kpi accent={ORIZZ} titolo="Progressioni Orizzontali" valore={loading ? "…" : (k ? nf.format(k.orizzontali) : "N/D")} />
        <Kpi accent={TOT} titolo="Totale Progressioni" valore={loading ? "…" : (k ? nf.format(k.totale) : "N/D")} />
      </div>

      {/* Bar chart per anno */}
      <div className="rounded-lg border bg-card p-5">
        <h4 className="mb-3 text-sm font-semibold text-foreground">Progressioni per anno{rangeLabel}</h4>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={evoRows} margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
            <XAxis dataKey="anno" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => nf.format(v)} />
            <Tooltip formatter={(v: number, name) => [nf.format(Number(v)), name]} />
            <Legend />
            <Bar dataKey="verticali" name="Verticali" fill={VERT} radius={[3, 3, 0, 0]} />
            <Bar dataKey="orizzontali" name="Orizzontali" fill={ORIZZ} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line chart trend (stesse due serie) */}
      <div className="rounded-lg border bg-card p-5">
        <h4 className="mb-3 text-sm font-semibold text-foreground">Trend progressioni{rangeLabel}</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={evoRows} margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
            <XAxis dataKey="anno" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => nf.format(v)} />
            <Tooltip formatter={(v: number, name) => [nf.format(Number(v)), name]} />
            <Legend />
            <Line type="monotone" dataKey="verticali" name="Verticali" stroke={VERT} strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="orizzontali" name="Orizzontali" stroke={ORIZZ} strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
