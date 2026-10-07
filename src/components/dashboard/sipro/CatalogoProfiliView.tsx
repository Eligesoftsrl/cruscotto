import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList,
  PieChart, Pie, Legend, ResponsiveContainer,
} from "recharts";
import { SiproScopeBar, type SiproScope } from "./SiproScopeBar";
import { useCatalogoRiepilogo, useCatalogoDistribuzione, useCatalogoProfili } from "@/hooks/useSchedaSiproProfili";
import { fetchCatalogoProfili } from "@/services/sipro/profiliService";
import { useRegisterExport } from "@/lib/exportRegistry";
import { LoadingSpinner, ErrorBox, KpiBox, Pager, BAR_COLOR, PIE_COLORS, TOOLTIP_STYLE, pieValueLabel } from "./_shared";
import { StackedCompositionBar } from "@/components/dashboard/_shared/charts";

const PER_PAGE = 20;
const fmt = (n: number | null | undefined) =>
  (typeof n === "number" && Number.isFinite(n) ? n : 0).toLocaleString("it-IT", { maximumFractionDigits: 2 });

/** S08 - Catalogo Profili di Ruolo: KPI + donut origine + barre famiglia + tabella profili. */
export const CatalogoProfiliView = () => {
  const [scope, setScope] = useState<SiproScope>({ codiceFiscale: null, regione: null });
  const [page, setPage] = useState(0);

  const riepilogo = useCatalogoRiepilogo(scope);
  const origine = useCatalogoDistribuzione(scope, "origine");
  const famiglia = useCatalogoDistribuzione(scope, "famiglia");
  const tabella = useCatalogoProfili(scope, PER_PAGE, page * PER_PAGE);

  const r = riepilogo.data;
  const byOrigine = (origine.data ?? []).map((d) => ({ name: d.voce, value: d.numero_profili }));
  const totOrig = byOrigine.reduce((s, d) => s + d.value, 0);
  const byFamiglia = (famiglia.data ?? []).map((d) => ({ name: d.voce, value: d.numero_profili }));
  const rows = tabella.data ?? [];
  const totalRighe = rows[0]?.totale_righe ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRighe / PER_PAGE));

  const resetAndSet = (v: SiproScope) => { setPage(0); setScope(v); };

  useRegisterExport(
    async () => {
      const all = await fetchCatalogoProfili(scope, 100000, 0);
      return [{
        title: "Catalogo Profili di Ruolo",
        headers: ["Profilo", "Famiglia", "Ambito", "Area", "Origine", "FTE programmati", "FTE assegnati"],
        rows: all.map((row) => [
          row.profilo, row.famiglia ?? "—", row.ambito ?? "—", row.area_contrattuale ?? "—",
          row.origine ?? "—", row.fte_programmati ?? 0, row.fte_assegnati ?? 0,
        ]),
      }];
    },
    [scope.codiceFiscale, scope.regione],
  );

  return (
    <div className="space-y-4">
      <SiproScopeBar value={scope} onChange={resetAndSet} />
      {riepilogo.error ? <ErrorBox error={riepilogo.error} /> : riepilogo.isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiBox label="Profili totali" value={r?.profili_totali ?? 0} />
            <KpiBox label="Famiglie" value={r?.famiglie_totali ?? 0} />
            <KpiBox label="Ambiti" value={r?.ambiti_totali ?? 0} />
            <KpiBox label="Aree contrattuali" value={r?.aree_totali ?? 0} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border rounded-xl p-5">
              <p className="text-xs font-semibold text-muted-foreground text-center mb-3">Profili per origine</p>
              <StackedCompositionBar data={byOrigine} />
            </div>
            <div className="bg-card border rounded-xl p-5">
              <p className="text-xs font-semibold text-muted-foreground text-center mb-3">Profili per famiglia professionale</p>
              <ResponsiveContainer width="100%" height={Math.max(260, byFamiglia.length * 40)}>
                <BarChart data={byFamiglia} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" width={200} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="N° profili" radius={[0, 4, 4, 0]} maxBarSize={26}>
                    {byFamiglia.map((_, i) => <Cell key={i} fill={BAR_COLOR} />)}
                    <LabelList dataKey="value" position="insideRight" style={{ fontSize: 11, fontWeight: 700, fill: "white" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-5">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Catalogo profili di ruolo</p>
            {tabella.isLoading ? <LoadingSpinner /> : (
              <>
                <div className="overflow-auto rounded-md border">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b bg-muted/40 text-muted-foreground">
                        <th className="text-left px-3 py-2 font-semibold">Profilo</th>
                        <th className="text-left px-3 py-2 font-semibold">Famiglia</th>
                        <th className="text-left px-3 py-2 font-semibold">Ambito</th>
                        <th className="text-left px-3 py-2 font-semibold">Area</th>
                        <th className="text-left px-3 py-2 font-semibold">Origine</th>
                        <th className="text-right px-3 py-2 font-semibold whitespace-nowrap">FTE progr.</th>
                        <th className="text-right px-3 py-2 font-semibold whitespace-nowrap">FTE asseg.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.profilo_key} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="px-3 py-2 text-foreground">{row.profilo}</td>
                          <td className="px-3 py-2 text-foreground">{row.famiglia ?? "—"}</td>
                          <td className="px-3 py-2 text-foreground">{row.ambito ?? "—"}</td>
                          <td className="px-3 py-2 text-foreground">{row.area_contrattuale ?? "—"}</td>
                          <td className="px-3 py-2 text-foreground">{row.origine ?? "—"}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{fmt(row.fte_programmati)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{fmt(row.fte_assegnati)}</td>
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
