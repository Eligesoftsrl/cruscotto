import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer,
} from "recharts";
import { SiproScopeBar, type SiproScope } from "./SiproScopeBar";
import { useProvvedimentiAndamento, useProvvedimenti } from "@/hooks/useSchedaSiproOrganizzazione";
import { LoadingSpinner, ErrorBox, KpiBox, Pager, BAR_COLOR, TOOLTIP_STYLE } from "./_shared";

const PER_PAGE = 20;

const fmtMese = (iso: string) => {
  if (!iso) return "N/D";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("it-IT", { month: "short", year: "2-digit" });
};

/** 04 - Provvedimenti Organizzativi: KPI + barre per mese + timeline paginata. */
export const ProvvedimentiView = () => {
  const [scope, setScope] = useState<SiproScope>({ codiceFiscale: null, regione: null });
  const [page, setPage] = useState(0);

  const andamento = useProvvedimentiAndamento(scope);
  const lista = useProvvedimenti(scope, PER_PAGE, page * PER_PAGE);

  const head = andamento.data?.[0];
  const byMese = (andamento.data ?? []).map((r) => ({ name: fmtMese(r.mese), value: r.numero }));
  const rows = lista.data ?? [];
  const totalRighe = rows[0]?.totale_righe ?? head?.provvedimenti_totali ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRighe / PER_PAGE));

  const resetAndSet = (v: SiproScope) => { setPage(0); setScope(v); };

  return (
    <div className="space-y-4">
      <SiproScopeBar value={scope} onChange={resetAndSet} />
      {andamento.error ? (
        <ErrorBox error={andamento.error} />
      ) : andamento.isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <KpiBox label="Provvedimenti totali" value={head?.provvedimenti_totali ?? 0} />
            <KpiBox label="Enti coinvolti" value={head?.enti_coinvolti ?? 0} />
          </div>
          <div className="space-y-6">
            <div className="bg-card border rounded-xl p-5">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Provvedimenti per mese di adozione</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byMese} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={0} angle={-35} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="Provvedimenti" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={40}>
                    <LabelList dataKey="value" position="top" style={{ fontSize: 11, fontWeight: 700, fill: "hsl(var(--foreground))" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border rounded-xl p-5">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Timeline provvedimenti</p>
              {lista.isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {rows.map((r) => (
                      <div key={r.provvedimento_id} className="flex items-start gap-3 bg-muted/30 rounded-lg px-3 py-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-foreground">{r.provvedimento}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {r.ente} · Adottato: {r.data_adozione ? new Date(r.data_adozione).toLocaleDateString("it-IT") : "N/D"}
                          </div>
                        </div>
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
