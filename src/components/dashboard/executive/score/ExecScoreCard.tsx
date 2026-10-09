/**
 * Card indice della Vista Sintetica alimentata da fa_ca_exec_<dx>_indicatori_score.
 *
 * Contenuto (mappatura Excel "Scheda dettaglio"):
 *  codice + badge pillar · nome · fonte (statica) · score [0-100] + gauge ·
 *  variazione vs anno precedente · badge di giudizio · riquadro formula ·
 *  pannello espandibile "Scomposizione formula" (Parte 1 calcolo indice,
 *  Parte 2 normalizzazione dello score) · barre componenti (solo compositi) ·
 *  scheda metodologica · interconnessioni · trend storico.
 * Nessun simbolo "%": lo score e un punteggio [0-100].
 * Layout: la card usa CSS subgrid (8 righe: header, badge, formula, componenti,
 * scomposizione, metodologia, trend, interconnessioni) per allineare le sezioni
 * tra card della stessa riga della griglia.
 */
import React, { useState } from "react";
import {
  ChevronDown,
  Info,
  Link2,
  Calculator,
  TrendingUp,
  TrendingDown,
  Minus,
  LineChart as LineChartIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PILLAR_COLORS, PILLAR_LABELS, interconnessioni } from "../executiveInterconnessioni";
import type { ExecScoreRow } from "@/services/exec/execScoreService";
import {
  badgeColor,
  fmtIndex,
  fmtNum,
  fmtScore,
  type ExecScorePillarConfig,
} from "./execScoreConfig";

/* ── Gauge semicircolare su scala [0-100] ── */
const ScoreGauge = ({ score, color, size = 72 }: { score: number; color: string; size?: number }) => {
  const r = size * 0.38;
  const circumference = Math.PI * r;
  const dashLen = (Math.max(0, Math.min(100, score)) / 100) * circumference;
  const d = `M ${size * 0.1} ${size * 0.55} A ${r} ${r} 0 1 1 ${size * 0.9} ${size * 0.55}`;
  return (
    <svg width={size} height={size * 0.62} viewBox={`0 0 ${size} ${size * 0.62}`} aria-hidden="true">
      <path d={d} fill="none" stroke="hsl(var(--muted))" strokeWidth={size * 0.08} strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={size * 0.08}
        strokeLinecap="round"
        strokeDasharray={`${dashLen} ${circumference}`}
      />
    </svg>
  );
};

/* ── Riga chiave/valore della scomposizione ── */
const StepRow = ({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) => (
  <div className="flex items-start justify-between gap-3 py-1">
    <span className={`text-xs leading-snug ${strong ? "font-semibold text-primary" : "text-muted-foreground"}`}>
      {label}
    </span>
    <span
      className={`text-xs text-right shrink-0 max-w-[55%] break-words ${strong ? "font-bold text-primary" : "font-semibold text-foreground"}`}
    >
      {value}
    </span>
  </div>
);

/* ── Pannello collassabile uniforme ── */
const Section = ({
  icon: Icon,
  title,
  children,
  testId,
  defaultOpen = false,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  testId: string;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mx-4 mb-2">
      <CollapsibleTrigger
        data-testid={testId}
        className="flex items-center gap-1.5 w-full px-3 py-2 rounded border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
      >
        <Icon className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-semibold text-primary flex-1">{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">{children}</CollapsibleContent>
    </Collapsible>
  );
};

/* ── Scheda metodologica (Definizione · Calcolo · Lettura) ── */
const MetodologiaTabs = ({ row }: { row: ExecScoreRow }) => {
  const tabs = [
    { k: "Definizione", v: row.descrizione },
    { k: "Calcolo", v: [row.formula, row.dominio ? `Dominio: ${row.dominio}` : null].filter(Boolean).join("\n") },
    { k: "Lettura", v: row.interpretazione },
  ].filter((t) => t.v && String(t.v).trim().length > 0);
  const [tab, setTab] = useState(tabs[0]?.k ?? "Definizione");
  const content = tabs.find((t) => t.k === tab)?.v ?? "";
  if (!tabs.length) return <p className="text-xs text-muted-foreground px-3">Nessuna scheda disponibile.</p>;
  return (
    <div className="px-3 py-2.5 rounded border border-border/30 bg-muted/20 space-y-2">
      <div className="flex gap-1.5 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.k}
            type="button"
            onClick={() => setTab(t.k)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              tab === t.k ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            {t.k}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
};

export interface ExecScoreCardProps {
  code: string; // codice indice senza prefisso (es. "IGF")
  row: ExecScoreRow | undefined;
  rows: Map<string, ExecScoreRow>; // tutte le righe del pillar (per i compositi)
  trend: { anno: number; score: number | null; valore: number | null; unita: string | null }[];
  config: ExecScorePillarConfig;
  anno: number;
  highlighted?: boolean;
  variant?: "sintetico" | "intermedio";
  /** Dati mock-up (fonte non collegata): disclaimer a vista, niente trend storico. */
  isMock?: boolean;
}

export const ExecScoreCard = ({
  code,
  row,
  rows,
  trend,
  config,
  anno,
  highlighted = false,
  variant = "intermedio",
  isMock = false,
}: ExecScoreCardProps) => {
  const pillar = config.pillar;
  const pillarColor = config.color;
  const score = row?.score ?? 0;
  const hasScore = row?.score != null;
  const varScore = row?.var_score ?? null;
  const bColor = badgeColor(row?.badge);
  const componenti = config.componenti[code] ?? [];
  const isComposito = componenti.length > 0;

  /* ── Parte 1 · calcolo dell'indice ── */
  const parte1: { label: string; value: string }[] = [];
  if (row?.componente_1)
    parte1.push({
      label: `${row.componente_1}${row.anno_1 ? ` (${row.anno_1})` : ""}`,
      value: fmtNum(row.valore_1),
    });
  if (row?.componente_2)
    parte1.push({
      label: `${row.componente_2}${row.anno_2 ? ` (${row.anno_2})` : ""}`,
      value: fmtNum(row.valore_2),
    });
  (row?.dettagli ?? []).forEach((d) =>
    parte1.push({ label: `${d.componente}${d.anno ? ` (${d.anno})` : ""}`, value: fmtNum(d.valore) }),
  );

  /* ── Parte 2 · normalizzazione dello score ── */
  const parte2: { label: string; value: string }[] = [];
  const famiglia = row?.famiglia_score ?? "";
  if (row?.descrizione_score || famiglia)
    parte2.push({ label: "Famiglia di scala", value: row?.descrizione_score || famiglia });
  if (/target/i.test(famiglia) || row?.soglia_score != null) {
    const v1 = row?.valore_1 ?? null;
    const v2 = row?.valore_2 ?? null;
    if (v1 != null && v2) parte2.push({ label: "Valore grezzo (componente 1 / componente 2)", value: fmtNum(v1 / v2, 3) });
    if (row?.soglia_score != null)
      parte2.push({
        label: "Target",
        value: `${fmtNum(row.soglia_score)}${row.unita_soglia ? ` ${row.unita_soglia}` : ""}`,
      });
  } else if (!isComposito && /diretto/i.test(famiglia)) {
    parte2.push({ label: "Normalizzazione", value: `Non necessaria: score = ${code} × 100` });
  }
  if (isComposito) {
    componenti.forEach((c) => parte2.push({ label: `Score ${c}`, value: fmtScore(rows.get(c)?.score) }));
    (config.extraScoreSteps?.[code]?.(rows, fmtNum) ?? []).forEach((s) => parte2.push(s));
  }
  if (row?.formula_score) parte2.push({ label: "Calcolo score", value: row.formula_score });

  /* ── Interconnessioni: dall'API (escluso il pillar corrente), motivazioni dalla mappa statica ── */
  const staticIc = interconnessioni[code];
  const icPillars = (row?.interconnessioni ?? []).filter((p) => p !== pillar);

  const DeltaIcon = varScore == null || varScore === 0 ? Minus : varScore > 0 ? TrendingUp : TrendingDown;
  const deltaColor =
    varScore == null || varScore === 0
      ? "hsl(var(--muted-foreground))"
      : varScore > 0
        ? "hsl(var(--chart-green))"
        : "hsl(var(--destructive))";

  return (
    <div
      id={`synth-card-${code}`}
      data-testid={`exec-score-card-${code}`}
      className={`tableau-card border-t-2 grid grid-rows-subgrid row-span-8 gap-0 mb-4 transition-shadow scroll-mt-24 ${
        highlighted ? "ring-2 ring-primary shadow-md" : ""
      }`}
      style={{ borderTopColor: bColor }}
    >
      {/* Header: codice, badge pillar, nome, fonte · score + gauge */}
      <div className="p-4 pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`${variant === "sintetico" ? "text-xl" : "text-lg"} font-bold text-foreground`}>
                {code}
              </span>
              <span
                className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                style={{ background: `${pillarColor}20`, color: pillarColor }}
              >
                {pillar}
              </span>
              {variant === "sintetico" && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                  Indice di sintesi
                </span>
              )}
              {isMock && (
                <span
                  data-testid={`exec-score-mock-${code}`}
                  title="Dati dimostrativi: la fonte non è ancora collegata"
                  className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-dashed border-amber-400"
                >
                  Dati mock-up
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-foreground leading-tight">{row?.nome ?? code}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {isMock
                ? "Dati dimostrativi · fonte non ancora collegata"
                : (config.fonte[code] ?? "Fonte: Conto Annuale")}
            </p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span
                  className={`${variant === "sintetico" ? "text-4xl" : "text-3xl"} font-bold text-foreground tabular-nums`}
                  data-testid={`exec-score-value-${code}`}
                >
                  {fmtScore(score)}
                </span>
                <div className="text-[11px] text-muted-foreground">Score [0-100]</div>
              </div>
              <ScoreGauge score={score} color={bColor} size={variant === "sintetico" ? 80 : 64} />
            </div>
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold mt-1"
              style={{ color: deltaColor }}
              data-testid={`exec-score-var-${code}`}
            >
              <DeltaIcon className="h-3.5 w-3.5" />
              {varScore == null ? "n.d." : `${varScore > 0 ? "+" : ""}${fmtScore(varScore)} punti`} vs {anno - 1}
            </span>
          </div>
        </div>
      </div>

      {/* Badge di giudizio */}
      <div className="mx-4 mb-3 flex items-center gap-2">
        {row?.badge ? (
          <span
            className="shrink-0 px-2.5 py-1 rounded text-xs font-bold text-white"
            style={{ background: bColor }}
            data-testid={`exec-score-badge-${code}`}
          >
            {row.badge}
          </span>
        ) : (
          <span className="shrink-0 px-2.5 py-1 rounded text-xs font-semibold bg-muted text-muted-foreground">
            {hasScore ? "—" : "Dato non disponibile"}
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          Indice {fmtIndex(row?.valore)}
          {row?.dominio ? ` · dominio ${row.dominio}` : ""}
        </span>
      </div>

      {/* Riquadro formula */}
      {row?.formula ? (
        <div className="mx-4 mb-3 px-3 py-2 rounded border border-border/50 bg-muted/30">
          <code className="text-xs text-muted-foreground font-mono leading-snug whitespace-pre-line block">
            {row.formula}
          </code>
          <div className="text-[11px] text-muted-foreground/80 mt-1.5">
            → score {code} = punteggio [0-100] ({famiglia || "normalizzazione"})
          </div>
        </div>
      ) : (
        <div />
      )}

      {/* Barre dei componenti (solo compositi) - score [0-100] */}
      {isComposito ? (
        <div className="px-4 pb-3 space-y-1">
          {componenti.map((c) => {
            const r = rows.get(c);
            const s = r?.score ?? 0;
            return (
              <div key={c} className="flex items-center gap-2 py-0.5" data-testid={`exec-score-comp-${code}-${c}`}>
                <span className="text-xs font-medium text-muted-foreground w-20 text-right shrink-0">{c}</span>
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, s)}%`, background: badgeColor(r?.badge) }} />
                </div>
                <span className="text-xs font-bold w-8 text-right tabular-nums text-foreground">{fmtScore(s)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div />
      )}

      {/* Scomposizione formula (pannello che si apre dentro la card) */}
      <Section icon={Calculator} title="Scomposizione formula" testId={`exec-score-breakdown-toggle-${code}`}>
        <div className="px-3 py-3 rounded border border-primary/20 bg-primary/5 space-y-3" data-testid={`exec-score-breakdown-${code}`}>
          <div>
            <div className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1">
              Parte 1 · Calcolo dell'indice
            </div>
            {parte1.map((p) => (
              <StepRow key={p.label} label={p.label} value={p.value} />
            ))}
            {row?.formula_con_numeri && <StepRow label="Formula con i valori" value={row.formula_con_numeri} />}
            <div className="border-t border-primary/20 mt-1 pt-1">
              <StepRow label={`Indice ${code}`} value={fmtIndex(row?.valore)} strong />
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1">
              Parte 2 · Normalizzazione dello score
            </div>
            {parte2.map((p) => (
              <StepRow key={p.label} label={p.label} value={p.value} />
            ))}
            <div className="border-t border-primary/20 mt-1 pt-1">
              <StepRow label={`Score ${code} [0-100]`} value={fmtScore(row?.score)} strong />
            </div>
          </div>
        </div>
      </Section>

      {/* Scheda metodologica */}
      {row ? (
        <Section icon={Info} title="Scheda metodologica" testId={`exec-score-metodo-toggle-${code}`}>
          <MetodologiaTabs row={row} />
        </Section>
      ) : (
        <div />
      )}

      {/* Trend storico */}
      <Section icon={LineChartIcon} title={`Trend storico · ${code}`} testId={`exec-score-trend-toggle-${code}`}>
        <div className={`${isMock || trend.length === 0 ? "" : "h-[160px]"} px-1`} data-testid={`exec-score-trend-${code}`}>
          {isMock || trend.length === 0 ? (
            <p className="text-xs text-muted-foreground px-3">
              {isMock ? "Trend non disponibile per i dati mock-up." : "Nessun dato storico disponibile."}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ left: -10, right: 10, top: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
                <XAxis dataKey="anno" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <RTooltip
                  contentStyle={{ fontSize: 12, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  formatter={(v: number, _n: string, item: { payload?: { valore: number | null; unita: string | null } }) => [
                    `${fmtScore(v)} (indice ${fmtIndex(item?.payload?.valore)}${item?.payload?.unita ? ` · ${item.payload.unita}` : ""})`,
                    "Score",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={pillarColor}
                  strokeWidth={2.5}
                  connectNulls
                  dot={{ r: 3.5, fill: pillarColor, stroke: "hsl(var(--card))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Section>

      {/* Interconnessioni */}
      {icPillars.length > 0 ? (
        <div className="mx-4 mt-1 mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Interconnessioni
            </span>
          </div>
          <TooltipProvider delayDuration={200}>
            <div className="flex flex-wrap gap-1.5">
              {icPillars.map((p) => {
                const reason = staticIc?.connections.find((c) => c.pillar === p)?.reason;
                return (
                  <Tooltip key={p}>
                    <TooltipTrigger asChild>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border/40 bg-card cursor-help"
                        style={{ borderLeftWidth: 3, borderLeftColor: PILLAR_COLORS[p] }}
                      >
                        <span className="text-xs font-bold" style={{ color: PILLAR_COLORS[p] }}>
                          {p}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {PILLAR_LABELS[p] ?? ""}
                        </span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[280px] p-3">
                      <p className="text-xs font-semibold text-foreground mb-0.5">
                        {p} · {PILLAR_LABELS[p] ?? ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reason ?? `Indicatore collegato al pillar ${p}.`}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
          {staticIc?.bridgeNote && (
            <p className="mt-1.5 text-xs text-primary/80 italic leading-snug">{staticIc.bridgeNote}</p>
          )}
        </div>
      ) : (
        <div />
      )}
    </div>
  );
};
