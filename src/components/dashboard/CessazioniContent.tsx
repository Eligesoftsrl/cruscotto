import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchEnti } from "@/services/ca/filtriService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, Legend,
} from "recharts";
import { useFilters } from "@/contexts/FilterContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCessazioniKpi, useCessazioniCausali, useCessazioniEvoluzione,
} from "@/hooks/useSchedaCessazioni";
import type { Genere, CessazioniFiltri } from "@/services/ca/cessazioniService";

/* --------------------------- helper di formato --------------------------- */
const nf = new Intl.NumberFormat("it-IT");
const n1 = (v: number | null | undefined) =>
  v == null ? "\u2014" : new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 }).format(v);
const signed = (v: number | null | undefined) =>
  v == null ? "\u2014" : `${v > 0 ? "+" : ""}${nf.format(v)}`;

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

/* Grafico a barre orizzontale Uomini/Donne per causale. */
const CausaliChart = ({
  titolo, data, opUomini, opDonne,
}: {
  titolo: string;
  data: { descrizione: string; uomini: number; donne: number }[];
  opUomini: number; opDonne: number;
}) => (
  <div className="rounded-lg border bg-card p-5">
    <h4 className="mb-3 text-sm font-semibold text-foreground">{titolo}</h4>
    <ResponsiveContainer width="100%" height={340}>
      <BarChart layout="vertical" data={data} margin={{ left: 10, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
        <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v: number) => nf.format(v)} />
        <YAxis type="category" dataKey="descrizione" tick={{ fontSize: 9 }} width={160} />
        <Tooltip formatter={(v: number, name) => [nf.format(Number(v)), name === "uomini" ? "Uomini" : "Donne"]} />
        <Legend formatter={(v) => (v === "uomini" ? "Uomini" : "Donne")} />
        <Bar dataKey="uomini" stackId="s" fill="hsl(220,60%,50%)" fillOpacity={opUomini} radius={[3, 0, 0, 3]} />
        <Bar dataKey="donne" stackId="s" fill="hsl(0,70%,50%)" fillOpacity={opDonne} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const CessazioniContent = () => {
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
  const filtri: CessazioniFiltri = {
    anno,
    istituzione: ente?.codice ?? null,
    comparto: filters.comparto !== "Tutti" ? filters.comparto : null,
    macrocategoria: filters.macrocategoria !== "Tutte" ? filters.macrocategoria : null,
    categoria: filters.categoria !== "Tutte" ? filters.categoria : null,
    regione: filters.regione !== "Tutte" ? filters.regione : null,
    genere,
  };

  const kpi = useCessazioniKpi(filtri);
  const cessazioniCausali = useCessazioniCausali(filtri, "C");
  const assunzioniCausali = useCessazioniCausali(filtri, "A");
  const evo = useCessazioniEvoluzione(filtri);

  const k = kpi.data;
  const cessRows = cessazioniCausali.data ?? [];
  const assRows = assunzioniCausali.data ?? [];
  const evoRows = (evo.data ?? []).slice().sort((a, b) => a.anno - b.anno);

  // p_genere e ignorato dalle causali: applichiamo solo uno sbiadimento visivo.
  const opUomini = genere === "D" ? 0.25 : 1;
  const opDonne = genere === "U" ? 0.25 : 1;
  const saldoAccent = (k?.saldo ?? 0) >= 0 ? "hsl(145,50%,42%)" : "hsl(0,70%,50%)";

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
        <Kpi accent="hsl(0,70%,50%)" titolo="Cessati"
          valore={k ? nf.format(k.cessati) : "\u2014"} />
        <Kpi accent="hsl(175,55%,42%)" titolo="Assunti"
          valore={k ? nf.format(k.assunti) : "\u2014"} />
        <Kpi accent={saldoAccent} titolo="Saldo netto"
          valore={signed(k?.saldo)} />
        <Kpi accent="hsl(25,85%,55%)" titolo="Tasso turnover" unita="%"
          valore={n1(k?.turnover_pct)} />
      </div>

      {/* ------------------- CAUSALI: CESSAZIONI + ASSUNZIONI ------------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CausaliChart titolo="Cessazioni per causale" data={cessRows} opUomini={opUomini} opDonne={opDonne} />
        <CausaliChart titolo="Assunzioni per causale" data={assRows} opUomini={opUomini} opDonne={opDonne} />
      </div>

      {/* ------------------- SERIE STORICA ASSUNTI VS CESSATI ------------------- */}
      <div className="rounded-lg border bg-card p-5">
        <h4 className="mb-3 text-sm font-semibold text-foreground">Serie storica assunti vs cessati</h4>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={evoRows} margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
            <XAxis dataKey="anno" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => nf.format(v)} />
            <Tooltip formatter={(v: number, name) => [nf.format(Number(v)), name]} />
            <Legend />
            <ReferenceLine y={0} stroke="hsl(220,10%,60%)" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="assunti" name="Assunti" stroke="hsl(175,55%,42%)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="cessati" name="Cessati" stroke="hsl(0,70%,50%)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="saldo" name="Saldo" stroke="hsl(25,85%,55%)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ------------------- TABELLA DETTAGLIO CESSAZIONI ------------------- */}
      <div className="rounded-lg border bg-card p-5">
        <h4 className="mb-3 text-sm font-semibold text-foreground">Dettaglio cessazioni per causale</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-2">Causale</th>
                <th className="py-2 pr-2 text-right">Uomini</th>
                <th className="py-2 pr-2 text-right">Donne</th>
                <th className="py-2 pr-2 text-right">Totale</th>
                <th className="py-2 text-right">% sul totale</th>
              </tr>
            </thead>
            <tbody>
              {cessRows.map((r) => (
                <tr key={r.causale} className="border-b last:border-0">
                  <td className="py-2 pr-2 font-medium text-foreground">{r.descrizione}</td>
                  <td className="py-2 pr-2 text-right">{nf.format(r.uomini)}</td>
                  <td className="py-2 pr-2 text-right">{nf.format(r.donne)}</td>
                  <td className="py-2 pr-2 text-right font-semibold text-foreground">{nf.format(r.tutti)}</td>
                  <td className="py-2 text-right">{n1(r.percentuale)}%</td>
                </tr>
              ))}
              {cessRows.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Nessun dato</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
