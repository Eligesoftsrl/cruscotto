import { useEffect, useState } from "react";
import { useFilteredEnteIds } from "@/hooks/useFilteredEnteIds";
import { fetchInpaBandi, fetchInpaCandidati } from "@/services/dw/inpaService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { InpaLocalFilters, DEFAULT_INPA_FILTERS, applyInpaLocalFilters, type InpaFilters } from "./InpaLocalFilters";

const COLORS = ["hsl(210,80%,45%)", "hsl(30,85%,55%)", "hsl(150,60%,40%)", "hsl(340,70%,55%)", "hsl(260,50%,55%)", "hsl(180,60%,40%)"];

export const InpaAttrattivitaSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [allBandi, setAllBandi] = useState<any[]>([]);
  const [candidatiData, setCandidatiData] = useState<any[]>([]);
  const [filters, setFilters] = useState<InpaFilters>(DEFAULT_INPA_FILTERS);

  useEffect(() => {
    const load = async () => {
      const bandi = await fetchInpaBandi(enteIds);
      setAllBandi(bandi ?? []);

      // Load candidate demographics if available
      const candidati = await fetchInpaCandidati();
      setCandidatiData(candidati ?? []);
    };
    load();
  }, [enteIds]);

  const bandi = applyInpaLocalFilters(allBandi, filters);

  // By regione
  const byReg: Record<string, { posti: number; candidature: number; bandi: number }> = {};
  bandi.forEach((b: any) => {
    const r = b.regione ?? "N/D";
    if (!byReg[r]) byReg[r] = { posti: 0, candidature: 0, bandi: 0 };
    byReg[r].posti += b.num_posti ?? 0;
    byReg[r].candidature += b.num_candidature_submitted ?? 0;
    byReg[r].bandi++;
  });
  const regionData = Object.entries(byReg)
    .map(([regione, v]) => ({ regione, ...v, rapporto: v.posti > 0 ? +(v.candidature / v.posti).toFixed(1) : 0 }))
    .sort((a, b) => b.candidature - a.candidature);

  // By settore (new field)
  const bySettore: Record<string, { candidature: number; bandi: number }> = {};
  bandi.forEach((b: any) => {
    const s = b.settore_pubblicazione;
    if (!s) return;
    if (!bySettore[s]) bySettore[s] = { candidature: 0, bandi: 0 };
    bySettore[s].candidature += b.num_candidature_submitted ?? 0;
    bySettore[s].bandi++;
  });
  const settoreData = Object.entries(bySettore)
    .map(([settore, v]) => ({ settore, ...v }))
    .sort((a, b) => b.candidature - a.candidature);

  // Candidate demographics
  const hasCandidati = candidatiData.length > 0;
  const byGenere: Record<string, number> = {};
  const byEta: Record<string, number> = {};
  const byTitolo: Record<string, number> = {};
  if (hasCandidati) {
    const totCand = candidatiData.reduce((s, c) => s + (c.num_candidature ?? 0), 0);
    candidatiData.forEach((c: any) => {
      if (c.genere) byGenere[c.genere] = (byGenere[c.genere] || 0) + (c.num_candidature ?? 0);
      if (c.fascia_eta) byEta[c.fascia_eta] = (byEta[c.fascia_eta] || 0) + (c.num_candidature ?? 0);
      if (c.titolo_studio) byTitolo[c.titolo_studio] = (byTitolo[c.titolo_studio] || 0) + (c.num_candidature ?? 0);
    });
  }

  const genereData = Object.entries(byGenere).map(([name, value]) => ({ name, value, pct: +((value / Math.max(1, Object.values(byGenere).reduce((s, v) => s + v, 0))) * 100).toFixed(1) }));
  const etaData = Object.entries(byEta).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const titoloData = Object.entries(byTitolo).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-0">
      <InpaLocalFilters filters={filters} onChange={setFilters} />
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Rapporto Medio D/O", value: regionData.length > 0 ? (regionData.reduce((s, r) => s + r.rapporto, 0) / regionData.length).toFixed(1) + ":1" : "-" },
            { label: "Regione Più Attrattiva", value: regionData[0]?.regione ?? "-", sub: regionData[0] ? `${regionData[0].candidature} candidature` : "" },
            { label: "Settori con Dati", value: settoreData.length || "N/D" },
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

        <div className="tableau-card">
          <div className="tableau-card-header">Attrattività per Regione</div>
          <div className="p-4" style={{ height: 380 }}>
            <ResponsiveContainer>
              <BarChart data={regionData.slice(0, 12)} layout="vertical" margin={{ left: 140 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="regione" tick={{ fontSize: 11 }} width={130} />
                <Tooltip />
                <Legend />
                <Bar dataKey="candidature" name="Candidature" fill="hsl(210,80%,45%)" />
                <Bar dataKey="posti" name="Posti" fill="hsl(30,85%,55%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {settoreData.length > 0 && (
          <div className="tableau-card">
            <div className="tableau-card-header">Attrattività per Settore di Pubblicazione</div>
            <div className="p-4" style={{ height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={settoreData.slice(0, 12)} layout="vertical" margin={{ left: 180 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="settore" tick={{ fontSize: 10 }} width={170} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="candidature" name="Candidature" fill="hsl(150,60%,40%)" />
                  <Bar dataKey="bandi" name="N. Bandi" fill="hsl(260,50%,55%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {hasCandidati && (
          <div className="grid grid-cols-12 gap-4">
            {genereData.length > 0 && (
              <div className="col-span-4">
                <div className="tableau-card">
                  <div className="tableau-card-header">Candidature per Genere</div>
                  <div className="p-4" style={{ height: 280 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={genereData} dataKey="pct" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, pct }) => `${name}: ${pct}%`}>
                          {genereData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => `${v}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
            {etaData.length > 0 && (
              <div className="col-span-4">
                <div className="tableau-card">
                  <div className="tableau-card-header">Candidature per Fascia Età</div>
                  <div className="p-4" style={{ height: 280 }}>
                    <ResponsiveContainer>
                      <BarChart data={etaData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="value" name="Candidature" fill="hsl(210,80%,45%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
            {titoloData.length > 0 && (
              <div className="col-span-4">
                <div className="tableau-card">
                  <div className="tableau-card-header">Candidature per Titolo Studio</div>
                  <div className="p-4" style={{ height: 280 }}>
                    <ResponsiveContainer>
                      <BarChart data={titoloData} layout="vertical" margin={{ left: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                        <Tooltip />
                        <Bar dataKey="value" name="Candidature" fill="hsl(30,85%,55%)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="tableau-card">
          <div className="tableau-card-header">Dettaglio per Regione</div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground text-[11px]">
                  <th className="py-2 px-3">Regione</th><th className="py-2 px-3 text-right">Bandi</th>
                  <th className="py-2 px-3 text-right">Posti</th><th className="py-2 px-3 text-right">Candidature</th>
                  <th className="py-2 px-3 text-right">Rapporto D/O</th>
                </tr></thead>
                <tbody>{regionData.map(r => (
                  <tr key={r.regione} className="border-b border-border/30 hover:bg-muted/20 text-[11px]">
                    <td className="py-1.5 px-3">{r.regione}</td>
                    <td className="py-1.5 px-3 text-right">{r.bandi}</td>
                    <td className="py-1.5 px-3 text-right">{r.posti}</td>
                    <td className="py-1.5 px-3 text-right">{r.candidature}</td>
                    <td className="py-1.5 px-3 text-right font-semibold">{r.rapporto}:1</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
