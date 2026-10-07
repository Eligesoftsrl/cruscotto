import { RankedBarChart } from "@/components/dashboard/_shared/charts";
import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { SiproScopeBar, type SiproScope } from "./SiproScopeBar";
import { useCatalogoRiepilogo, useCatalogoDistribuzione } from "@/hooks/useSchedaSiproProfili";
import { LoadingSpinner, ErrorBox, KpiBox, PIE_COLORS, TOOLTIP_STYLE, pieValueLabel } from "./_shared";

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
              <RankedBarChart data={data} multicolor />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
