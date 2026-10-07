import { RankedBarChart } from "@/components/dashboard/_shared/charts";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList,
  PieChart, Pie, Legend, ResponsiveContainer,
} from "recharts";
import { SiproScopeBar, type SiproScope } from "./SiproScopeBar";
import { useUoDistribuzione } from "@/hooks/useSchedaSiproOrganizzazione";
import { LoadingSpinner, ErrorBox, BAR_COLOR, PIE_COLORS, TOOLTIP_STYLE, pieValueLabel } from "./_shared";

/** 02 - Organigramma UO: barre per livello gerarchico + donut per responsabilita. */
export const OrganigrammaUoView = () => {
  const [scope, setScope] = useState<SiproScope>({ codiceFiscale: null, regione: null });
  const livello = useUoDistribuzione(scope, "livello");
  const resp = useUoDistribuzione(scope, "responsabilita");

  const byLevel = (livello.data ?? []).map((r) => ({ name: `${r.voce}° livello`, value: r.numero }));
  const byResp = (resp.data ?? []).map((r) => ({ name: r.voce, value: r.numero }));
  const totalResp = byResp.reduce((s, d) => s + d.value, 0);

  const loading = livello.isLoading || resp.isLoading;
  const error = livello.error || resp.error;

  return (
    <div className="space-y-4">
      <SiproScopeBar value={scope} onChange={setScope} />
      {error ? (
        <ErrorBox error={error} />
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-card border rounded-xl p-5 space-y-2">
          <h3 className="text-[15px] font-bold text-foreground">
            Distribuzione delle Unità Organizzative per Livello Gerarchico e Livello di Responsabilità
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-3">Per livello gerarchico</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byLevel} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="N° Unità Organizzative" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {byLevel.map((_, i) => <Cell key={i} fill={BAR_COLOR} />)}
                    <LabelList dataKey="value" position="top" style={{ fontSize: 12, fontWeight: 700, fill: "hsl(var(--foreground))" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-3">Per livello di responsabilità</p>
              <RankedBarChart data={byResp} multicolor />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
