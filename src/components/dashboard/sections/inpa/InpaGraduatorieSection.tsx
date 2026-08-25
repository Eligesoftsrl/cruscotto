import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFilteredEnteIds, applyEnteFilter } from "@/hooks/useFilteredEnteIds";
import { PaginatedTable } from "@/components/dashboard/charts/PaginatedTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export const InpaGraduatorieSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [chartData, setChartData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [completamento, setCompletamento] = useState({ graduatorie: 0, bandi: 0, tasso: 0 });

  useEffect(() => {
    const load = async () => {
      // Load graduatorie
      let qGrad = supabase.from("dw_lp_graduatorie").select("*");
      qGrad = applyEnteFilter(qGrad, enteIds);
      const { data: grads } = await qGrad;

      // Load bandi for completion rate
      let qBandi = supabase.from("dw_inpa_bandi").select("id");
      qBandi = applyEnteFilter(qBandi, enteIds);
      const { data: bandi } = await qBandi;

      const numGrad = grads?.length ?? 0;
      const numBandi = bandi?.length ?? 0;
      setCompletamento({
        graduatorie: numGrad,
        bandi: numBandi,
        tasso: numBandi > 0 ? Math.round((numGrad / numBandi) * 100) : 0,
      });

      if (!grads) return;

      const chart = grads.map((g: any) => ({
        titolo: (g.profilo ?? g.qualifica ?? "N/D").substring(0, 25),
        posti: g.num_posti_banditi ?? 0,
        idonei: g.num_idonei ?? 0,
        assunti: g.num_vincitori_assunti ?? 0,
        tassoCopertura: (g.num_posti_banditi ?? 0) > 0 ? Math.round(((g.num_vincitori_assunti ?? 0) / g.num_posti_banditi) * 100) : 0,
      }));
      setChartData(chart.slice(0, 15));

      setTableData(grads.map((g: any) => ({
        ente: g.denominazione ?? "-",
        profilo: g.profilo ?? "-",
        qualifica: g.qualifica ?? "-",
        stato: g.stato_graduatoria ?? "-",
        posti: g.num_posti_banditi ?? 0,
        idonei: g.num_idonei ?? 0,
        assunti: g.num_vincitori_assunti ?? 0,
        tcp: g.tcp_giorni ?? "-",
        tassoCop: (g.num_posti_banditi ?? 0) > 0 ? Math.round(((g.num_vincitori_assunti ?? 0) / g.num_posti_banditi) * 100) + "%" : "-",
      })));
    };
    load();
  }, [enteIds]);

  const totPosti = chartData.reduce((s, d) => s + d.posti, 0);
  const totAssunti = chartData.reduce((s, d) => s + d.assunti, 0);
  const tassoGlobale = totPosti > 0 ? Math.round((totAssunti / totPosti) * 100) : 0;

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Tasso Completamento Procedurale", value: `${completamento.tasso}%`, sub: `${completamento.graduatorie} graduatorie / ${completamento.bandi} bandi` },
          { label: "Tasso Copertura Posti", value: `${tassoGlobale}%`, sub: `${totAssunti} assunti su ${totPosti} banditi` },
          { label: "Graduatorie Totali", value: completamento.graduatorie },
          { label: "Bandi Totali", value: completamento.bandi },
        ].map((kpi) => (
          <div key={kpi.label} className="tableau-card">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{kpi.label}</div>
              {"sub" in kpi && kpi.sub && <div className="text-[9px] text-muted-foreground/60 mt-0.5">{kpi.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="tableau-card">
        <div className="tableau-card-header">Graduatorie: Posti vs Idonei vs Assunti</div>
        <div className="p-4" style={{ height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis dataKey="titolo" tick={{ fontSize: 10 }} interval={0} height={70} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="posti" name="Posti" fill="hsl(210,15%,70%)" />
              <Bar dataKey="idonei" name="Idonei" fill="hsl(30,85%,55%)" />
              <Bar dataKey="assunti" name="Assunti" fill="hsl(150,60%,40%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="tableau-card">
        <div className="tableau-card-header">Dettaglio Graduatorie</div>
        <div className="p-4">
          <PaginatedTable
            data={tableData}
            columns={[
              { key: "ente", header: "Ente" },
              { key: "profilo", header: "Profilo" },
              { key: "stato", header: "Stato" },
              { key: "posti", header: "Posti", align: "right" },
              { key: "idonei", header: "Idonei", align: "right" },
              { key: "assunti", header: "Assunti", align: "right" },
              { key: "tcp", header: "TCP (gg)", align: "right" },
              { key: "tassoCop", header: "% Cop.", align: "right" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
