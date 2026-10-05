import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList, Legend, ResponsiveContainer,
} from "recharts";
import { SiproScopeBar, type SiproScope } from "./SiproScopeBar";
import { useCoinvolgimentoUo } from "@/hooks/useSchedaSiproProcessi";
import { LoadingSpinner, ErrorBox, Pager, TOOLTIP_STYLE } from "./_shared";

const PER_PAGE = 20;
const COLOR_NO = "hsl(0, 60%, 55%)";   // non coinvolge altre amministrazioni
const COLOR_YES = "hsl(210, 64%, 45%)"; // coinvolge

const coinvolge = (v: string) => {
  const s = String(v ?? "").trim().toLowerCase();
  return s !== "" && s !== "0" && s !== "no" && s !== "n";
};

/** S21 - Outsourcing Fasi: coinvolgimento UO per processo (tabella + barre, colore per altre amministrazioni). */
export const OutsourcingFasiView = () => {
  const [scope, setScope] = useState<SiproScope>({ codiceFiscale: null, regione: null });
  const [page, setPage] = useState(0);

  const dett = useCoinvolgimentoUo(scope, PER_PAGE, page * PER_PAGE);
  const top = useCoinvolgimentoUo(scope, 15, 0);

  const rows = dett.data ?? [];
  const totalRighe = rows[0]?.totale_righe ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRighe / PER_PAGE));
  const chartData = (top.data ?? []).map((r) => ({
    name: r.processo.length > 28 ? r.processo.slice(0, 28) + "…" : r.processo,
    value: r.numero_uo,
    coinvolge: coinvolge(r.altre_amministrazioni),
  }));

  const resetAndSet = (v: SiproScope) => { setPage(0); setScope(v); };

  return (
    <div className="space-y-4">
      <SiproScopeBar value={scope} onChange={resetAndSet} />
      {dett.error ? <ErrorBox error={dett.error} /> : dett.isLoading ? <LoadingSpinner /> : (
        <div className="bg-card border rounded-xl p-5 space-y-2">
          <h3 className="text-[15px] font-bold text-foreground">Coinvolgimento delle Unità Organizzative per processo</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div>
              <div className="overflow-auto rounded-md border">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b bg-muted/40 text-muted-foreground">
                      <th className="text-left px-3 py-2 font-semibold">Processo</th>
                      <th className="text-right px-3 py-2 font-semibold whitespace-nowrap">N° UO</th>
                      <th className="text-left px-3 py-2 font-semibold whitespace-nowrap">Coinvolge altre amm.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.processo_id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-3 py-2 text-foreground">{r.processo}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{r.numero_uo}</td>
                        <td className="px-3 py-2 text-foreground">{coinvolge(r.altre_amministrazioni) ? "Sì" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pager page={page} totalPages={totalPages} onPage={setPage} total={totalRighe} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-3">Coinvolgimento UO (top 15) — blu: coinvolge altre amministrazioni</p>
              <ResponsiveContainer width="100%" height={Math.max(260, chartData.length * 26)}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" width={180} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="N° UO" radius={[0, 4, 4, 0]} maxBarSize={20}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.coinvolge ? COLOR_YES : COLOR_NO} />)}
                    <LabelList dataKey="value" position="insideRight" style={{ fontSize: 10, fontWeight: 700, fill: "white" }} />
                  </Bar>
                  <Legend payload={[{ value: "Coinvolge altre amm.", type: "square", color: COLOR_YES }, { value: "Non coinvolge", type: "square", color: COLOR_NO }]} wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
