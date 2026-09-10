import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import { useEtaFilters } from "@/hooks/useEtaFilters";
import {
  usePersonaleServizio, useEtaCard, useAnzianita, useFasceGenere,
  useEvoluzione, useBenchmark,
} from "@/hooks/useAnalisiEta";
import type { Genere, BenchDimensione } from "@/services/ca/analisiEtaService";
import type { FiltroOpzione } from "@/services/ca/filtriService";

/* --------------------------- helper di formato --------------------------- */
const nf = new Intl.NumberFormat("it-IT");
const n1 = (v: number | null | undefined) =>
  v == null ? "—" : new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 }).format(v);
const signPP = (v: number | null | undefined, unit = "pp") =>
  v == null ? "" : `${v > 0 ? "▲ +" : v < 0 ? "▼ " : "→ "}${n1(v)} ${unit} vs prec.`;

/* ------------------------------ KPI card --------------------------------- */
const Kpi = ({
  titolo, valore, unita, delta, riga2, accent,
}: {
  titolo: string; valore: string; unita?: string; delta?: string;
  riga2?: { l: string; r: string }; accent: string;
}) => (
  <div className="flex-1 min-w-[190px] rounded-lg border bg-card p-4" style={{ borderLeft: `4px solid ${accent}` }}>
    <p className="text-xs text-muted-foreground">{titolo}</p>
    <p className="mt-1 text-3xl font-bold text-foreground">
      {valore}{unita ? <span className="ml-1 text-base font-medium text-muted-foreground">{unita}</span> : null}
    </p>
    {delta ? <p className="mt-1 text-xs text-muted-foreground">{delta}</p> : null}
    {riga2 ? (
      <div className="mt-2 flex justify-between border-t pt-2 text-[11px] text-muted-foreground">
        <span>{riga2.l}</span><span>{riga2.r}</span>
      </div>
    ) : null}
  </div>
);

const Select = ({
  label, value, onChange, children, disabled,
}: {
  label: string; value: string; onChange: (v: string) => void;
  children: React.ReactNode; disabled?: boolean;
}) => (
  <div className="flex items-center gap-2">
    <label className="text-xs font-medium text-foreground whitespace-nowrap">{label}:</label>
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border bg-background px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 min-w-[150px]"
    >
      {children}
    </select>
  </div>
);

export const AnalisiEtaContent = () => {
  const { filtri, stato, opzioni, set } = useEtaFilters(2023);
  const [serieGenere, setSerieGenere] = useState<Genere>("T");
  const [benchDim, setBenchDim] = useState<BenchDimensione>("comparto");

  const personale = usePersonaleServizio(filtri);
  const eta = useEtaCard(filtri);
  const anz = useAnzianita(filtri);
  const fasce = useFasceGenere(filtri);
  const evo = useEvoluzione(filtri, serieGenere);
  const bench = useBenchmark(filtri, benchDim);

  const findOpt = (list: FiltroOpzione[], codice: string) => list.find((o) => o.codice === codice) ?? null;

  const p = personale.data; const e = eta.data; const a = anz.data;
  const fasceRows = fasce.data ?? [];
  const benchRows = (bench.data ?? []).map((r) => ({ ...r, gap: (r.valore_gruppo ?? 0) }));

  return (
    <div className="space-y-6">
      <p className="text-sm font-semibold text-foreground">
        Dati del Conto Annuale · Rilevazione RGS · Ultimo anno {filtri.anno} · Serie storica 2012–{filtri.anno}
      </p>

      {/* ---------------------------- FILTRI ---------------------------- */}
      <div className="rounded-lg border bg-card p-4 flex flex-wrap items-center gap-4">
        <Select label="Anno" value={String(stato.anno)} onChange={(v) => set.onAnno(Number(v))}>
          {(opzioni.anni.length ? opzioni.anni : [filtri.anno]).map((y) => <option key={y} value={y}>{y}</option>)}
        </Select>
        <Select label="Comparto" value={stato.comparto?.codice ?? ""} onChange={(v) => set.onComparto(v ? findOpt(opzioni.comparti, v) : null)}>
          <option value="">Tutti i comparti</option>
          {opzioni.comparti.map((o) => <option key={o.codice} value={o.codice}>{o.descrizione}</option>)}
        </Select>
        <Select label="Macrocategoria" value={stato.macro?.codice ?? ""} disabled={!stato.comparto}
          onChange={(v) => set.onMacro(v ? findOpt(opzioni.macro, v) : null)}>
          <option value="">Tutte</option>
          {opzioni.macro.map((o) => <option key={o.codice} value={o.codice}>{o.descrizione}</option>)}
        </Select>
        <Select label="Categoria" value={stato.categoria?.codice ?? ""} disabled={!stato.macro}
          onChange={(v) => set.setCategoria(v ? findOpt(opzioni.categorie, v) : null)}>
          <option value="">Tutte</option>
          {opzioni.categorie.map((o) => <option key={o.codice} value={o.codice}>{o.descrizione}</option>)}
        </Select>
        <Select label="Regione" value={stato.regione ?? ""} onChange={(v) => set.setRegione(v || null)}>
          <option value="">Tutte le regioni</option>
          {opzioni.regioni.map((o) => <option key={o.codice} value={o.codice}>{o.descrizione}</option>)}
        </Select>
        <Select label="Genere" value={stato.genere} onChange={(v) => set.setGenere(v as Genere)}>
          <option value="T">Tutti</option><option value="U">Uomini</option><option value="D">Donne</option>
        </Select>
      </div>

      {/* ---------------------------- KPI CARDS ---------------------------- */}
      <div className="flex flex-wrap gap-4">
        <Kpi accent="hsl(220,60%,50%)" titolo="Personale in servizio"
          valore={p ? nf.format(p.personale) : "—"}
          delta={p?.var_pct_prec != null ? signPP(p.var_pct_prec, "%") : undefined}
          riga2={p ? { l: `Min ${nf.format(p.min_storico ?? 0)}`, r: `Max ${nf.format(p.max_storico ?? 0)}` } : undefined} />
        <Kpi accent="hsl(25,85%,55%)" titolo="Età media" valore={n1(e?.eta_media)} unita="anni"
          delta={e?.eta_var_prec != null ? signPP(e.eta_var_prec, "aa") : undefined}
          riga2={e ? { l: `Cluster ${n1(e.eta_cluster)}`, r: `PA ${n1(e.eta_pa)}` } : undefined} />
        <Kpi accent="hsl(0,70%,50%)" titolo="Quota over 55" valore={n1(e?.over_55)} unita="%"
          delta={e?.over_55_var_prec_pp != null ? signPP(e.over_55_var_prec_pp) : undefined}
          riga2={e ? { l: `Cluster ${n1(e.over_55_cluster)}%`, r: `Gap ${n1(e.over_55_gap_pp)} pp` } : undefined} />
        <Kpi accent="hsl(145,50%,42%)" titolo="Quota under 35" valore={n1(e?.under_35)} unita="%"
          delta={e?.under_35_var_prec_pp != null ? signPP(e.under_35_var_prec_pp) : undefined}
          riga2={e ? { l: `Cluster ${n1(e.under_35_cluster)}%`, r: `Gap ${n1(e.under_35_gap_pp)} pp` } : undefined} />
        <Kpi accent="hsl(280,45%,55%)" titolo="Anzianità media" valore={n1(a?.anzianita_media)} unita="aa"
          delta={a?.anzianita_var_prec != null ? signPP(a.anzianita_var_prec, "aa") : undefined}
          riga2={a ? { l: `Cluster ${n1(a.anzianita_cluster)}`, r: `PA ${n1(a.anzianita_pa)}` } : undefined} />
      </div>

      {/* ------------------- PIRAMIDE + EVOLUZIONE ------------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Piramide per età e genere</h4>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart layout="vertical" data={fasceRows} stackOffset="sign" margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v: number) => nf.format(Math.abs(v))} />
              <YAxis type="category" dataKey="fascia_eta" tick={{ fontSize: 10 }} width={54} />
              <Tooltip formatter={(v: number, name) => [nf.format(Math.abs(Number(v))), name === "uomini_grafico" ? "Uomini" : "Donne"]} />
              <Legend formatter={(v) => (v === "uomini_grafico" ? "Uomini" : "Donne")} />
              <Bar dataKey="uomini_grafico" fill="hsl(220,60%,50%)" stackId="s" radius={[3, 0, 0, 3]} />
              <Bar dataKey="donne" fill="hsl(25,85%,55%)" stackId="s" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Evoluzione età media</h4>
            <div className="flex gap-1">
              {(["T", "U", "D"] as Genere[]).map((g) => (
                <button key={g} onClick={() => setSerieGenere(g)}
                  className={`rounded px-2 py-1 text-xs ${serieGenere === g ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {g === "T" ? "Uomini+Donne" : g === "U" ? "Uomini" : "Donne"}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={evo.data ?? []} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="anno" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
              <Tooltip formatter={(v: number) => n1(Number(v))} />
              <Legend />
              <Line type="monotone" dataKey="valore_amm" name="Questa amm." stroke="hsl(220,60%,50%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="valore_cluster" name="Cluster" stroke="hsl(25,85%,55%)" strokeDasharray="5 4" dot={false} />
              <Line type="monotone" dataKey="valore_pa" name="Totale PA" stroke="hsl(220,10%,60%)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ------------------- BENCHMARK + TABELLA ------------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Benchmarking età media</h4>
            <div className="flex gap-1">
              {(["comparto", "regione"] as BenchDimensione[]).map((d) => (
                <button key={d} onClick={() => setBenchDim(d)}
                  className={`rounded px-2 py-1 text-xs capitalize ${benchDim === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart layout="vertical" data={benchRows} margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis type="number" tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
              <YAxis type="category" dataKey="etichetta" tick={{ fontSize: 9 }} width={130} />
              <Tooltip formatter={(v: number) => n1(Number(v))} />
              <Bar dataKey="valore_gruppo" name="Valore gruppo" fill="hsl(220,60%,50%)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Analisi per genere e fascia d'età</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-2">Fascia d'età</th><th className="py-2 pr-2 text-right">Uomini</th>
                  <th className="py-2 pr-2 text-right">Donne</th><th className="py-2 pr-2 text-right">Totale</th>
                  <th className="py-2 pr-2 text-right">% Donne</th><th className="py-2 text-right">Δ PA</th>
                </tr>
              </thead>
              <tbody>
                {fasceRows.map((r) => (
                  <tr key={r.fascia_eta} className="border-b last:border-0">
                    <td className="py-2 pr-2 font-medium text-foreground">{r.fascia_eta}</td>
                    <td className="py-2 pr-2 text-right">{nf.format(r.uomini)}</td>
                    <td className="py-2 pr-2 text-right">{nf.format(r.donne)}</td>
                    <td className="py-2 pr-2 text-right">{nf.format(r.tutti)}</td>
                    <td className="py-2 pr-2 text-right">{n1(r.donne_pct)}%</td>
                    <td className={`py-2 text-right ${(r.delta_pa_pp ?? 0) > 0 ? "text-red-600" : (r.delta_pa_pp ?? 0) < 0 ? "text-green-600" : ""}`}>
                      {r.delta_pa_pp == null ? "—" : `${r.delta_pa_pp > 0 ? "+" : ""}${n1(r.delta_pa_pp)} pp`}
                    </td>
                  </tr>
                ))}
                {fasceRows.length === 0 && (
                  <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">Nessun dato</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
