import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFilteredEnteIds, applyEnteFilter } from "@/hooks/useFilteredEnteIds";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell, ReferenceLine } from "recharts";
import { PaginatedTable } from "@/components/dashboard/charts/PaginatedTable";
import { Badge } from "@/components/ui/badge";

const COLORS = ["hsl(150,60%,40%)", "hsl(30,85%,55%)", "hsl(210,80%,45%)", "hsl(0,70%,55%)"];

export const MinervaAssessmentSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [kpis, setKpis] = useState({ totCicli: 0, completati: 0, inCorso: 0, gapMedio: 0, dipValutati: 0 });
  const [statoData, setStatoData] = useState<any[]>([]);
  const [gapByEnte, setGapByEnte] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      let q = supabase.from("dw_minerva_assessment").select("*");
      q = applyEnteFilter(q, enteIds, "id_ente");
      const { data: assess } = await q;
      if (!assess) return;

      // Get ente names
      const { data: enti } = await supabase.from("dw_ente").select("id_ente,denominazione");
      const enteMap = Object.fromEntries((enti ?? []).map((e: any) => [e.id_ente, e.denominazione]));

      const completati = assess.filter((a: any) => a.stato === "completato");
      const inCorso = assess.filter((a: any) => a.stato === "in_corso");
      const gapValues = completati.filter((a: any) => a.gap_medio != null).map((a: any) => Number(a.gap_medio));
      const avgGap = gapValues.length ? +(gapValues.reduce((s: number, v: number) => s + v, 0) / gapValues.length).toFixed(2) : 0;
      const totValutati = assess.reduce((s: number, a: any) => s + (a.nr_dipendenti_valutati ?? 0), 0);

      setKpis({ totCicli: assess.length, completati: completati.length, inCorso: inCorso.length, gapMedio: avgGap, dipValutati: totValutati });

      // Stato pie
      setStatoData([
        { name: "Completati", value: completati.length },
        { name: "In corso", value: inCorso.length },
      ]);

      // Gap per ente (completati)
      const byEnte: Record<number, { gaps: number[]; nome: string }> = {};
      completati.forEach((a: any) => {
        if (!byEnte[a.id_ente]) byEnte[a.id_ente] = { gaps: [], nome: enteMap[a.id_ente] ?? `Ente ${a.id_ente}` };
        if (a.gap_medio != null) byEnte[a.id_ente].gaps.push(Number(a.gap_medio));
      });
      setGapByEnte(Object.values(byEnte).map(e => ({
        ente: e.nome.substring(0, 20),
        gapMedio: +(e.gaps.reduce((s, v) => s + v, 0) / e.gaps.length).toFixed(2),
      })).sort((a, b) => b.gapMedio - a.gapMedio).slice(0, 15));

      // Trend nel tempo
      const byAnno: Record<number, { gaps: number[]; count: number }> = {};
      completati.forEach((a: any) => {
        if (!byAnno[a.anno]) byAnno[a.anno] = { gaps: [], count: 0 };
        byAnno[a.anno].count += 1;
        if (a.gap_medio != null) byAnno[a.anno].gaps.push(Number(a.gap_medio));
      });
      setTrendData(Object.entries(byAnno).map(([anno, v]) => ({
        anno, cicli: v.count,
        gapMedio: v.gaps.length ? +(v.gaps.reduce((s, g) => s + g, 0) / v.gaps.length).toFixed(2) : 0,
      })).sort((a, b) => a.anno.localeCompare(b.anno)));

      // Table
      setTableData(assess.map((a: any) => ({
        ente: enteMap[a.id_ente] ?? `Ente ${a.id_ente}`,
        anno: a.anno,
        ciclo: a.ciclo,
        stato: a.stato,
        profili: a.nr_profili_coinvolti,
        competenze: a.nr_competenze_valutate,
        valutati: a.nr_dipendenti_valutati,
        totali: a.nr_dipendenti_totali,
        gap: a.gap_medio != null ? Number(a.gap_medio).toFixed(2) : "—",
        gapMax: a.gap_max != null ? Number(a.gap_max).toFixed(2) : "—",
      })));
    };
    load();
  }, [enteIds]);

  return (
    <div className="p-4 space-y-4">
      {/* KPI */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Cicli Totali", value: kpis.totCicli },
          { label: "Completati", value: kpis.completati, color: "text-green-600" },
          { label: "In Corso", value: kpis.inCorso, color: "text-amber-600" },
          { label: "Gap Medio", value: kpis.gapMedio, color: kpis.gapMedio > 1 ? "text-red-600" : "text-green-600" },
          { label: "Dipendenti Valutati", value: kpis.dipValutati },
        ].map(k => (
          <div key={k.label} className="tableau-card">
            <div className="p-3 text-center">
              <div className={`text-xl font-bold ${k.color ?? "text-foreground"}`}>{k.value}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Stato cicli */}
        <div className="tableau-card">
          <div className="tableau-card-header">Stato Cicli Assessment</div>
          <div className="p-4" style={{ height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statoData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} fontSize={11}>
                  {statoData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend gap nel tempo */}
        <div className="tableau-card">
          <div className="tableau-card-header">Evoluzione Gap nel Tempo</div>
          <div className="p-4" style={{ height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                <XAxis dataKey="anno" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                <Tooltip />
                <Legend />
                <ReferenceLine y={1} stroke="hsl(0,70%,55%)" strokeDasharray="5 5" label={{ value: "Soglia critica", fontSize: 9, fill: "hsl(0,70%,55%)" }} />
                <Line type="monotone" dataKey="gapMedio" name="Gap Medio" stroke="hsl(210,80%,45%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="cicli" name="Nr Cicli" stroke="hsl(150,60%,40%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gap per ente */}
      <div className="tableau-card">
        <div className="tableau-card-header">Gap Medio per Amministrazione (Top 15)</div>
        <div className="p-4" style={{ height: 380 }}>
          <ResponsiveContainer>
            <BarChart data={gapByEnte} layout="vertical" margin={{ left: 140 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis type="number" tick={{ fontSize: 10 }} domain={[0, 'auto']} />
              <YAxis type="category" dataKey="ente" tick={{ fontSize: 9 }} width={130} />
              <Tooltip />
              <ReferenceLine x={1} stroke="hsl(0,70%,55%)" strokeDasharray="5 5" />
              <Bar dataKey="gapMedio" name="Gap Medio" fill="hsl(30,85%,55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabella dettaglio */}
      <div className="tableau-card">
        <div className="tableau-card-header">Dettaglio Cicli Assessment</div>
        <div className="p-4">
          <PaginatedTable
            data={tableData}
            columns={[
              { key: "ente", header: "Amministrazione" },
              { key: "anno", header: "Anno", align: "right" as const },
              { key: "ciclo", header: "Ciclo" },
              { key: "stato", header: "Stato", render: (r: any) => (
                <Badge variant={r.stato === "completato" ? "default" : "secondary"} className="text-[10px]">
                  {r.stato === "completato" ? "✓ Completato" : "⏳ In corso"}
                </Badge>
              )},
              { key: "profili", header: "Profili", align: "right" as const },
              { key: "competenze", header: "Comp.", align: "right" as const },
              { key: "valutati", header: "Valutati", align: "right" as const },
              { key: "gap", header: "Gap", align: "right" as const, render: (r: any) => (
                <span className={r.gap !== "—" && parseFloat(r.gap) > 1 ? "text-red-600 font-semibold" : ""}>{r.gap}</span>
              )},
            ]}
          />
        </div>
      </div>
    </div>
  );
};
