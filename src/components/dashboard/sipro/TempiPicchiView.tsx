import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList,
  PieChart, Pie, Legend, ResponsiveContainer,
} from "recharts";
import { SiproScopeBar, type SiproScope } from "./SiproScopeBar";
import { useTempiPicchi, usePicchiDistribuzione } from "@/hooks/useSchedaSiproProcessi";
import { fetchTempiPicchi } from "@/services/sipro/processiService";
import { useRegisterExport } from "@/lib/exportRegistry";
import { LoadingSpinner, ErrorBox, Pager, BAR_COLOR, PIE_COLORS, TOOLTIP_STYLE, pieValueLabel } from "./_shared";

const PER_PAGE = 20;
const COLOR_PREVISTO = "hsl(210, 64%, 45%)";
const COLOR_EFFETTIVO = "hsl(35, 75%, 45%)";

const DistribBars = ({ title, data }: { title: string; data: { name: string; value: number }[] }) => (
  <div>
    <p className="text-xs font-semibold text-muted-foreground text-center mb-2">{title}</p>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="value" name="N° processi" radius={[4, 4, 0, 0]} maxBarSize={44}>
          {data.map((_, i) => <Cell key={i} fill={BAR_COLOR} />)}
          <LabelList dataKey="value" position="top" style={{ fontSize: 11, fontWeight: 700, fill: "hsl(var(--foreground))" }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

/** S23 - Tempi e Picchi: tempi previsti vs effettivi + distribuzioni frequenza/intensita/presidio. */
export const TempiPicchiView = () => {
  const [scope, setScope] = useState<SiproScope>({ codiceFiscale: null, regione: null });
  const [page, setPage] = useState(0);

  const tabella = useTempiPicchi(scope, PER_PAGE, page * PER_PAGE);
  const top = useTempiPicchi(scope, 15, 0);
  const frequenza = usePicchiDistribuzione(scope, "frequenza");
  const intensita = usePicchiDistribuzione(scope, "intensita");
  const presidio = usePicchiDistribuzione(scope, "presidio");

  const rows = tabella.data ?? [];
  const totalRighe = rows[0]?.totale_righe ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRighe / PER_PAGE));

  const tempiData = (top.data ?? []).map((r) => ({
    name: r.processo.length > 24 ? r.processo.slice(0, 24) + "…" : r.processo,
    previsto: r.previsto ?? 0, effettivo: r.effettivo ?? 0,
  }));
  const toVoce = (d?: { voce: string; numero: number }[]) => (d ?? []).map((r) => ({ name: r.voce, value: r.numero }));
  const presidioData = toVoce(presidio.data);
  const totPres = presidioData.reduce((s, d) => s + d.value, 0);

  const resetAndSet = (v: SiproScope) => { setPage(0); setScope(v); };

  useRegisterExport(
    async () => {
      const all = await fetchTempiPicchi(scope, 100000, 0);
      return [{
        title: "Tempi e Picchi",
        headers: ["Processo", "Tempo previsto", "Tempo effettivo"],
        rows: all.map((r) => [r.processo, r.previsto ?? "—", r.effettivo ?? "—"]),
      }];
    },
    [scope.codiceFiscale, scope.regione],
  );

  return (
    <div className="space-y-4">
      <SiproScopeBar value={scope} onChange={resetAndSet} />
      {tabella.error ? <ErrorBox error={tabella.error} /> : tabella.isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          <div className="bg-card border rounded-xl p-5">
            <h3 className="text-[15px] font-bold text-foreground mb-2">Tempi previsti ed effettivi dei processi (top 15, giorni)</h3>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={tempiData} margin={{ top: 5, right: 10, left: -5, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" interval={0} angle={-45} textAnchor="end" height={90} />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="previsto" name="Tempo previsto" fill={COLOR_PREVISTO} radius={[2, 2, 0, 0]} maxBarSize={16} />
                <Bar dataKey="effettivo" name="Tempo effettivo" fill={COLOR_EFFETTIVO} radius={[2, 2, 0, 0]} maxBarSize={16} />
                <Legend verticalAlign="bottom" iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border rounded-xl p-5">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Dettaglio tempi per processo</p>
            <div className="overflow-auto rounded-md border">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground">
                    <th className="text-left px-3 py-2 font-semibold">Processo</th>
                    <th className="text-right px-3 py-2 font-semibold whitespace-nowrap">Tempo previsto</th>
                    <th className="text-right px-3 py-2 font-semibold whitespace-nowrap">Tempo effettivo</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.processo_id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-2 text-foreground">{r.processo}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.previsto ?? "—"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.effettivo ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager page={page} totalPages={totalPages} onPage={setPage} total={totalRighe} />
          </div>

          <div className="bg-card border rounded-xl p-5">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Distribuzione dei picchi e presidio continuativo</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <DistribBars title="Per frequenza dei picchi" data={toVoce(frequenza.data)} />
              <DistribBars title="Per intensità dei picchi" data={toVoce(intensita.data)} />
              <div>
                <p className="text-xs font-semibold text-muted-foreground text-center mb-2">% processi con presidio continuativo</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={presidioData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={2} label={pieValueLabel} labelLine={false}>
                      {presidioData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v} (${totPres ? ((v / totPres) * 100).toFixed(0) : 0}%)`, ""]} />
                    <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
