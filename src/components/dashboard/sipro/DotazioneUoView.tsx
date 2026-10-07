import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { SiproScopeBar, type SiproScope } from "./SiproScopeBar";
import { useDotazioneUo, useDotazioneUoRiepilogo } from "@/hooks/useSchedaSiproOrganizzazione";
import { fetchDotazioneUo } from "@/services/sipro/organizzazioneService";
import { TableExport } from "@/components/dashboard/_shared/TableExport";
import { LoadingSpinner, ErrorBox, Pager, TOOLTIP_STYLE } from "./_shared";

const PER_PAGE = 20;
const COLOR_DOTAZIONE = "hsl(175, 55%, 42%)";
const COLOR_SERVIZIO = "hsl(35, 75%, 42%)";

// Formattatore null-safe: i valori NULL dal DB sono trattati come 0.
const fx = (n: number | null | undefined, d = 1) =>
  (typeof n === "number" && Number.isFinite(n) ? n : 0).toFixed(d);

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

  const exportTables = async () => {
      const all = await fetchDotazioneUo(scope, 100000, 0);
      return [{
        title: "Dotazione Risorse UO",
        headers: ["Unità Organizzativa", "FTE dotazione", "FTE servizio", "GAP"],
        rows: all.map((r) => [r.uo, r.dotazione ?? 0, r.servizio_ti ?? 0, r.gap_ti ?? 0]),
      }];
  };

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
          <div className="mb-2 flex items-center justify-end">
            <TableExport fetchTables={exportTables} filename="sipro_dotazione_uo" title="Dotazione Risorse UO" />
          </div>
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
                      <td className="px-2 py-1.5 text-right tabular-nums">{fx(r.dotazione)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{fx(r.servizio_ti)}</td>
                      <td className={`px-2 py-1.5 text-right tabular-nums font-semibold ${(r.gap_ti ?? 0) < 0 ? "text-destructive" : (r.gap_ti ?? 0) > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                        {fx(r.gap_ti, 2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {rie && (
                  <tfoot>
                    <tr className="border-t-2 border-foreground/30 font-bold text-foreground">
                      <td className="px-2 py-1.5 text-right">Totale ({rie.copertura_ti_pct?.toFixed(1) ?? "-"}% cop.):</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{fx(rie.dotazione, 2)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{fx(rie.servizio_ti, 2)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{fx(rie.gap_ti, 2)}</td>
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
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number, n: string) => [fx(v), n]} />
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
