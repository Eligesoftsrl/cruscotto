import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { PaginatedTable } from "@/components/dashboard/charts/PaginatedTable";

const COLORS = ["hsl(210,80%,45%)", "hsl(150,60%,40%)", "hsl(30,85%,55%)", "hsl(0,70%,50%)", "hsl(270,60%,55%)", "hsl(180,50%,45%)", "hsl(45,90%,50%)", "hsl(330,60%,50%)", "hsl(120,40%,40%)"];

export const SyllabusAmministrazioniSection = () => {
  const [byCategoria, setByCategoria] = useState<any[]>([]);
  const [byTipologia, setByTipologia] = useState<any[]>([]);
  const [byRegione, setByRegione] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [totals, setTotals] = useState({ pa: 0, partecipazioni: 0 });

  useEffect(() => {
    const load = async () => {
      const [{ data: pa }, { data: part }] = await Promise.all([
        supabase.from("dw_syllabus_pa").select("*"),
        supabase.from("dw_syllabus_partecipazioni").select("id, id_pa"),
      ]);
      if (!pa) return;

      const partByPa: Record<number, number> = {};
      (part ?? []).forEach((p: any) => { partByPa[p.id_pa] = (partByPa[p.id_pa] || 0) + 1; });

      setTotals({ pa: pa.length, partecipazioni: part?.length ?? 0 });

      const cat: Record<string, number> = {};
      const tip: Record<string, number> = {};
      const reg: Record<string, number> = {};
      const rows: any[] = [];

      pa.forEach((e: any) => {
        const c = e.categoria_ipa ?? "N/D";
        const t = e.tipologia_ipa ?? "N/D";
        const r = e.regione ?? "N/D";
        cat[c] = (cat[c] || 0) + 1;
        tip[t] = (tip[t] || 0) + 1;
        reg[r] = (reg[r] || 0) + 1;
        rows.push({
          denominazione: e.denominazione ?? "N/D",
          categoria: c,
          tipologia: t,
          regione: r,
          partecipazioni: partByPa[e.id_pa_syllabus] ?? 0,
        });
      });

      setByCategoria(Object.entries(cat).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value));
      setByTipologia(Object.entries(tip).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value));
      setByRegione(Object.entries(reg).map(([name, value]) => ({ name: name.substring(0, 15), value })).sort((a, b) => b.value - a.value).slice(0, 12));
      setTableData(rows.sort((a, b) => b.partecipazioni - a.partecipazioni));
    };
    load();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="tableau-card"><div className="p-4 text-center"><div className="text-2xl font-bold">{totals.pa}</div><div className="text-[11px] text-muted-foreground">PA Aderenti</div></div></div>
        <div className="tableau-card"><div className="p-4 text-center"><div className="text-2xl font-bold">{totals.partecipazioni.toLocaleString()}</div><div className="text-[11px] text-muted-foreground">Partecipazioni Totali</div></div></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="tableau-card">
          <div className="tableau-card-header">Distribuzione per Categoria IPA</div>
          <div className="p-4" style={{ height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name.substring(0, 12)} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                  {byCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="tableau-card">
          <div className="tableau-card-header">Distribuzione per Tipologia</div>
          <div className="p-4" style={{ height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byTipologia} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name.substring(0, 18)} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                  {byTipologia.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="tableau-card">
        <div className="tableau-card-header">PA Aderenti per Regione</div>
        <div className="p-4" style={{ height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={byRegione} layout="vertical" margin={{ left: 110 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
              <Tooltip />
              <Bar dataKey="value" name="PA" fill="hsl(210,80%,45%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tableau-card">
        <div className="tableau-card-header">Elenco Amministrazioni</div>
        <div className="p-4">
          <PaginatedTable
            data={tableData}
            columns={[
              { key: "denominazione", header: "Denominazione" },
              { key: "categoria", header: "Categoria IPA" },
              { key: "tipologia", header: "Tipologia" },
              { key: "regione", header: "Regione" },
              { key: "partecipazioni", header: "Partecipazioni" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
