import { useEffect, useState } from "react";
import { useFilteredEnteIds } from "@/hooks/useFilteredEnteIds";
import { fetchInpaBandi } from "@/services/dw/inpaService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Cell,
} from "recharts";
import { PaginatedTable } from "@/components/dashboard/charts/PaginatedTable";

export const InpaDomandaOffertaSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const bandi = await fetchInpaBandi(enteIds);
      if (!bandi) return;

      const mapped = bandi
        .filter((b: any) => (b.num_posti ?? 0) > 0)
        .map((b: any) => {
          const cands = b.num_candidature_submitted ?? 0;
          const posti = b.num_posti ?? 0;
          // Formula documento: (Posti - Candidature) / Posti * 100
          // Positivo = scarsa attrattività (pochi candidati), Negativo = saturazione (troppi candidati)
          const diffPct = posti > 0 ? +(((posti - cands) / posti) * 100).toFixed(1) : 0;
          return {
            titolo: (b.figura_ricercata ?? b.codice ?? "N/D").substring(0, 25),
            regione: b.regione ?? "-",
            tipo: b.tipo_procedura ?? "-",
            posti,
            candidature: cands,
            diffPct,
            rapporto: posti > 0 ? +(cands / posti).toFixed(1) : 0,
          };
        });
      setData(mapped.sort((a, b) => a.diffPct - b.diffPct));
    };
    load();
  }, [enteIds]);

  const avgDiff = data.length
    ? +(data.reduce((s, d) => s + d.diffPct, 0) / data.length).toFixed(1)
    : 0;
  const saturati = data.filter((d) => d.diffPct < -100).length;
  const scarsaAttr = data.filter((d) => d.diffPct > 50).length;
  const equilibrio = data.filter((d) => d.diffPct >= -100 && d.diffPct <= 50).length;

  const byTipo: Record<string, { posti: number; cands: number }> = {};
  data.forEach((d) => {
    if (!byTipo[d.tipo]) byTipo[d.tipo] = { posti: 0, cands: 0 };
    byTipo[d.tipo].posti += d.posti;
    byTipo[d.tipo].cands += d.candidature;
  });
  const tipoData = Object.entries(byTipo).map(([tipo, v]) => ({
    tipo,
    posti: v.posti,
    candidature: v.cands,
    diffPct: v.posti > 0 ? +(((v.posti - v.cands) / v.posti) * 100).toFixed(1) : 0,
  }));

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Differenza % Media",
            value: `${avgDiff}%`,
            sub: avgDiff > 0 ? "Scarsa attrattività" : "Saturazione",
          },
          { label: "Bandi Saturi (<-100%)", value: saturati, sub: "Troppi candidati" },
          { label: "Scarsa Attrattività (>50%)", value: scarsaAttr, sub: "Pochi candidati" },
          { label: "In Equilibrio", value: equilibrio, sub: "Tra -100% e +50%" },
        ].map((kpi) => (
          <div key={kpi.label} className="tableau-card">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{kpi.label}</div>
              <div className="text-[9px] text-muted-foreground/60 mt-0.5">{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="tableau-card">
        <div className="tableau-card-header">
          Differenza % (Posti − Candidature) / Posti × 100
          <span className="ml-2 text-[10px] font-normal text-muted-foreground">
            Positivo = scarsa attrattività · Negativo = saturazione
          </span>
        </div>
        <div className="p-4" style={{ height: 380 }}>
          <ResponsiveContainer>
            <BarChart data={data.slice(0, 20)} layout="vertical" margin={{ left: 140 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis type="number" tick={{ fontSize: 11 }} unit="%" />
              <YAxis type="category" dataKey="titolo" tick={{ fontSize: 10 }} width={130} />
              <Tooltip formatter={(v: any) => `${v}%`} />
              <ReferenceLine x={0} stroke="hsl(var(--foreground))" strokeWidth={1.5} />
              <Bar dataKey="diffPct" name="Diff % D/O">
                {data.slice(0, 20).map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.diffPct > 50
                        ? "hsl(30,85%,55%)"
                        : entry.diffPct < -100
                          ? "hsl(0,70%,55%)"
                          : "hsl(210,80%,45%)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tableau-card">
        <div className="tableau-card-header">Bilanciamento D/O per Tipo Procedura</div>
        <div className="p-4" style={{ height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={tipoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis dataKey="tipo" tick={{ fontSize: 10 }} interval={0} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="posti" name="Posti Disponibili" fill="hsl(210,15%,70%)" />
              <Bar dataKey="candidature" name="Candidature" fill="hsl(210,80%,45%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tableau-card">
        <div className="tableau-card-header">Dettaglio Bilanciamento Domanda/Offerta</div>
        <div className="p-4">
          <PaginatedTable
            data={data}
            columns={[
              { key: "titolo", header: "Figura" },
              { key: "regione", header: "Regione" },
              { key: "tipo", header: "Tipo" },
              { key: "posti", header: "Posti", align: "right" },
              { key: "candidature", header: "Candidature", align: "right" },
              {
                key: "diffPct",
                header: "Diff %",
                align: "right",
                render: (r: any) => (
                  <span
                    className={`font-semibold ${r.diffPct > 50 ? "text-amber-600" : r.diffPct < -100 ? "text-red-600" : "text-green-600"}`}
                  >
                    {r.diffPct}%
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
