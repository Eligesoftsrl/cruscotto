import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList,
  PieChart, Pie, Legend, ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { SiproFilters, type SiproFilterValues, effectiveEnteIds } from "./SiproFilters";
import { useAuth } from "@/contexts/AuthContext";

interface LevelData { name: string; value: number }
interface RespData { name: string; value: number }
interface BenchmarkLevel { ente: string; [key: string]: string | number }

const BAR_COLOR = "hsl(175, 60%, 50%)";

const PIE_COLORS = [
  "hsl(210, 64%, 30%)",
  "hsl(330, 55%, 55%)",
  "hsl(40, 90%, 55%)",
  "hsl(120, 45%, 45%)",
  "hsl(210, 64%, 50%)",
  "hsl(0, 0%, 60%)",
];

const ENTE_COLORS = [
  "hsl(175, 60%, 50%)",
  "hsl(210, 64%, 45%)",
  "hsl(330, 55%, 55%)",
  "hsl(40, 90%, 55%)",
  "hsl(120, 45%, 45%)",
  "hsl(0, 60%, 55%)",
];

export const UoDistributionChart = () => {
  const { profile } = useAuth();
  const initialEnteId = profile?.role === "ente_hr" ? profile.ente_id : null;
  const [filters, setFilters] = useState<SiproFilterValues>({ enteId: initialEnteId, enteIds: [] });
  const [byLevel, setByLevel] = useState<LevelData[]>([]);
  const [byResp, setByResp] = useState<RespData[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<{ levels: BenchmarkLevel[]; entiNames: string[]; totals: { ente: string; total: number }[] }>({ levels: [], entiNames: [], totals: [] });
  const [loading, setLoading] = useState(true);

  const isBenchmark = filters.enteIds.length > 1 && !filters.enteId;

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      let query = supabase
        .from("ft_sipo_uo")
        .select("livello_gerarchico, livello_resp_id, ente_id, lk_sipo_livelli_resp_uo(descrizione)")
        .is("data_fine_validita", null);

      const ids = effectiveEnteIds(filters);
      if (ids.length === 1) query = query.eq("ente_id", ids[0]);
      else if (ids.length > 1) query = query.in("ente_id", ids);

      const [uoRes, entiRes] = await Promise.all([
        query,
        supabase.from("lk_enti").select("ente_id, denominazione"),
      ]);

      if (uoRes.data) {
        const entiMap = new Map((entiRes.data ?? []).map((e: any) => [e.ente_id, e.denominazione]));
        const data = uoRes.data as any[];

        // Standard view
        const levelMap: Record<number, number> = {};
        const respMap: Record<string, number> = {};
        for (const row of data) {
          levelMap[row.livello_gerarchico] = (levelMap[row.livello_gerarchico] || 0) + 1;
          const desc = row.lk_sipo_livelli_resp_uo?.descrizione ?? "N/D";
          respMap[desc] = (respMap[desc] || 0) + 1;
        }
        setByLevel(Object.entries(levelMap).sort(([a], [b]) => Number(a) - Number(b)).map(([k, v]) => ({ name: `${k}° livello`, value: v })));
        setByResp(Object.entries(respMap).sort(([, a], [, b]) => b - a).map(([k, v]) => ({ name: k, value: v })));

        // Benchmark view
        if (ids.length > 1) {
          const perEnte: Record<number, Record<number, number>> = {};
          const allLevels = new Set<number>();
          const enteTotals: Record<number, number> = {};

          for (const row of data) {
            if (!perEnte[row.ente_id]) perEnte[row.ente_id] = {};
            perEnte[row.ente_id][row.livello_gerarchico] = (perEnte[row.ente_id][row.livello_gerarchico] || 0) + 1;
            allLevels.add(row.livello_gerarchico);
            enteTotals[row.ente_id] = (enteTotals[row.ente_id] || 0) + 1;
          }

          const sortedLevels = Array.from(allLevels).sort((a, b) => a - b);
          const entiNames = ids.map((id) => (entiMap.get(id) ?? `Ente ${id}`).replace("Comune di ", ""));

          const levels: BenchmarkLevel[] = sortedLevels.map((lvl) => {
            const row: BenchmarkLevel = { ente: `${lvl}° livello` };
            ids.forEach((id, idx) => {
              row[entiNames[idx]] = perEnte[id]?.[lvl] ?? 0;
            });
            return row;
          });

          const totals = ids.map((id, idx) => ({
            ente: entiNames[idx],
            total: enteTotals[id] ?? 0,
          }));

          setBenchmarkData({ levels, entiNames, totals });
        }
      }
      setLoading(false);
    };
    load();
  }, [filters]);

  const totalResp = byResp.reduce((s, d) => s + d.value, 0);

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
            Benchmark UO — Confronto tra Enti
          </h3>
          <p className="text-xs text-muted-foreground">
            Numero di Unità Organizzative per livello gerarchico, confrontate tra gli enti selezionati.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-2">
                UO per livello gerarchico
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={benchmarkData.levels} margin={{ top: 10, right: 10, left: -5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="ente" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  {benchmarkData.entiNames.map((name, i) => (
                    <Bar key={name} dataKey={name} fill={ENTE_COLORS[i % ENTE_COLORS.length]} radius={[3, 3, 0, 0]} maxBarSize={32} />
                  ))}
                  <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-2">
                Totale UO per Ente
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={benchmarkData.totals} margin={{ top: 10, right: 30, left: -5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="ente" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="total" name="Totale UO" radius={[3, 3, 0, 0]} maxBarSize={48}>
                    {benchmarkData.totals.map((_, i) => (
                      <Cell key={i} fill={ENTE_COLORS[i % ENTE_COLORS.length]} />
                    ))}
                  </Bar>
                  <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border rounded-xl p-5 space-y-2">
          <h3 className="text-[15px] font-bold text-foreground">
            Distribuzione delle Unità Organizzative per Livello Gerarchico e Livello di Responsabilità
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-3">Per livello gerarchico</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byLevel} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" name="Numero Unità Organizzative" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {byLevel.map((_, i) => (<Cell key={i} fill={BAR_COLOR} />))}
                    <LabelList dataKey="value" position="top" style={{ fontSize: 12, fontWeight: 700, fill: "hsl(var(--foreground))" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-3">Per livello di responsabilità</p>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={byResp} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={100} startAngle={180} endAngle={-180} paddingAngle={2} label={({ value }) => `${value}`} labelLine={false}>
                    {byResp.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(value: number) => [`${value} (${((value / totalResp) * 100).toFixed(0)}%)`, ""]} />
                  <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
