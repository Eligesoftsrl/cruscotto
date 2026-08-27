import { useEffect, useState } from "react";
import {
  fetchSyllabusPa,
  fetchSyllabusCatalogo,
  fetchSyllabusPartecipazioni,
} from "@/services/dw/syllabusService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PaginatedTable } from "@/components/dashboard/charts/PaginatedTable";

export const SyllabusUtentiSection = () => {
  const [entiData, setEntiData] = useState<any[]>([]);
  const [totals, setTotals] = useState({ partecipanti: 0, enti: 0, corsi: 0 });

  useEffect(() => {
    const load = async () => {
      const [pa, catalogo, partecipazioni] = await Promise.all([
        fetchSyllabusPa(),
        fetchSyllabusCatalogo(),
        fetchSyllabusPartecipazioni("id, id_pa"),
      ]);

      const byEnte: Record<string, number> = {};
      (partecipazioni ?? []).forEach((p: any) => {
        const ente = (pa ?? []).find((e: any) => e.id_pa_syllabus === p.id_pa);
        const name = ente?.denominazione ?? "N/D";
        byEnte[name] = (byEnte[name] || 0) + 1;
      });

      setEntiData(
        Object.entries(byEnte)
          .map(([ente, count]) => ({ ente: ente.substring(0, 25), partecipanti: count }))
          .sort((a, b) => b.partecipanti - a.partecipanti),
      );
      setTotals({
        partecipanti: partecipazioni?.length ?? 0,
        enti: pa?.length ?? 0,
        corsi: catalogo?.length ?? 0,
      });
    };
    load();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="tableau-card">
          <div className="p-4 text-center">
            <div className="text-2xl font-bold">{totals.partecipanti}</div>
            <div className="text-[11px] text-muted-foreground">Partecipazioni</div>
          </div>
        </div>
        <div className="tableau-card">
          <div className="p-4 text-center">
            <div className="text-2xl font-bold">{totals.enti}</div>
            <div className="text-[11px] text-muted-foreground">PA Aderenti</div>
          </div>
        </div>
        <div className="tableau-card">
          <div className="p-4 text-center">
            <div className="text-2xl font-bold">{totals.corsi}</div>
            <div className="text-[11px] text-muted-foreground">Corsi a Catalogo</div>
          </div>
        </div>
      </div>
      <div className="tableau-card">
        <div className="tableau-card-header">Partecipazioni per Ente</div>
        <div className="p-4" style={{ height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={entiData.slice(0, 15)} layout="vertical" margin={{ left: 140 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="ente" tick={{ fontSize: 10 }} width={130} />
              <Tooltip />
              <Bar dataKey="partecipanti" fill="hsl(210,80%,45%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
