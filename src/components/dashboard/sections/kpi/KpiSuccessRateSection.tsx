import { useEffect, useState } from "react";
import { useFilteredEnteIds } from "@/hooks/useFilteredEnteIds";
import { fetchKpiRilevazione } from "@/services/dw/kpiRilevazioneService";
import {
  computeDimensionScores,
  extractAllKpis,
  type DimensionScore,
} from "@/hooks/useKpiCalculations";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { PaginatedTable } from "@/components/dashboard/charts/PaginatedTable";

export const KpiSuccessRateSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [radarData, setRadarData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchKpiRilevazione(enteIds);
      if (!data) return;

      // Latest per ente
      const byEnte: Record<number, any> = {};
      data.forEach((k: any) => {
        byEnte[k.id_ente] = k;
      });
      const latestRows = Object.values(byEnte);

      // Dimension scores
      const dimScores = computeDimensionScores(latestRows);

      // Radar: SR Totale, SR Abilitanti, SR Successo per dimensione
      setRadarData(
        dimScores.map((d) => ({
          dimensione: d.dim,
          "SR Totale": d.srTotale,
          "SR Abilitanti": d.srAbilitanti,
          "SR Successo": d.srSuccesso,
          target: 75,
        })),
      );

      // Table per ente
      const table = latestRows.map((row: any) => {
        const kpis = extractAllKpis(row);
        const byDim: Record<string, number[]> = {};
        kpis
          .filter((k) => k.categoria !== "strutturale")
          .forEach((k) => {
            if (!byDim[k.dimensione]) byDim[k.dimensione] = [];
            byDim[k.dimensione].push(k.valore);
          });
        const dimAvg = (dim: string) => {
          const vals = byDim[dim] || [];
          return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
        };
        const allVals = Object.values(byDim).flat();
        const media = allVals.length
          ? Math.round(allVals.reduce((a, b) => a + b, 0) / allVals.length)
          : 0;
        return {
          ente: row.denominazione ?? "-",
          semestre: row.semestre ?? "-",
          D1: dimAvg("D1"),
          D2: dimAvg("D2"),
          D3: dimAvg("D3"),
          D4: dimAvg("D4"),
          D5: dimAvg("D5"),
          D6: dimAvg("D6"),
          media,
        };
      });
      setTableData(table);
    };
    load();
  }, [enteIds]);

  return (
    <div className="p-4 space-y-4">
      <div className="tableau-card">
        <div className="tableau-card-header">
          KPI Success Rate per Dimensione (Metodologia Ufficiale)
        </div>
        <div className="p-4" style={{ height: 400 }}>
          {radarData.length > 0 ? (
            <ResponsiveContainer>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="hsl(var(--tableau-grid))" />
                <PolarAngleAxis dataKey="dimensione" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="hsl(210,15%,60%)"
                  fill="hsl(210,15%,60%)"
                  fillOpacity={0.05}
                  strokeDasharray="5 5"
                />
                <Radar
                  name="SR Totale"
                  dataKey="SR Totale"
                  stroke="hsl(210,80%,45%)"
                  fill="hsl(210,80%,45%)"
                  fillOpacity={0.25}
                />
                <Radar
                  name="SR Abilitanti"
                  dataKey="SR Abilitanti"
                  stroke="hsl(150,60%,40%)"
                  fill="hsl(150,60%,40%)"
                  fillOpacity={0.15}
                />
                <Radar
                  name="SR Successo"
                  dataKey="SR Successo"
                  stroke="hsl(30,85%,55%)"
                  fill="hsl(30,85%,55%)"
                  fillOpacity={0.15}
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Nessun dato disponibile
            </div>
          )}
        </div>
      </div>
      <div className="tableau-card">
        <div className="tableau-card-header">Dettaglio Success Rate per Ente</div>
        <div className="p-4">
          <PaginatedTable
            data={tableData}
            columns={[
              { key: "ente", header: "Ente" },
              { key: "semestre", header: "Semestre" },
              { key: "D1", header: "D1", align: "right" },
              { key: "D2", header: "D2", align: "right" },
              { key: "D3", header: "D3", align: "right" },
              { key: "D4", header: "D4", align: "right" },
              { key: "D5", header: "D5", align: "right" },
              { key: "D6", header: "D6", align: "right" },
              {
                key: "media",
                header: "Media",
                align: "right",
                render: (r: any) => (
                  <span
                    className={`font-semibold ${r.media >= 60 ? "text-green-600" : r.media >= 40 ? "text-amber-600" : "text-red-600"}`}
                  >
                    {r.media}%
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
