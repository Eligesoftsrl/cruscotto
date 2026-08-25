import { useEffect, useState } from "react";
import { sipoFrom } from "@/services/dw/siproService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { SiproFilters, type SiproFilterValues, effectiveEnteIds } from "./SiproFilters";
import { useAuth } from "@/contexts/AuthContext";

interface UoFteRow {
  denominazione: string;
  dotazione: number;
  servizio: number;
  gap: number;
}

interface BenchmarkRow {
  ente: string;
  dotazione: number;
  servizio: number;
  gap: number;
  copertura: number;
}

const COLOR_DOTAZIONE = "hsl(175, 55%, 42%)";
const COLOR_SERVIZIO = "hsl(35, 75%, 42%)";
const COLOR_GAP = "hsl(0, 65%, 55%)";
const COLOR_COPERTURA = "hsl(210, 64%, 45%)";

export const FteDotazioneChart = () => {
  const { profile } = useAuth();
  const initialEnteId = profile?.role === "ente_hr" ? profile.ente_id : null;
  const [filters, setFilters] = useState<SiproFilterValues>({ enteId: initialEnteId, enteIds: [] });
  const [rows, setRows] = useState<UoFteRow[]>([]);
  const [benchmark, setBenchmark] = useState<BenchmarkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const perPage = 12;

  const isBenchmark = filters.enteIds.length > 1 && !filters.enteId;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setPage(0);

      const ids = effectiveEnteIds(filters);

      // Always fetch with ente info for benchmark
      let query = sipoFrom("ft_sipo_uo")
        .select("denominazione, risorse_dotazione, risorse_servizio_tempo_ind, ente_id")
        .is("data_fine_validita", null)
        .order("denominazione");

      if (ids.length === 1) query = query.eq("ente_id", ids[0]);
      else if (ids.length > 1) query = query.in("ente_id", ids);

      const [uoRes, entiRes] = await Promise.all([
        query,
        sipoFrom("lk_enti").select("ente_id, denominazione"),
      ]);

      if (uoRes.data) {
        const entiMap = new Map(
          (entiRes.data ?? []).map((e: any) => [e.ente_id, e.denominazione])
        );

        const data = uoRes.data as any[];

        // Standard rows
        setRows(
          data.map((r) => ({
            denominazione: r.denominazione,
            dotazione: r.risorse_dotazione ?? 0,
            servizio: r.risorse_servizio_tempo_ind ?? 0,
            gap: (r.risorse_servizio_tempo_ind ?? 0) - (r.risorse_dotazione ?? 0),
          }))
        );

        // Benchmark aggregation by ente
        if (ids.length > 1) {
          const agg: Record<number, { dot: number; serv: number }> = {};
          for (const r of data) {
            if (!agg[r.ente_id]) agg[r.ente_id] = { dot: 0, serv: 0 };
            agg[r.ente_id].dot += r.risorse_dotazione ?? 0;
            agg[r.ente_id].serv += r.risorse_servizio_tempo_ind ?? 0;
          }
          setBenchmark(
            ids.map((id) => {
              const a = agg[id] ?? { dot: 0, serv: 0 };
              const copertura = a.dot > 0 ? (a.serv / a.dot) * 100 : 0;
              return {
                ente: (entiMap.get(id) ?? `Ente ${id}`).replace("Comune di ", ""),
                dotazione: Math.round(a.dot * 10) / 10,
                servizio: Math.round(a.serv * 10) / 10,
                gap: Math.round((a.serv - a.dot) * 10) / 10,
                copertura: Math.round(copertura * 10) / 10,
              };
            })
          );
        }
      }
      setLoading(false);
    };
    load();
  }, [filters]);

  const totalPages = Math.ceil(rows.length / perPage);
  const pagedRows = rows.slice(page * perPage, (page + 1) * perPage);
  const totDotazione = rows.reduce((s, r) => s + r.dotazione, 0);
  const totServizio = rows.reduce((s, r) => s + r.servizio, 0);

  return (
    <div className="space-y-4">
      <SiproFilters value={filters} onChange={setFilters} />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : isBenchmark ? (
        /* ===== BENCHMARK VIEW ===== */
        <div className="bg-card border rounded-xl p-5 space-y-4">
          <h3 className="text-[15px] font-bold text-foreground">
            Benchmark FTE — Confronto tra Enti
          </h3>
          <p className="text-xs text-muted-foreground">
            Valori aggregati di dotazione organica, personale in servizio e tasso di copertura per ciascun ente selezionato.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grouped bar: dotazione vs servizio per ente */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-2">
                FTE Dotazione vs Servizio
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={benchmark} margin={{ top: 10, right: 10, left: -5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="ente" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number, name: string) => [v.toFixed(1), name]}
                  />
                  <Bar dataKey="dotazione" name="FTE Dotazione" fill={COLOR_DOTAZIONE} radius={[3, 3, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="servizio" name="FTE Servizio" fill={COLOR_SERVIZIO} radius={[3, 3, 0, 0]} maxBarSize={40} />
                  <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Copertura % bar */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-2">
                Tasso di copertura organica (%)
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={benchmark} margin={{ top: 10, right: 30, left: -5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="ente" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={[0, 'auto']} unit="%" />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [`${v.toFixed(1)}%`, "Copertura"]}
                  />
                  <Bar dataKey="copertura" name="Copertura %" fill={COLOR_COPERTURA} radius={[3, 3, 0, 0]} maxBarSize={48} />
                  <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary table */}
          <div className="overflow-auto">
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr className="bg-[hsl(210,64%,30%)] text-white">
                  <th className="text-left px-3 py-2 font-semibold">Ente</th>
                  <th className="text-right px-3 py-2 font-semibold">FTE Dotazione</th>
                  <th className="text-right px-3 py-2 font-semibold">FTE Servizio</th>
                  <th className="text-right px-3 py-2 font-semibold">GAP</th>
                  <th className="text-right px-3 py-2 font-semibold">Copertura %</th>
                </tr>
              </thead>
              <tbody>
                {benchmark.map((r, i) => (
                  <tr key={i} className="border-b border-border hover:bg-muted/40">
                    <td className="px-3 py-2 text-foreground font-medium">{r.ente}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.dotazione.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.servizio.toFixed(1)}</td>
                    <td className={`px-3 py-2 text-right tabular-nums font-semibold ${r.gap < 0 ? "text-destructive" : r.gap > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {r.gap > 0 ? "+" : ""}{r.gap.toFixed(1)}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums font-semibold ${r.copertura < 80 ? "text-destructive" : r.copertura >= 100 ? "text-emerald-600" : "text-foreground"}`}>
                      {r.copertura.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ===== SINGLE / ALL VIEW ===== */
        <div className="bg-card border rounded-xl p-5 space-y-3">
          <h3 className="text-[15px] font-bold text-foreground">
            Dotazione Organica e personale in servizio per ogni Unità Organizzativa (valore FTE)
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="overflow-auto">
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="bg-[hsl(210,64%,30%)] text-white">
                    <th className="text-left px-2 py-1.5 font-semibold">Unità Organizzativa</th>
                    <th className="text-right px-2 py-1.5 font-semibold whitespace-nowrap">FTE dotazione</th>
                    <th className="text-right px-2 py-1.5 font-semibold whitespace-nowrap">FTE servizio</th>
                    <th className="text-right px-2 py-1.5 font-semibold whitespace-nowrap">GAP</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((r, i) => (
                    <tr key={i} className="border-b border-border hover:bg-muted/40 transition-colors">
                      <td className="px-2 py-1.5 text-foreground">{r.denominazione}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{r.dotazione.toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{r.servizio.toFixed(1)}</td>
                      <td className={`px-2 py-1.5 text-right tabular-nums font-semibold ${r.gap < 0 ? "text-destructive" : r.gap > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                        {r.gap.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-foreground/30 font-bold text-foreground">
                    <td className="px-2 py-1.5 text-right">Totale:</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{totDotazione.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{totServizio.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{(totServizio - totDotazione).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              {totalPages > 1 && (
                <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
                  <button onClick={() => setPage(0)} disabled={page === 0} className="px-1.5 py-0.5 rounded border border-border hover:bg-muted disabled:opacity-30">«</button>
                  <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-1.5 py-0.5 rounded border border-border hover:bg-muted disabled:opacity-30">‹</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} onClick={() => setPage(i)} className={`px-2 py-0.5 rounded border ${i === page ? "bg-primary text-primary-foreground border-primary font-bold" : "border-border hover:bg-muted"}`}>{i + 1}</button>
                  ))}
                  <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1} className="px-1.5 py-0.5 rounded border border-border hover:bg-muted disabled:opacity-30">›</button>
                  <button onClick={() => setPage(totalPages - 1)} disabled={page === totalPages - 1} className="px-1.5 py-0.5 rounded border border-border hover:bg-muted disabled:opacity-30">»</button>
                  <span className="ml-2">{page + 1} di {totalPages} ({rows.length} elementi)</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-2">
                Dotazione Organica e personale in servizio
              </p>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={rows} margin={{ top: 5, right: 10, left: -5, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="denominazione" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" interval={0} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(value: number, name: string) => [value.toFixed(1), name]} />
                  <Bar dataKey="dotazione" name="FTE in dotazione" fill={COLOR_DOTAZIONE} radius={[2, 2, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="servizio" name="FTE in servizio" fill={COLOR_SERVIZIO} radius={[2, 2, 0, 0]} maxBarSize={18} />
                  <Legend verticalAlign="bottom" iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
