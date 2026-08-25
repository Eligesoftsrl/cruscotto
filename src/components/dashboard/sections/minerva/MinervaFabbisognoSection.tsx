import { useEffect, useState } from "react";
import { useFilteredEnteIds } from "@/hooks/useFilteredEnteIds";
import { fetchPtfpReclutamento } from "@/services/dw/minervaService";
import { PaginatedTable } from "@/components/dashboard/charts/PaginatedTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export const MinervaFabbisognoSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const reclutamento = await fetchPtfpReclutamento();
      if (!reclutamento) return;

      setData(reclutamento.map((r: any) => ({
        ente: r.cfiscale_amm ?? "-",
        triennio: r.triennio ?? "-",
        anno: r.anno_piano ?? "-",
        area: r.area_giuridica ?? "-",
        profilo: r.profilo_di_ruolo ?? "-",
        procedura: r.procedura_selettiva ?? "-",
        ula: r.ula_da_assumere ?? 0,
        valore: Number(r.valore_economico ?? 0).toLocaleString("it-IT"),
      })));
    };
    load();
  }, [enteIds]);

  const byArea = data.reduce((acc, r) => {
    if (!acc[r.area]) acc[r.area] = { ula: 0 };
    acc[r.area].ula += r.ula;
    return acc;
  }, {} as Record<string, { ula: number }>);
  const chartData = Object.entries(byArea).map(([area, v]) => ({ area, ula: (v as any).ula })).sort((a, b) => b.ula - a.ula);

  return (
    <div className="p-4 space-y-4">
      <div className="tableau-card">
        <div className="tableau-card-header">Fabbisogno Reclutamento per Area Giuridica</div>
        <div className="p-4" style={{ height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} layout="vertical" margin={{ left: 130 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="area" tick={{ fontSize: 10 }} width={120} />
              <Tooltip />
              <Bar dataKey="ula" name="ULA da assumere" fill="hsl(210,80%,45%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="tableau-card">
        <div className="tableau-card-header">Dettaglio Piano Reclutamento PTFP</div>
        <div className="p-4">
          <PaginatedTable
            data={data}
            columns={[
              { key: "ente", header: "CF Ente" },
              { key: "triennio", header: "Triennio" },
              { key: "anno", header: "Anno" },
              { key: "area", header: "Area" },
              { key: "profilo", header: "Profilo" },
              { key: "procedura", header: "Procedura" },
              { key: "ula", header: "ULA", align: "right" },
              { key: "valore", header: "Valore €", align: "right" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
