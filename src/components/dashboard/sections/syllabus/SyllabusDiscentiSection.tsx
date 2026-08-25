import { useEffect, useState } from "react";
import { fetchSyllabusPartecipazioni } from "@/services/dw/syllabusService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["hsl(210,80%,45%)", "hsl(150,60%,40%)", "hsl(30,85%,55%)", "hsl(0,70%,50%)", "hsl(270,60%,55%)"];

export const SyllabusDiscentiSection = () => {
  const [byGenere, setByGenere] = useState<any[]>([]);
  const [byEta, setByEta] = useState<any[]>([]);
  const [byQualifica, setByQualifica] = useState<any[]>([]);
  const [byContratto, setByContratto] = useState<any[]>([]);
  const [totals, setTotals] = useState({ discenti: 0, oreTotali: 0, oreMedia: "0" });

  useEffect(() => {
    const load = async () => {
      const data = await fetchSyllabusPartecipazioni("id, genere, fascia_eta, qualifica, tipo_contratto, durata_ore");
      if (!data) return;

      const gen: Record<string, number> = {};
      const eta: Record<string, number> = {};
      const qual: Record<string, number> = {};
      const contr: Record<string, number> = {};
      let totOre = 0;

      data.forEach((p: any) => {
        gen[p.genere ?? "N/D"] = (gen[p.genere ?? "N/D"] || 0) + 1;
        eta[p.fascia_eta ?? "N/D"] = (eta[p.fascia_eta ?? "N/D"] || 0) + 1;
        qual[p.qualifica ?? "N/D"] = (qual[p.qualifica ?? "N/D"] || 0) + 1;
        contr[p.tipo_contratto ?? "N/D"] = (contr[p.tipo_contratto ?? "N/D"] || 0) + 1;
        totOre += Number(p.durata_ore) || 0;
      });

      setByGenere(Object.entries(gen).map(([name, value]) => ({ name: name === "F" ? "Donne" : name === "M" ? "Uomini" : name, value })));
      setByEta(["<30", "30-39", "40-49", "50-59", "60+"].map(k => ({ name: k, value: eta[k] || 0 })));
      setByQualifica(Object.entries(qual).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value));
      setByContratto(Object.entries(contr).map(([name, value]) => ({ name, value })));
      setTotals({
        discenti: data.length,
        oreTotali: Math.round(totOre),
        oreMedia: data.length > 0 ? (totOre / data.length).toFixed(1) : "0",
      });
    };
    load();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="tableau-card"><div className="p-4 text-center"><div className="text-2xl font-bold">{totals.discenti.toLocaleString()}</div><div className="text-[11px] text-muted-foreground">Discenti Totali</div></div></div>
        <div className="tableau-card"><div className="p-4 text-center"><div className="text-2xl font-bold">{totals.oreTotali.toLocaleString()}</div><div className="text-[11px] text-muted-foreground">Ore Formazione Erogate</div></div></div>
        <div className="tableau-card"><div className="p-4 text-center"><div className="text-2xl font-bold">{totals.oreMedia}h</div><div className="text-[11px] text-muted-foreground">Ore Medie per Discente</div></div></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="tableau-card">
          <div className="tableau-card-header">Distribuzione per Genere</div>
          <div className="p-4" style={{ height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byGenere} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} fontSize={11}>
                  {byGenere.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="tableau-card">
          <div className="tableau-card-header">Distribuzione per Tipo Contratto</div>
          <div className="p-4" style={{ height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byContratto} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({ name, percent }) => `${name.substring(0, 12)} ${(percent * 100).toFixed(0)}%`} fontSize={10}>
                  {byContratto.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="tableau-card">
        <div className="tableau-card-header">Partecipazioni per Fascia d'Età</div>
        <div className="p-4" style={{ height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={byEta}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" name="Discenti" fill="hsl(210,80%,45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tableau-card">
        <div className="tableau-card-header">Partecipazioni per Qualifica</div>
        <div className="p-4" style={{ height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={byQualifica} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
              <Tooltip />
              <Bar dataKey="value" name="Discenti" fill="hsl(150,60%,40%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
