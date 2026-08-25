import { useEffect, useState } from "react";
import { sipoFrom } from "@/services/dw/siproService";
import { Loader2 } from "lucide-react";
import { SiproFilters, type SiproFilterValues, effectiveEnteIds } from "./SiproFilters";
import { useAuth } from "@/contexts/AuthContext";
import { PaginatedTable } from "./PaginatedTable";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const COLORS = [
  "hsl(175,60%,50%)", "hsl(340,60%,55%)", "hsl(40,80%,50%)",
  "hsl(210,60%,50%)", "hsl(0,0%,35%)", "hsl(280,50%,55%)",
];

interface ProcFasiRow {
  denominazione: string;
  numFasi: number;
  fasiEsternalizz: number;
  fasiLavoroAgile: number;
  livelloDigPrevalente: string;
}

export const DigitalizzazioneFasiChart = () => {
  const { profile } = useAuth();
  const initialEnteId = profile?.role === "ente_hr" ? profile.ente_id : null;
  const [filters, setFilters] = useState<SiproFilterValues>({ enteId: initialEnteId, enteIds: [] });
  const [digData, setDigData] = useState<{ name: string; value: number }[]>([]);
  const [outsData, setOutsData] = useState<{ name: string; value: number }[]>([]);
  const [agileData, setAgileData] = useState<{ name: string; value: number }[]>([]);
  const [tableRows, setTableRows] = useState<ProcFasiRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const ids = effectiveEnteIds(filters);

      let procQ = sipoFrom("ft_sipo_processi").select("processo_id, denominazione, ente_id").is("data_fine", null);
      if (ids.length === 1) procQ = procQ.eq("ente_id", ids[0]);
      else if (ids.length > 1) procQ = procQ.in("ente_id", ids);

      const [procRes, fasiRes, digLkRes, outsLkRes, agileLkRes] = await Promise.all([
        procQ,
        sipoFrom("ft_sipo_fasi").select("fase_id, processo_id, livello_digitalizzazione_id, outsourcing_id, lavoro_agile_id, in_outsourcing, lavoro_agile"),
        sipoFrom("lk_sipo_livello_digitalizzazione_fasi").select("*"),
        sipoFrom("lk_sipo_outsourcing_fasi").select("*"),
        sipoFrom("lk_sipo_lavoro_agile_fasi").select("*"),
      ]);

      if (!procRes.data) { setLoading(false); return; }

      const procIds = new Set((procRes.data as any[]).map((p) => p.processo_id));
      const procMap = new Map((procRes.data as any[]).map((p) => [p.processo_id, p.denominazione]));

      const digLkMap = new Map((digLkRes.data ?? []).map((d: any) => [d.livello_digitalizzazione_id, d.descrizione ?? `Livello ${d.livello_digitalizzazione_id}`]));
      const outsLkMap = new Map((outsLkRes.data ?? []).map((o: any) => [o.outsourcing_id, o.descrizione]));
      const agileLkMap = new Map((agileLkRes.data ?? []).map((a: any) => [a.lavoro_agile_id, a.descrizione]));

      const fasi = ((fasiRes.data ?? []) as any[]).filter((f) => procIds.has(f.processo_id));

      const digCounts: Record<string, number> = {};
      const outsCounts: Record<string, number> = {};
      const agileCounts: Record<string, number> = {};
      const perProc: Record<number, { total: number; outs: number; agile: number; digLevels: number[] }> = {};

      for (const f of fasi) {
        const digLabel = digLkMap.get(f.livello_digitalizzazione_id) ?? "Non specificato";
        digCounts[digLabel] = (digCounts[digLabel] || 0) + 1;

        const outsLabel = outsLkMap.get(f.outsourcing_id) ?? (f.in_outsourcing === 1 ? "Sì" : "No");
        outsCounts[outsLabel] = (outsCounts[outsLabel] || 0) + 1;

        const agileLabel = agileLkMap.get(f.lavoro_agile_id) ?? (f.lavoro_agile === 1 ? "Sì" : "No, non sono previste attività esternalizzate");
        agileCounts[agileLabel] = (agileCounts[agileLabel] || 0) + 1;

        if (!perProc[f.processo_id]) perProc[f.processo_id] = { total: 0, outs: 0, agile: 0, digLevels: [] };
        perProc[f.processo_id].total++;
        if (f.in_outsourcing === 1 || f.outsourcing_id > 1) perProc[f.processo_id].outs++;
        if (f.lavoro_agile === 1 || f.lavoro_agile_id > 1) perProc[f.processo_id].agile++;
        if (f.livello_digitalizzazione_id) perProc[f.processo_id].digLevels.push(f.livello_digitalizzazione_id);
      }

      setDigData(Object.entries(digCounts).map(([k, v]) => ({ name: k, value: v })));
      setOutsData(Object.entries(outsCounts).map(([k, v]) => ({ name: k, value: v })));
      setAgileData(Object.entries(agileCounts).map(([k, v]) => ({ name: k, value: v })));

      const rows: ProcFasiRow[] = [];
      for (const [pid, data] of Object.entries(perProc)) {
        const denom = procMap.get(Number(pid)) ?? `Processo ${pid}`;
        const levelCounts: Record<number, number> = {};
        for (const l of data.digLevels) levelCounts[l] = (levelCounts[l] || 0) + 1;
        const prevalentId = Object.entries(levelCounts).sort(([, a], [, b]) => b - a)[0]?.[0];
        const prevalentLabel = prevalentId ? (digLkMap.get(Number(prevalentId)) ?? "—") : "—";

        rows.push({
          denominazione: denom,
          numFasi: data.total,
          fasiEsternalizz: data.outs,
          fasiLavoroAgile: data.agile,
          livelloDigPrevalente: prevalentLabel,
        });
      }
      setTableRows(rows);
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

  const renderGauge = (data: { name: string; value: number }[], title: string) => (
    <div>
      <p className="text-xs font-semibold text-muted-foreground text-center mb-2">{title}</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="60%" innerRadius={50} outerRadius={85} startAngle={180} endAngle={0} paddingAngle={2} label={({ value }) => `${value}`} labelLine>
            {data.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
          </Pie>
          <Legend verticalAlign="bottom" iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10, lineHeight: "14px" }} />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const tableColumns = [
    { key: "denominazione", header: "Processo", render: (r: ProcFasiRow) => <span className="font-medium text-foreground">{r.denominazione}</span> },
    { key: "numFasi", header: "Numero Fasi", align: "right" as const, render: (r: ProcFasiRow) => <span className="text-muted-foreground">{r.numFasi}</span> },
    { key: "fasiEsternalizz", header: "Fasi con esternalizzazioni", align: "right" as const, render: (r: ProcFasiRow) => <span className="text-muted-foreground">{r.fasiEsternalizz}</span> },
    { key: "fasiLavoroAgile", header: "Fasi in lavoro agile", align: "right" as const, render: (r: ProcFasiRow) => <span className="text-muted-foreground">{r.fasiLavoroAgile}</span> },
    { key: "livelloDigPrevalente", header: "Livello digitalizzazione prevalente", render: (r: ProcFasiRow) => <span className="text-muted-foreground">{r.livelloDigPrevalente}</span> },
  ];

  return (
    <div className="space-y-4">
      <SiproFilters value={filters} onChange={setFilters} />
      <div className="bg-card border rounded-xl p-5 space-y-4">
        <h3 className="text-[15px] font-bold text-foreground">Digitalizzazione e lavoro agile (Fasi)</h3>
        <p className="text-xs text-muted-foreground">Sintesi dei livelli di digitalizzazione e delle attività svolgibili in lavoro agile e sulle fasi dei processi.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {renderGauge(digData, "Fasi per livello di digitalizzazione")}
          {renderGauge(outsData, "Fasi con attività esternalizzabili")}
          {renderGauge(agileData, "Fasi per cui il lavoro agile è possibile")}
        </div>

        <PaginatedTable data={tableRows} columns={tableColumns} pageSize={10} />
      </div>
    </div>
  );
};
