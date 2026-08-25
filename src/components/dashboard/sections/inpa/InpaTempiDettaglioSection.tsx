import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFilteredEnteIds, applyEnteFilter } from "@/hooks/useFilteredEnteIds";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { PaginatedTable } from "@/components/dashboard/charts/PaginatedTable";

export const InpaTempiDettaglioSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [byTipo, setByTipo] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      let q = supabase.from("dw_inpa_bandi").select("*");
      q = applyEnteFilter(q, enteIds);
      q = q.not("data_scadenza", "is", null);
      const { data: bandi } = await q;
      if (!bandi) return;

      const tipoAgg: Record<string, number[]> = {};
      const table: any[] = [];

      bandi.forEach((b: any) => {
        if (!b.data_pubblicazione || !b.data_scadenza) return;
        const pub = new Date(b.data_pubblicazione);
        const scad = new Date(b.data_scadenza);
        const durata = Math.round((scad.getTime() - pub.getTime()) / 86400000);
        if (durata <= 0) return;

        const t = b.tipo_procedura ?? "Altro";
        if (!tipoAgg[t]) tipoAgg[t] = [];
        tipoAgg[t].push(durata);

        table.push({
          titolo: b.figura_ricercata ?? b.codice ?? "-",
          regione: b.regione ?? "-",
          tipo: t,
          pubblicazione: b.data_pubblicazione,
          scadenza: b.data_scadenza,
          durata,
        });
      });

      setByTipo(Object.entries(tipoAgg).map(([tipo, vals]) => ({
        tipo,
        media: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
        min: Math.min(...vals),
        max: Math.max(...vals),
        count: vals.length,
      })));
      setTableData(table.sort((a, b) => b.durata - a.durata));
    };
    load();
  }, [enteIds]);

  return (
    <div className="p-4 space-y-4">
      <div className="tableau-card">
        <div className="tableau-card-header">Tempi Medi per Tipo Procedura</div>
        <div className="p-4" style={{ height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={byTipo}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis dataKey="tipo" tick={{ fontSize: 10 }} interval={0} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: "Giorni", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="media" name="Media (gg)" fill="hsl(210,80%,45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tableau-card">
        <div className="tableau-card-header">Dettaglio Tempi per Bando</div>
        <div className="p-4">
          <PaginatedTable
            data={tableData}
            columns={[
              { key: "titolo", header: "Figura Ricercata" },
              { key: "regione", header: "Regione" },
              { key: "tipo", header: "Tipo" },
              { key: "pubblicazione", header: "Pubblicazione" },
              { key: "scadenza", header: "Scadenza" },
              { key: "durata", header: "Durata (gg)", align: "right", render: (r: any) => (
                <span className={`font-semibold ${r.durata > 180 ? "text-red-600" : r.durata > 90 ? "text-amber-600" : "text-green-600"}`}>
                  {r.durata}
                </span>
              )},
            ]}
          />
        </div>
      </div>
    </div>
  );
};
