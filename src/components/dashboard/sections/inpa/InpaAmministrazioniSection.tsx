import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFilteredEnteIds, applyEnteFilter } from "@/hooks/useFilteredEnteIds";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { InpaLocalFilters, DEFAULT_INPA_FILTERS, applyInpaLocalFilters, type InpaFilters } from "./InpaLocalFilters";

const COLORS = ["hsl(210,80%,45%)", "hsl(30,85%,55%)", "hsl(150,60%,40%)", "hsl(340,70%,55%)", "hsl(260,50%,55%)", "hsl(180,60%,40%)"];

export const InpaAmministrazioniSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [allBandi, setAllBandi] = useState<any[]>([]);
  const [totPa, setTotPa] = useState(0);
  const [filters, setFilters] = useState<InpaFilters>(DEFAULT_INPA_FILTERS);

  useEffect(() => {
    const load = async () => {
      const { count: totCount } = await supabase.from("dw_ente").select("*", { count: "exact", head: true });
      setTotPa(totCount ?? 0);

      let q = supabase.from("dw_inpa_bandi").select("*");
      q = applyEnteFilter(q, enteIds);
      const { data: bandi } = await q;
      setAllBandi(bandi ?? []);
    };
    load();
  }, [enteIds]);

  const bandi = applyInpaLocalFilters(allBandi, filters);

  const paSet = new Set<string>();
  const paByRegione: Record<string, Set<string>> = {};
  const paByAnno: Record<number, Set<string>> = {};
  const paByTipologia: Record<string, Set<string>> = {};

  bandi.forEach((b: any) => {
    const paKey = b.cfiscale_pa ?? b.id_ente?.toString() ?? "";
    if (!paKey) return;
    paSet.add(paKey);

    const reg = b.regione ?? "N/D";
    if (!paByRegione[reg]) paByRegione[reg] = new Set();
    paByRegione[reg].add(paKey);

    const anno = b.anno ?? new Date(b.data_pubblicazione).getFullYear();
    if (!paByAnno[anno]) paByAnno[anno] = new Set();
    paByAnno[anno].add(paKey);

    const tipologia = b.tipologia_ipa ?? b.categoria_ipa ?? "Non classificata";
    if (!paByTipologia[tipologia]) paByTipologia[tipologia] = new Set();
    paByTipologia[tipologia].add(paKey);
  });

  const paAttive = paSet.size;
  const pctGlobale = totPa > 0 ? +((paAttive / totPa) * 100).toFixed(1) : 0;

  const regionData = Object.entries(paByRegione)
    .map(([regione, set]) => ({
      regione,
      pa_attive: set.size,
      pct: totPa > 0 ? +((set.size / totPa) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.pa_attive - a.pa_attive);

  const trendData = Object.entries(paByAnno)
    .sort()
    .map(([anno, set]) => ({
      anno,
      pa_attive: set.size,
      pct: totPa > 0 ? +((set.size / totPa) * 100).toFixed(1) : 0,
    }));

  const tipologiaData = Object.entries(paByTipologia)
    .map(([tipologia, set]) => ({
      tipologia,
      pa_attive: set.size,
      pct: paAttive > 0 ? +((set.size / paAttive) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.pa_attive - a.pa_attive);

  return (
    <div className="space-y-0">
      <InpaLocalFilters filters={filters} onChange={setFilters} />
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "PA che Pubblicano su InPA", value: paAttive, sub: `su ${totPa} totali` },
            { label: "% PA Attive", value: `${pctGlobale}%`, sub: "Indicatore di dinamismo" },
            { label: "Regioni Coperte", value: regionData.length },
            { label: "Tipologie PA", value: tipologiaData.filter(t => t.tipologia !== "Non classificata").length || tipologiaData.length },
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

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-5">
            <div className="tableau-card">
              <div className="tableau-card-header">Trend % PA Attive su InPA</div>
              <div className="p-4" style={{ height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                    <XAxis dataKey="anno" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip formatter={(v: any) => `${v}%`} />
                    <Line type="monotone" dataKey="pct" name="% PA attive" stroke="hsl(210,80%,45%)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-span-7">
            <div className="tableau-card">
              <div className="tableau-card-header">PA Attive per Regione</div>
              <div className="p-4" style={{ height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={regionData.slice(0, 12)} layout="vertical" margin={{ left: 120 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="regione" tick={{ fontSize: 10 }} width={110} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pa_attive" name="PA Attive" fill="hsl(210,80%,45%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {tipologiaData.length > 0 && tipologiaData.some(t => t.tipologia !== "Non classificata") && (
          <div className="tableau-card">
            <div className="tableau-card-header">PA Attive per Tipologia Amministrazione</div>
            <div className="p-4" style={{ height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={tipologiaData} layout="vertical" margin={{ left: 180 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="tipologia" tick={{ fontSize: 10 }} width={170} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pa_attive" name="PA Attive" fill="hsl(150,60%,40%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="tableau-card">
          <div className="tableau-card-header">Dettaglio PA Attive per Regione</div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground text-[11px]">
                    <th className="py-2 px-3">Regione</th>
                    <th className="py-2 px-3 text-right">PA Attive</th>
                    <th className="py-2 px-3 text-right">% sul Totale</th>
                  </tr>
                </thead>
                <tbody>
                  {regionData.map((r) => (
                    <tr key={r.regione} className="border-b border-border/30 hover:bg-muted/20 text-[11px]">
                      <td className="py-1.5 px-3">{r.regione}</td>
                      <td className="py-1.5 px-3 text-right">{r.pa_attive}</td>
                      <td className="py-1.5 px-3 text-right font-semibold">{r.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
