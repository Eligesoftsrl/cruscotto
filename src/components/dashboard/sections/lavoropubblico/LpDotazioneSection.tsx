import { useEffect, useState } from "react";
import { useFilteredEnteIds } from "@/hooks/useFilteredEnteIds";
import { fetchLpDotazione } from "@/services/dw/lavoroPubblicoService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PaginatedTable } from "@/components/dashboard/charts/PaginatedTable";

export const LpDotazioneSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [chartData, setChartData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchLpDotazione();
      if (!data) return;

      const byEnte: Record<string, { dotazione: number; spesa: number }> = {};
      data.forEach((d: any) => {
        const e = d.cfiscale_amm ?? "N/D";
        if (!byEnte[e]) byEnte[e] = { dotazione: 0, spesa: 0 };
        byEnte[e].dotazione += d.n_teste_dotazione ?? 0;
        byEnte[e].spesa += Number(d.valore_economico ?? 0);
      });
      setChartData(Object.entries(byEnte).map(([ente, v]) => ({
        ente: ente.substring(0, 15), ...v,
      })));

      setTableData(data.map((d: any) => ({
        ente: d.cfiscale_amm ?? "-",
        triennio: d.triennio ?? "-",
        categoria: d.categoria_giuridica ?? "-",
        dotazione: d.n_teste_dotazione ?? 0,
        valore: Number(d.valore_economico ?? 0).toLocaleString("it-IT"),
        spesaMax: Number(d.spesa_massima ?? 0).toLocaleString("it-IT"),
      })));
    };
    load();
  }, [enteIds]);

  return (
    <div className="p-4 space-y-4">
      <div className="tableau-card">
        <div className="tableau-card-header">Dotazione Organica PTFP per Ente</div>
        <div className="p-4" style={{ height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis dataKey="ente" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="dotazione" name="Teste Dotazione" fill="hsl(210,80%,45%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="tableau-card">
        <div className="tableau-card-header">Dettaglio Dotazione PTFP</div>
        <div className="p-4">
          <PaginatedTable
            data={tableData}
            columns={[
              { key: "ente", header: "CF Ente" },
              { key: "triennio", header: "Triennio" },
              { key: "categoria", header: "Categoria" },
              { key: "dotazione", header: "Teste", align: "right" },
              { key: "valore", header: "Valore €", align: "right" },
              { key: "spesaMax", header: "Spesa Max €", align: "right" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
