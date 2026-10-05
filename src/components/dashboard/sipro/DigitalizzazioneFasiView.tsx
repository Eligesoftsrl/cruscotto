import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { SiproScopeBar, type SiproScope } from "./SiproScopeBar";
import { useDigitalizzazioneFasi, useFasiRiepilogo } from "@/hooks/useSchedaSiproProcessi";
import { LoadingSpinner, ErrorBox, Pager, PIE_COLORS, TOOLTIP_STYLE, pieValueLabel } from "./_shared";

const PER_PAGE = 20;

const Semicircle = ({ title, data }: { title: string; data: { name: string; value: number }[] }) => {
  const tot = data.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground text-center mb-2">{title}</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="72%" innerRadius={45} outerRadius={85} startAngle={180} endAngle={0} paddingAngle={2} label={pieValueLabel} labelLine={false}>
            {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v} (${tot ? ((v / tot) * 100).toFixed(0) : 0}%)`, ""]} />
          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 9 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

/** S19 Digitalizzazione Fasi / S20 Lavoro Agile: 3 semicerchi + tabella riepilogo per processo. */
export const DigitalizzazioneFasiView = ({ title = "Livello di digitalizzazione, esternalizzazione e lavoro agile delle fasi" }: { title?: string }) => {
  const [scope, setScope] = useState<SiproScope>({ codiceFiscale: null, regione: null });
  const [page, setPage] = useState(0);

  const digitale = useDigitalizzazioneFasi(scope, "digitale");
  const outsourcing = useDigitalizzazioneFasi(scope, "outsourcing");
  const agile = useDigitalizzazioneFasi(scope, "agile");
  const riepilogo = useFasiRiepilogo(scope, PER_PAGE, page * PER_PAGE);

  const loading = digitale.isLoading || outsourcing.isLoading || agile.isLoading;
  const error = digitale.error || outsourcing.error || agile.error;
  const toData = (d?: { stato: string; numero: number }[]) => (d ?? []).map((r) => ({ name: r.stato, value: r.numero }));

  const rows = riepilogo.data ?? [];
  const totalRighe = rows[0]?.totale_righe ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRighe / PER_PAGE));

  const resetAndSet = (v: SiproScope) => { setPage(0); setScope(v); };

  return (
    <div className="space-y-4">
      <SiproScopeBar value={scope} onChange={resetAndSet} />
      {error ? <ErrorBox error={error} /> : loading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          <div className="bg-card border rounded-xl p-5">
            <h3 className="text-[15px] font-bold text-foreground mb-2">{title}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Semicircle title="Livello di digitalizzazione" data={toData(digitale.data)} />
              <Semicircle title="Fasi con attività esternalizzabili" data={toData(outsourcing.data)} />
              <Semicircle title="Lavoro agile" data={toData(agile.data)} />
            </div>
          </div>
          <div className="bg-card border rounded-xl p-5">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Dettaglio per processo</p>
            {riepilogo.isLoading ? <LoadingSpinner /> : (
              <>
                <div className="overflow-auto rounded-md border">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b bg-muted/40 text-muted-foreground">
                        <th className="text-left px-3 py-2 font-semibold">Processo</th>
                        <th className="text-right px-3 py-2 font-semibold whitespace-nowrap">N° fasi</th>
                        <th className="text-right px-3 py-2 font-semibold whitespace-nowrap">Fasi esternalizzate</th>
                        <th className="text-right px-3 py-2 font-semibold whitespace-nowrap">Fasi in lavoro agile</th>
                        <th className="text-left px-3 py-2 font-semibold whitespace-nowrap">Livello prevalente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.processo_id} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="px-3 py-2 text-foreground">{r.processo}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{r.numero_fasi}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{r.fasi_esternalizzate}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{r.fasi_agile}</td>
                          <td className="px-3 py-2 text-foreground">{r.digitale_prevalente ?? "—"}</td>
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
