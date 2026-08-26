import { useEffect, useState } from "react";
import { useFilteredEnteIds } from "@/hooks/useFilteredEnteIds";
import { fetchKpiRilevazione } from "@/services/dw/kpiRilevazioneService";
import { extractAllKpis, computeCompositeIndices, type KpiRow, type CompositeIndex } from "@/hooks/useKpiCalculations";

const DIM_META: Record<string, { label: string; color: string }> = {
  D1: { label: "D1 – Modello organizzativo", color: "hsl(210,80%,45%)" },
  D2: { label: "D2 – Programmazione fabbisogno", color: "hsl(30,85%,55%)" },
  D3: { label: "D3 – Recruiting", color: "hsl(150,60%,40%)" },
  D4: { label: "D4 – Sviluppo professionale", color: "hsl(340,70%,55%)" },
  D5: { label: "D5 – Rewarding e carriera", color: "hsl(260,50%,55%)" },
  D6: { label: "D6 – Capacity building", color: "hsl(180,60%,40%)" },
};

interface DimBlock {
  dim: string;
  label: string;
  color: string;
  kpis: KpiRow[];
  avgRate: number;
}

export const KpiAbilitantiSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [blocks, setBlocks] = useState<DimBlock[]>([]);
  const [indices, setIndices] = useState<CompositeIndex[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchKpiRilevazione(enteIds);
      if (!data) return;

      const byEnte: Record<number, any> = {};
      data.forEach((k: any) => { byEnte[k.id_ente] = k; });
      const latestRows = Object.values(byEnte);

      // Extract all KPIs and aggregate by code (media tra gli enti selezionati)
      // per evitare codici duplicati quando sono selezionati piu enti.
      const allKpisRaw = latestRows.flatMap(r => extractAllKpis(r));
      const byCode = new Map<string, { sum: number; count: number; sample: KpiRow }>();
      allKpisRaw.forEach((k) => {
        const cur = byCode.get(k.codice);
        if (cur) {
          cur.sum += k.valore;
          cur.count += 1;
        } else {
          byCode.set(k.codice, { sum: k.valore, count: 1, sample: k });
        }
      });
      const allKpis: KpiRow[] = Array.from(byCode.values()).map(({ sum, count, sample }) => ({
        ...sample,
        valore: Math.round(sum / count),
      }));

      // Group by dimension
      const byDim: Record<string, KpiRow[]> = {};
      allKpis.forEach(k => {
        if (!byDim[k.dimensione]) byDim[k.dimensione] = [];
        byDim[k.dimensione].push(k);
      });

      const result: DimBlock[] = Object.entries(byDim).map(([dim, kpis]) => {
        const meta = DIM_META[dim] ?? { label: dim, color: "hsl(210,15%,60%)" };
        const nonStruct = kpis.filter(k => k.categoria !== "strutturale");
        const avgRate = nonStruct.length ? Math.round(nonStruct.reduce((s, k) => s + k.valore, 0) / nonStruct.length) : 0;
        return { dim, label: meta.label, color: meta.color, kpis, avgRate };
      }).sort((a, b) => a.dim.localeCompare(b.dim));

      setBlocks(result);

      // Compute composite indices (average across entities)
      if (latestRows.length > 0) {
        const allIndices = latestRows.map(r => computeCompositeIndices(r));
        const avgIndices = allIndices[0].map((idx, i) => ({
          ...idx,
          valore: Math.round((allIndices.reduce((s, idxs) => s + idxs[i].valore, 0) / allIndices.length) * 10) / 10,
        }));
        setIndices(avgIndices);
      }
    };
    load();
  }, [enteIds]);

  const statoIcon = (k: KpiRow) => {
    if (k.tipo === "binario") return k.valore === 100 ? "🟢" : "🔴";
    if (k.valore >= 75) return "🟢";
    if (k.valore >= 40) return "🔵";
    if (k.valore > 0) return "🟡";
    return "🔴";
  };

  const catLabel = (c: string) => c === "abilitante" ? "ABL" : c === "successo" ? "SR" : "STR";

  return (
    <div className="p-4 space-y-4">
      {/* Composite Indices */}
      {indices.length > 0 && (
        <div className="tableau-card">
          <div className="tableau-card-header">Indici Compositi (scala 0-4)</div>
          <div className="p-4 grid grid-cols-4 gap-4">
            {indices.map(idx => (
              <div key={idx.codice} className="rounded-lg border border-border p-4 text-center">
                <div className="text-[11px] text-muted-foreground mb-1">{idx.nome}</div>
                <div className="text-3xl font-bold" style={{
                  color: idx.valore >= 3 ? "hsl(150,60%,40%)" : idx.valore >= 2 ? "hsl(30,85%,55%)" : "hsl(0,70%,55%)",
                }}>{idx.valore}</div>
                <div className="flex justify-center gap-1 mt-2">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="w-4 h-1.5 rounded-full" style={{
                      background: i < idx.valore ? (idx.valore >= 3 ? "hsl(150,60%,40%)" : idx.valore >= 2 ? "hsl(30,85%,55%)" : "hsl(0,70%,55%)") : "hsl(var(--muted))",
                    }} />
                  ))}
                </div>
                <div className="text-[9px] text-muted-foreground mt-2">
                  {idx.componenti.map(c => `${c.codice}: ${c.contributo}`).join(" · ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="tableau-card">
        <div className="tableau-card-header">KPI Abilitanti e di Successo – 41 KPI per Dimensione (Metodologia Ufficiale)</div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {blocks.map((block) => (
              <div key={block.dim} className="rounded-lg border border-border overflow-hidden">
                <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: block.color + "15", borderBottom: `2px solid ${block.color}` }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: block.color }} />
                    <span className="text-[12px] font-bold text-foreground">{block.label}</span>
                    <span className="text-[10px] text-muted-foreground">({block.kpis.length} KPI)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[11px] font-semibold" style={{ color: block.color }}>SR: {block.avgRate}%</div>
                    <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, block.avgRate)}%`, background: block.color }} />
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-border/50 max-h-[280px] overflow-y-auto">
                  {block.kpis.map((kpi) => (
                    <div key={kpi.codice} className="px-4 py-2 flex items-center gap-3 text-[11px] hover:bg-muted/20 transition-colors">
                      <span className="text-[10px]">{statoIcon(kpi)}</span>
                      <span className="font-mono text-muted-foreground w-10 flex-shrink-0">{kpi.codice}</span>
                      <span className="flex-1 truncate text-foreground">{kpi.nome}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground flex-shrink-0">{catLabel(kpi.categoria)}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="font-semibold" style={{
                          color: kpi.valore >= 75 ? "hsl(150,60%,40%)" : kpi.valore >= 40 ? "hsl(30,85%,55%)" : "hsl(0,70%,55%)",
                        }}>{kpi.valore}%</span>
                        <div className="w-10 h-1.5 rounded-full bg-muted overflow-hidden ml-1">
                          <div className="h-full rounded-full" style={{
                            width: `${Math.min(100, kpi.valore)}%`,
                            background: kpi.valore >= 75 ? "hsl(150,60%,40%)" : kpi.valore >= 40 ? "hsl(30,85%,55%)" : "hsl(0,70%,55%)",
                          }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
