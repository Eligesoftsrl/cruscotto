import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { SiproScopeBar, type SiproScope } from "./SiproScopeBar";
import { useDotazioneUo, useDotazioneUoRiepilogo } from "@/hooks/useSchedaSiproOrganizzazione";
import { LoadingSpinner, ErrorBox, Pager, TOOLTIP_STYLE } from "./_shared";

const PER_PAGE = 20;
const COLOR_DOTAZIONE = "hsl(175, 55%, 42%)";
const COLOR_SERVIZIO = "hsl(35, 75%, 42%)";

/** 07 - Dotazione Risorse UO: tabella UO + riga totale (riepilogo) + grafico dotazione vs servizio. */
export const DotazioneUoView = () => {
  const [scope, setScope] = useState<SiproScope>({ codiceFiscale: null, regione: null });
  const [page, setPage] = useState(0);

  const dett = useDotazioneUo(scope, PER_PAGE, page * PER_PAGE);
  const riepilogo = useDotazioneUoRiepilogo(scope);

  const rows = dett.data ?? [];
  const totalRighe = rows[0]?.totale_righe ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRighe / PER_PAGE));
  const rie = riepilogo.data;

  const chartData = rows.map((r) => ({ uo: r.uo, dotazione: r.dotazione, servizio: r.servizio_ti }));

  const resetAndSet = (v: SiproScope) => { setPage(0); setScope(v); };

  return (
    <div className="space-y-4">
      <SiproScopeBar value={scope} onChange={resetAndSet} />
      {dett.error ? (
        <ErrorBox error={dett.error} />
      ) : dett.isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-card border rounded-xl p-5 space-y-3">
          <h3 className="text-[15px] font-bold text-foreground">
            Dotazione Organica e personale in servizio per ogni Unità Organizzativa (valore FTE)
          </h3>
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
            <div className="overflow-auto">
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="bg-[hsl(210,64%,30%)] text-white">
                    <th className="text-left px-2 py-1.5 font-semibold">Unità Organizzativa</th>
                    <th className="text-right px-2 py-1.5 font-semibold whitespace-nowrap">FTE dotazione</th>
                    <th className="text-right px-2 py-1.5 font-semibold whitespace-nowrap">FTE servizio</th>
                    <th className="text-right px-2 py-1.5 font-semibold whitespace-nowrap">GAP</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.uo_id} className="border-b border-border hover:bg-muted/40 transition-colors">
                      <td className="px-2 py-1.5 text-foreground">{r.uo}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{r.dotazione.toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{r.servizio_ti.toFixed(1)}</td>
                      <td className={`px-2 py-1.5 text-right tabular-nums font-semibold ${r.gap_ti < 0 ? "text-destructive" : r.gap_ti > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                        {r.gap_ti.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {rie && (
                  <tfoot>
                    <tr className="border-t-2 border-foreground/30 font-bold text-foreground">
                      <td className="px-2 py-1.5 text-right">Totale ({rie.copertura_ti_pct?.toFixed(1) ?? "-"}% cop.):</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{rie.dotazione.toFixed(2)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{rie.servizio_ti.toFixed(2)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{rie.gap_ti.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
              <Pager page={page} totalPages={totalPages} onPage={setPage} total={totalRighe} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-2">Dotazione Organica e personale in servizio</p>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -5, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="uo" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" interval={0} angle={-45} textAnchor="end" height={90} />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number, n: string) => [v.toFixed(1), n]} />
                  <Bar dataKey="dotazione" name="FTE in dotazione" fill={COLOR_DOTAZIONE} radius={[2, 2, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="servizio" name="FTE in servizio" fill={COLOR_SERVIZIO} radius={[2, 2, 0, 0]} maxBarSize={18} />
                  <Legend verticalAlign="bottom" iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
