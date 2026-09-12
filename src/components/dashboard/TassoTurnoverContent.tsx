import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchEnti } from "@/services/ca/filtriService";
import {
  ComposedChart, Bar, Line, BarChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import { useFilters } from "@/contexts/FilterContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTurnoverKpi, useTurnoverEvoluzione } from "@/hooks/useSchedaTurnover";
import type { Genere, TurnoverFiltri } from "@/services/ca/turnoverService";

const nf = new Intl.NumberFormat("it-IT");
const n1 = (v: number | null | undefined) =>
  v == null ? "—" : new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 }).format(v);
const signed = (v: number | null | undefined) =>
  v == null ? "—" : `${v > 0 ? "+" : ""}${nf.format(v)}`;
const deltaPP = (v: number | null | undefined) =>
  v == null ? undefined : `${v > 0 ? "▲ +" : v < 0 ? "▼ " : "→ "}${n1(v)} pp vs anno prec.`;

const Kpi = ({ titolo, valore, unita, delta, accent }: {
  titolo: string; valore: string; unita?: string; delta?: string; accent: string;
}) => (
  <div className="flex-1 min-w-[190px] rounded-lg border bg-card p-4" style={{ borderLeft: `4px solid ${accent}` }}>
    <p className="text-xs text-muted-foreground">{titolo}</p>
    <p className="mt-1 text-3xl font-bold text-foreground">
      {valore}{unita ? <span className="ml-1 text-base font-medium text-muted-foreground">{unita}</span> : null}
    </p>
    {delta ? <p className="mt-1 text-xs text-muted-foreground">{delta}</p> : null}
  </div>
);

export const TassoTurnoverContent = () => {
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
  const filtri: TurnoverFiltri = {
    anno,
    istituzione: ente?.codice ?? null,
    comparto: filters.comparto !== "Tutti" ? filters.comparto : null,
    macrocategoria: filters.macrocategoria !== "Tutte" ? filters.macrocategoria : null,
    categoria: filters.categoria !== "Tutte" ? filters.categoria : null,
    regione: filters.regione !== "Tutte" ? filters.regione : null,
    genere: gMap[filters.genere] ?? "T",
  };

  const kpi = useTurnoverKpi(filtri);
  const evo = useTurnoverEvoluzione(filtri);
  const k = kpi.data;
  const evoRows = (evo.data ?? []).slice().sort((a, b) => a.anno - b.anno);
  const saldoAccent = (k?.saldo ?? 0) >= 0 ? "hsl(145,50%,42%)" : "hsl(0,70%,50%)";

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

      {/* KPI */}
      <div className="flex flex-wrap gap-4">
        <Kpi accent="hsl(25,85%,55%)" titolo="Tasso turnover" unita="%" valore={n1(k?.turnover_pct)} delta={deltaPP(k?.turnover_var_prec_pp)} />
        <Kpi accent="hsl(0,70%,50%)" titolo="Cessati" valore={k ? nf.format(k.cessati) : "—"} />
        <Kpi accent="hsl(175,55%,42%)" titolo="Assunti" valore={k ? nf.format(k.assunti) : "—"} />
        <Kpi accent={saldoAccent} titolo="Saldo netto" valore={signed(k?.saldo)} />
      </div>

      {/* Combo chart */}
      <div className="rounded-lg border bg-card p-5">
        <h4 className="mb-3 text-sm font-semibold text-foreground">Assunti vs Cessati e Tasso di Turnover</h4>
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={evoRows} margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
            <XAxis dataKey="anno" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={(v: number) => nf.format(v)} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${n1(v)}%`} />
            <Tooltip formatter={(v: number, name) => [name === "Tasso turnover" ? `${n1(Number(v))}%` : nf.format(Number(v)), name]} />
            <Legend />
            <Bar yAxisId="left" dataKey="assunti" name="Assunti" fill="hsl(175,55%,42%)" radius={[3, 3, 0, 0]} />
            <Bar yAxisId="left" dataKey="cessati" name="Cessati" fill="hsl(0,70%,50%)" radius={[3, 3, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="turnover_pct" name="Tasso turnover" stroke="hsl(25,85%,55%)" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Saldo netto cumulato */}
      <div className="rounded-lg border bg-card p-5">
        <h4 className="mb-3 text-sm font-semibold text-foreground">Saldo netto cumulato</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={evoRows} margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
            <XAxis dataKey="anno" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => nf.format(v)} />
            <Tooltip formatter={(v: number) => [nf.format(Number(v)), "Saldo cumulato"]} />
            <ReferenceLine y={0} stroke="hsl(220,10%,60%)" />
            <Bar dataKey="saldo_cumulato" name="Saldo cumulato" fill="hsl(220,60%,50%)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabella serie storica */}
      <div className="rounded-lg border bg-card p-5">
        <h4 className="mb-3 text-sm font-semibold text-foreground">Serie storica turnover</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-2">Anno</th>
                <th className="py-2 pr-2 text-right">Assunti</th>
                <th className="py-2 pr-2 text-right">Cessati</th>
                <th className="py-2 pr-2 text-right">Saldo</th>
                <th className="py-2 pr-2 text-right">Tasso turnover</th>
                <th className="py-2 text-right">Tasso ingresso</th>
              </tr>
            </thead>
            <tbody>
              {evoRows.map((r) => (
                <tr key={r.anno} className="border-b last:border-0">
                  <td className="py-2 pr-2 font-medium text-foreground">{r.anno}</td>
                  <td className="py-2 pr-2 text-right">{nf.format(r.assunti)}</td>
                  <td className="py-2 pr-2 text-right">{nf.format(r.cessati)}</td>
                  <td className={`py-2 pr-2 text-right ${r.saldo < 0 ? "text-red-600" : "text-green-600"}`}>{signed(r.saldo)}</td>
                  <td className="py-2 pr-2 text-right">{n1(r.turnover_pct)}%</td>
                  <td className="py-2 text-right">{n1(r.ingresso_pct)}%</td>
                </tr>
              ))}
              {evoRows.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">Nessun dato</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
