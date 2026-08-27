import { useEffect, useState } from "react";
import { sipoFrom } from "@/services/dw/siproService";
import { Loader2 } from "lucide-react";
import { SiproFilters, type SiproFilterValues, effectiveEnteIds } from "./SiproFilters";
import { useAuth } from "@/contexts/AuthContext";
import { PaginatedTable } from "./PaginatedTable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CoinvRow {
  denominazione: string;
  numUo: number;
  coinvolge: boolean;
}

const RED = "hsl(0,65%,55%)";
const BLUE = "hsl(210,64%,50%)";

export const CoinvolgimentoUoChart = () => {
  const { profile } = useAuth();
  const initialEnteId = profile?.role === "ente_hr" ? profile.ente_id : null;
  const [filters, setFilters] = useState<SiproFilterValues>({ enteId: initialEnteId, enteIds: [] });
  const [rows, setRows] = useState<CoinvRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const ids = effectiveEnteIds(filters);

      let procQ = sipoFrom("ft_sipo_processi")
        .select("processo_id, denominazione, coinvolgimento_amministrazioni, ente_id")
        .is("data_fine", null);

      if (ids.length === 1) procQ = procQ.eq("ente_id", ids[0]);
      else if (ids.length > 1) procQ = procQ.in("ente_id", ids);

      const [procRes, fasiRes, uoPartRes] = await Promise.all([
        procQ,
        sipoFrom("ft_sipo_fasi").select("fase_id, processo_id"),
        sipoFrom("ft_sipo_fasi_uo_partecipanti").select("fase_id, uo_partecipante_id"),
      ]);

      if (!procRes.data) {
        setLoading(false);
        return;
      }

      const fasiByProc = new Map<number, number[]>();
      for (const f of (fasiRes.data ?? []) as any[]) {
        if (!fasiByProc.has(f.processo_id)) fasiByProc.set(f.processo_id, []);
        fasiByProc.get(f.processo_id)!.push(f.fase_id);
      }

      const uoPerFase = new Map<number, Set<number>>();
      for (const u of (uoPartRes.data ?? []) as any[]) {
        if (!uoPerFase.has(u.fase_id)) uoPerFase.set(u.fase_id, new Set());
        uoPerFase.get(u.fase_id)!.add(u.uo_partecipante_id);
      }

      const result: CoinvRow[] = (procRes.data as any[]).map((p) => {
        const fasi = fasiByProc.get(p.processo_id) ?? [];
        const uoSet = new Set<number>();
        for (const fId of fasi) {
          const uos = uoPerFase.get(fId);
          if (uos) uos.forEach((u) => uoSet.add(u));
        }
        return {
          denominazione: p.denominazione,
          numUo: uoSet.size || fasi.length,
          coinvolge: p.coinvolgimento_amministrazioni === 1,
        };
      });

      setRows(result.sort((a, b) => b.numUo - a.numUo));
      setLoading(false);
    };
    load();
  }, [filters]);

  if (loading) {
    return (
      <div className="space-y-4">
        <SiproFilters value={filters} onChange={setFilters} />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const chartData = rows.map((r) => ({
    name: r.denominazione.length > 18 ? r.denominazione.substring(0, 16) + "…" : r.denominazione,
    value: r.numUo,
    coinvolge: r.coinvolge,
  }));

  const columns = [
    {
      key: "denominazione",
      header: "Processo",
      render: (r: CoinvRow) => (
        <span className="font-medium text-foreground">{r.denominazione}</span>
      ),
    },
    {
      key: "numUo",
      header: "Numero Unità Organizzative",
      align: "right" as const,
      render: (r: CoinvRow) => <span className="text-muted-foreground">{r.numUo}</span>,
    },
    {
      key: "coinvolge",
      header: "Coinvolge altre amm.",
      align: "center" as const,
      render: (r: CoinvRow) => (
        <span className="text-muted-foreground">{r.coinvolge ? "Sì" : "No"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <SiproFilters value={filters} onChange={setFilters} />
      <div className="bg-card border rounded-xl p-5 space-y-3">
        <h3 className="text-[15px] font-bold text-foreground">
          Coinvolgimento Unità Organizzative e altre amministrazioni
        </h3>
        <p className="text-xs text-muted-foreground">
          Informazioni sul coinvolgimento delle unità organizzative e altre amministrazioni.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PaginatedTable data={rows} columns={columns} pageSize={10} />
          <div>
            <p className="text-xs font-semibold text-muted-foreground text-center mb-2">
              Coinvolgimento UO e altre amministrazioni
            </p>
            <ResponsiveContainer
              width="100%"
              height={Math.max(280, Math.min(rows.length, 15) * 40)}
            >
              <BarChart
                data={chartData.slice(0, 15)}
                margin={{ top: 10, right: 10, left: -5, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9 }}
                  angle={-30}
                  textAnchor="end"
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
                <Legend
                  iconType="square"
                  iconSize={10}
                  wrapperStyle={{ fontSize: 11 }}
                  payload={[
                    { value: "Non coinvolge altre amm.", type: "square", color: RED },
                    { value: "Coinvolge altre amm.", type: "square", color: BLUE },
                  ]}
                />
                <Bar dataKey="value" name="UO coinvolte" radius={[3, 3, 0, 0]} maxBarSize={40}>
                  {chartData.slice(0, 15).map((d, i) => (
                    <Cell key={i} fill={d.coinvolge ? BLUE : RED} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
