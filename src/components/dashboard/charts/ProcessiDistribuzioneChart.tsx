import { useEffect, useState } from "react";
import { sipoFrom } from "@/services/dw/siproService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList,
  PieChart, Pie, Legend, ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { SiproFilters, type SiproFilterValues, effectiveEnteIds } from "./SiproFilters";
import { useAuth } from "@/contexts/AuthContext";

interface FunzioneData { name: string; value: number }
interface TipologiaData { name: string; value: number }

const FUNZIONE_COLORS: Record<string, string> = {
  Caratterizzanti: "hsl(175, 60%, 50%)",
  "Di supporto": "hsl(0, 0%, 35%)",
};

const BAR_COLOR = "hsl(175, 60%, 50%)";

const ENTE_COLORS = [
  "hsl(175, 60%, 50%)",
  "hsl(210, 64%, 45%)",
  "hsl(330, 55%, 55%)",
  "hsl(40, 90%, 55%)",
  "hsl(120, 45%, 45%)",
  "hsl(0, 60%, 55%)",
];

const TIPOLOGIA_TO_FUNZIONE: Record<string, string> = {
  Strategico: "Caratterizzanti",
  Operativo: "Caratterizzanti",
  Supporto: "Di supporto",
};

interface BenchmarkProc {
  ente: string;
  caratterizzanti: number;
  supporto: number;
  totale: number;
}

export const ProcessiDistribuzioneChart = () => {
  const { profile } = useAuth();
  const initialEnteId = profile?.role === "ente_hr" ? profile.ente_id : null;
  const [filters, setFilters] = useState<SiproFilterValues>({ enteId: initialEnteId, enteIds: [] });
  const [byFunzione, setByFunzione] = useState<FunzioneData[]>([]);
  const [byTipologia, setByTipologia] = useState<TipologiaData[]>([]);
  const [benchmarkRows, setBenchmarkRows] = useState<BenchmarkProc[]>([]);
  const [loading, setLoading] = useState(true);

  const isBenchmark = filters.enteIds.length > 1 && !filters.enteId;

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      let query = sipoFrom("ft_sipo_processi")
        .select("tipologia_id, ente_id")
        .is("data_fine", null);

      const ids = effectiveEnteIds(filters);
      if (ids.length === 1) query = query.eq("ente_id", ids[0]);
      else if (ids.length > 1) query = query.in("ente_id", ids);

      const [procRes, tipRes, entiRes] = await Promise.all([
        query,
        sipoFrom("lk_sipo_tipologia_funzione").select("*"),
        sipoFrom("lk_enti").select("ente_id, denominazione"),
      ]);

      if (procRes.data && tipRes.data) {
        const tipMap = new Map(tipRes.data.map((t: any) => [t.tipologia_id, t]));
        const entiMap = new Map((entiRes.data ?? []).map((e: any) => [e.ente_id, e.denominazione]));

        // Standard view
        const funzCounts: Record<string, number> = {};
        const tipCounts: Record<string, number> = {};
        for (const p of procRes.data as any[]) {
          const tip = tipMap.get(p.tipologia_id);
          if (!tip) continue;
          const funz = TIPOLOGIA_TO_FUNZIONE[tip.tipologia] ?? "Altro";
          funzCounts[funz] = (funzCounts[funz] || 0) + 1;
          tipCounts[tip.funzione] = (tipCounts[tip.funzione] || 0) + 1;
        }
        setByFunzione(Object.entries(funzCounts).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({ name: k, value: v })));
        setByTipologia(Object.entries(tipCounts).sort(([, a], [, b]) => b - a).map(([k, v]) => ({ name: k, value: v })));

        // Benchmark
        if (ids.length > 1) {
          const perEnte: Record<number, { car: number; sup: number }> = {};
          for (const p of procRes.data as any[]) {
            const tip = tipMap.get(p.tipologia_id);
            if (!tip) continue;
            if (!perEnte[p.ente_id]) perEnte[p.ente_id] = { car: 0, sup: 0 };
            const funz = TIPOLOGIA_TO_FUNZIONE[tip.tipologia] ?? "Altro";
            if (funz === "Caratterizzanti") perEnte[p.ente_id].car++;
            else perEnte[p.ente_id].sup++;
          }
          setBenchmarkRows(
            ids.map((id) => ({
              ente: (entiMap.get(id) ?? `Ente ${id}`).replace("Comune di ", ""),
              caratterizzanti: perEnte[id]?.car ?? 0,
              supporto: perEnte[id]?.sup ?? 0,
              totale: (perEnte[id]?.car ?? 0) + (perEnte[id]?.sup ?? 0),
            }))
          );
        }
      }
      setLoading(false);
    };
    load();
  }, [filters]);

  const totalFunz = byFunzione.reduce((s, d) => s + d.value, 0);

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
            Benchmark Processi — Confronto tra Enti
          </h3>
          <p className="text-xs text-muted-foreground">
            Distribuzione processi caratterizzanti vs. di supporto per ciascun ente.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-2">
                Processi Caratterizzanti vs Supporto
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={benchmarkRows} margin={{ top: 10, right: 10, left: -5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="ente" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="caratterizzanti" name="Caratterizzanti" fill="hsl(175, 60%, 50%)" radius={[3, 3, 0, 0]} maxBarSize={40} stackId="a" />
                  <Bar dataKey="supporto" name="Di supporto" fill="hsl(0, 0%, 45%)" radius={[3, 3, 0, 0]} maxBarSize={40} stackId="a" />
                  <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-2">
                Totale processi mappati
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={benchmarkRows} margin={{ top: 10, right: 30, left: -5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="ente" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="totale" name="Totale" radius={[3, 3, 0, 0]} maxBarSize={48}>
                    {benchmarkRows.map((_, i) => (<Cell key={i} fill={ENTE_COLORS[i % ENTE_COLORS.length]} />))}
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
            Approfondimenti sui Processi (Tipologie, Fasi, Criticità, Ruoli)
          </h3>
          <p className="text-xs text-muted-foreground">Distribuzione per funzione e tipologia</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-3">Processi per funzione</p>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={byFunzione} dataKey="value" nameKey="name" cx="50%" cy="60%" innerRadius={60} outerRadius={100} startAngle={180} endAngle={0} paddingAngle={2} label={({ value }) => `${value}`} labelLine={false}>
                    {byFunzione.map((d, i) => (<Cell key={i} fill={FUNZIONE_COLORS[d.name] ?? "hsl(210,50%,50%)"} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(value: number) => [`${value} (${((value / totalFunz) * 100).toFixed(0)}%)`, ""]} />
                  <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-3">Processi per tipologia (Decreto 22/07/2022)</p>
              <ResponsiveContainer width="100%" height={Math.max(280, byTipologia.length * 36)}>
                <BarChart data={byTipologia} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" name="Numero processi" radius={[0, 4, 4, 0]} maxBarSize={28}>
                    {byTipologia.map((_, i) => (<Cell key={i} fill={BAR_COLOR} />))}
                    <LabelList dataKey="value" position="insideRight" style={{ fontSize: 11, fontWeight: 700, fill: "#fff" }} />
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
