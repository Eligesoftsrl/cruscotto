import { useEffect, useState } from "react";
import { fetchSyllabusPartecipazioni, fetchSyllabusCatalogo } from "@/services/dw/syllabusService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export const SyllabusGapFormazioneSection = () => {
  const [gapData, setGapData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [partecipazioni, catalogo] = await Promise.all([
        fetchSyllabusPartecipazioni("id_corso, esito_finale, id_competenza, livello_da, livello_a"),
        fetchSyllabusCatalogo("id_corso, competenza, livello"),
      ]);
      if (!partecipazioni || !catalogo) return;

      const byComp: Record<string, { corsi: number; partecipanti: number; completati: number }> =
        {};
      const corsiByComp: Record<string, Set<number>> = {};

      catalogo.forEach((c) => {
        const comp = c.competenza ?? "N/D";
        if (!corsiByComp[comp]) corsiByComp[comp] = new Set();
        corsiByComp[comp].add(c.id_corso);
      });

      Object.entries(corsiByComp).forEach(([comp, corsiSet]) => {
        const parts = partecipazioni.filter((p) => corsiSet.has(p.id_corso));
        byComp[comp] = {
          corsi: corsiSet.size,
          partecipanti: parts.length,
          completati: parts.filter(
            (p) => p.esito_finale === "Superato" || p.esito_finale === "Completato",
          ).length,
        };
      });

      const sorted = Object.entries(byComp)
        .map(([competenza, v]) => ({
          competenza: competenza.substring(0, 20),
          ...v,
          tasso: v.partecipanti > 0 ? Math.round((v.completati / v.partecipanti) * 100) : 0,
        }))
        .sort((a, b) => b.partecipanti - a.partecipanti);

      setGapData(sorted.slice(0, 12));
    };
    load();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Competenze Attive", value: gapData.length },
          {
            label: "Partecipazioni Totali",
            value: gapData.reduce((s, d) => s + d.partecipanti, 0),
          },
          { label: "Completamenti", value: gapData.reduce((s, d) => s + d.completati, 0) },
        ].map((kpi) => (
          <div key={kpi.label} className="tableau-card">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="tableau-card">
        <div className="tableau-card-header">Partecipazioni e Completamenti per Competenza</div>
        <div className="p-4" style={{ height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={gapData} layout="vertical" margin={{ left: 140 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="competenza" tick={{ fontSize: 9 }} width={130} />
              <Tooltip />
              <Legend />
              <Bar dataKey="partecipanti" name="Partecipanti" fill="hsl(210,80%,45%)" />
              <Bar dataKey="completati" name="Completati" fill="hsl(150,60%,40%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
