import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFilteredEnteIds, applyEnteFilter } from "@/hooks/useFilteredEnteIds";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { InpaLocalFilters, DEFAULT_INPA_FILTERS, applyInpaLocalFilters, type InpaFilters } from "./InpaLocalFilters";

const COLORS = ["hsl(210,80%,45%)", "hsl(30,85%,55%)", "hsl(150,60%,40%)", "hsl(340,70%,55%)", "hsl(260,50%,55%)", "hsl(180,60%,40%)"];

export const InpaCategorieSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [allBandi, setAllBandi] = useState<any[]>([]);
  const [filters, setFilters] = useState<InpaFilters>(DEFAULT_INPA_FILTERS);
  const [byTipo, setByTipo] = useState<any[]>([]);
  const [byAnno, setByAnno] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      let q = supabase.from("dw_inpa_bandi").select("*");
      q = applyEnteFilter(q, enteIds);
      const { data: raw } = await q;
      if (!raw) return;
      setAllBandi(raw);
    };
    load();
  }, [enteIds]);

  useEffect(() => {
    const bandi = applyInpaLocalFilters(allBandi, filters);
    if (!bandi.length) { setByTipo([]); setByAnno([]); return; }

      const tipo: Record<string, number> = {};
      const anno: Record<number, { posti: number; candidature: number }> = {};
      const totale = bandi.length;

      bandi.forEach((b: any) => {
        const t = b.tipo_procedura ?? "Altro";
        tipo[t] = (tipo[t] || 0) + 1;
        const a = b.anno ?? new Date(b.data_pubblicazione).getFullYear();
        if (!anno[a]) anno[a] = { posti: 0, candidature: 0 };
        anno[a].posti += b.num_posti ?? 0;
        anno[a].candidature += b.num_candidature_submitted ?? 0;
      });

      setByTipo(
        Object.entries(tipo)
          .map(([name, value]) => ({
            name,
            value,
            pct: totale > 0 ? +((value / totale) * 100).toFixed(1) : 0,
          }))
          .sort((a, b) => b.value - a.value)
      );
      setByAnno(Object.entries(anno).sort().map(([a, v]) => ({ anno: a, ...v })));
  }, [allBandi, filters]);

  const totBandi = byTipo.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-0">
      <InpaLocalFilters filters={filters} onChange={setFilters} />
      <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Tipi Procedura Distinti", value: byTipo.length },
          { label: "Totale Bandi", value: totBandi },
          { label: "Anni Coperti", value: byAnno.length },
        ].map((kpi) => (
          <div key={kpi.label} className="tableau-card">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-5">
          <div className="tableau-card">
            <div className="tableau-card-header">Composizione % per Tipo Procedura</div>
            <div className="p-4" style={{ height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={byTipo}
                    dataKey="pct"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, pct }) => `${name}: ${pct}%`}
                  >
                    {byTipo.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-span-7">
          <div className="tableau-card">
            <div className="tableau-card-header">Distribuzione % per Tipo Procedura</div>
            <div className="p-4" style={{ height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={byTipo} layout="vertical" margin={{ left: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                  <Tooltip formatter={(v: any) => `${v}%`} />
                  <Bar dataKey="pct" name="% Bandi" fill="hsl(210,80%,45%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="tableau-card">
        <div className="tableau-card-header">Trend Annuale: Posti e Candidature</div>
        <div className="p-4" style={{ height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={byAnno}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis dataKey="anno" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="posti" name="Posti" fill="hsl(210,80%,45%)" />
              <Bar dataKey="candidature" name="Candidature" fill="hsl(30,85%,55%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      </div>
    </div>
  );
};
