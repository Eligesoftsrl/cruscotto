import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList, ResponsiveContainer,
} from "recharts";
import { PIE_COLORS, BAR_COLOR, TOOLTIP_STYLE } from "@/components/dashboard/sipro/_shared";

export interface CategoryDatum {
  name: string;
  value: number;
}

const itNum = (n: number) => n.toLocaleString("it-IT", { maximumFractionDigits: 2 });

/**
 * Barre ORIZZONTALI ORDINATE (ranked bar) — sostituto delle torte/ciambelle.
 * Ordina dal valore più alto al più basso, mostra valore (+ % opzionale) a fine
 * barra e resta leggibile anche con molte categorie. Numeri sempre in evidenza.
 */
export function RankedBarChart({
  data,
  color = BAR_COLOR,
  showPercent = true,
  rowHeight = 30,
  minHeight = 200,
  labelWidth = 220,
  multicolor = false,
}: {
  data: CategoryDatum[];
  color?: string;
  showPercent?: boolean;
  rowHeight?: number;
  minHeight?: number;
  labelWidth?: number;
  multicolor?: boolean;
}) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((s, d) => s + d.value, 0);
  const height = Math.max(minHeight, sorted.length * rowHeight + 20);

  const renderLabel = (props: { x?: number; y?: number; width?: number; height?: number; value?: number }) => {
    const { x = 0, y = 0, width = 0, height: h = 0, value = 0 } = props;
    const pct = total ? Math.round((value / total) * 100) : 0;
    const text = showPercent ? `${itNum(value)} (${pct}%)` : itNum(value);
    return (
      <text
        x={x + width + 6}
        y={y + h / 2}
        dominantBaseline="central"
        style={{ fontSize: 11, fontWeight: 700, fill: "hsl(var(--foreground))" }}
      >
        {text}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 70, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
        <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11 }}
          stroke="hsl(var(--muted-foreground))"
          width={labelWidth}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v: number) => [
            showPercent ? `${itNum(v)} (${total ? Math.round((v / total) * 100) : 0}%)` : itNum(v),
            "",
          ]}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={26}>
          {sorted.map((_, i) => (
            <Cell key={i} fill={multicolor ? PIE_COLORS[i % PIE_COLORS.length] : color} />
          ))}
          <LabelList dataKey="value" content={renderLabel} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Barra 100% IMPILATA (composizione parte/tutto) — sostituto compatto di
 * torte/ciambelle quando conta la PROPORZIONE. Mostra i segmenti con % e una
 * legenda con valore assoluto + percentuale. Implementazione CSS (nessun
 * artefatto Recharts con dati vuoti).
 */
export function StackedCompositionBar({
  data,
  colors = PIE_COLORS,
}: {
  data: CategoryDatum[];
  colors?: string[];
}) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <div className="space-y-3">
      <div className="flex h-10 w-full overflow-hidden rounded-lg border">
        {sorted.map((d, i) => {
          const pct = (d.value / total) * 100;
          return (
            <div
              key={d.name}
              className="flex items-center justify-center text-[11px] font-bold text-white"
              style={{ width: `${pct}%`, background: colors[i % colors.length], minWidth: pct > 0 ? 2 : 0 }}
              title={`${d.name}: ${itNum(d.value)} (${pct.toFixed(1)}%)`}
            >
              {pct >= 8 ? `${Math.round(pct)}%` : ""}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {sorted.map((d, i) => {
          const pct = (d.value / total) * 100;
          return (
            <div key={d.name} className="flex items-center gap-2 text-xs">
              <span
                className="h-3 w-3 shrink-0 rounded-sm"
                style={{ background: colors[i % colors.length] }}
              />
              <span className="min-w-0 flex-1 truncate text-foreground">{d.name}</span>
              <span className="shrink-0 font-semibold tabular-nums text-foreground">
                {itNum(d.value)}
              </span>
              <span className="w-12 shrink-0 text-right tabular-nums text-muted-foreground">
                {pct.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
