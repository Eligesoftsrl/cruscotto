import { useEffect, useState } from "react";
import { useFilteredEnteIds } from "@/hooks/useFilteredEnteIds";
import { fetchBridgeProfiloCompetenza, fetchProfiliDiRuolo, fetchCompetenze } from "@/services/dw/minervaService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { PaginatedTable } from "@/components/dashboard/charts/PaginatedTable";

export const MinervaGapAnalysisSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [gapData, setGapData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const bridge = await fetchBridgeProfiloCompetenza(enteIds);
      if (!bridge) return;

      const competenze = await fetchCompetenze();
      const profili = await fetchProfiliDiRuolo();
      const compMap = Object.fromEntries((competenze ?? []).map(c => [c.codice, c.titolo ?? c.codice]));
      const profMap = Object.fromEntries((profili ?? []).map(p => [p.codice, p.nome ?? p.codice]));

      const byProfilo: Record<string, { gaps: number[]; profilo: string }> = {};
      bridge.forEach((b: any) => {
        const profilo = profMap[b.cod_profilo_di_ruolo] ?? b.cod_profilo_di_ruolo ?? "N/D";
        const gap = (b.livello_target ?? 0) - (Number(b.livello_valutato_medio) || 0);
        if (!byProfilo[profilo]) byProfilo[profilo] = { gaps: [], profilo };
        byProfilo[profilo].gaps.push(Math.max(0, gap));
      });

      const mapped = Object.values(byProfilo).map(p => ({
        profilo: p.profilo.substring(0, 25),
        gapMedio: +(p.gaps.reduce((a, b) => a + b, 0) / p.gaps.length).toFixed(2),
        gapMax: +Math.max(...p.gaps).toFixed(2),
        competenze: p.gaps.length,
        critiche: p.gaps.filter(g => g > 1).length,
      })).sort((a, b) => b.gapMedio - a.gapMedio);

      setGapData(mapped);
    };
    load();
  }, [enteIds]);

  const totalCritical = gapData.reduce((s, d) => s + d.critiche, 0);
  const avgGap = gapData.length ? +(gapData.reduce((s, d) => s + d.gapMedio, 0) / gapData.length).toFixed(2) : 0;

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Gap Medio Competenze", value: avgGap, color: avgGap > 1 ? "text-red-600" : "text-green-600" },
          { label: "Competenze Critiche (gap>1)", value: totalCritical, color: "text-amber-600" },
          { label: "Profili con Gap Critico", value: gapData.filter(d => d.critiche > 0).length, color: "text-foreground" },
        ].map(kpi => (
          <div key={kpi.label} className="tableau-card">
            <div className="p-4 text-center">
              <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="tableau-card">
        <div className="tableau-card-header">Gap Medio Competenze per Profilo (Top 15)</div>
        <div className="p-4" style={{ height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={gapData.slice(0, 15)} layout="vertical" margin={{ left: 160 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 'auto']} />
              <YAxis type="category" dataKey="profilo" tick={{ fontSize: 10 }} width={150} />
              <Tooltip />
              <Legend />
              <ReferenceLine x={1} stroke="hsl(0,70%,55%)" strokeDasharray="5 5" label={{ value: "Soglia critica", fontSize: 9, fill: "hsl(0,70%,55%)" }} />
              <Bar dataKey="gapMedio" name="Gap Medio" fill="hsl(30,85%,55%)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="gapMax" name="Gap Massimo" fill="hsl(0,70%,55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tableau-card">
        <div className="tableau-card-header">Profili con Competenze Critiche</div>
        <div className="p-4">
          <PaginatedTable
            data={gapData.filter(d => d.critiche > 0)}
            columns={[
              { key: "profilo", header: "Profilo" },
              { key: "competenze", header: "Competenze", align: "right" },
              { key: "critiche", header: "Critiche", align: "right", render: (r: any) => (
                <span className="text-red-600 font-semibold">{r.critiche}</span>
              )},
              { key: "gapMedio", header: "Gap Medio", align: "right" },
              { key: "gapMax", header: "Gap Max", align: "right", render: (r: any) => (
                <span className={r.gapMax > 1.5 ? "text-red-600 font-semibold" : ""}>{r.gapMax}</span>
              )},
            ]}
          />
        </div>
      </div>
    </div>
  );
};
