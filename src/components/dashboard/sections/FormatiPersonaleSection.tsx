import { SectionError, SectionLoading } from "../SectionStates";
import { tooltipStyle } from "../chartTheme";
import { useFormazioneData } from "@/hooks/useFormazioneData";
import { GraduationCap, Clock, Users, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Line, Area,
} from "recharts";


// Dettaglio illustrativo per area/tipologia (non presente nelle tabelle dw_*)
const formazionePerArea = [
  { area: "Dirigenti I", formati: 38, totale: 45, perc: 84.4 },
  { area: "Dirigenti II", formati: 220, totale: 275, perc: 80.0 },
  { area: "Funzionari", formati: 2850, totale: 3800, perc: 75.0 },
  { area: "Assistenti", formati: 3500, totale: 5200, perc: 67.3 },
  { area: "Operatori", formati: 1920, totale: 3130, perc: 61.3 },
];

const formazioneTipologia = [
  { tipo: "Competenze digitali", ore: 12500 },
  { tipo: "Competenze manageriali", ore: 8200 },
  { tipo: "Aggiornamento normativo", ore: 9800 },
  { tipo: "Lingue straniere", ore: 4500 },
  { tipo: "Sicurezza sul lavoro", ore: 7500 },
];

export const FormatiPersonaleSection = () => {
  const { formazione, isLoading, error } = useFormazioneData(2023);

  if (isLoading) return <SectionLoading />;
  if (error) return <SectionError />;

  const { formatiPerc, formatiTotale, oreFormazione, oreProCapite, serieStorica, _personaleTotale } = formazione;
  const personale = _personaleTotale || 1;
  const formazioneVar = serieStorica.length >= 2
    ? (serieStorica[serieStorica.length - 1].formatiPerc - serieStorica[serieStorica.length - 2].formatiPerc).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-4">
      {/* KPI */}
      <div className="grid grid-cols-12 gap-3">
        {[
          { label: "Personale formato", value: `${formatiPerc}%`, icon: GraduationCap, color: "hsl(var(--chart-blue))", sub: `${formatiTotale.toLocaleString("it-IT")} su ${personale.toLocaleString("it-IT")}` },
          { label: "Ore di formazione", value: oreFormazione.toLocaleString("it-IT"), icon: Clock, color: "hsl(var(--chart-teal))" },
          { label: "Ore pro capite", value: oreProCapite.toFixed(1), icon: Users, color: "hsl(var(--chart-orange))" },
          { label: "Variazione vs anno prec.", value: `${parseFloat(formazioneVar) >= 0 ? "+" : ""}${formazioneVar} pp`, icon: TrendingUp, color: parseFloat(formazioneVar) >= 0 ? "hsl(var(--chart-teal))" : "hsl(var(--chart-red))" },
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

      {/* Charts */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-5 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">% Personale Formato per Area</h3>
          <div className="space-y-3 mt-4">
            {formazionePerArea.map((r) => (
              <div key={r.area}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-foreground font-medium">{r.area}</span>
                  <span className="text-muted-foreground">{r.perc}%</span>
                </div>
                <div className="h-5 bg-muted rounded-full overflow-hidden relative">
                  <div className="h-full rounded-full transition-all" style={{ width: `${r.perc}%`, background: "hsl(var(--chart-blue))" }} />
                  <div className="absolute top-0 h-full w-0.5" style={{ left: `${formatiPerc}%`, background: "hsl(var(--chart-orange))" }} />
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-2">
              <div className="w-3 h-0.5 rounded" style={{ background: "hsl(var(--chart-orange))" }} />
              Media ente ({formatiPerc}%)
            </div>
          </div>
        </div>

        <div className="col-span-7 bg-card border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Trend % Personale Formato</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={serieStorica}>
              <defs>
                <linearGradient id="gradFormazione" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-blue))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--chart-blue))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="anno" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} unit="%" domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [`${val}%`, undefined]} />
              <Area type="monotone" dataKey="formatiPerc" fill="url(#gradFormazione)" stroke="none" />
              <Line type="monotone" dataKey="formatiPerc" name="% Formati" stroke="hsl(var(--chart-blue))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--chart-blue))", stroke: "hsl(var(--card))", strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tipologia formazione (dettaglio illustrativo) */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-xs font-semibold text-foreground mb-3">Ore di Formazione per Tipologia</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={formazioneTipologia} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis type="category" dataKey="tipo" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={150} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="ore" name="Ore" fill="hsl(var(--chart-teal))" barSize={20} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
