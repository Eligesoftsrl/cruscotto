import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFilteredEnteIds, applyEnteFilter } from "@/hooks/useFilteredEnteIds";
import { PaginatedTable } from "@/components/dashboard/charts/PaginatedTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = [
  "hsl(210,80%,45%)", "hsl(30,85%,55%)", "hsl(150,60%,40%)", "hsl(0,70%,55%)",
  "hsl(270,60%,55%)", "hsl(45,90%,50%)", "hsl(180,50%,45%)", "hsl(330,60%,50%)",
];

export const MinervaCatalogoSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [famiglie, setFamiglie] = useState<any[]>([]);
  const [byFamiglia, setByFamiglia] = useState<any[]>([]);
  const [byArea, setByArea] = useState<any[]>([]);
  const [byAmbito, setByAmbito] = useState<any[]>([]);
  const [byDimensione, setByDimensione] = useState<any[]>([]);
  const [totPP, setTotPP] = useState(0);
  const [totPR, setTotPR] = useState(0);
  const [totComp, setTotComp] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [{ data: fam }, { data: profili }, { data: comp }] = await Promise.all([
        supabase.from("dw_famiglia_professionale").select("*"),
        supabase.from("dw_profilo_di_ruolo").select("*"),
        supabase.from("dw_competenza").select("*"),
      ]);
      setFamiglie(fam ?? []);
      setTotComp((comp ?? []).length);

      const profs = profili ?? [];
      // Count distinct profili professionali (by macrocategoria+famiglia) vs profili di ruolo
      setTotPP(new Set(profs.map((p: any) => p.famiglia_professionale)).size * 2); // proxy
      setTotPR(profs.length);

      // By famiglia
      const famCount: Record<string, number> = {};
      profs.forEach((p: any) => { const f = p.famiglia_professionale ?? "Altro"; famCount[f] = (famCount[f] || 0) + 1; });
      setByFamiglia(Object.entries(famCount).map(([f, c]) => ({ name: f, count: c })).sort((a, b) => b.count - a.count));

      // By area contrattuale
      const areaCount: Record<string, number> = {};
      profs.forEach((p: any) => { const a = p.area_contrattuale ?? "N/D"; areaCount[a] = (areaCount[a] || 0) + 1; });
      setByArea(Object.entries(areaCount).map(([a, c]) => ({ name: a, value: c })));

      // By ambito ruolo
      const ambitoCount: Record<string, number> = {};
      profs.forEach((p: any) => { const a = p.ambito_ruolo ?? "N/D"; ambitoCount[a] = (ambitoCount[a] || 0) + 1; });
      setByAmbito(Object.entries(ambitoCount).map(([a, c]) => ({ name: a.substring(0, 22), count: c })).sort((a, b) => b.count - a.count));

      // By dimensione professionale
      const dimCount: Record<string, number> = {};
      (fam ?? []).forEach((f: any) => { const d = f.dimensione_professionale ?? "N/D"; dimCount[d] = (dimCount[d] || 0) + 1; });
      setByDimensione(Object.entries(dimCount).map(([d, c]) => ({ name: d, value: c })));
    };
    load();
  }, [enteIds]);

  return (
    <div className="p-4 space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Profili Professionali", value: totPP },
          { label: "Profili di Ruolo", value: totPR },
          { label: "Competenze Censite", value: totComp },
        ].map(k => (
          <div key={k.label} className="tableau-card">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{k.value}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Profili per Famiglia Professionale */}
        <div className="tableau-card">
          <div className="tableau-card-header">Profili di Ruolo per Famiglia Professionale</div>
          <div className="p-4" style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={byFamiglia} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={55} />
                <Tooltip />
                <Bar dataKey="count" name="Profili" fill="hsl(210,80%,45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuzione per Area Contrattuale */}
        <div className="tableau-card">
          <div className="tableau-card-header">Distribuzione per Area Contrattuale</div>
          <div className="p-4" style={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byArea} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                  {byArea.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Profili per Ambito di Ruolo */}
        <div className="tableau-card">
          <div className="tableau-card-header">Profili di Ruolo per Ambito</div>
          <div className="p-4" style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={byAmbito} layout="vertical" margin={{ left: 140 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={130} />
                <Tooltip />
                <Bar dataKey="count" name="Profili" fill="hsl(150,60%,40%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dimensione Professionale */}
        <div className="tableau-card">
          <div className="tableau-card-header">Famiglie per Dimensione Professionale</div>
          <div className="p-4" style={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byDimensione} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name.substring(0, 15)} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                  {byDimensione.map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Catalogo tabella */}
      <div className="tableau-card">
        <div className="tableau-card-header">Catalogo Famiglie Professionali</div>
        <div className="p-4">
          <PaginatedTable
            data={famiglie}
            columns={[
              { key: "codice", header: "Codice" },
              { key: "titolo", header: "Famiglia" },
              { key: "comparto", header: "Comparto" },
              { key: "dimensione_professionale", header: "Dimensione" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
