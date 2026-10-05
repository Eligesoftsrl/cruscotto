import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { SiproScopeBar, type SiproScope } from "./SiproScopeBar";
import { useOrganizzazioniStati, useOrganizzazioni } from "@/hooks/useSchedaSiproOrganizzazione";
import { LoadingSpinner, ErrorBox, KpiBox, Pager, PIE_COLORS, TOOLTIP_STYLE, pieValueLabel } from "./_shared";

const PER_PAGE = 20;

/** 03 - Stato Organizzazione: KPI + donut per stato + elenco enti paginato. */
export const StatoOrganizzazioneView = () => {
  const [scope, setScope] = useState<SiproScope>({ codiceFiscale: null, regione: null });
  const [page, setPage] = useState(0);

  const stati = useOrganizzazioniStati(scope);
  const lista = useOrganizzazioni(scope, PER_PAGE, page * PER_PAGE);

  const head = stati.data?.[0];
  const byStato = (stati.data ?? []).map((r) => ({ name: r.stato, value: r.numero }));
  const totale = head?.organizzazioni_totali ?? 0;
  const rows = lista.data ?? [];
  const totalRighe = rows[0]?.totale_righe ?? totale;
  const totalPages = Math.max(1, Math.ceil(totalRighe / PER_PAGE));

  const resetAndSet = (v: SiproScope) => { setPage(0); setScope(v); };

  return (
    <div className="space-y-4">
      <SiproScopeBar value={scope} onChange={resetAndSet} />
      {stati.error ? (
        <ErrorBox error={stati.error} />
      ) : stati.isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <KpiBox label="Organizzazioni totali" value={totale} />
            <KpiBox label="Formalizzate" value={head?.formalizzate ?? 0} />
            <KpiBox label="In inserimento" value={head?.in_inserimento ?? 0} />
          </div>
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
            <div className="bg-card border rounded-xl p-5">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Distribuzione per stato</p>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={byStato} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={95} paddingAngle={2} label={pieValueLabel} labelLine={false}>
                    {byStato.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v} (${totale ? ((v / totale) * 100).toFixed(0) : 0}%)`, ""]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border rounded-xl p-5">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Dettaglio enti</p>
              {lista.isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {rows.map((r) => (
                      <div key={r.organizzazione_id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-foreground truncate">{r.ente}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{r.organizzazione}</div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded whitespace-nowrap ${r.stato === "Formalizzata" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                          {r.stato}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Pager page={page} totalPages={totalPages} onPage={setPage} total={totalRighe} />
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
