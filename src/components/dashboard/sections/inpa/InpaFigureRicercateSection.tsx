import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFilteredEnteIds, applyEnteFilter } from "@/hooks/useFilteredEnteIds";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(210,80%,45%)", "hsl(30,85%,55%)", "hsl(150,60%,40%)", "hsl(340,70%,55%)", "hsl(260,50%,55%)", "hsl(180,60%,40%)", "hsl(45,80%,50%)", "hsl(300,50%,55%)"];

// Classificazione base delle figure ricercate
const classifyFigura = (figura: string): string => {
  const f = (figura ?? "").toLowerCase();
  if (f.includes("inform") || f.includes("digit") || f.includes("ict") || f.includes("tecnolog")) return "Informatico / Digitale";
  if (f.includes("giurid") || f.includes("legal") || f.includes("ammin") || f.includes("funzion")) return "Giuridico / Amministrativo";
  if (f.includes("tecnic") || f.includes("ingegn") || f.includes("architect")) return "Tecnico / Ingegneristico";
  if (f.includes("econom") || f.includes("contab") || f.includes("finan") || f.includes("ragion")) return "Economico / Finanziario";
  if (f.includes("sanit") || f.includes("medic") || f.includes("inferm") || f.includes("farmac")) return "Sanitario";
  if (f.includes("comunic") || f.includes("relaz") || f.includes("stampa")) return "Comunicazione";
  if (f.includes("dirig")) return "Dirigenziale";
  return "Altro";
};

export const InpaFigureRicercateSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [byCategoria, setByCategoria] = useState<any[]>([]);
  const [byFigura, setByFigura] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      let q = supabase.from("dw_inpa_bandi").select("*");
      q = applyEnteFilter(q, enteIds);
      const { data: bandi } = await q;
      if (!bandi) return;

      const catCount: Record<string, { bandi: number; posti: number; candidature: number }> = {};
      const figCount: Record<string, { bandi: number; posti: number }> = {};
      const totale = bandi.length;

      bandi.forEach((b: any) => {
        const cat = classifyFigura(b.figura_ricercata ?? "");
        if (!catCount[cat]) catCount[cat] = { bandi: 0, posti: 0, candidature: 0 };
        catCount[cat].bandi++;
        catCount[cat].posti += b.num_posti ?? 0;
        catCount[cat].candidature += b.num_candidature_submitted ?? 0;

        const fig = (b.figura_ricercata ?? "N/D").substring(0, 35);
        if (!figCount[fig]) figCount[fig] = { bandi: 0, posti: 0 };
        figCount[fig].bandi++;
        figCount[fig].posti += b.num_posti ?? 0;
      });

      setByCategoria(
        Object.entries(catCount)
          .map(([name, v]) => ({
            name,
            bandi: v.bandi,
            posti: v.posti,
            candidature: v.candidature,
            pct: totale > 0 ? +((v.bandi / totale) * 100).toFixed(1) : 0,
          }))
          .sort((a, b) => b.bandi - a.bandi)
      );

      setByFigura(
        Object.entries(figCount)
          .map(([name, v]) => ({ name, ...v, pct: totale > 0 ? +((v.bandi / totale) * 100).toFixed(1) : 0 }))
          .sort((a, b) => b.bandi - a.bandi)
          .slice(0, 15)
      );
    };
    load();
  }, [enteIds]);

  const topCat = byCategoria.length > 0 ? byCategoria[0] : null;

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Categorie Professionali", value: byCategoria.length },
          { label: "Categoria Più Richiesta", value: topCat?.name ?? "-", sub: topCat ? `${topCat.pct}% dei bandi` : "" },
          { label: "Figure Distinte", value: byFigura.length },
        ].map((kpi) => (
          <div key={kpi.label} className="tableau-card">
            <div className="p-4 text-center">
              <div className="text-xl font-bold text-foreground">{kpi.value}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{kpi.label}</div>
              {"sub" in kpi && kpi.sub && <div className="text-[9px] text-muted-foreground/60 mt-0.5">{kpi.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-5">
          <div className="tableau-card">
            <div className="tableau-card-header">Composizione % per Tipologia Professionale</div>
            <div className="p-4" style={{ height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byCategoria} dataKey="pct" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, pct }) => `${name}: ${pct}%`}>
                    {byCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-span-7">
          <div className="tableau-card">
            <div className="tableau-card-header">Posti e Candidature per Tipologia</div>
            <div className="p-4" style={{ height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={byCategoria} layout="vertical" margin={{ left: 140 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
                  <Tooltip />
                  <Bar dataKey="posti" name="Posti" fill="hsl(210,80%,45%)" />
                  <Bar dataKey="candidature" name="Candidature" fill="hsl(30,85%,55%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="tableau-card">
        <div className="tableau-card-header">Top 15 Figure Ricercate</div>
        <div className="p-4" style={{ height: 380 }}>
          <ResponsiveContainer>
            <BarChart data={byFigura} layout="vertical" margin={{ left: 200 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={190} />
              <Tooltip />
              <Bar dataKey="bandi" name="N. Bandi" fill="hsl(210,80%,45%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
