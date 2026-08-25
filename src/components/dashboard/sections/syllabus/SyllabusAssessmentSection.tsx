import { useEffect, useState } from "react";
import { fetchSyllabusPartecipazioni } from "@/services/dw/syllabusService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export const SyllabusAssessmentSection = () => {
  const [data, setData] = useState<any[]>([]);
  const [byComp, setByComp] = useState<any[]>([]);
  const [totals, setTotals] = useState({ partecipanti: 0, completati: 0, tasso: "0", miglioramenti: 0 });

  useEffect(() => {
    const load = async () => {
      const partecipazioni = await fetchSyllabusPartecipazioni("id, esito_finale, id_competenza, livello_da, livello_a");
      if (!partecipazioni) return;

      const byEsito: Record<string, number> = {};
      const comp: Record<string, { completati: number; inCorso: number; miglioramento: number }> = {};
      let miglioramenti = 0;

      partecipazioni.forEach((p: any) => {
        const e = p.esito_finale ?? "N/D";
        byEsito[e] = (byEsito[e] || 0) + 1;

        const c = p.id_competenza ?? "N/D";
        if (!comp[c]) comp[c] = { completati: 0, inCorso: 0, miglioramento: 0 };
        if (e === "Superato" || e === "Completato") comp[c].completati++;
        else comp[c].inCorso++;
        if ((p.livello_a ?? 0) > (p.livello_da ?? 0)) { comp[c].miglioramento++; miglioramenti++; }
      });

      setData(Object.entries(byEsito).map(([esito, count]) => ({ esito, count })).sort((a, b) => b.count - a.count));
      setByComp(Object.entries(comp)
        .map(([competenza, v]) => ({ competenza: competenza.substring(0, 18), ...v }))
        .sort((a, b) => (b.completati + b.inCorso) - (a.completati + a.inCorso))
        .slice(0, 12));

      const tot = partecipazioni.length;
      const compl = partecipazioni.filter((p: any) => p.esito_finale === "Superato" || p.esito_finale === "Completato").length;
      setTotals({ partecipanti: tot, completati: compl, tasso: tot > 0 ? ((compl / tot) * 100).toFixed(1) : "0", miglioramenti });
    };
    load();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="tableau-card"><div className="p-4 text-center"><div className="text-2xl font-bold">{totals.partecipanti.toLocaleString()}</div><div className="text-[11px] text-muted-foreground">Partecipazioni</div></div></div>
        <div className="tableau-card"><div className="p-4 text-center"><div className="text-2xl font-bold">{totals.completati.toLocaleString()}</div><div className="text-[11px] text-muted-foreground">Completamenti</div></div></div>
        <div className="tableau-card"><div className="p-4 text-center"><div className="text-2xl font-bold">{totals.tasso}%</div><div className="text-[11px] text-muted-foreground">Tasso Completamento</div></div></div>
        <div className="tableau-card"><div className="p-4 text-center"><div className="text-2xl font-bold">{totals.miglioramenti.toLocaleString()}</div><div className="text-[11px] text-muted-foreground">Miglioramenti Livello</div></div></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="tableau-card">
          <div className="tableau-card-header">Distribuzione Esiti Formativi</div>
          <div className="p-4" style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                <XAxis dataKey="esito" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Partecipazioni" fill="hsl(150,60%,40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="tableau-card">
          <div className="tableau-card-header">Progressi per Competenza</div>
          <div className="p-4" style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={byComp}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                <XAxis dataKey="competenza" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completati" name="Completati" stackId="a" fill="hsl(150,60%,40%)" />
                <Bar dataKey="inCorso" name="In Corso" stackId="a" fill="hsl(30,85%,55%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
