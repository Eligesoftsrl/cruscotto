import { useEffect, useState } from "react";
import { useFilteredEnteIds } from "@/hooks/useFilteredEnteIds";
import { fetchBridgeProfiloCompetenza, fetchCompetenze } from "@/services/dw/minervaService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { PaginatedTable } from "@/components/dashboard/charts/PaginatedTable";
import { Badge } from "@/components/ui/badge";

const TYPE_COLORS: Record<string, string> = {
  CTP: "hsl(210,80%,45%)",
  CTS: "hsl(30,85%,55%)",
  CC: "hsl(150,60%,40%)",
};

export const MinervaCompetenzeSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [compByType, setCompByType] = useState<any[]>([]);
  const [compByArea, setCompByArea] = useState<any[]>([]);
  const [gradingDist, setGradingDist] = useState<any[]>([]);
  const [compTable, setCompTable] = useState<any[]>([]);
  const [coverageRate, setCoverageRate] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [competenze, bridge] = await Promise.all([
        fetchCompetenze(),
        fetchBridgeProfiloCompetenza(enteIds),
      ]);

      // By type (CTP/CTS/CC)
      const typeCount: Record<string, number> = {};
      competenze.forEach((c: any) => { const t = c.tipo ?? "N/D"; typeCount[t] = (typeCount[t] || 0) + 1; });
      setCompByType(Object.entries(typeCount).map(([name, value]) => ({ name, value })));

      // By area
      const areaCount: Record<string, number> = {};
      competenze.forEach((c: any) => { const a = c.area ?? "N/D"; areaCount[a] = (areaCount[a] || 0) + 1; });
      setCompByArea(Object.entries(areaCount).map(([name, count]) => ({ name: name.substring(0, 20), count })).sort((a, b) => b.count - a.count));

      // Grading distribution from bridge
      const gradCount: Record<number, number> = {};
      bridge.forEach((b: any) => { if (b.livello_target) { gradCount[b.livello_target] = (gradCount[b.livello_target] || 0) + 1; } });
      setGradingDist(Object.entries(gradCount).map(([level, count]) => ({ level: `Livello ${level}`, count })).sort((a, b) => a.level.localeCompare(b.level)));

      // Competenze mappate sui profili
      const mappedComps = new Set(bridge.map((b: any) => b.cod_competenza));
      setCoverageRate(competenze.length > 0 ? Math.round((mappedComps.size / competenze.length) * 100) : 0);

      // Table
      setCompTable(competenze.map((c: any) => ({
        codice: c.codice,
        titolo: c.titolo ?? "-",
        area: c.area ?? "-",
        tipo: c.tipo ?? "-",
        mappata: mappedComps.has(c.codice) ? "Sì" : "No",
      })));
    };
    load();
  }, [enteIds]);

  return (
    <div className="p-4 space-y-4">
      {/* KPI */}
      <div className="grid grid-cols-4 gap-3">
        {compByType.map(t => (
          <div key={t.name} className="tableau-card">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: TYPE_COLORS[t.name] ?? "hsl(var(--foreground))" }}>{t.value}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{t.name === "CTP" ? "Tecnico Professionali" : t.name === "CTS" ? "Tecnico Specialistiche" : t.name === "CC" ? "Comportamentali" : t.name}</div>
            </div>
          </div>
        ))}
        <div className="tableau-card">
          <div className="p-4 text-center">
            <div className={`text-2xl font-bold ${coverageRate >= 80 ? "text-green-600" : coverageRate >= 50 ? "text-amber-600" : "text-red-600"}`}>{coverageRate}%</div>
            <div className="text-[11px] text-muted-foreground mt-1">Copertura Mappatura</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Tipologia competenze */}
        <div className="tableau-card">
          <div className="tableau-card-header">Distribuzione per Tipologia (CTP/CTS/CC)</div>
          <div className="p-4" style={{ height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={compByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} fontSize={10}>
                  {compByType.map((e, i) => <Cell key={i} fill={TYPE_COLORS[e.name] ?? "hsl(200,50%,50%)"} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grading atteso */}
        <div className="tableau-card">
          <div className="tableau-card-header">Distribuzione Grading Atteso</div>
          <div className="p-4" style={{ height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={gradingDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                <XAxis dataKey="level" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" name="Occorrenze" fill="hsl(210,80%,45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Per area */}
      <div className="tableau-card">
        <div className="tableau-card-header">Competenze per Area</div>
        <div className="p-4" style={{ height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={compByArea} layout="vertical" margin={{ left: 130 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={120} />
              <Tooltip />
              <Bar dataKey="count" name="Competenze" fill="hsl(30,85%,55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabella dettaglio */}
      <div className="tableau-card">
        <div className="tableau-card-header">Catalogo Competenze</div>
        <div className="p-4">
          <PaginatedTable
            data={compTable}
            columns={[
              { key: "codice", header: "Codice" },
              { key: "titolo", header: "Competenza" },
              { key: "area", header: "Area" },
              { key: "tipo", header: "Tipo", render: (r: any) => (
                <Badge variant="outline" className="text-[10px]" style={{ borderColor: TYPE_COLORS[r.tipo], color: TYPE_COLORS[r.tipo] }}>{r.tipo}</Badge>
              )},
              { key: "mappata", header: "Mappata", render: (r: any) => (
                <span className={r.mappata === "Sì" ? "text-green-600 font-semibold" : "text-muted-foreground"}>{r.mappata}</span>
              )},
            ]}
          />
        </div>
      </div>
    </div>
  );
};
