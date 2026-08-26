import { useEffect, useState } from "react";
import { useFilteredEnteIds } from "@/hooks/useFilteredEnteIds";
import { fetchKpiRilevazione } from "@/services/dw/kpiRilevazioneService";
import { extractAllKpis } from "@/hooks/useKpiCalculations";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, ZAxis, Cell, ReferenceLine } from "recharts";

export const KpiBenchmarkSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [barData, setBarData] = useState<any[]>([]);
  const [matrixData, setMatrixData] = useState<any[]>([]);
  const [benchmarkByClass, setBenchmarkByClass] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const kpis = await fetchKpiRilevazione(enteIds);
      if (!kpis) return;

      const byEnte: Record<number, any> = {};
      kpis.forEach((k: any) => { byEnte[k.id_ente] = k; });

      const chartData: any[] = [];
      const matrix: any[] = [];

      Object.values(byEnte).forEach((row: any) => {
        const allKpis = extractAllKpis(row);
        const ente = row.denominazione?.replace("Comune di ", "").replace("Università degli Studi di ", "Uni. ")?.substring(0, 18) ?? "N/D";

        const byDim: Record<string, number[]> = {};
        const ablVals: number[] = [];
        const succVals: number[] = [];

        allKpis.filter(k => k.categoria !== "strutturale").forEach(k => {
          if (!byDim[k.dimensione]) byDim[k.dimensione] = [];
          byDim[k.dimensione].push(k.valore);
          if (k.categoria === "abilitante") ablVals.push(k.valore);
          if (k.categoria === "successo") succVals.push(k.valore);
        });

        const dimAvg = (dim: string) => {
          const vals = byDim[dim] || [];
          return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
        };

        chartData.push({
          ente,
          D1: dimAvg("D1"), D2: dimAvg("D2"), D3: dimAvg("D3"),
          D4: dimAvg("D4"), D5: dimAvg("D5"), D6: dimAvg("D6"),
        });

        const srTot = [...ablVals, ...succVals];
        const srAll = srTot.length ? Math.round(srTot.reduce((a, b) => a + b, 0) / srTot.length) : 0;
        const srAbl = ablVals.length ? Math.round(ablVals.reduce((a, b) => a + b, 0) / ablVals.length) : 0;

        matrix.push({ ente, x: srAll, y: srAbl, dim: row.dimensione_amm ?? "N/D" });
      });

      setBarData(chartData);
      setMatrixData(matrix);

      // Benchmark by classification
      const byClass: Record<string, number[]> = {};
      kpis.forEach((row: any) => {
        const cls = row.dimensione_amm || "N/D";
        if (!byClass[cls]) byClass[cls] = [];
        const allK = extractAllKpis(row);
        const vals = allK.filter(k => k.categoria !== "strutturale").map(k => k.valore);
        if (vals.length) byClass[cls].push(Math.round(vals.reduce((a, b) => a + b, 0) / vals.length));
      });
      setBenchmarkByClass(Object.entries(byClass).map(([cls, vals]) => ({
        classe: cls,
        media: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0,
        n: vals.length,
      })));
    };
    load();
  }, [enteIds]);

  const colors = ["hsl(210,80%,45%)", "hsl(30,85%,55%)", "hsl(150,60%,40%)", "hsl(340,70%,55%)", "hsl(260,50%,55%)", "hsl(180,60%,40%)"];
  const quadrantColor = (x: number, y: number) => {
    if (x >= 50 && y >= 50) return "hsl(150,60%,40%)";
    if (x >= 50 && y < 50) return "hsl(30,85%,55%)";
    if (x < 50 && y >= 50) return "hsl(260,50%,55%)";
    return "hsl(0,70%,55%)";
  };

  return (
    <div className="p-4 space-y-4">
      {/* 4-Quadrant Matrix */}
      <div className="tableau-card">
        <div className="tableau-card-header">Matrice di Posizionamento: SR Complessivo vs SR Abilitanti</div>
        <div className="p-4" style={{ height: 420 }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis type="number" dataKey="x" domain={[0, 100]} name="SR Complessivo" tick={{ fontSize: 10 }}
                label={{ value: "Success Rate Complessivo (%)", position: "bottom", offset: 20, fontSize: 11 }} />
              <YAxis type="number" dataKey="y" domain={[0, 100]} name="SR Abilitanti" tick={{ fontSize: 10 }}
                label={{ value: "SR Abilitanti (%)", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <ZAxis range={[80, 200]} />
              <ReferenceLine x={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
              <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
              <Tooltip content={({ payload }) => {
                if (!payload?.[0]) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-background border border-border rounded p-2 text-[11px] shadow-lg">
                    <div className="font-bold">{d.ente}</div>
                    <div>SR Complessivo: {d.x}%</div>
                    <div>SR Abilitanti: {d.y}%</div>
                    <div className="mt-1 font-semibold" style={{ color: quadrantColor(d.x, d.y) }}>
                      {d.x >= 50 && d.y >= 50 ? "🟢 Maturità" :
                       d.x >= 50 ? "🟡 Sviluppo" :
                       d.y >= 50 ? "🟣 Priorità" : "🔴 Rafforzamento"}
                    </div>
                  </div>
                );
              }} />
              <Scatter data={matrixData}>
                {matrixData.map((d, i) => (
                  <Cell key={i} fill={quadrantColor(d.x, d.y)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2 text-[10px] text-muted-foreground">
            <span>🟢 Maturità (alto/alto)</span>
            <span>🟡 Sviluppo (alto SR / basso Abl)</span>
            <span>🟣 Priorità (basso SR / alto Abl)</span>
            <span>🔴 Rafforzamento (basso/basso)</span>
          </div>
        </div>
      </div>

      {/* Bar chart benchmark */}
      <div className="tableau-card">
        <div className="tableau-card-header">Benchmark KPI tra Enti (% SR per Dimensione)</div>
        <div className="p-4" style={{ height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis dataKey="ente" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip />
              <Legend />
              {["D1", "D2", "D3", "D4", "D5", "D6"].map((d, i) => (
                <Bar key={d} dataKey={d} name={d} fill={colors[i]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Benchmark by classification */}
      {benchmarkByClass.length > 0 && (
        <div className="tableau-card">
          <div className="tableau-card-header">Benchmark per Dimensione Amministrazione</div>
          <div className="p-4 grid grid-cols-3 gap-4">
            {benchmarkByClass.map(b => (
              <div key={b.classe} className="rounded-lg border border-border p-4 text-center">
                <div className="text-[11px] text-muted-foreground">{b.classe || "N/D"}</div>
                <div className="text-2xl font-bold mt-1" style={{
                  color: b.media >= 60 ? "hsl(150,60%,40%)" : b.media >= 40 ? "hsl(30,85%,55%)" : "hsl(0,70%,55%)",
                }}>{b.media}%</div>
                <div className="text-[10px] text-muted-foreground mt-1">{b.n} rilevazioni</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
