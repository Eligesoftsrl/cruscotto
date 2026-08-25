import { useEffect, useState } from "react";
import { useFilteredEnteIds } from "@/hooks/useFilteredEnteIds";
import { fetchInpaBandiOrderedByPublication } from "@/services/dw/inpaService";
import { PaginatedTable } from "@/components/dashboard/charts/PaginatedTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { InpaLocalFilters, DEFAULT_INPA_FILTERS, applyInpaLocalFilters, type InpaFilters } from "./InpaLocalFilters";

const COLORS = ["hsl(210,80%,45%)", "hsl(30,85%,55%)", "hsl(150,60%,40%)", "hsl(0,70%,55%)", "hsl(260,50%,55%)", "hsl(180,60%,40%)"];

export const InpaBandiSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [allBandi, setAllBandi] = useState<any[]>([]);
  const [filters, setFilters] = useState<InpaFilters>(DEFAULT_INPA_FILTERS);

  useEffect(() => {
    const load = async () => {
      const data = await fetchInpaBandiOrderedByPublication(enteIds);
      setAllBandi(data ?? []);
    };
    load();
  }, [enteIds]);

  const bandi = applyInpaLocalFilters(allBandi, filters);

  // Pie: by tipo_procedura (%)
  const byTipo: Record<string, number> = {};
  bandi.forEach((b) => { byTipo[b.tipo_procedura ?? "Altro"] = (byTipo[b.tipo_procedura ?? "Altro"] || 0) + 1; });
  const tot = bandi.length;
  const pieData = Object.entries(byTipo)
    .map(([name, value]) => ({ name, value, pct: tot > 0 ? +((value / tot) * 100).toFixed(1) : 0 }))
    .sort((a, b) => b.value - a.value);

  // Bar: posti per regione
  const byRegione: Record<string, number> = {};
  bandi.forEach((b) => { byRegione[b.regione ?? "N/D"] = (byRegione[b.regione ?? "N/D"] || 0) + (Number(b.num_posti) || 0); });
  const barData = Object.entries(byRegione).map(([regione, posti]) => ({ regione, posti })).sort((a, b) => b.posti - a.posti);

  // Stacked bar: tipologia_ipa x tipo_procedura
  const tipologiaMap: Record<string, Record<string, number>> = {};
  const allTipi = new Set<string>();
  bandi.forEach((b) => {
    const tipologia = b.tipologia_ipa ?? b.categoria_ipa ?? "Non classificata";
    const tipo = b.tipo_procedura ?? "Altro";
    allTipi.add(tipo);
    if (!tipologiaMap[tipologia]) tipologiaMap[tipologia] = {};
    tipologiaMap[tipologia][tipo] = (tipologiaMap[tipologia][tipo] || 0) + 1;
  });
  const tipiArr = [...allTipi];
  const stackedData = Object.entries(tipologiaMap)
    .map(([tipologia, tipi]) => ({ tipologia, ...tipi }))
    .sort((a, b) => {
      const sumA = tipiArr.reduce((s, t) => s + ((a as any)[t] || 0), 0);
      const sumB = tipiArr.reduce((s, t) => s + ((b as any)[t] || 0), 0);
      return sumB - sumA;
    });

  // Trend annuale
  const byAnno: Record<string, number> = {};
  bandi.forEach((b) => {
    const a = String(b.anno ?? new Date(b.data_pubblicazione).getFullYear());
    byAnno[a] = (byAnno[a] || 0) + 1;
  });
  const trendData = Object.entries(byAnno).sort().map(([anno, count]) => ({ anno, bandi: count }));

  return (
    <div className="space-y-0">
      <InpaLocalFilters filters={filters} onChange={setFilters} />
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Totale Bandi", value: bandi.length },
            { label: "Posti Totali", value: bandi.reduce((s, b) => s + (b.num_posti ?? 0), 0) },
            { label: "Tipi Procedura", value: pieData.length },
            { label: "Regioni", value: barData.length },
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
          <div className="col-span-4">
            <div className="tableau-card">
              <div className="tableau-card-header">% Bandi per Tipo Procedura</div>
              <div className="p-4" style={{ height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="pct" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, pct }) => `${name}: ${pct}%`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-span-4">
            <div className="tableau-card">
              <div className="tableau-card-header">Trend Annuale Bandi</div>
              <div className="p-4" style={{ height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                    <XAxis dataKey="anno" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="bandi" name="N. Bandi" stroke="hsl(210,80%,45%)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-span-4">
            <div className="tableau-card">
              <div className="tableau-card-header">Posti per Regione (Top 10)</div>
              <div className="p-4" style={{ height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={barData.slice(0, 10)} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="regione" tick={{ fontSize: 10 }} width={90} />
                    <Tooltip />
                    <Bar dataKey="posti" fill="hsl(210,80%,45%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {stackedData.length > 0 && stackedData.some(d => d.tipologia !== "Non classificata") && (
          <div className="tableau-card">
            <div className="tableau-card-header">Tipologia PA × Tipo Procedura</div>
            <div className="p-4" style={{ height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={stackedData.slice(0, 10)} layout="vertical" margin={{ left: 160 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="tipologia" tick={{ fontSize: 10 }} width={150} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {tipiArr.map((tipo, i) => (
                    <Bar key={tipo} dataKey={tipo} stackId="a" fill={COLORS[i % COLORS.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="tableau-card">
          <div className="tableau-card-header">Dettaglio Bandi Pubblicati</div>
          <div className="p-4">
            <PaginatedTable
              data={bandi}
              columns={[
                { key: "codice", header: "Codice" },
                { key: "figura_ricercata", header: "Figura Ricercata" },
                { key: "tipo_procedura", header: "Tipo" },
                { key: "regione", header: "Regione" },
                { key: "settore_pubblicazione", header: "Settore" },
                { key: "stato_bando", header: "Stato" },
                { key: "num_posti", header: "Posti", align: "right" },
                { key: "num_candidature_submitted", header: "Candidature", align: "right" },
                { key: "data_pubblicazione", header: "Pubblicazione" },
              ]}
              pageSize={10}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
