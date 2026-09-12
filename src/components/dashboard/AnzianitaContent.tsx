import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchEnti } from "@/services/ca/filtriService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend,
} from "recharts";
import { useFilters } from "@/contexts/FilterContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAnzianitaKpi, useAnzianitaFasce, useAnzianitaEvoluzione,
} from "@/hooks/useSchedaAnzianita";
import type { Genere, AnzFiltri } from "@/services/ca/anzianitaService";

/* --------------------------- helper di formato --------------------------- */
const nf = new Intl.NumberFormat("it-IT");
const n1 = (v: number | null | undefined) =>
  v == null ? "\u2014" : new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 }).format(v);

/* ------------------------------ KPI card --------------------------------- */
const Kpi = ({
  titolo, valore, unita, accent,
}: {
  titolo: string; valore: string; unita?: string; accent: string;
}) => (
  <div className="flex-1 min-w-[190px] rounded-lg border bg-card p-4" style={{ borderLeft: `4px solid ${accent}` }}>
    <p className="text-xs text-muted-foreground">{titolo}</p>
    <p className="mt-1 text-3xl font-bold text-foreground">
      {valore}{unita ? <span className="ml-1 text-base font-medium text-muted-foreground">{unita}</span> : null}
    </p>
  </div>
);

/* Palette per le 5 fasce di anzianita (area chart impilato al 100%). */
const FASCIA_COLORS = [
  "hsl(220,60%,50%)",
  "hsl(25,85%,55%)",
  "hsl(175,55%,42%)",
  "hsl(280,45%,55%)",
  "hsl(0,70%,50%)",
];

export const AnzianitaContent = () => {
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
  const genere: Genere = gMap[filters.genere] ?? "T";
  const filtri: AnzFiltri = {
    anno,
    istituzione: ente?.codice ?? null,
    comparto: filters.comparto !== "Tutti" ? filters.comparto : null,
    macrocategoria: filters.macrocategoria !== "Tutte" ? filters.macrocategoria : null,
    categoria: filters.categoria !== "Tutte" ? filters.categoria : null,
    regione: filters.regione !== "Tutte" ? filters.regione : null,
    genere,
  };

  const kpi = useAnzianitaKpi(filtri);
  const fasce = useAnzianitaFasce(filtri);
  const evo = useAnzianitaEvoluzione(filtri);

  const k = kpi.data;
  const fasceRows = (fasce.data ?? []).slice().sort((a, b) => a.ordine - b.ordine);
  const evoRows = evo.data ?? [];

  // Sbiadimento delle barre del genere non selezionato.
  const opUomini = genere === "D" ? 0.25 : 1;
  const opDonne = genere === "U" ? 0.25 : 1;

  // Pivot dell'evoluzione: x=anno, serie=fascia, y=percentuale.
  const fasceOrdinate = [
    ...new Map(
      evoRows.slice().sort((a, b) => a.ordine - b.ordine).map((r) => [r.ordine, r.fascia]),
    ).values(),
  ];
  const evoByAnno = new Map<number, Record<string, number>>();
  for (const r of evoRows) {
    const row = evoByAnno.get(r.anno) ?? { anno: r.anno };
    row[r.fascia] = r.percentuale;
    evoByAnno.set(r.anno, row);
  }
  const evoPivot = [...evoByAnno.values()].sort((a, b) => a.anno - b.anno);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">
          {ente ? <>Amministrazione: <span className="text-primary">{ente.descrizione}</span></> : "Totale PA"} · Conto Annuale RGS · Anno {filtri.anno}
        </p>
        <div className="relative w-[320px] max-w-full" style={{ display: isDfp ? undefined : "none" }}>
          <input
            value={ente ? ente.descrizione : enteTerm}
            onChange={(e) => { setEnte(null); setEnteTerm(e.target.value); }}
            placeholder="Cerca un ente (es. Roma Capitale)…"
            className="w-full rounded border bg-background px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring"
          />
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

      {/* ---------------------------- KPI CARDS ---------------------------- */}
      <div className="flex flex-wrap gap-4">
        <Kpi accent="hsl(220,60%,50%)" titolo="Personale totale"
          valore={k ? nf.format(k.personale) : "\u2014"} />
        <Kpi accent="hsl(25,85%,55%)" titolo="Fascia prevalente"
          valore={k?.fascia_prevalente ?? "\u2014"} />
        <Kpi accent="hsl(280,45%,55%)" titolo="% fascia prevalente" unita="%"
          valore={n1(k?.fascia_prevalente_pct)} />
        <Kpi accent="hsl(145,50%,42%)" titolo="Anzianità media stimata" unita="anni"
          valore={n1(k?.anzianita_media)} />
      </div>

      {/* ------------------- DISTRIBUZIONE + EVOLUZIONE ------------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Distribuzione per anzianità</h4>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={fasceRows} barGap={2} margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="fascia" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => nf.format(v)} />
              <Tooltip formatter={(v: number, name) => [nf.format(Number(v)), name === "uomini" ? "Uomini" : "Donne"]} />
              <Legend formatter={(v) => (v === "uomini" ? "Uomini" : "Donne")} />
              <Bar dataKey="uomini" fill="hsl(220,60%,50%)" fillOpacity={opUomini} radius={[3, 3, 0, 0]} />
              <Bar dataKey="donne" fill="hsl(25,85%,55%)" fillOpacity={opDonne} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Evoluzione composizione per anzianità</h4>
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={evoPivot} stackOffset="expand" margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="anno" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${Math.round(v * 100)}%`} />
              <Tooltip formatter={(v: number) => `${n1(Number(v))}%`} />
              <Legend />
              {fasceOrdinate.map((f, i) => (
                <Area key={f} type="monotone" dataKey={f} stackId="1"
                  stroke={FASCIA_COLORS[i % FASCIA_COLORS.length]}
                  fill={FASCIA_COLORS[i % FASCIA_COLORS.length]} fillOpacity={0.7} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ------------------- TABELLA DETTAGLIO ------------------- */}
      <div className="rounded-lg border bg-card p-5">
        <h4 className="mb-3 text-sm font-semibold text-foreground">Dettaglio per fascia di anzianità</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-2">Fascia</th>
                <th className="py-2 pr-2 text-right">Uomini</th>
                <th className="py-2 pr-2 text-right">Donne</th>
                <th className="py-2 pr-2 text-right">Totale</th>
                <th className="py-2 text-right">% sul totale</th>
              </tr>
            </thead>
            <tbody>
              {fasceRows.map((r) => (
                <tr key={r.fascia} className="border-b last:border-0">
                  <td className="py-2 pr-2 font-medium text-foreground">{r.fascia}</td>
                  <td className="py-2 pr-2 text-right">{nf.format(r.uomini)}</td>
                  <td className="py-2 pr-2 text-right">{nf.format(r.donne)}</td>
                  <td className="py-2 pr-2 text-right font-semibold text-foreground">{nf.format(r.tutti)}</td>
                  <td className="py-2 text-right">{n1(r.percentuale)}%</td>
                </tr>
              ))}
              {fasceRows.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Nessun dato</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
