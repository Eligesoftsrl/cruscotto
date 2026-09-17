import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchEnti } from "@/services/ca/filtriService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useFilters } from "@/contexts/FilterContext";
import { useAuth } from "@/contexts/AuthContext";
import { useGenereKpi, useGenereQualifiche, useGenerePiramide } from "@/hooks/useSchedaGenere";
import type { GenereFiltri } from "@/services/ca/genereService";

const nf = new Intl.NumberFormat("it-IT");
const n1 = (v: number | null | undefined) =>
  v == null ? "N/D" : new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 }).format(v);
const DONNE = "hsl(330,65%,55%)";
const UOMINI = "hsl(215,70%,50%)";

const Kpi = ({ titolo, valore, unita, accent }: { titolo: string; valore: string; unita?: string; accent: string }) => (
  <div className="flex-1 min-w-[190px] rounded-lg border bg-card p-4" style={{ borderLeft: `4px solid ${accent}` }}>
    <p className="text-xs text-muted-foreground">{titolo}</p>
    <p className="mt-1 text-2xl font-bold text-foreground">{valore}{unita ? <span className="ml-1 text-base font-medium text-muted-foreground">{unita}</span> : null}</p>
  </div>
);

export const AnalisiGenereContent = () => {
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

  // Nessun p_genere: il confronto tra generi è l'oggetto della scheda.
  const filtri: GenereFiltri = {
    anno,
    istituzione: ente?.codice ?? null,
    comparto: filters.comparto !== "Tutti" ? filters.comparto : null,
    macrocategoria: filters.macrocategoria !== "Tutte" ? filters.macrocategoria : null,
    categoria: filters.categoria !== "Tutte" ? filters.categoria : null,
    regione: filters.regione !== "Tutte" ? filters.regione : null,
  };

  const kpi = useGenereKpi(filtri);
  const qual = useGenereQualifiche(filtri);
  const pir = useGenerePiramide(filtri);
  const k = kpi.data;
  const qualRows = (qual.data ?? []).slice().sort((a, b) => b.tutti - a.tutti).slice(0, 20);
  const pirRows = (pir.data ?? []).slice().sort((a, b) => a.ordine - b.ordine);
  const loading = kpi.isLoading;
  const errored = kpi.isError || qual.isError || pir.isError;

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
        <Kpi accent={DONNE} titolo="% Donne" unita="%" valore={loading ? "…" : n1(k?.donne_pct)} />
        <Kpi accent={UOMINI} titolo="% Uomini" unita="%" valore={loading ? "…" : n1(k?.uomini_pct)} />
        <Kpi accent="hsl(25,85%,55%)" titolo="Gender gap" unita="%" valore={loading ? "…" : n1(k?.gender_gap_pp)} />
        <Kpi accent="hsl(160,60%,40%)" titolo="Qualifica più bilanciata" valore={loading ? "…" : (k?.desc_qualifica_bilanciata ?? "N/D")} />
      </div>

      {/* Distribuzione genere per qualifica (stacked, max 20) */}
      <div className="rounded-lg border bg-card p-5">
        <h4 className="mb-3 text-sm font-semibold text-foreground">Distribuzione genere per qualifica (prime 20)</h4>
        <ResponsiveContainer width="100%" height={Math.max(280, qualRows.length * 24)}>
          <BarChart data={qualRows} layout="vertical" margin={{ left: 10, right: 20 }} stackOffset="none">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v: number) => nf.format(v)} />
            <YAxis type="category" dataKey="descrizione" tick={{ fontSize: 9 }} width={220} />
            <Tooltip formatter={(v: number, name) => [nf.format(Number(v)), name]} />
            <Legend />
            <Bar dataKey="uomini" name="Uomini" stackId="g" fill={UOMINI} />
            <Bar dataKey="donne" name="Donne" stackId="g" fill={DONNE} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Piramide demografica per genere */}
      <div className="rounded-lg border bg-card p-5">
        <h4 className="mb-3 text-sm font-semibold text-foreground">Piramide demografica per genere</h4>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={pirRows} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v: number) => nf.format(Math.abs(v))} />
            <YAxis type="category" dataKey="fascia_eta" tick={{ fontSize: 10 }} width={70} />
            <Tooltip formatter={(v: number, name) => [nf.format(Math.abs(Number(v))), name]} />
            <Legend />
            <Bar dataKey="uomini_grafico" name="Uomini" stackId="p" fill={UOMINI} />
            <Bar dataKey="donne" name="Donne" stackId="p" fill={DONNE} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dettaglio per qualifica */}
      <div className="rounded-lg border bg-card p-5">
        <h4 className="mb-3 text-sm font-semibold text-foreground">Dettaglio per qualifica</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-2">Qualifica</th>
                <th className="py-2 pr-2 text-right">Uomini</th>
                <th className="py-2 pr-2 text-right">Donne</th>
                <th className="py-2 pr-2 text-right">Totale</th>
                <th className="py-2 pr-2 text-right">% Donne</th>
                <th className="py-2 text-right">Gap</th>
              </tr>
            </thead>
            <tbody>
              {qualRows.map((r, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 pr-2 text-foreground">{r.descrizione}</td>
                  <td className="py-2 pr-2 text-right">{nf.format(r.uomini)}</td>
                  <td className="py-2 pr-2 text-right">{nf.format(r.donne)}</td>
                  <td className="py-2 pr-2 text-right">{nf.format(r.tutti)}</td>
                  <td className="py-2 pr-2 text-right">{n1(r.donne_pct)}%</td>
                  <td className="py-2 text-right">{n1(r.gap_pp)} pp</td>
                </tr>
              ))}
              {qualRows.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">Nessun dato</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
