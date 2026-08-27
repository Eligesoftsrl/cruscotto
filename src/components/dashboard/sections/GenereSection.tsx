import { FilterBar } from "../FilterBar";
import { KpiCard } from "../KpiCard";
import { UserCheck } from "lucide-react";
import { useGenereData } from "@/hooks/useGenereData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const GENDER_COLORS = ["hsl(220,60%,50%)", "hsl(350,65%,55%)"];

export const GenereSection = () => {
  const { generePerQualifica, kpiOverview, isLoading, error } = useGenereData(2023);

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Caricamento dati…</div>;
  if (error)
    return <div className="p-6 text-sm text-destructive">Errore nel caricamento dei dati.</div>;

  const genderTotal = [
    { name: "Uomini", value: kpiOverview.uominiPerc },
    { name: "Donne", value: kpiOverview.donnePerc },
  ];

  const dirUomini = generePerQualifica
    .filter((r) => r.qualifica.includes("Dirig"))
    .reduce((s, r) => s + r.uomini, 0);
  const dirDonne = generePerQualifica
    .filter((r) => r.qualifica.includes("Dirig"))
    .reduce((s, r) => s + r.donne, 0);
  const dirTotal = dirUomini + dirDonne;
  const dirDonnePerc = dirTotal > 0 ? ((dirDonne / dirTotal) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <FilterBar showMacrocategoria />

      <div className="grid gap-4 sm:grid-cols-4">
        <KpiCard
          title="% Donne Totale"
          value={kpiOverview.donnePerc}
          suffix="%"
          icon={UserCheck}
          accent
        />
        <KpiCard title="% Donne Dirigenti" value={dirDonnePerc} suffix="%" icon={UserCheck} />
        <KpiCard title="Dirigenti" value={kpiOverview.personaleDirigente} />
        <KpiCard title="Non Dirigenti" value={kpiOverview.personaleNonDirigente} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="chart-container">
          <h3 className="section-title mb-4">Personale per Genere</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={genderTotal}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {genderTotal.map((_, i) => (
                  <Cell key={i} fill={GENDER_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container lg:col-span-2">
          <h3 className="section-title mb-4">Distribuzione per Genere e Qualifica</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={generePerQualifica}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="qualifica" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="uomini" name="Uomini" fill="hsl(220,60%,50%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="donne" name="Donne" fill="hsl(350,65%,55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="chart-container overflow-x-auto">
        <h3 className="section-title mb-4">Dettaglio per Qualifica</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                Qualifica
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                Uomini
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                Donne
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                Totale
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                % Donne
              </th>
            </tr>
          </thead>
          <tbody>
            {generePerQualifica.map((r) => {
              const tot = r.uomini + r.donne;
              return (
                <tr
                  key={r.qualifica}
                  className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-2.5 font-medium">{r.qualifica}</td>
                  <td className="px-4 py-2.5 text-right">{r.uomini.toLocaleString("it-IT")}</td>
                  <td className="px-4 py-2.5 text-right">{r.donne.toLocaleString("it-IT")}</td>
                  <td className="px-4 py-2.5 text-right font-semibold">
                    {tot.toLocaleString("it-IT")}
                  </td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">
                    {tot > 0 ? ((r.donne / tot) * 100).toFixed(1) : "0.0"}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
