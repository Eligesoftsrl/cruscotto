import { SectionEmpty, SectionError, SectionLoading } from "../SectionStates";
import { tooltipStyle } from "../chartTheme";
import { useGenereData } from "@/hooks/useGenereData";
import { useEtaData } from "@/hooks/useEtaData";
import { Users, BarChart3, Scale } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";


export const AnalisiGenereSection = () => {
  const { generePerQualifica, isLoading: l1, error: e1 } = useGenereData(2023);
  const { distribuzioneEta, isLoading: l2, error: e2 } = useEtaData(2023);

  if (l1 || l2) return <SectionLoading />;
  if (e1 || e2) return <SectionError />;

  if (!generePerQualifica.length) {
    return <SectionEmpty />;
  }

  // Gender gap per qualifica
  const gapData = generePerQualifica.map((r) => ({
    qualifica: r.qualifica,
    uomini: r.uomini,
    donne: r.donne,
    totale: r.uomini + r.donne,
    percDonne: r.uomini + r.donne > 0 ? parseFloat(((r.donne / (r.uomini + r.donne)) * 100).toFixed(1)) : 0,
    gap: r.uomini + r.donne > 0 ? parseFloat((((r.donne - r.uomini) / (r.uomini + r.donne)) * 100).toFixed(1)) : 0,
  }));

  // Distribuzione età per genere (diverging)
  const divergingEta = distribuzioneEta.map((r) => ({
    fascia: r.fascia,
    uomini: -r.uomini,
    donne: r.donne,
  }));

  const totDonne = generePerQualifica.reduce((s, r) => s + r.donne, 0);
  const totUomini = generePerQualifica.reduce((s, r) => s + r.uomini, 0);
  const tot = totDonne + totUomini || 1;
  const percDonne = ((totDonne / tot) * 100).toFixed(1);
  const genderGap = (((totDonne - totUomini) / tot) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      {/* KPI */}
      <div className="grid grid-cols-12 gap-3">
        {[
          { label: "% Donne", value: `${percDonne}%`, icon: Users, color: "hsl(var(--chart-red))" },
          { label: "% Uomini", value: `${(100 - parseFloat(percDonne)).toFixed(1)}%`, icon: Users, color: "hsl(var(--chart-blue))" },
          { label: "Gender gap index", value: `${parseFloat(genderGap) >= 0 ? "+" : ""}${genderGap}%`, icon: Scale, color: "hsl(var(--chart-purple))" },
          { label: "Qualifica più bilanciata", value: gapData.reduce((a, b) => Math.abs(b.gap) < Math.abs(a.gap) ? b : a).qualifica, icon: BarChart3, color: "hsl(var(--chart-teal))" },
        ].map((k, i) => (
          <div key={i} className="col-span-3 bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{k.label}</div>
              <k.icon className="h-4 w-4" style={{ color: k.color }} />
            </div>
            <div className="text-xl font-bold text-foreground mt-1">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Stacked bar per qualifica */}
        <div className="col-span-7 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Distribuzione Genere per Qualifica</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={generePerQualifica} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis type="category" dataKey="qualifica" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={100} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="uomini" name="Uomini" fill="hsl(var(--chart-blue))" stackId="a" barSize={22} />
              <Bar dataKey="donne" name="Donne" fill="hsl(var(--chart-red))" stackId="a" barSize={22} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gender gap butterfly */}
        <div className="col-span-5 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Gender Gap per Qualifica (%)</h3>
          <div className="space-y-3 mt-4">
            {gapData.map((r) => (
              <div key={r.qualifica}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-foreground font-medium">{r.qualifica}</span>
                  <span className={`font-semibold ${r.gap >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {r.gap >= 0 ? "+" : ""}{r.gap}%
                  </span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden relative">
                  <div className="absolute top-0 left-1/2 h-full w-px bg-foreground/20" />
                  {r.gap >= 0 ? (
                    <div
                      className="absolute top-0 h-full rounded-r-full"
                      style={{ left: "50%", width: `${Math.min(Math.abs(r.gap), 50)}%`, background: "hsl(var(--chart-red))" }}
                    />
                  ) : (
                    <div
                      className="absolute top-0 h-full rounded-l-full"
                      style={{ right: "50%", width: `${Math.min(Math.abs(r.gap), 50)}%`, background: "hsl(var(--chart-blue))" }}
                    />
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground mt-2">
              <div className="flex items-center gap-1"><div className="w-3 h-2 rounded" style={{ background: "hsl(var(--chart-blue))" }} /> Più uomini</div>
              <div className="flex items-center gap-1"><div className="w-3 h-2 rounded" style={{ background: "hsl(var(--chart-red))" }} /> Più donne</div>
            </div>
          </div>
        </div>
      </div>

      {/* Piramide demografica per genere */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-xs font-semibold text-foreground mb-3">Piramide Demografica per Genere</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={divergingEta} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => Math.abs(v).toLocaleString("it-IT")} />
            <YAxis type="category" dataKey="fascia" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={110} />
            <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [Math.abs(val).toLocaleString("it-IT"), undefined]} />
            <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine x={0} stroke="hsl(var(--foreground))" strokeWidth={0.5} />
            <Bar dataKey="uomini" name="Uomini" fill="hsl(var(--chart-blue))" barSize={20} />
            <Bar dataKey="donne" name="Donne" fill="hsl(var(--chart-red))" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-xs font-semibold text-foreground mb-3">Dettaglio per Qualifica</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Qualifica", "Uomini", "Donne", "Totale", "% Donne", "Gap"].map((h, i) => (
                  <th key={i} className={`px-4 py-2.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gapData.map((r) => (
                <tr key={r.qualifica} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">{r.qualifica}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{r.uomini.toLocaleString("it-IT")}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{r.donne.toLocaleString("it-IT")}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-foreground">{r.totale.toLocaleString("it-IT")}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{r.percDonne}%</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${r.gap >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {r.gap >= 0 ? "+" : ""}{r.gap}%
                    </span>
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
