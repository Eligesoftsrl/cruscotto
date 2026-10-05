import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList,
  PieChart, Pie, Legend, ResponsiveContainer,
} from "recharts";
import { SiproScopeBar, type SiproScope } from "./SiproScopeBar";
import { useProcessiDistribuzione } from "@/hooks/useSchedaSiproProcessi";
import { LoadingSpinner, ErrorBox, BAR_COLOR, PIE_COLORS, TOOLTIP_STYLE } from "./_shared";

/** S15 - Mappatura Processi: semicerchio per funzione + barre per tipologia. */
export const MappaturaProcessiView = () => {
  const [scope, setScope] = useState<SiproScope>({ codiceFiscale: null, regione: null });
  const funzione = useProcessiDistribuzione(scope, "funzione");
  const tipologia = useProcessiDistribuzione(scope, "tipologia");

  const byFunzione = (funzione.data ?? []).map((r) => ({ name: r.voce, value: r.numero }));
  const byTipologia = (tipologia.data ?? []).map((r) => ({ name: r.voce, value: r.numero }));
  const totFunz = byFunzione.reduce((s, d) => s + d.value, 0);

  const loading = funzione.isLoading || tipologia.isLoading;
  const error = funzione.error || tipologia.error;

  return (
    <div className="space-y-4">
      <SiproScopeBar value={scope} onChange={setScope} />
      {error ? <ErrorBox error={error} /> : loading ? <LoadingSpinner /> : (
        <div className="bg-card border rounded-xl p-5 space-y-2">
          <h3 className="text-[15px] font-bold text-foreground">Mappatura dei processi per funzione e tipologia</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-3">Processi per funzione</p>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={byFunzione} dataKey="value" nameKey="name" cx="50%" cy="62%" innerRadius={60} outerRadius={110} startAngle={180} endAngle={0} paddingAngle={2} label={({ value }) => `${value}`} labelLine={false}>
                    {byFunzione.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v} (${totFunz ? ((v / totFunz) * 100).toFixed(0) : 0}%)`, ""]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground text-center mb-3">Processi per tipologia</p>
              <ResponsiveContainer width="100%" height={Math.max(280, byTipologia.length * 40)}>
                <BarChart data={byTipologia} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" width={200} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="N° processi" radius={[0, 4, 4, 0]} maxBarSize={26}>
                    {byTipologia.map((_, i) => <Cell key={i} fill={BAR_COLOR} />)}
                    <LabelList dataKey="value" position="insideRight" style={{ fontSize: 11, fontWeight: 700, fill: "white" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
