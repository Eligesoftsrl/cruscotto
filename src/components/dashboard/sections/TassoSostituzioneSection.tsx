import { SectionEmpty, SectionError, SectionLoading } from "../SectionStates";
import { tooltipStyle } from "../chartTheme";
import { useCessatiData } from "@/hooks/useCessatiData";
import { useAssuntiData } from "@/hooks/useAssuntiData";
import { RefreshCw, TrendingUp, Target, BarChart3 } from "lucide-react";
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ReferenceLine, AreaChart, Area,
} from "recharts";


export const TassoSostituzioneSection = () => {
  const { serieStoricaCessati, isLoading, error } = useCessatiData(2023);
  const { serieStoricaTurnover: serieAssunti } = useAssuntiData(2023);

  if (isLoading) return <SectionLoading />;
  if (error) return <SectionError />;

  const anni = Array.from(new Set([
    ...serieStoricaCessati.map((r) => r.anno),
    ...serieAssunti.map((r) => r.anno),
  ])).sort((a, b) => a - b);
  const serieStoricaTurnover = anni.map((anno) => {
    const cessati = serieStoricaCessati.find((r) => r.anno === anno)?.cessati ?? 0;
    const assunti = serieAssunti.find((r) => r.anno === anno)?.assunti ?? 0;
    return { anno, assunti, cessati, saldo: assunti - cessati };
  });

  if (!serieStoricaTurnover.length) {
    return <SectionEmpty />;
  }

  const serieConSostituzione = serieStoricaTurnover.map((r) => ({
    ...r,
    tassoSostituzione: r.cessati > 0 ? parseFloat(((r.assunti / r.cessati) * 100).toFixed(1)) : 0,
  }));

  const ultimo = serieConSostituzione[serieConSostituzione.length - 1];
  const penultimo = serieConSostituzione[serieConSostituzione.length - 2] ?? ultimo;
  const delta = (ultimo.tassoSostituzione - penultimo.tassoSostituzione).toFixed(1);
  const media = (serieConSostituzione.reduce((s, r) => s + r.tassoSostituzione, 0) / serieConSostituzione.length).toFixed(1);
  const anniSopra100 = serieConSostituzione.filter((r) => r.tassoSostituzione >= 100).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-3">
        {[
          { label: "Tasso Sostituzione 2023", value: `${ultimo.tassoSostituzione}%`, icon: RefreshCw, color: "hsl(var(--chart-blue))", sub: `${parseFloat(delta) >= 0 ? "+" : ""}${delta} pp vs anno prec.` },
          { label: "Media periodo", value: `${media}%`, icon: BarChart3, color: "hsl(var(--chart-purple))" },
          { label: "Anni con ricambio positivo", value: `${anniSopra100} / ${serieConSostituzione.length}`, icon: Target, color: "hsl(var(--chart-teal))" },
          { label: "Variazione vs anno prec.", value: `${parseFloat(delta) >= 0 ? "+" : ""}${delta} pp`, icon: TrendingUp, color: parseFloat(delta) >= 0 ? "hsl(var(--chart-teal))" : "hsl(var(--chart-red))" },
        ].map((k, i) => (
          <div key={i} className="col-span-3 bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{k.label}</div>
              <k.icon className="h-4 w-4" style={{ color: k.color }} />
            </div>
            <div className="text-xl font-bold text-foreground mt-1">{k.value}</div>
            {k.sub && <div className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-7 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Tasso di Sostituzione (Assunti/Cessati × 100)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={serieConSostituzione}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="anno" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} unit="%" domain={[0, 'auto']} />
              <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [`${val}%`, undefined]} />
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={100} stroke="hsl(var(--chart-orange))" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: "Soglia 100%", position: "right", fontSize: 10, fill: "hsl(var(--chart-orange))" }} />
              <Bar dataKey="tassoSostituzione" name="Tasso Sostituzione %" barSize={28} radius={[4, 4, 0, 0]} fill="hsl(var(--chart-teal))" />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-muted-foreground mt-2">
            Valori ≥ 100% indicano un ricambio positivo (più assunti che cessati).
          </p>
        </div>

        <div className="col-span-5 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Assunti vs Cessati — Area</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={serieStoricaTurnover}>
              <defs>
                <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-teal))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--chart-teal))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-red))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--chart-red))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="anno" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="assunti" name="Assunti" stroke="hsl(var(--chart-teal))" strokeWidth={2} fill="url(#gradA)" dot={{ r: 3 }} />
              <Area type="monotone" dataKey="cessati" name="Cessati" stroke="hsl(var(--chart-red))" strokeWidth={2} fill="url(#gradC)" dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-xs font-semibold text-foreground mb-3">Dettaglio Tasso di Sostituzione</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Anno", "Assunti", "Cessati", "Saldo", "Tasso Sostituzione"].map((h, i) => (
                  <th key={i} className={`px-4 py-2.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {serieConSostituzione.map((r) => (
                <tr key={r.anno} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">{r.anno}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{r.assunti.toLocaleString("it-IT")}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{r.cessati.toLocaleString("it-IT")}</td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${r.saldo >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {r.saldo >= 0 ? "+" : ""}{r.saldo.toLocaleString("it-IT")}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${r.tassoSostituzione >= 100 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {r.tassoSostituzione}%
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
