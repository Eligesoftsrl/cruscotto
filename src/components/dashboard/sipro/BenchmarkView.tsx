import { useEffect, useMemo, useState } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList, ReferenceLine, Legend,
  ResponsiveContainer,
} from "recharts";
import { Users } from "lucide-react";
import {
  useBenchmarkFiltri, useBenchmarkScore, useBenchmarkCriticita, useBenchmarkMaxEnti,
} from "@/hooks/useSchedaSiproBenchmark";
import { LoadingSpinner, ErrorBox, PIE_COLORS, TOOLTIP_STYLE } from "./_shared";

// Numero massimo di enti confrontabili: default 6, sovrascrivibile dalla
// configurazione applicativa (Pannello Admin, chiave benchmark_max_enti).
const DEFAULT_MAX_ENTI = 6;

// 6 assi del radar (mappatura cliente) sui campi reali della RPC sipro_benchmark_score
const RADAR_ASSI = [
  { key: "fte", label: "Copertura FTE" },
  { key: "dotazione_uo", label: "Dotazione UO" },
  { key: "digitale", label: "Digitalizzazione" },
  { key: "lavoro_agile", label: "Lavoro Agile" },
  { key: "semplificazione", label: "Semplificazione" },
  { key: "tempi", label: "Tempi" },
];
const ASSE_LABEL: Record<string, string> = {
  fte: "Copertura FTE", dotazione_uo: "Dotazione UO", digitale: "Digitalizzazione",
  lavoro_agile: "Lavoro Agile", semplificazione: "Semplificazione", tempi: "Tempi",
  criticita: "Criticità", presidio_interno: "Presidio interno", composito: "Punteggio complessivo",
};
const shortName = (s: string) => (s || "").replace(/^COMUNE DI\s+/i, "").trim();

export const BenchmarkView = () => {
  const filtri = useBenchmarkFiltri();
  const { data: maxEnti = DEFAULT_MAX_ENTI } = useBenchmarkMaxEnti();
  const [regione, setRegione] = useState<string>("");
  const [selected, setSelected] = useState<string[]>([]);
  const [ambito, setAmbito] = useState<"processo" | "uo">("processo");
  const [asseBar, setAsseBar] = useState<string>("dotazione_uo");

  const enti = filtri.data ?? [];
  const regioni = useMemo(
    () => Array.from(new Set(enti.map((e) => e.regione).filter(Boolean))).sort() as string[],
    [enti],
  );
  const entiFiltrati = useMemo(
    () => (regione ? enti.filter((e) => e.regione === regione) : enti),
    [enti, regione],
  );

  // selezione di default: primi 3 enti disponibili
  useEffect(() => {
    if (enti.length > 0 && selected.length === 0) {
      setSelected(enti.slice(0, Math.min(3, enti.length)).map((e) => e.codice_fiscale));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enti]);

  const score = useBenchmarkScore(selected);
  const criticita = useBenchmarkCriticita(selected);

  const toggle = (cf: string) => {
    setSelected((prev) => {
      if (prev.includes(cf)) return prev.filter((x) => x !== cf);
      if (prev.length >= maxEnti) return prev;
      return [...prev, cf];
    });
  };

  // mappa ente selezionato -> nome + colore
  const selectedEnti = useMemo(
    () => selected.map((cf, i) => ({
      cf,
      name: shortName(enti.find((e) => e.codice_fiscale === cf)?.ente ?? cf),
      color: PIE_COLORS[i % PIE_COLORS.length],
    })),
    [selected, enti],
  );

  const scoreRows = score.data ?? [];
  const scoreLookup = useMemo(() => {
    const m = new Map<string, number>();
    scoreRows.forEach((r) => m.set(`${r.codice_fiscale}|${r.asse}`, r.score));
    return m;
  }, [scoreRows]);
  const clusterByAsse = useMemo(() => {
    const m = new Map<string, number>();
    scoreRows.forEach((r) => { if (r.media_score_cluster != null) m.set(r.asse, r.media_score_cluster); });
    return m;
  }, [scoreRows]);

  // Radar: una riga per asse, una colonna per ente + media cluster
  const radarData = RADAR_ASSI.map((a) => {
    const row: Record<string, number | string> = { asse: a.label };
    selectedEnti.forEach((e) => { row[e.name] = scoreLookup.get(`${e.cf}|${a.key}`) ?? 0; });
    row["Media cluster"] = clusterByAsse.get(a.key) ?? 0;
    return row;
  });

  // Barre: score per ente sull'asse scelto, ordinate crescente + linea media cluster
  const barData = selectedEnti
    .map((e) => ({ name: e.name, color: e.color, score: scoreLookup.get(`${e.cf}|${asseBar}`) ?? 0 }))
    .sort((x, y) => x.score - y.score);
  const mediaBar = clusterByAsse.get(asseBar) ?? 0;

  // Ranking criticità per ambito
  const ranking = (criticita.data ?? [])
    .filter((r) => r.ambito === ambito)
    .sort((a, b) => b.occorrenze - a.occorrenze);
  const numEntiCluster = (criticita.data ?? [])[0]?.numero_enti_cluster ?? selected.length;

  if (filtri.isLoading) return <LoadingSpinner />;
  if (filtri.error) return <ErrorBox error={filtri.error} />;

  return (
    <div className="space-y-4">
      {/* Selettore multi-ente */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-[12px] font-bold uppercase tracking-wide text-foreground">Enti da confrontare</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase">Regione</label>
            <select
              value={regione}
              onChange={(e) => setRegione(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-[12px] outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="">Tutte</option>
              {regioni.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <span className="text-[11px] text-muted-foreground ml-auto">
            Selezionati {selected.length}/{maxEnti} · Nota: è possibile selezionare massimo {maxEnti} enti
          </span>
        </div>
        <div className="max-h-[180px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
          {entiFiltrati.map((e) => {
            const checked = selected.includes(e.codice_fiscale);
            const disabled = !checked && selected.length >= maxEnti;
            return (
              <label
                key={e.codice_fiscale}
                className={`flex items-center gap-2 px-2 py-1 rounded text-[12px] cursor-pointer ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-muted/40"}`}
              >
                <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(e.codice_fiscale)} className="accent-[hsl(var(--primary))]" />
                <span className="truncate text-foreground">{shortName(e.ente)}</span>
              </label>
            );
          })}
        </div>
      </div>

      {selected.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-10">Seleziona almeno un ente per visualizzare il confronto.</div>
      ) : score.isLoading ? (
        <LoadingSpinner />
      ) : score.error ? (
        <ErrorBox error={score.error} />
      ) : (
        <>
          {/* S01.01 Radar */}
          <div className="bg-card border rounded-xl p-5">
            <h3 className="text-[15px] font-bold text-foreground mb-2">Confronto multidimensionale (score 0-100)</h3>
            <ResponsiveContainer width="100%" height={420}>
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="asse" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                {selectedEnti.map((e) => (
                  <Radar key={e.cf} name={e.name} dataKey={e.name} stroke={e.color} fill={e.color} fillOpacity={0.12} strokeWidth={2} />
                ))}
                <Radar name="Media cluster" dataKey="Media cluster" stroke="hsl(210 15% 45%)" fill="transparent" strokeWidth={1.5} strokeDasharray="5 4" />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend iconType="line" wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* S01.02 Barre comparative */}
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <h3 className="text-[15px] font-bold text-foreground">Confronto per indicatore vs media cluster</h3>
              <select
                value={asseBar}
                onChange={(e) => setAsseBar(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-[12px] outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              >
                {Object.keys(ASSE_LABEL).filter((k) => k !== "composito").map((k) => (
                  <option key={k} value={k}>{ASSE_LABEL[k]}</option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(260, barData.length * 46)}>
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 50, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={160} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}`, ASSE_LABEL[asseBar]]} />
                <ReferenceLine x={mediaBar} stroke="hsl(0 60% 55%)" strokeDasharray="5 4" label={{ value: `Media ${mediaBar}`, position: "top", fontSize: 10, fill: "hsl(0 60% 55%)" }} />
                <Bar dataKey="score" name={ASSE_LABEL[asseBar]} radius={[0, 4, 4, 0]} maxBarSize={26}>
                  {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  <LabelList dataKey="score" position="insideRight" style={{ fontSize: 11, fontWeight: 700, fill: "white" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* S01.03 Ranking criticità */}
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <h3 className="text-[15px] font-bold text-foreground">Ranking criticità del cluster</h3>
              <div className="inline-flex rounded-md border overflow-hidden text-[12px]">
                {(["processo", "uo"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmbito(a)}
                    className={`px-3 py-1.5 font-medium transition-colors ${ambito === a ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted/50"}`}
                  >
                    {a === "processo" ? "Processo" : "UO"}
                  </button>
                ))}
              </div>
            </div>
            {criticita.isLoading ? <LoadingSpinner /> : (
              <div className="overflow-auto rounded-md border">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b bg-muted/40 text-muted-foreground">
                      <th className="text-left px-3 py-2 font-semibold">Categoria criticità</th>
                      <th className="text-right px-3 py-2 font-semibold whitespace-nowrap">Occorrenze</th>
                      <th className="text-right px-3 py-2 font-semibold whitespace-nowrap">Incidenza</th>
                      <th className="text-right px-3 py-2 font-semibold whitespace-nowrap">Enti coinvolti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Nessuna criticità per questo ambito</td></tr>
                    ) : ranking.map((r) => (
                      <tr key={`${r.ambito}-${r.categoria_id}`} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-3 py-2 text-foreground">{r.categoria}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{r.occorrenze}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{r.incidenza_pct != null ? `${r.incidenza_pct}%` : "—"}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{r.enti_coinvolti}/{numEntiCluster}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
