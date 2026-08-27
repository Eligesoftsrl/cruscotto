import { useEffect, useState } from "react";
import { sipoFrom } from "@/services/dw/siproService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Loader2 } from "lucide-react";
import { SiproFilters, type SiproFilterValues, effectiveEnteIds } from "./SiproFilters";
import { useAuth } from "@/contexts/AuthContext";

interface CritRow {
  uo: string;
  criticita: string;
  macroCategoria: string;
}

interface MacroFreq {
  name: string;
  value: number;
}

interface BenchmarkCrit {
  ente: string;
  totale: number;
  [cat: string]: string | number;
}

const BAR_COLOR = "hsl(175, 60%, 50%)";

const ENTE_COLORS = [
  "hsl(175, 60%, 50%)",
  "hsl(210, 64%, 45%)",
  "hsl(330, 55%, 55%)",
  "hsl(40, 90%, 55%)",
  "hsl(120, 45%, 45%)",
  "hsl(0, 60%, 55%)",
];

export const CriticitaUoChart = () => {
  const { profile } = useAuth();
  const initialEnteId = profile?.role === "ente_hr" ? profile.ente_id : null;
  const [filters, setFilters] = useState<SiproFilterValues>({ enteId: initialEnteId, enteIds: [] });
  const [rows, setRows] = useState<CritRow[]>([]);
  const [macroFreq, setMacroFreq] = useState<MacroFreq[]>([]);
  const [benchmarkRows, setBenchmarkRows] = useState<BenchmarkCrit[]>([]);
  const [benchmarkCategories, setBenchmarkCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const perPage = 8;

  const isBenchmark = filters.enteIds.length > 1 && !filters.enteId;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setPage(0);

      const [critRes, uoRes, lkRes, entiRes] = await Promise.all([
        sipoFrom("ft_sipo_criticita_uo").select("criticita_id, uo_id"),
        sipoFrom("ft_sipo_uo")
          .select("uo_id, denominazione, ente_id")
          .is("data_fine_validita", null),
        sipoFrom("lk_sipo_criticita_uo").select("criticita_id, descrizione, categoria"),
        sipoFrom("lk_enti").select("ente_id, denominazione"),
      ]);

      if (critRes.data && uoRes.data && lkRes.data) {
        const uoMap = new Map(uoRes.data.map((u: any) => [u.uo_id, u]));
        const lkMap = new Map(lkRes.data.map((l: any) => [l.criticita_id, l]));
        const entiMap = new Map((entiRes.data ?? []).map((e: any) => [e.ente_id, e.denominazione]));

        const allRows = critRes.data
          .map((r: any) => {
            const uo = uoMap.get(r.uo_id);
            const lk = lkMap.get(r.criticita_id);
            if (!uo || !lk) return null;
            return {
              uo: uo.denominazione,
              criticita: lk.descrizione,
              macroCategoria: lk.categoria,
              enteId: uo.ente_id,
            };
          })
          .filter(Boolean) as (CritRow & { enteId: number })[];

        const ids = effectiveEnteIds(filters);
        const filtered = ids.length > 0 ? allRows.filter((r) => ids.includes(r.enteId)) : allRows;

        setRows(
          filtered.map(({ uo, criticita, macroCategoria }) => ({ uo, criticita, macroCategoria })),
        );

        const catMap: Record<string, number> = {};
        for (const row of filtered)
          catMap[row.macroCategoria] = (catMap[row.macroCategoria] || 0) + 1;
        setMacroFreq(
          Object.entries(catMap)
            .sort(([, a], [, b]) => b - a)
            .map(([k, v]) => ({ name: k, value: v })),
        );

        // Benchmark
        if (ids.length > 1) {
          const perEnte: Record<number, Record<string, number>> = {};
          const allCats = new Set<string>();
          for (const r of filtered) {
            if (!perEnte[(r as any).enteId]) perEnte[(r as any).enteId] = {};
            perEnte[(r as any).enteId][r.macroCategoria] =
              (perEnte[(r as any).enteId][r.macroCategoria] || 0) + 1;
            allCats.add(r.macroCategoria);
          }
          const cats = Array.from(allCats).sort();
          setBenchmarkCategories(cats);
          setBenchmarkRows(
            ids.map((id) => {
              const row: BenchmarkCrit = {
                ente: (entiMap.get(id) ?? `Ente ${id}`).replace("Comune di ", ""),
                totale: Object.values(perEnte[id] ?? {}).reduce((s, v) => s + v, 0),
              };
              cats.forEach((c) => {
                row[c] = perEnte[id]?.[c] ?? 0;
              });
              return row;
            }),
          );
        }
      }
      setLoading(false);
    };
    load();
  }, [filters]);

  const totalPages = Math.ceil(rows.length / perPage);
  const paged = rows.slice(page * perPage, (page + 1) * perPage);

  const CAT_COLORS = [
    "hsl(175, 60%, 50%)",
    "hsl(210, 64%, 45%)",
    "hsl(330, 55%, 55%)",
    "hsl(40, 90%, 55%)",
    "hsl(120, 45%, 45%)",
    "hsl(0, 60%, 55%)",
    "hsl(270, 50%, 55%)",
    "hsl(30, 80%, 50%)",
  ];

  return (
    <div className="space-y-4">
      <SiproFilters value={filters} onChange={setFilters} />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : isBenchmark ? (
        <div className="bg-card border rounded-xl p-5 space-y-4">
          <h3 className="text-[15px] font-bold text-foreground">
            Benchmark Criticità — Confronto tra Enti
          </h3>
          <p className="text-xs text-muted-foreground">
            Numero di criticità segnalate per macro-categoria, confrontate tra gli enti selezionati.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-2">
                Criticità per macro-categoria
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={benchmarkRows} margin={{ top: 10, right: 10, left: -5, bottom: 5 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="ente"
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  {benchmarkCategories.map((cat, i) => (
                    <Bar
                      key={cat}
                      dataKey={cat}
                      stackId="a"
                      fill={CAT_COLORS[i % CAT_COLORS.length]}
                      maxBarSize={48}
                    />
                  ))}
                  <Legend
                    iconType="square"
                    iconSize={10}
                    wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-2">
                Totale criticità per Ente
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={benchmarkRows} margin={{ top: 10, right: 30, left: -5, bottom: 5 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="ente"
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="totale"
                    name="Totale criticità"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={48}
                  >
                    {benchmarkRows.map((_, i) => (
                      <Cell key={i} fill={ENTE_COLORS[i % ENTE_COLORS.length]} />
                    ))}
                  </Bar>
                  <Legend
                    iconType="square"
                    iconSize={10}
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border rounded-xl p-5 space-y-2">
          <h3 className="text-[15px] font-bold text-foreground">
            Elenco delle criticità segnalate e frequenza per Macro-criticità
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div>
              <div className="overflow-auto rounded-md border">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">
                        Unità Organizzativa
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">
                        Criticità
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">
                        Macro Criticità
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-8 text-muted-foreground">
                          Nessun dato disponibile
                        </td>
                      </tr>
                    ) : (
                      paged.map((r, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="px-3 py-2 text-foreground">{r.uo}</td>
                          <td className="px-3 py-2 text-foreground">{r.criticita}</td>
                          <td className="px-3 py-2 text-foreground">{r.macroCategoria}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(0)}
                      disabled={page === 0}
                      className="px-2 py-1 text-xs rounded border disabled:opacity-40"
                    >
                      «
                    </button>
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="px-2 py-1 text-xs rounded border disabled:opacity-40"
                    >
                      ‹
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                      const p = start + i;
                      if (p >= totalPages) return null;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-2 py-1 text-xs rounded border ${p === page ? "bg-primary text-primary-foreground" : ""}`}
                        >
                          {p + 1}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                      className="px-2 py-1 text-xs rounded border disabled:opacity-40"
                    >
                      ›
                    </button>
                    <button
                      onClick={() => setPage(totalPages - 1)}
                      disabled={page >= totalPages - 1}
                      className="px-2 py-1 text-xs rounded border disabled:opacity-40"
                    >
                      »
                    </button>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {page + 1} di {totalPages} ({rows.length} elementi)
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-3">
                Frequenza per Macro Criticità
              </p>
              <ResponsiveContainer width="100%" height={Math.max(200, macroFreq.length * 52)}>
                <BarChart
                  data={macroFreq}
                  layout="vertical"
                  margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="value" name="N° UO" radius={[0, 4, 4, 0]} maxBarSize={32}>
                    {macroFreq.map((_, i) => (
                      <Cell key={i} fill={BAR_COLOR} />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="insideRight"
                      style={{ fontSize: 12, fontWeight: 700, fill: "white" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
