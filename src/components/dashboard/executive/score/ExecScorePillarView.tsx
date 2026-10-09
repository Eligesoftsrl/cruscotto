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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileText, AlertCircle, Loader2, Power } from "lucide-react";
import { useAdminState } from "@/services/admin/adminStore";
import { logEvento } from "@/services/admin/logger";
import { EXEC_FLAG_BY_CODE, EXEC_LABEL_BY_CODE } from "@/config/execIndiciCatalog";
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
import { mockRows } from "./execScoreMock";

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

  /* Feature flag per indice (Pannello Admin → Schede → Indici Dx) */
  const { flags } = useAdminState();
  const isOn = useCallback(
    (c: string) => {
      const k = EXEC_FLAG_BY_CODE[`${pillar}.${c}`];
      return !k || (flags.find((f) => f.key === k)?.enabled ?? true);
    },
    [flags, pillar],
  );

  /* «Schede più consultate»: una consultazione per indice per visita della pagina
     (apertura di un pannello o click in panoramica). L'indice aperto da link
     diretto e gia tracciato da UsageTracker (parametro ?indicator). */
  const tracked = useRef(new Set<string>(selectedIndicator ? [selectedIndicator] : []));
  const trackIndice = useCallback(
    (c: string) => {
      if (tracked.current.has(c)) return;
      tracked.current.add(c);
      const label = EXEC_LABEL_BY_CODE[`${pillar}.${c}`];
      if (label) logEvento("navigazione", label, { scheda: label, indicator: c, pillar, origine: "vista-sintetica" });
    },
    [pillar],
  );

  const q = useExecScore(pillar, filtri);
  const trendQ = useExecScoreTrend(pillar, filtri);

  /* Righe indicizzate per codice senza prefisso (es. "IRS"); i mock-up non sovrascrivono i dati reali */
  const mockSet = useMemo(() => new Set(config?.mock ?? []), [config]);
  const rows = useMemo(() => {
    const m = new Map<string, ExecScoreRow>();
    mockRows(pillar, config?.mock ?? [], anno).forEach((r) => m.set(codiceIndice(r.id), r));
    (q.data ?? []).forEach((r) => m.set(codiceIndice(r.id), r));
    return m;
  }, [q.data, pillar, config, anno]);

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

  const sintetici = config.sintetici.filter(isOn);
  const ordered = [...sintetici, ...config.intermedi.filter(isOn)];
  const selectedOff = !!selectedIndicator && !isOn(selectedIndicator);
  const barData = ordered.map((c) => ({
    id: c,
    nome: rows.get(c)?.nome ?? c,
    score: Math.round(rows.get(c)?.score ?? 0),
    badge: rows.get(c)?.badge ?? null,
    mock: mockSet.has(c),
  }));
  const hasMock = barData.some((d) => d.mock);
  const gruppi = (config.gruppiIntermedi ?? [{ titolo: "Indici intermedi", codici: config.intermedi }])
    .map((g) => ({ ...g, codici: g.codici.filter(isOn) }))
    .filter((g) => g.codici.length > 0);

  const goTo = (code: string) => {
    setHighlight(code);
    trackIndice(code);
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
    isMock: mockSet.has(code),
    onInteract: trackIndice,
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

        {selectedOff && (
          <div className="tableau-card p-4 flex items-center gap-2 text-sm text-muted-foreground" data-testid="exec-score-indice-off">
            <Power className="h-4 w-4" />
            L'indice <b className="text-foreground">{selectedIndicator}</b> è stato disattivato dall'amministratore nel
            Pannello di gestione.
          </div>
        )}
        {q.isSuccess && ordered.length === 0 && (
          <div className="tableau-card p-6 text-sm text-muted-foreground" data-testid="exec-score-all-off">
            Tutti gli indici del pillar {pillar} sono disattivati dall'amministratore.
          </div>
        )}

        {q.isSuccess && ordered.length > 0 && (
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
                <div style={{ height: Math.max(180, barData.length * 36) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis
                        type="category"
                        dataKey="id"
                        tick={{ fontSize: 13, fill: "hsl(var(--foreground))", fontWeight: 700 }}
                        tickFormatter={(id: string) => (mockSet.has(id) ? `${id} *` : id)}
                        width={90}
                      />
                      <Tooltip
                        contentStyle={{ fontSize: 13, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                        formatter={(v: number, _n: string, item: { payload?: { badge: string | null } }) => [
                          `${fmtScore(v)}${item?.payload?.badge ? ` · ${item.payload.badge}` : ""}${mockSet.has((item?.payload as { id?: string })?.id ?? "") ? " · dati mock-up" : ""}`,
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
                            fillOpacity={(!highlight || highlight === d.id ? 1 : 0.25) * (d.mock ? 0.45 : 1)}
                            stroke={d.mock ? badgeColor(d.badge) : undefined}
                            strokeDasharray={d.mock ? "4 2" : undefined}
                            cursor="pointer"
                            onClick={() => goTo(d.id)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {hasMock && (
                  <p className="text-xs text-muted-foreground mt-2" data-testid="exec-score-mock-note">
                    * Dati mock-up: valori dimostrativi, fonte non ancora collegata.
                  </p>
                )}
              </div>
            </div>

            {/* Indici di sintesi: 2 card per riga */}
            {sintetici.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Indice di sintesi</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-0" data-testid="exec-score-grid-sintetici">
                  {sintetici.map((c) => (
                    <ExecScoreCard key={c} {...cardProps(c)} variant="sintetico" />
                  ))}
                </div>
              </section>
            )}

            {/* Indici intermedi: 3 card per riga (uno o piu gruppi) */}
            {gruppi.map((g, gi) => (
              <section key={g.titolo} className="space-y-3">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  {g.titolo}
                  {g.codici.every((c) => mockSet.has(c)) && (
                    <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-dashed border-amber-400 align-middle">
                      Dati mock-up
                    </span>
                  )}
                </h2>
                <div
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-0"
                  data-testid={gi === 0 ? "exec-score-grid-intermedi" : `exec-score-grid-intermedi-${gi}`}
                >
                  {g.codici.map((c) => (
                    <ExecScoreCard key={c} {...cardProps(c)} variant="intermedio" />
                  ))}
                </div>
              </section>
            ))}
          </>
        )}

        <BottomUpNav currentLevel="synthetic" pillar={pillar} onGoExecutive={onGoExecutive} />
      </div>
    </div>
  );
};
