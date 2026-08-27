import { useEffect, useState } from "react";
import { fetchSyllabusCatalogo } from "@/services/dw/syllabusService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { PaginatedTable } from "@/components/dashboard/charts/PaginatedTable";

const COLORS = [
  "hsl(210,80%,45%)",
  "hsl(150,60%,40%)",
  "hsl(30,85%,55%)",
  "hsl(0,70%,50%)",
  "hsl(270,60%,55%)",
];

export const SyllabusCorsiSection = () => {
  const [corsi, setCorsi] = useState<any[]>([]);
  const [byCategoria, setByCategoria] = useState<any[]>([]);
  const [byLivello, setByLivello] = useState<any[]>([]);
  const [totals, setTotals] = useState({ corsi: 0, competenze: 0 });

  useEffect(() => {
    const load = async () => {
      const data = await fetchSyllabusCatalogo();
      if (!data) return;

      setTotals({ corsi: data.length, competenze: new Set(data.map((c) => c.competenza)).size });

      const cat: Record<string, number> = {};
      const liv: Record<string, number> = {};
      data.forEach((c) => {
        cat[c.categoria_syllabus ?? "N/D"] = (cat[c.categoria_syllabus ?? "N/D"] || 0) + 1;
        liv[c.livello ?? "N/D"] = (liv[c.livello ?? "N/D"] || 0) + 1;
      });

      setByCategoria(
        Object.entries(cat)
          .map(([name, value]) => ({ name: name.substring(0, 22), value }))
          .sort((a, b) => b.value - a.value),
      );
      setByLivello(
        Object.entries(liv)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value),
      );

      setCorsi(
        data.map((c: any) => ({
          titolo: c.denominazione_corso ?? "N/D",
          competenza: c.competenza ?? "N/D",
          categoria: c.categoria_syllabus ?? "N/D",
          livello: c.livello ?? "N/D",
          tipologia: c.tipologia ?? "N/D",
          durata: c.durata_ore ? `${c.durata_ore}h` : "-",
        })),
      );
    };
    load();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="tableau-card">
          <div className="p-4 text-center">
            <div className="text-2xl font-bold">{totals.corsi}</div>
            <div className="text-[11px] text-muted-foreground">Corsi a Catalogo</div>
          </div>
        </div>
        <div className="tableau-card">
          <div className="p-4 text-center">
            <div className="text-2xl font-bold">{totals.competenze}</div>
            <div className="text-[11px] text-muted-foreground">Competenze Coperte</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="tableau-card">
          <div className="tableau-card-header">Corsi per Categoria Syllabus</div>
          <div className="p-4" style={{ height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={byCategoria}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name.substring(0, 14)} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                  fontSize={9}
                >
                  {byCategoria.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="tableau-card">
          <div className="tableau-card-header">Corsi per Livello</div>
          <div className="p-4" style={{ height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={byLivello}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" name="Corsi" fill="hsl(150,60%,40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="tableau-card">
        <div className="tableau-card-header">Catalogo Formativo Syllabus</div>
        <div className="p-4">
          <PaginatedTable
            data={corsi}
            columns={[
              { key: "titolo", header: "Titolo Corso" },
              { key: "competenza", header: "Competenza" },
              { key: "categoria", header: "Categoria" },
              { key: "livello", header: "Livello" },
              { key: "tipologia", header: "Tipologia" },
              { key: "durata", header: "Durata" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
