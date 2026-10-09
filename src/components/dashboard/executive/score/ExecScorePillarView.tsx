/**
 * Vista Sintetica di un pillar alimentata da fa_ca_exec_<dx>_indicatori_score.
 *
 * Layout (mappatura Excel D2):
 *  - Intestazione pillar (Quadro Sinottico disattivato)
 *  - Barra filtri: Anno · Regione · Comparto (+ perimetro ente Keycloak)
 *  - Panoramica indicatori: barre orizzontali dello score [0-100]
 *  - Indici di sintesi: 2 card per riga
 *  - Indici intermedi: 3 card per riga
 * Score in scala [0-100], senza simbolo "%".
 */
import { useEffect, useMemo, useState } from "react";
import { FileText, AlertCircle, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useExecScore, useExecScoreFiltri, useExecScoreTrend } from "@/hooks/useExecScore";
import { codiceIndice, type ExecScoreRow } from "@/services/exec/execScoreService";
import { FilterPills } from "../../FilterPills";
import { BottomUpNav } from "../../BottomUpNav";
import { ExecScoreCard } from "./ExecScoreCard";
import { EXEC_SCORE_PILLARS, badgeColor, fmtScore, resolveExecCode } from "./execScoreConfig";

interface Props {
  pillar: string;
  selectedIndicator?: string;
  onGoExecutive?: () => void;
}

export const ExecScorePillarView = ({ pillar, selectedIndicator: selectedRaw, onGoExecutive }: Props) => {
  const selectedIndicator = resolveExecCode(pillar, selectedRaw);
  const config = EXEC_SCORE_PILLARS[pillar];
  const { filtri, enteScope, ente } = useExecScoreFiltri();
  const [highlight, setHighlight] = useState<string | null>(selectedIndicator ?? null);
  const anno = filtri.anno;

  const q = useExecScore(pillar, filtri);
  const trendQ = useExecScoreTrend(pillar, filtri);

  /* Righe indicizzate per codice senza prefisso (es. "IRS") */
  const rows = useMemo(() => {
    const m = new Map<string, ExecScoreRow>();
    (q.data ?? []).forEach((r) => m.set(codiceIndice(r.id), r));
    return m;
  }, [q.data]);

  const trendByCode = useMemo(() => {
    const m = new Map<string, { anno: number; score: number | null; valore: number | null; unita: string | null }[]>();
    trendQ.rows.forEach((r) => {
      const c = codiceIndice(r.id);
      const arr = m.get(c) ?? [];
      arr.push({ anno: r.anno, score: r.score, valore: r.valore, unita: r.unita });
      m.set(c, arr);
    });
    m.forEach((arr) => arr.sort((a, b) => a.anno - b.anno));
    return m;
  }, [trendQ.rows]);

  /* Deep-link (sidebar / Executive): evidenzia e scorre alla card */
  useEffect(() => {
    if (!selectedIndicator) return;
    setHighlight(selectedIndicator);
    const t = setTimeout(() => {
      document.getElementById(`synth-card-${selectedIndicator}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
    return () => clearTimeout(t);
  }, [selectedIndicator, q.isSuccess]);

  if (!config) return null;

  const ordered = [...config.sintetici, ...config.intermedi];
  const barData = ordered.map((c) => ({
    id: c,
    nome: rows.get(c)?.nome ?? c,
    score: Math.round(rows.get(c)?.score ?? 0),
    badge: rows.get(c)?.badge ?? null,
  }));

  const goTo = (code: string) => {
    setHighlight(code);
    document.getElementById(`synth-card-${code}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cardProps = (code: string) => ({
    code,
    row: rows.get(code),
    rows,
    trend: trendByCode.get(code) ?? [],
    config,
    anno,
    highlighted: highlight === code,
  });

  const perimetro = ente?.descrizione ?? enteScope.label ?? "Totale PA";

  return (
    <div className="flex-1 flex flex-col" data-testid={`exec-score-view-${pillar}`}>
      <FilterPills variant="executive" />
      <div className="p-6 space-y-6 flex-1">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-[18px] font-bold"
            style={{ background: `${config.color}15`, color: config.color }}
          >
            {pillar}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-foreground">{config.label}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{config.description}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Amministrazione: <span className="text-primary font-semibold">{perimetro}</span> · Anno {anno || "—"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {enteScope.control}
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Quadro Sinottico non disponibile"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold bg-muted text-muted-foreground/50 cursor-not-allowed opacity-60"
            >
              <FileText className="h-4 w-4" />
              Quadro Sinottico
            </button>
          </div>
        </div>

        {q.isLoading && (
          <div className="tableau-card p-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Caricamento indicatori…
          </div>
        )}
        {q.isError && (
          <div className="tableau-card p-6 flex items-center gap-2 text-sm text-destructive" data-testid="exec-score-error">
            <AlertCircle className="h-4 w-4" />
            Impossibile caricare gli indicatori {pillar}: {(q.error as Error)?.message ?? "errore sconosciuto"}
          </div>
        )}

        {q.isSuccess && (
          <>
            {/* Panoramica */}
            <div className="tableau-card" data-testid="exec-score-panoramica">
              <div className="tableau-card-header flex items-center justify-between">
                <span>Panoramica indicatori · {pillar} · Score [0-100]</span>
                {highlight && (
                  <button onClick={() => setHighlight(null)} className="text-xs font-semibold text-primary hover:underline">
                    Rimuovi evidenziazione
                  </button>
                )}
              </div>
              <div className="tableau-card-body">
                <div style={{ height: Math.max(180, barData.length * 40) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis
                        type="category"
                        dataKey="id"
                        tick={{ fontSize: 13, fill: "hsl(var(--foreground))", fontWeight: 700 }}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{ fontSize: 13, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                        formatter={(v: number, _n: string, item: { payload?: { badge: string | null } }) => [
                          `${fmtScore(v)}${item?.payload?.badge ? ` · ${item.payload.badge}` : ""}`,
                          "Score",
                        ]}
                        labelFormatter={(label: string) => barData.find((d) => d.id === label)?.nome || label}
                      />
                      <Bar
                        dataKey="score"
                        radius={[0, 3, 3, 0]}
                        barSize={18}
                        label={{ position: "right", fontSize: 12, fill: "hsl(var(--foreground))" }}
                      >
                        {barData.map((d) => (
                          <Cell
                            key={d.id}
                            fill={badgeColor(d.badge)}
                            fillOpacity={!highlight || highlight === d.id ? 1 : 0.25}
                            cursor="pointer"
                            onClick={() => goTo(d.id)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Indici di sintesi: 2 card per riga */}
            {config.sintetici.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Indice di sintesi</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-0" data-testid="exec-score-grid-sintetici">
                  {config.sintetici.map((c) => (
                    <ExecScoreCard key={c} {...cardProps(c)} variant="sintetico" />
                  ))}
                </div>
              </section>
            )}

            {/* Indici intermedi: 3 card per riga */}
            {config.intermedi.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Indici intermedi</h2>
                <div
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-0"
                  data-testid="exec-score-grid-intermedi"
                >
                  {config.intermedi.map((c) => (
                    <ExecScoreCard key={c} {...cardProps(c)} variant="intermedio" />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <BottomUpNav currentLevel="synthetic" pillar={pillar} onGoExecutive={onGoExecutive} />
      </div>
    </div>
  );
};
