import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchEnti } from "@/services/ca/filtriService";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { useFilters } from "@/contexts/FilterContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSostituzioneKpi, useSostituzioneEvoluzione } from "@/hooks/useSchedaSostituzione";
import type { Genere, SostituzioneFiltri } from "@/services/ca/sostituzioneService";

const nf = new Intl.NumberFormat("it-IT");
const n1 = (v: number | null | undefined) =>
  v == null ? "—" : new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 }).format(v);
const signed = (v: number | null | undefined) =>
  v == null ? "—" : `${v > 0 ? "+" : ""}${nf.format(v)}`;

const Kpi = ({ titolo, valore, unita, accent }: {
  titolo: string; valore: string; unita?: string; accent: string;
}) => (
  <div className="flex-1 min-w-[190px] rounded-lg border bg-card p-4" style={{ borderLeft: `4px solid ${accent}` }}>
    <p className="text-xs text-muted-foreground">{titolo}</p>
    <p className="mt-1 text-3xl font-bold text-foreground">
      {valore}{unita ? <span className="ml-1 text-base font-medium text-muted-foreground">{unita}</span> : null}
    </p>
  </div>
);

export const TassoSostituzioneContent = () => {
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
  const filtri: SostituzioneFiltri = {
    anno,
    istituzione: ente?.codice ?? null,
    comparto: filters.comparto !== "Tutti" ? filters.comparto : null,
    macrocategoria: filters.macrocategoria !== "Tutte" ? filters.macrocategoria : null,
    categoria: filters.categoria !== "Tutte" ? filters.categoria : null,
    regione: filters.regione !== "Tutte" ? filters.regione : null,
    genere: gMap[filters.genere] ?? "T",
  };

  const kpi = useSostituzioneKpi(filtri);
  const evo = useSostituzioneEvoluzione(filtri);
  const k = kpi.data;
  const evoRows = (evo.data ?? []).slice().sort((a, b) => a.anno - b.anno);

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
        <Kpi accent="hsl(220,60%,50%)" titolo="Tasso sostituzione" unita="%" valore={n1(k?.sostituzione_pct)} />
        <Kpi accent="hsl(175,55%,42%)" titolo="Media periodo" unita="%" valore={n1(k?.media_periodo_pct)} />
        <Kpi accent="hsl(145,50%,42%)" titolo="Anni con ricambio positivo"
          valore={k ? `${nf.format(k.anni_ricambio_positivo)} / ${nf.format(k.anni_periodo)}` : "—"} />
        <Kpi accent="hsl(25,85%,55%)" titolo="Variazione vs anno prec." unita="pp"
          valore={k?.sostituzione_var_prec_pp == null ? "—" : signed(k.sostituzione_var_prec_pp)} />
      </div>

      {/* Bar chart tasso di sostituzione (nessuna didascalia) */}
      <div className="rounded-lg border bg-card p-5">
        <h4 className="mb-3 text-sm font-semibold text-foreground">Tasso di sostituzione</h4>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={evoRows} margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
            <XAxis dataKey="anno" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${n1(v)}%`} />
            <Tooltip formatter={(v: number) => [`${n1(Number(v))}%`, "Tasso sostituzione"]} />
            <Bar dataKey="sostituzione_pct" name="Tasso sostituzione" fill="hsl(220,60%,50%)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Area chart Assunti vs Cessati */}
      <div className="rounded-lg border bg-card p-5">
        <h4 className="mb-3 text-sm font-semibold text-foreground">Assunti vs Cessati</h4>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={evoRows} margin={{ left: 0, right: 10 }}>
            <defs>
              <linearGradient id="gradAss" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(175,55%,42%)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="hsl(175,55%,42%)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gradCess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0,70%,50%)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="hsl(0,70%,50%)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
            <XAxis dataKey="anno" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => nf.format(v)} />
            <Tooltip formatter={(v: number, name) => [nf.format(Number(v)), name]} />
            <Legend />
            <Area type="monotone" dataKey="assunti" name="Assunti" stroke="hsl(175,55%,42%)" strokeWidth={2} fill="url(#gradAss)" />
            <Area type="monotone" dataKey="cessati" name="Cessati" stroke="hsl(0,70%,50%)" strokeWidth={2} fill="url(#gradCess)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Tabella dettaglio */}
      <div className="rounded-lg border bg-card p-5">
        <h4 className="mb-3 text-sm font-semibold text-foreground">Dettaglio tasso di sostituzione</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-2">Anno</th>
                <th className="py-2 pr-2 text-right">Assunti</th>
                <th className="py-2 pr-2 text-right">Cessati</th>
                <th className="py-2 pr-2 text-right">Saldo</th>
                <th className="py-2 text-right">Tasso sostituzione</th>
              </tr>
            </thead>
            <tbody>
              {evoRows.map((r) => (
                <tr key={r.anno} className="border-b last:border-0">
                  <td className="py-2 pr-2 font-medium text-foreground">{r.anno}</td>
                  <td className="py-2 pr-2 text-right">{nf.format(r.assunti)}</td>
                  <td className="py-2 pr-2 text-right">{nf.format(r.cessati)}</td>
                  <td className={`py-2 pr-2 text-right ${r.saldo < 0 ? "text-red-600" : "text-green-600"}`}>{signed(r.saldo)}</td>
                  <td className="py-2 text-right">{n1(r.sostituzione_pct)}%</td>
                </tr>
              ))}
              {evoRows.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Nessun dato</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
