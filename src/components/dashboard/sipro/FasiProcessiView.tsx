import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { SiproScopeBar, type SiproScope } from "./SiproScopeBar";
import { useProcessi, useProcessiDistribuzione } from "@/hooks/useSchedaSiproProcessi";
import { LoadingSpinner, ErrorBox, Pager, PIE_COLORS, TOOLTIP_STYLE } from "./_shared";

const PER_PAGE = 20;

/** S16 - Fasi dei Processi: elenco processi censiti + semicerchio obiettivi strategici. */
export const FasiProcessiView = () => {
  const [scope, setScope] = useState<SiproScope>({ codiceFiscale: null, regione: null });
  const [page, setPage] = useState(0);

  const lista = useProcessi(scope, PER_PAGE, page * PER_PAGE);
  const obiettivo = useProcessiDistribuzione(scope, "obiettivo");

  const rows = lista.data ?? [];
  const totalRighe = rows[0]?.totale_righe ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRighe / PER_PAGE));
  const byObiettivo = (obiettivo.data ?? []).map((r) => ({ name: r.voce, value: r.numero }));
  const totObj = byObiettivo.reduce((s, d) => s + d.value, 0);

  const resetAndSet = (v: SiproScope) => { setPage(0); setScope(v); };

  return (
    <div className="space-y-4">
      <SiproScopeBar value={scope} onChange={resetAndSet} />
      {lista.error ? <ErrorBox error={lista.error} /> : lista.isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          <div className="bg-card border rounded-xl p-5">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Elenco processi censiti</p>
            <div className="overflow-auto rounded-md border">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground">
                    <th className="text-left px-3 py-2 font-semibold">Processo</th>
                    <th className="text-left px-3 py-2 font-semibold">Funzione</th>
                    <th className="text-left px-3 py-2 font-semibold">Tipologia</th>
                    <th className="text-left px-3 py-2 font-semibold">Obiettivo</th>
                    <th className="text-left px-3 py-2 font-semibold">Rilevanza</th>
                    <th className="text-left px-3 py-2 font-semibold">Semplificazione</th>
                    <th className="text-right px-3 py-2 font-semibold whitespace-nowrap">N° criticità</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.processo_id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-2 text-foreground">{r.processo}</td>
                      <td className="px-3 py-2 text-foreground">{r.funzione}</td>
                      <td className="px-3 py-2 text-foreground">{r.tipologia}</td>
                      <td className="px-3 py-2 text-foreground">{r.obiettivo}</td>
                      <td className="px-3 py-2 text-foreground">{r.rilevanza}</td>
                      <td className="px-3 py-2 text-foreground">{r.semplificazione}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.numero_criticita}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager page={page} totalPages={totalPages} onPage={setPage} total={totalRighe} />
          </div>
          <div className="bg-card border rounded-xl p-5">
            <p className="text-xs font-semibold text-muted-foreground text-center mb-3">Obiettivi strategici</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byObiettivo} dataKey="value" nameKey="name" cx="50%" cy="62%" innerRadius={55} outerRadius={105} startAngle={180} endAngle={0} paddingAngle={2} label={({ value }) => `${value}`} labelLine={false}>
                  {byObiettivo.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v} (${totObj ? ((v / totObj) * 100).toFixed(0) : 0}%)`, ""]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
