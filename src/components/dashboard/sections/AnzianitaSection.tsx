import { distribuzioneAnzianita, serieStoricaAnzianita } from "@/fixtures";
import { DemoDataBadge } from "@/components/dashboard/DemoDataBadge";
import { useFilters } from "@/contexts/FilterContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area,
} from "recharts";

const FASCIA_COLORS = [
  "hsl(var(--chart-blue))",
  "hsl(var(--chart-orange))",
  "hsl(var(--chart-teal))",
  "hsl(var(--chart-navy, var(--chart-purple)))",
  "hsl(var(--chart-red))",
];

const fasce = ["<5 anni", "5-14", "15-24", "25-34", "35+"];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 11,
};

export const AnzianitaSection = () => {
  const { filters } = useFilters();
  const genere = filters.genere;

  // Apply gender filter
  const data = distribuzioneAnzianita.map((r) => ({
    ...r,
    uomini: genere === "Donne" ? 0 : r.uomini,
    donne: genere === "Uomini" ? 0 : r.donne,
    totale: genere === "Donne" ? r.donne : genere === "Uomini" ? r.uomini : r.totale,
  }));

  const totale = data.reduce((s, r) => s + r.totale, 0);
  const fasciaMax = data.reduce((a, b) => (b.totale > a.totale ? b : a));

  const showBoth = genere === "Tutti";

  return (
    <div className="space-y-4">
      <DemoDataBadge note="Dati dimostrativi: l'anzianità di servizio non è ancora presente nelle tabelle dw_* (prevista in ca_anzianita)." />
      {/* KPI row */}
      <div className="grid grid-cols-12 gap-3">
        {[
          { label: genere === "Tutti" ? "Personale totale" : `Personale (${genere})`, value: totale.toLocaleString("it-IT") },
          { label: "Fascia prevalente", value: fasciaMax.fascia },
          { label: "% fascia prevalente", value: `${((fasciaMax.totale / totale) * 100).toFixed(1)}%` },
          { label: "Anzianità media stimata", value: "18,5 anni" },
        ].map((k, i) => (
          <div key={i} className="col-span-3 bg-card border rounded-lg p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{k.label}</div>
            <div className="text-xl font-bold text-foreground mt-1">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Distribuzione per Anzianità di Servizio</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="fascia" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
              {(showBoth || genere === "Uomini") && (
                <Bar dataKey="uomini" name="Uomini" fill="hsl(var(--chart-blue))" radius={[3, 3, 0, 0]} />
              )}
              {(showBoth || genere === "Donne") && (
                <Bar dataKey="donne" name="Donne" fill="hsl(var(--chart-red))" radius={[3, 3, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-6 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Evoluzione composizione per anzianità (2012–2023)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={serieStoricaAnzianita}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="anno" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} unit="%" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
              {fasce.map((f, i) => (
                <Area key={f} type="monotone" dataKey={f} stackId="1" fill={FASCIA_COLORS[i]} stroke={FASCIA_COLORS[i]} fillOpacity={0.7} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="col-span-12 bg-card border rounded-lg p-4">
        <h3 className="text-xs font-semibold text-foreground mb-3">Dettaglio per fascia di anzianità</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Fascia</th>
                {showBoth && <th className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Uomini</th>}
                {showBoth && <th className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Donne</th>}
                <th className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Totale</th>
                <th className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">% sul totale</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.fascia} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">{r.fascia}</td>
                  {showBoth && <td className="px-4 py-2.5 text-right text-muted-foreground">{r.uomini.toLocaleString("it-IT")}</td>}
                  {showBoth && <td className="px-4 py-2.5 text-right text-muted-foreground">{r.donne.toLocaleString("it-IT")}</td>}
                  <td className="px-4 py-2.5 text-right font-semibold text-foreground">{r.totale.toLocaleString("it-IT")}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{((r.totale / totale) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
