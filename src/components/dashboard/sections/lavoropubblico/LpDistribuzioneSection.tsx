import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFilteredEnteIds, applyEnteFilter } from "@/hooks/useFilteredEnteIds";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(210,80%,45%)", "hsl(30,85%,55%)", "hsl(150,60%,40%)", "hsl(340,70%,55%)", "hsl(260,50%,55%)"];

export const LpDistribuzioneSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [byQualifica, setByQualifica] = useState<any[]>([]);
  const [byAnno, setByAnno] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      let q = supabase.from("dw_occupazione").select("*");
      q = applyEnteFilter(q, enteIds, "istituzione");
      const { data } = await q;
      if (!data) return;

      const qual: Record<string, number> = {};
      const anno: Record<number, { uomini: number; donne: number }> = {};
      data.forEach((r: any) => {
        const mc = r.macrocat ?? r.qualifica ?? "Altro";
        qual[mc] = (qual[mc] || 0) + (r.tp_uomini ?? 0) + (r.tp_donne ?? 0);
        if (!anno[r.anno]) anno[r.anno] = { uomini: 0, donne: 0 };
        anno[r.anno].uomini += r.tp_uomini ?? 0;
        anno[r.anno].donne += r.tp_donne ?? 0;
      });

      setByQualifica(Object.entries(qual).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value));
      setByAnno(Object.entries(anno).sort().map(([a, v]) => ({ anno: a, ...v })));
    };
    load();
  }, [enteIds]);

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-5">
          <div className="tableau-card">
            <div className="tableau-card-header">Personale per Macrocategoria</div>
            <div className="p-4" style={{ height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byQualifica.slice(0, 8)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                    {byQualifica.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-span-7">
          <div className="tableau-card">
            <div className="tableau-card-header">Trend Occupazione per Genere</div>
            <div className="p-4" style={{ height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={byAnno}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                  <XAxis dataKey="anno" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="uomini" name="Uomini" fill="hsl(210,80%,45%)" />
                  <Bar dataKey="donne" name="Donne" fill="hsl(340,70%,55%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
