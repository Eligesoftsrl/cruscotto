import React from "react";
import { BarChart3, TrendingUp, Building2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

/* ── Cluster benchmark data (normalized / percentual) ── */
const clusterCoverageData = [
  { ente: "Padova", copertura: 92, cluster: 85, gap: -7 },
  { ente: "Brescia", copertura: 88, cluster: 85, gap: -3 },
  { ente: "Gubbio", copertura: 72, cluster: 78, gap: 6 },
  { ente: "Vibo V.", copertura: 65, cluster: 78, gap: 13 },
  { ente: "Avezzano", copertura: 78, cluster: 78, gap: 0 },
  { ente: "Tivoli", copertura: 82, cluster: 85, gap: 3 },
];

const digitalMaturityData = [
  { ente: "Padova", indice: 3.8, cluster_media: 3.2 },
  { ente: "Brescia", indice: 3.5, cluster_media: 3.2 },
  { ente: "Gubbio", indice: 2.4, cluster_media: 2.8 },
  { ente: "Vibo V.", indice: 1.9, cluster_media: 2.8 },
  { ente: "Avezzano", indice: 2.7, cluster_media: 2.8 },
  { ente: "Tivoli", indice: 3.1, cluster_media: 3.2 },
];

const radarBenchmarkData = [
  { dimension: "UO/Ente", padova: 85, brescia: 78, media: 72 },
  { dimension: "Copertura FTE", padova: 92, brescia: 88, media: 80 },
  { dimension: "Proc. Censiti", padova: 75, brescia: 82, media: 65 },
  { dimension: "Digital. Fasi", padova: 88, brescia: 72, media: 60 },
  { dimension: "Lavoro Agile", padova: 65, brescia: 58, media: 45 },
  { dimension: "Profili Ruolo", padova: 70, brescia: 65, media: 55 },
];

const criticitaCluster = [
  { criticita: "Sottorganico", incidenza: 42, enti_coinvolti: 4 },
  { criticita: "Competenze carenti", incidenza: 35, enti_coinvolti: 3 },
  { criticita: "Processi non mappati", incidenza: 28, enti_coinvolti: 3 },
  { criticita: "Digitalizzazione bassa", incidenza: 25, enti_coinvolti: 2 },
  { criticita: "Turnover elevato", incidenza: 18, enti_coinvolti: 2 },
];

export const SiproBenchmarkView = () => {
  return (
    <div className="p-4 flex-1 space-y-5">
      {/* Header */}
      <div className="tableau-card">
        <div className="tableau-card-header flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Vista Formez/DFP · SIPrO Benchmarking Multi-Ente
        </div>
        <div className="p-4">
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Indicatori normalizzati, percentuali e indici di copertura per il confronto tra cluster
            di amministrazioni. I valori assoluti sono riformulati in chiave comparativa per
            supportare benchmarking, individuazione criticità sistemiche e diffusione best practice.
          </p>
        </div>
      </div>

      {/* Two-column: Radar + Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Radar benchmark */}
        <div className="tableau-card">
          <div className="tableau-card-header flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Radar Benchmark Multi-Dimensionale
          </div>
          <div className="tableau-card-body">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarBenchmarkData} cx="50%" cy="50%" outerRadius="65%">
                  <PolarGrid stroke="hsl(var(--tableau-grid))" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} />
                  <Radar
                    name="Padova"
                    dataKey="padova"
                    stroke="hsl(var(--chart-blue))"
                    fill="hsl(var(--chart-blue))"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Brescia"
                    dataKey="brescia"
                    stroke="hsl(var(--chart-teal))"
                    fill="hsl(var(--chart-teal))"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Media Cluster"
                    dataKey="media"
                    stroke="hsl(var(--chart-orange))"
                    fill="hsl(var(--chart-orange))"
                    fillOpacity={0.05}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                  <Legend iconType="line" iconSize={12} wrapperStyle={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      fontSize: 10,
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tasso copertura organico */}
        <div className="tableau-card">
          <div className="tableau-card-header flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tasso Copertura Organico vs Media Cluster
          </div>
          <div className="tableau-card-body">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clusterCoverageData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                  <XAxis
                    dataKey="ente"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 10,
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                    formatter={(v: number) => `${v}%`}
                  />
                  <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                  <Bar
                    dataKey="copertura"
                    name="Copertura Ente"
                    fill="hsl(var(--chart-blue))"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="cluster"
                    name="Media Cluster"
                    fill="hsl(var(--chart-orange) / 0.5)"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Digital maturity */}
      <div className="tableau-card">
        <div className="tableau-card-header">
          Indice Medio di Maturità Digitale (IMDP) per Ente vs Cluster
        </div>
        <div className="tableau-card-body">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={digitalMaturityData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                <XAxis
                  dataKey="ente"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  domain={[0, 5]}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 10,
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                <Bar
                  dataKey="indice"
                  name="IMDP Ente"
                  fill="hsl(var(--chart-teal))"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="cluster_media"
                  name="Media Cluster"
                  fill="hsl(var(--chart-orange) / 0.4)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Criticità ranking per cluster */}
      <div className="tableau-card">
        <div className="tableau-card-header">Ranking Macro-Criticità per Cluster</div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2 font-bold text-muted-foreground">#</th>
                <th className="text-left px-3 py-2 font-bold text-muted-foreground">
                  Macro-Criticità
                </th>
                <th className="text-left px-3 py-2 font-bold text-muted-foreground">Incidenza %</th>
                <th className="text-left px-3 py-2 font-bold text-muted-foreground">
                  Enti Coinvolti
                </th>
                <th className="text-left px-3 py-2 font-bold text-muted-foreground">Barra</th>
              </tr>
            </thead>
            <tbody>
              {criticitaCluster.map((c, i) => (
                <tr key={c.criticita} className={i % 2 === 0 ? "" : "bg-muted/15"}>
                  <td className="px-3 py-2 font-bold text-foreground">{i + 1}</td>
                  <td className="px-3 py-2 font-semibold text-foreground">{c.criticita}</td>
                  <td className="px-3 py-2 text-muted-foreground">{c.incidenza}%</td>
                  <td className="px-3 py-2 text-muted-foreground">{c.enti_coinvolti}/6</td>
                  <td className="px-3 py-2">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${c.incidenza}%`,
                          background:
                            c.incidenza > 30
                              ? "hsl(var(--chart-orange))"
                              : "hsl(var(--chart-blue))",
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
