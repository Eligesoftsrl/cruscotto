import { useSiproInitialScope } from "@/hooks/useSiproAccesso";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";
import { ResponsiveContainer } from "@/components/dashboard/_shared/AccessibleChart";
import { SiproScopeBar, type SiproScope } from "./SiproScopeBar";
import { useFteRiepilogo, useFteCopertura } from "@/hooks/useSchedaSiproProfili";
import { LoadingSpinner, KpiBox, QueryState } from "./_shared";

const fmt = (n: number | null | undefined) =>
  (typeof n === "number" && Number.isFinite(n) ? n : 0).toLocaleString("it-IT", { maximumFractionDigits: 2 });

const CLASSE_COLORS: Record<string, string> = {
  "Ottimale": "hsl(152, 55%, 42%)",
  "Accettabile": "hsl(175, 55%, 41%)",
  "Attenzione": "hsl(38, 85%, 42%)",
  "Criticità grave": "hsl(0, 65%, 52%)",
};

interface TipPayload { payload?: { classe: string; percentuale: number; numero: number } }
const CoperturaTooltip = ({ active, payload }: { active?: boolean; payload?: TipPayload[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="rounded-md border bg-card px-3 py-2 text-[12px] shadow">
      <div className="font-semibold text-foreground mb-1">{d.classe}</div>
      <div className="text-muted-foreground">Percentuale di copertura: <span className="font-semibold text-foreground">{fmt(d.percentuale)}%</span></div>
      <div className="text-muted-foreground">Numero profili: <span className="font-semibold text-foreground">{d.numero}</span></div>
    </div>
  );
};

/** S06 - Copertura Profili di Ruolo: 3 KPI + barre percentuale di copertura per classe. */
export const CoperturaView = () => {
  // Utente di ente: ente e regione bloccati al perimetro (useSiproAccesso)
  const initialScope = useSiproInitialScope();
  const [scope, setScope] = useState<SiproScope>(initialScope);
  const riepilogo = useFteRiepilogo(scope);
  const copertura = useFteCopertura(scope);

  const r = riepilogo.data;
  const data = (copertura.data ?? []).map((c) => ({
    classe: c.classe, percentuale: c.percentuale ?? 0, numero: c.numero_profili,
  }));

  return (
    <div className="space-y-4">
      <SiproScopeBar value={scope} onChange={setScope} />
      <QueryState error={riepilogo.error} loading={riepilogo.isLoading}>{() => (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiBox label="Programmati" value={fmt(r?.fte_programmati)} />
            <KpiBox label="Assegnati" value={fmt(r?.fte_assegnati)} />
            <KpiBox label="Scostamento" value={fmt(r?.scostamento_fte)} />
          </div>
          <div className="bg-card border rounded-xl p-5">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Percentuale di copertura per classe</p>
            {copertura.isLoading ? <LoadingSpinner /> : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data} margin={{ top: 15, right: 20, left: -5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="classe" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit="%" />
                  <Tooltip content={<CoperturaTooltip />} />
                  <Bar dataKey="percentuale" radius={[4, 4, 0, 0]} maxBarSize={90}>
                    {data.map((d, i) => <Cell key={i} fill={CLASSE_COLORS[d.classe] ?? "hsl(210,20%,55%)"} />)}
                    <LabelList dataKey="percentuale" position="top" formatter={(v: number) => `${fmt(v)}%`} style={{ fontSize: 11, fontWeight: 700, fill: "hsl(var(--foreground))" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}</QueryState>
    </div>
  );
};
