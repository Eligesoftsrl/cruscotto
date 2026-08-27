import { useEffect, useState } from "react";
import { fetchSyllabusPartecipazioni } from "@/services/dw/syllabusService";
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

export const SyllabusBadgeSection = () => {
  const [byComp, setByComp] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const partecipazioni = await fetchSyllabusPartecipazioni(
        "id_competenza, esito_finale, livello_da, livello_a",
      );
      if (!partecipazioni) return;

      const comp: Record<string, { completati: number; inCorso: number; miglioramento: number }> =
        {};
      partecipazioni.forEach((p: any) => {
        const c = p.id_competenza ?? "N/D";
        if (!comp[c]) comp[c] = { completati: 0, inCorso: 0, miglioramento: 0 };
        if (p.esito_finale === "Superato" || p.esito_finale === "Completato") comp[c].completati++;
        else comp[c].inCorso++;
        if ((p.livello_a ?? 0) > (p.livello_da ?? 0)) comp[c].miglioramento++;
      });

      setByComp(
        Object.entries(comp)
          .map(([competenza, v]) => ({ competenza: competenza.substring(0, 18), ...v }))
          .sort((a, b) => b.completati + b.inCorso - (a.completati + a.inCorso))
          .slice(0, 12),
      );
    };
    load();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="tableau-card">
        <div className="tableau-card-header">Progressi per Competenza</div>
        <div className="p-4" style={{ height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={byComp}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis dataKey="competenza" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="completati" name="Completati" stackId="a" fill="hsl(150,60%,40%)" />
              <Bar dataKey="inCorso" name="In Corso" stackId="a" fill="hsl(30,85%,55%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="tableau-card">
        <div className="tableau-card-header">Miglioramenti di Livello per Competenza</div>
        <div className="p-4" style={{ height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={byComp} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="competenza" tick={{ fontSize: 10 }} width={110} />
              <Tooltip />
              <Bar
                dataKey="miglioramento"
                name="Miglioramenti livello"
                fill="hsl(210,80%,45%)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
