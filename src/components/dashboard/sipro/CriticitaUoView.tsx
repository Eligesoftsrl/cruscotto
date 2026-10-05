import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList, ResponsiveContainer,
} from "recharts";
import { SiproScopeBar, type SiproScope } from "./SiproScopeBar";
import { useCriticita, useCriticitaDistribuzione } from "@/hooks/useSchedaSiproOrganizzazione";
import { LoadingSpinner, ErrorBox, Pager, BAR_COLOR, TOOLTIP_STYLE } from "./_shared";

const PER_PAGE = 20;

/** 18 - Criticita UO: tabella criticita paginata + barre frequenza per macro-criticita. */
export const CriticitaUoView = () => {
  const [scope, setScope] = useState<SiproScope>({ codiceFiscale: null, regione: null });
  const [page, setPage] = useState(0);

  const dett = useCriticita(scope, PER_PAGE, page * PER_PAGE);
  const distrib = useCriticitaDistribuzione(scope);

  const rows = dett.data ?? [];
  const totalRighe = rows[0]?.totale_righe ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRighe / PER_PAGE));
  const macro = (distrib.data ?? []).map((r) => ({ name: r.categoria, value: r.occorrenze }));

  const resetAndSet = (v: SiproScope) => { setPage(0); setScope(v); };

  return (
    <div className="space-y-4">
      <SiproScopeBar value={scope} onChange={resetAndSet} />
      {dett.error ? (
        <ErrorBox error={dett.error} />
      ) : dett.isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-card border rounded-xl p-5 space-y-2">
          <h3 className="text-[15px] font-bold text-foreground">
            Elenco delle criticità segnalate e frequenza per Macro-criticità
          </h3>
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 pt-2">
            <div>
              <div className="overflow-auto rounded-md border">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Unità Organizzativa</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Criticità</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Macro Criticità</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr><td colSpan={3} className="text-center py-8 text-muted-foreground">Nessun dato disponibile</td></tr>
                    ) : (
                      rows.map((r, i) => (
                        <tr key={`${r.oggetto_id}-${r.criticita_id}-${i}`} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="px-3 py-2 text-foreground">{r.oggetto}</td>
                          <td className="px-3 py-2 text-foreground">{r.criticita}</td>
                          <td className="px-3 py-2 text-foreground">{r.categoria}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pager page={page} totalPages={totalPages} onPage={setPage} total={totalRighe} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-3">Frequenza per Macro Criticità</p>
              {distrib.isLoading ? (
                <LoadingSpinner />
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(220, macro.length * 46)}>
                  <BarChart data={macro} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={320} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="value" name="Occorrenze" radius={[0, 4, 4, 0]} maxBarSize={30}>
                      {macro.map((_, i) => <Cell key={i} fill={BAR_COLOR} />)}
                      <LabelList dataKey="value" position="insideRight" style={{ fontSize: 12, fontWeight: 700, fill: "white" }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
