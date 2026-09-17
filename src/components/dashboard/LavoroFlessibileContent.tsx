import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchEnti } from "@/services/ca/filtriService";
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useFilters } from "@/contexts/FilterContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEnteScope } from "@/hooks/useEnteScope";
import { useLavoroFlessibileKpi, useLavoroFlessibileEvoluzione } from "@/hooks/useSchedaLavoroFlessibile";
import type { LavoroFlessibileFiltri } from "@/services/ca/lavoroFlessibileService";

const nf = new Intl.NumberFormat("it-IT");
const n1 = (v: number | null | undefined) =>
  v == null ? "N/D" : new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 }).format(v);
const DONNE = "hsl(330,65%,55%)";
const UOMINI = "hsl(215,70%,50%)";
const FLEX = "hsl(175,55%,42%)";
const TEAL = "hsl(160,60%,40%)";

const Kpi = ({ titolo, valore, unita, sub, accent }: {
  titolo: string; valore: string; unita?: string; sub?: string; accent: string;
}) => (
  <div className="flex-1 min-w-[190px] rounded-lg border bg-card p-4" style={{ borderLeft: `4px solid ${accent}` }}>
    <p className="text-xs text-muted-foreground">{titolo}</p>
    <p className="mt-1 text-3xl font-bold text-foreground">
      {valore}{unita ? <span className="ml-1 text-base font-medium text-muted-foreground">{unita}</span> : null}
    </p>
    {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
  </div>
);

export const LavoroFlessibileContent = () => {
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

  const filtri: LavoroFlessibileFiltri = {
    anno,
    istituzione: ente?.codice ?? null,
    codiceFiscale: enteScope.codiceFiscale,
    comparto: filters.comparto !== "Tutti" ? filters.comparto : null,
    macrocategoria: filters.macrocategoria !== "Tutte" ? filters.macrocategoria : null,
    categoria: filters.categoria !== "Tutte" ? filters.categoria : null,
    regione: filters.regione !== "Tutte" ? filters.regione : null,
  };

  const kpi = useLavoroFlessibileKpi(filtri);
  const evo = useLavoroFlessibileEvoluzione(filtri);
  const k = kpi.data;
  const evoRows = (evo.data ?? []).slice().sort((a, b) => a.anno - b.anno);
  const primoAnno = evoRows[0]?.anno;
  const ultimoAnno = evoRows[evoRows.length - 1]?.anno;
  const rangeLabel = primoAnno && ultimoAnno ? ` (${primoAnno}–${ultimoAnno})` : "";
  const loading = kpi.isLoading || evo.isLoading;
  const errored = kpi.isError || evo.isError;

  const donutData = k ? [
    { name: "Donne", value: k.donne_pct ?? 0 },
    { name: "Uomini", value: k.uomini_pct ?? 0 },
  ] : [];

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

      {/* KPI (4 card + donut, una sola chiamata) */}
      <div className="flex flex-wrap gap-4">
        <Kpi accent={FLEX} titolo="Personale flessibile (% sul totale del personale in servizio)" unita="%"
          valore={loading ? "…" : n1(k?.lavoro_flessibile_pct)}
          sub={k ? `${nf.format(Math.round(k.unita_annue_flessibili))} unità annue` : undefined} />
        <Kpi accent={DONNE} titolo="% Donne" unita="%" valore={loading ? "…" : n1(k?.donne_pct)} />
        <Kpi accent={UOMINI} titolo="% Uomini" unita="%" valore={loading ? "…" : n1(k?.uomini_pct)} />
        <Kpi accent={TEAL} titolo={k?.primo_anno ? `Crescita vs primo anno (${k.primo_anno})` : "Crescita vs primo anno"} unita="%"
          valore={loading ? "…" : n1(k?.crescita_vs_primo_anno_pct)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Area chart evoluzione */}
        <div className="rounded-lg border bg-card p-5 lg:col-span-2">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Evoluzione lavoro flessibile{rangeLabel}</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={evoRows} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="anno" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => nf.format(v)} />
              <Tooltip formatter={(v: number) => [nf.format(Math.round(Number(v))), "Personale flessibile"]} />
              <Area type="monotone" dataKey="tutti" name="Personale flessibile" stroke={FLEX} fill={FLEX} fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut genere */}
        <div className="rounded-lg border bg-card p-5">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Distribuzione per genere</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                <Cell fill={DONNE} />
                <Cell fill={UOMINI} />
              </Pie>
              <Tooltip formatter={(v: number, name) => [`${n1(Number(v))}%`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
