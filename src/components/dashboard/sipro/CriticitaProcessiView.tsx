import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList, ResponsiveContainer,
} from "recharts";
import { SiproScopeBar, type SiproScope } from "./SiproScopeBar";
import { useSemplificazioneProcessi, useCriticitaDistribuzioneProcesso } from "@/hooks/useSchedaSiproProcessi";
import { fetchSemplificazioneProcessi } from "@/services/sipro/processiService";
import { TableExport } from "@/components/dashboard/_shared/TableExport";
import { LoadingSpinner, ErrorBox, Pager, BAR_COLOR, TOOLTIP_STYLE } from "./_shared";

const PER_PAGE = 20;

/** S17 Criticita Processi / S22 Semplificazione: tabella processi + barre frequenza macro-criticita. */
export const CriticitaProcessiView = ({ title = "Criticità e semplificazione dei processi" }: { title?: string }) => {
  const [scope, setScope] = useState<SiproScope>({ codiceFiscale: null, regione: null });
  const [page, setPage] = useState(0);

  const lista = useSemplificazioneProcessi(scope, PER_PAGE, page * PER_PAGE);
  const distrib = useCriticitaDistribuzioneProcesso(scope);

  const rows = lista.data ?? [];
  const totalRighe = rows[0]?.totale_righe ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRighe / PER_PAGE));
  const macro = (distrib.data ?? []).map((r) => ({ name: r.categoria, value: r.occorrenze }));

  const exportTables = async () => {
      const all = await fetchSemplificazioneProcessi(scope, 100000, 0);
      return [{
        title,
        headers: ["Processo", "N° fasi", "N° criticità", "Semplificato"],
        rows: all.map((r) => [r.processo, r.numero_fasi, r.numero_criticita, r.semplificazione || "—"]),
      }];
  };

  const resetAndSet = (v: SiproScope) => { setPage(0); setScope(v); };

  return (
    <div className="space-y-4">
      <SiproScopeBar value={scope} onChange={resetAndSet} />
      {lista.error ? <ErrorBox error={lista.error} /> : lista.isLoading ? <LoadingSpinner /> : (
        <div className="bg-card border rounded-xl p-5 space-y-2">
          <div className="mb-2 flex items-center justify-end">
            <TableExport fetchTables={exportTables} filename="sipro_criticita_processi" title={title} />
          </div>
          <h3 className="text-[15px] font-bold text-foreground">{title}</h3>
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 pt-2">
            <div>
              <div className="overflow-auto rounded-md border">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b bg-muted/40 text-muted-foreground">
                      <th className="text-left px-3 py-2 font-semibold">Processo</th>
                      <th className="text-right px-3 py-2 font-semibold whitespace-nowrap">N° fasi</th>
                      <th className="text-right px-3 py-2 font-semibold whitespace-nowrap">N° criticità</th>
                      <th className="text-left px-3 py-2 font-semibold">Semplificato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Nessun dato disponibile</td></tr>
                    ) : rows.map((r) => (
                      <tr key={r.processo_id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-3 py-2 text-foreground">{r.processo}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{r.numero_fasi}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{r.numero_criticita}</td>
                        <td className="px-3 py-2 text-foreground">{r.semplificazione || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pager page={page} totalPages={totalPages} onPage={setPage} total={totalRighe} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-3">Frequenza per Macro-criticità</p>
              {distrib.isLoading ? <LoadingSpinner /> : (
                <ResponsiveContainer width="100%" height={Math.max(220, macro.length * 46)}>
                  <BarChart data={macro} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={320} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="value" name="Occorrenze" radius={[0, 4, 4, 0]} maxBarSize={30}>
                      {macro.map((_, i) => <Cell key={i} fill={BAR_COLOR} />)}
                      <LabelList dataKey="value" position="insideRight" style={{ fontSize: 11, fontWeight: 700, fill: "white" }} />
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
