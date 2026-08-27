import { FilterBar } from "../FilterBar";
import { useEtaData } from "@/hooks/useEtaData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export const EtaSection = () => {
  const { distribuzioneEta, totalePersonale, isLoading, error } = useEtaData(2023);

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Caricamento dati…</div>;
  if (error)
    return <div className="p-6 text-sm text-destructive">Errore nel caricamento dei dati.</div>;

  return (
    <div className="space-y-6">
      <FilterBar showMacrocategoria />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="chart-container">
          <h3 className="section-title mb-4">Distribuzione per Fascia di Età</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={distribuzioneEta}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="fascia" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="uomini" name="Uomini" fill="hsl(220,60%,50%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="donne" name="Donne" fill="hsl(350,65%,55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 className="section-title mb-4">Totale per Fascia di Età</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={distribuzioneEta}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="fascia" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="totale" name="Totale" fill="hsl(38,80%,55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-container overflow-x-auto">
        <h3 className="section-title mb-4">Dettaglio numerico</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                Fascia
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
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {distribuzioneEta.map((r) => (
              <tr
                key={r.fascia}
                className="border-b last:border-0 hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-2.5 font-medium">{r.fascia}</td>
                <td className="px-4 py-2.5 text-right">{r.uomini.toLocaleString("it-IT")}</td>
                <td className="px-4 py-2.5 text-right">{r.donne.toLocaleString("it-IT")}</td>
                <td className="px-4 py-2.5 text-right font-semibold">
                  {r.totale.toLocaleString("it-IT")}
                </td>
                <td className="px-4 py-2.5 text-right text-muted-foreground">
                  {totalePersonale > 0 ? ((r.totale / totalePersonale) * 100).toFixed(1) : "0.0"}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
