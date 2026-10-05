import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { SiproScopeBar, type SiproScope } from "./SiproScopeBar";
import { useFteRiepilogo, useFteProfili, useFte } from "@/hooks/useSchedaSiproProfili";
import { LoadingSpinner, ErrorBox, KpiBox, Pager, TOOLTIP_STYLE } from "./_shared";

const PER_PAGE = 20;
const COLOR_PROGR = "hsl(210, 64%, 45%)";
const COLOR_ASSEG = "hsl(175, 55%, 42%)";
const fmt = (n: number | null | undefined) =>
  typeof n === "number" ? n.toLocaleString("it-IT", { maximumFractionDigits: 2 }) : "—";

/** S05 - FTE Programmati vs Assegnati: KPI + barre per profilo + tabella per ente/profilo. */
export const FteView = () => {
  const [scope, setScope] = useState<SiproScope>({ codiceFiscale: null, regione: null });
  const [page, setPage] = useState(0);

  const riepilogo = useFteRiepilogo(scope);
  const profili = useFteProfili(scope); // tutti (p_limit NULL)
  const tabella = useFte(scope, PER_PAGE, page * PER_PAGE);

  const r = riepilogo.data;
  const chartData = (profili.data ?? []).map((p) => ({
    name: p.profilo.length > 42 ? p.profilo.slice(0, 42) + "…" : p.profilo,
    programmati: p.fte_programmati, assegnati: p.fte_assegnati,
  }));
  const rows = tabella.data ?? [];
  const totalRighe = rows[0]?.totale_righe ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRighe / PER_PAGE));

  const resetAndSet = (v: SiproScope) => { setPage(0); setScope(v); };

  return (
    <div className="space-y-4">
      <SiproScopeBar value={scope} onChange={resetAndSet} />
      {riepilogo.error ? <ErrorBox error={riepilogo.error} /> : riepilogo.isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <KpiBox label="FTE programmati" value={fmt(r?.fte_programmati)} />
            <KpiBox label="FTE assegnati" value={fmt(r?.fte_assegnati)} />
            <KpiBox label="Scostamento FTE" value={fmt(r?.scostamento_fte)} />
          </div>
          <div className="bg-card border rounded-xl p-5">
            <p className="text-xs font-semibold text-muted-foreground mb-3">FTE programmati e assegnati per profilo</p>
            <div className="max-h-[560px] overflow-y-auto">
              <ResponsiveContainer width="100%" height={Math.max(340, chartData.length * 34)}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" width={300} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number, n: string) => [fmt(v), n]} />
                  <Legend verticalAlign="top" iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="programmati" name="FTE programmati" fill={COLOR_PROGR} radius={[0, 3, 3, 0]} maxBarSize={12} />
                  <Bar dataKey="assegnati" name="FTE assegnati" fill={COLOR_ASSEG} radius={[0, 3, 3, 0]} maxBarSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-5">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Dettaglio FTE per ente e profilo</p>
            {tabella.isLoading ? <LoadingSpinner /> : (
              <>
                <div className="overflow-auto rounded-md border">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b bg-muted/40 text-muted-foreground">
                        <th className="text-left px-3 py-2 font-semibold">Ente</th>
                        <th className="text-left px-3 py-2 font-semibold">Profilo</th>
                        <th className="text-right px-3 py-2 font-semibold whitespace-nowrap">FTE progr.</th>
                        <th className="text-right px-3 py-2 font-semibold whitespace-nowrap">FTE asseg.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.profilo_fase_id} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="px-3 py-2 text-foreground">{row.ente}</td>
                          <td className="px-3 py-2 text-foreground">{row.profilo}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{fmt(row.fte_programmati)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{fmt(row.fte_assegnati)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pager page={page} totalPages={totalPages} onPage={setPage} total={totalRighe} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
