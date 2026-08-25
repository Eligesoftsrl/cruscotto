import { useEffect, useState } from "react";
import { sipoFrom } from "@/services/dw/siproService";
import { Loader2 } from "lucide-react";
import { SiproFilters, type SiproFilterValues, effectiveEnteIds } from "./SiproFilters";
import { useAuth } from "@/contexts/AuthContext";
import { PaginatedTable } from "./PaginatedTable";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
} from "recharts";

const TEAL = "hsl(175,60%,50%)";

interface ProcCritRow {
  denominazione: string;
  nrFasi: number;
  nrCriticita: number;
  macroCriticita: string;
  semplificato: string;
}

export const CriticitaProcessiChart = () => {
  const { profile } = useAuth();
  const initialEnteId = profile?.role === "ente_hr" ? profile.ente_id : null;
  const [filters, setFilters] = useState<SiproFilterValues>({ enteId: initialEnteId, enteIds: [] });
  const [rows, setRows] = useState<ProcCritRow[]>([]);
  const [macroFreq, setMacroFreq] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const ids = effectiveEnteIds(filters);

      let procQ = sipoFrom("ft_sipo_processi")
        .select("processo_id, denominazione, processo_semplificazione_id, ente_id")
        .is("data_fine", null);
      if (ids.length === 1) procQ = procQ.eq("ente_id", ids[0]);
      else if (ids.length > 1) procQ = procQ.in("ente_id", ids);

      const [procRes, fasiRes, critProcRes, critLkRes, semplRes] = await Promise.all([
        procQ,
        sipoFrom("ft_sipo_fasi").select("fase_id, processo_id"),
        sipoFrom("ft_sipo_criticita_processi").select("*"),
        sipoFrom("lk_sipo_criticita_processi").select("*"),
        sipoFrom("lk_sipo_semplificazione_processi").select("*"),
      ]);

      if (!procRes.data) { setLoading(false); return; }

      const procIds = new Set((procRes.data as any[]).map((p) => p.processo_id));
      const semplMap = new Map((semplRes.data ?? []).map((s: any) => [s.semplificazione_id, s.descrizione]));
      const critLkMap = new Map((critLkRes.data ?? []).map((c: any) => [c.criticita_proc_id, c]));

      const fasiCount = new Map<number, number>();
      for (const f of (fasiRes.data ?? []) as any[]) {
        if (procIds.has(f.processo_id)) fasiCount.set(f.processo_id, (fasiCount.get(f.processo_id) || 0) + 1);
      }

      const critPerProc = new Map<number, any[]>();
      for (const c of (critProcRes.data ?? []) as any[]) {
        if (procIds.has(c.processo_id)) {
          if (!critPerProc.has(c.processo_id)) critPerProc.set(c.processo_id, []);
          critPerProc.get(c.processo_id)!.push(c);
        }
      }

      const macroCount: Record<string, number> = {};

      const tableRows: ProcCritRow[] = (procRes.data as any[]).map((p) => {
        const crits = critPerProc.get(p.processo_id) ?? [];
        const nrCrit = crits.length;
        const macroByCat: Record<string, number> = {};
        for (const c of crits) {
          const lk = critLkMap.get(c.criticita_processo_id);
          if (lk) {
            macroByCat[lk.categoria] = (macroByCat[lk.categoria] || 0) + 1;
            macroCount[lk.categoria] = (macroCount[lk.categoria] || 0) + 1;
          }
        }
        const macroDesc = Object.entries(macroByCat).map(([cat, n]) => `${n} ${cat}`).join(" - ") || "—";
        const semplDesc = semplMap.get(p.processo_semplificazione_id);
        const sempl = semplDesc && semplDesc !== "No" ? (semplDesc.includes("parte") ? "Sì, in parte" : "Sì") : "No";

        return { denominazione: p.denominazione, nrFasi: fasiCount.get(p.processo_id) ?? 0, nrCriticita: nrCrit, macroCriticita: macroDesc, semplificato: sempl };
      });

      setRows(tableRows.sort((a, b) => b.nrCriticita - a.nrCriticita));
      setMacroFreq(Object.entries(macroCount).sort(([, a], [, b]) => b - a).map(([k, v]) => ({
        name: k.length > 30 ? k.substring(0, 28) + "…" : k,
        value: v,
      })));
      setLoading(false);
    };
    load();
  }, [filters]);

  if (loading) {
    return (
      <div className="space-y-4">
        <SiproFilters value={filters} onChange={setFilters} />
        <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  const columns = [
    { key: "denominazione", header: "Processo", render: (r: ProcCritRow) => <span className="font-medium text-foreground max-w-[180px] block">{r.denominazione}</span> },
    { key: "nrFasi", header: "Nr fasi", align: "right" as const, render: (r: ProcCritRow) => <span className="text-muted-foreground">{r.nrFasi}</span> },
    { key: "nrCriticita", header: "Nr criticità", align: "right" as const, render: (r: ProcCritRow) => <span className="text-muted-foreground">{r.nrCriticita}</span> },
    { key: "macroCriticita", header: "Macro-criticità", render: (r: ProcCritRow) => <span className="text-muted-foreground text-[11px] max-w-[200px] block">{r.macroCriticita}</span> },
    { key: "semplificato", header: "Semplificato", align: "center" as const, render: (r: ProcCritRow) => <span className="text-muted-foreground">{r.semplificato}</span> },
  ];

  return (
    <div className="space-y-4">
      <SiproFilters value={filters} onChange={setFilters} />
      <div className="bg-card border rounded-xl p-5 space-y-3">
        <h3 className="text-[15px] font-bold text-foreground">Semplificazioni e Criticità segnalate</h3>
        <p className="text-xs text-muted-foreground">Criticità segnalate sulle fasi dei processi ed eventuali vincoli alle semplificazioni.</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PaginatedTable data={rows} columns={columns} pageSize={10} />
          <div>
            <p className="text-xs font-semibold text-muted-foreground text-center mb-2">Frequenza Criticità per Macro Criticità</p>
            <ResponsiveContainer width="100%" height={Math.max(200, macroFreq.length * 40)}>
              <BarChart data={macroFreq} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" name="Criticità" fill={TEAL} radius={[0, 4, 4, 0]} maxBarSize={28}>
                  <LabelList dataKey="value" position="insideRight" style={{ fontSize: 11, fontWeight: 700, fill: "#fff" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
