import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { SiproScopeBar, type SiproScope } from "./SiproScopeBar";
import { useCatalogoRiepilogo, useCatalogoDistribuzione } from "@/hooks/useSchedaSiproProfili";
import { LoadingSpinner, ErrorBox, KpiBox, PIE_COLORS, TOOLTIP_STYLE } from "./_shared";

/** S14 - Evoluzione Profili: KPI (totali/attivi/eliminati) + donut per origine. */
export const EvoluzioneProfiliView = () => {
  const [scope, setScope] = useState<SiproScope>({ codiceFiscale: null, regione: null });
  const riepilogo = useCatalogoRiepilogo(scope);
  const origine = useCatalogoDistribuzione(scope, "origine");

  const r = riepilogo.data;
  const data = (origine.data ?? []).map((d) => ({ name: d.voce, value: d.numero_profili }));
  const tot = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-4">
      <SiproScopeBar value={scope} onChange={setScope} />
      {riepilogo.error ? <ErrorBox error={riepilogo.error} /> : riepilogo.isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <KpiBox label="Profili totali" value={r?.profili_totali ?? 0} />
            <KpiBox label="Attivi" value={r?.attivi ?? "N/D"} />
            <KpiBox label="Eliminati" value={r?.eliminati ?? "N/D"} />
          </div>
          <div className="bg-card border rounded-xl p-5">
            <p className="text-xs font-semibold text-muted-foreground text-center mb-3">Distribuzione profili di ruolo per origine</p>
            {origine.isLoading ? <LoadingSpinner /> : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={65} outerRadius={115} paddingAngle={2} label={({ value }) => `${value}`} labelLine={false}>
                    {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v} (${tot ? ((v / tot) * 100).toFixed(0) : 0}%)`, ""]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
