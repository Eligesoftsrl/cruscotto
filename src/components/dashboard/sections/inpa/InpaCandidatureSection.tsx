import { useEffect, useState } from "react";
import { useFilteredEnteIds } from "@/hooks/useFilteredEnteIds";
import { fetchInpaBandi } from "@/services/dw/inpaService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(210,80%,45%)", "hsl(30,85%,55%)", "hsl(150,60%,40%)", "hsl(340,70%,55%)", "hsl(260,50%,55%)", "hsl(180,60%,40%)"];

const getFasciaPosti = (n: number): string => {
  if (n <= 5) return "1-5";
  if (n <= 20) return "6-20";
  if (n <= 50) return "21-50";
  if (n <= 100) return "51-100";
  if (n <= 200) return "101-200";
  return ">200";
};

export const InpaCandidatureSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [data, setData] = useState<any[]>([]);
  const [byCategoria, setByCategoria] = useState<any[]>([]);
  const [byFascia, setByFascia] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const bandi = await fetchInpaBandi(enteIds);
      if (!bandi) return;

      const filtered = bandi.filter((b: any) => b.num_candidature_submitted > 0);
      const totCandidature = filtered.reduce((s: number, b: any) => s + (b.num_candidature_submitted ?? 0), 0);

      const mapped = filtered.map((b: any) => ({
        titolo: (b.figura_ricercata ?? b.codice ?? "N/D").substring(0, 30),
        posti: b.num_posti ?? 0,
        candidature: b.num_candidature_submitted ?? 0,
        rapporto: b.num_posti > 0 ? ((b.num_candidature_submitted ?? 0) / b.num_posti).toFixed(1) : "0",
      }));
      setData(mapped);

      // By tipo procedura (categoria)
      const catAgg: Record<string, number> = {};
      filtered.forEach((b: any) => {
        const t = b.tipo_procedura ?? "Altro";
        catAgg[t] = (catAgg[t] || 0) + (b.num_candidature_submitted ?? 0);
      });
      setByCategoria(
        Object.entries(catAgg)
          .map(([name, value]) => ({
            name,
            value,
            pct: totCandidature > 0 ? +((value / totCandidature) * 100).toFixed(1) : 0,
          }))
          .sort((a, b) => b.value - a.value)
      );

      // By fascia posti
      const fasciaAgg: Record<string, { candidature: number; bandi: number }> = {};
      const fasciaOrder = ["1-5", "6-20", "21-50", "51-100", "101-200", ">200"];
      filtered.forEach((b: any) => {
        const fascia = getFasciaPosti(b.num_posti ?? 0);
        if (!fasciaAgg[fascia]) fasciaAgg[fascia] = { candidature: 0, bandi: 0 };
        fasciaAgg[fascia].candidature += b.num_candidature_submitted ?? 0;
        fasciaAgg[fascia].bandi++;
      });
      setByFascia(
        fasciaOrder
          .filter((f) => fasciaAgg[f])
          .map((fascia) => ({
            fascia,
            ...fasciaAgg[fascia],
            pct: totCandidature > 0 ? +((fasciaAgg[fascia].candidature / totCandidature) * 100).toFixed(1) : 0,
          }))
      );
    };
    load();
  }, [enteIds]);

  const totCandidature = data.reduce((s, d) => s + d.candidature, 0);
  const totPosti = data.reduce((s, d) => s + d.posti, 0);
  const avgRapporto = data.length ? (data.reduce((s, d) => s + parseFloat(d.rapporto), 0) / data.length).toFixed(1) : "-";

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Totale Candidature", value: totCandidature },
          { label: "Rapporto Medio D/O", value: `${avgRapporto}:1` },
          { label: "Posti Totali Offerti", value: totPosti },
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
            <div className="tableau-card-header">% Candidature per Tipo Procedura</div>
            <div className="p-4" style={{ height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byCategoria} dataKey="pct" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, pct }) => `${name}: ${pct}%`}>
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
            <div className="tableau-card-header">Candidature per Fascia di Posti</div>
            <div className="p-4" style={{ height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={byFascia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                  <XAxis dataKey="fascia" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="candidature" name="Candidature" fill="hsl(210,80%,45%)" />
                  <Bar dataKey="bandi" name="N. Bandi" fill="hsl(30,85%,55%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="tableau-card">
        <div className="tableau-card-header">Candidature per Bando (Top 15)</div>
        <div className="p-4" style={{ height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={data.slice(0, 15)} margin={{ left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis dataKey="titolo" tick={{ fontSize: 10 }} interval={0} height={80} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="candidature" name="Candidature" fill="hsl(210,80%,45%)" />
              <Bar dataKey="posti" name="Posti" fill="hsl(30,85%,55%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
