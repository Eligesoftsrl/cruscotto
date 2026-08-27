import { useState } from "react";
import { getNarrative, narrativeThresholds } from "@/data/narrativeGenerators";
import { executiveIndicesStatic } from "@/components/dashboard/executive/executiveData";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, AlertTriangle, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";

/* ── Indicator metadata built from executiveData ── */
interface IndicatorMeta {
  id: string;
  label: string;
  pillar: string;
  level: string;
  formula: string;
  fonte: string;
  value: number;
  assessment: string;
  hasNarrative: boolean;
}

const allIndicators: IndicatorMeta[] = executiveIndicesStatic.map((idx) => ({
  id: idx.id,
  label: idx.label.replace(/\n/g, " "),
  pillar: idx.pillar,
  level: idx.indicatorLevel ?? "executive",
  formula: idx.formula,
  fonte: idx.fonte
    .replace(/^Fonte:\s*/, "")
    .split("·")[0]
    .trim(),
  value: idx.value,
  assessment: idx.assessment.level,
  hasNarrative: !!narrativeThresholds[idx.id],
}));

const pillarLabels: Record<string, string> = {
  D1: "Classificazione",
  D2: "Fabbisogno",
  D3: "Recruiting",
  D4: "Sviluppo",
  D5: "Rewarding",
  D6: "Sostenibilità",
};

const kpiLabels: Record<string, string> = Object.fromEntries(
  executiveIndicesStatic.map((idx) => [idx.id, idx.label.replace(/\n/g, " ")]),
);

function getSeverity(id: string, value: number) {
  const thresholds = narrativeThresholds[id];
  if (!thresholds) return { label: "—", color: "bg-muted text-muted-foreground" };
  const idx = thresholds.findIndex((t) => value < t.max);
  const level = idx === -1 ? thresholds.length - 1 : idx;
  const colors = [
    "bg-destructive text-destructive-foreground",
    "bg-orange-500 text-white",
    "bg-yellow-500 text-black",
    "bg-green-600 text-white",
  ];
  const labels = ["Critico", "Basso", "Moderato", "Buono"];
  return { label: labels[level] ?? "—", color: colors[level] ?? colors[0] };
}

export default function NarrativeDemo() {
  const kpiIds = Object.keys(narrativeThresholds);
  const [selectedKpi, setSelectedKpi] = useState(kpiIds[0]);
  const [value, setValue] = useState(0.14);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPillar, setFilterPillar] = useState<string>("all");

  const narrative = getNarrative(selectedKpi, value);
  const pct = Math.round(value * 100);
  const severity = getSeverity(selectedKpi, value);

  const thresholds = narrativeThresholds[selectedKpi] ?? [];
  const boundaries = thresholds.slice(0, -1).map((t) => t.max);

  // Filter indicators for the table
  const filteredIndicators = allIndicators.filter((ind) => {
    const matchSearch =
      searchTerm === "" ||
      ind.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPillar = filterPillar === "all" || ind.pillar === filterPillar;
    return matchSearch && matchPillar;
  });

  // Stats
  const totalIndicators = allIndicators.length;
  const withNarrative = allIndicators.filter((i) => i.hasNarrative).length;
  const withoutNarrative = totalIndicators - withNarrative;
  const missingIndicators = allIndicators.filter((i) => !i.hasNarrative);

  return (
    <div className="min-h-screen bg-background p-6 max-w-6xl mx-auto space-y-6">
      <Link
        to="/bussola"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Torna al Pannello di Governo
      </Link>

      <h1 className="text-2xl font-bold text-foreground">Demo: Generatori Narrativi Dinamici</h1>
      <p className="text-muted-foreground text-sm">
        Muovi lo slider per vedere come cambia la frase al variare del valore dell'indicatore.
      </p>

      {/* ── Simulator ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Seleziona indicatore</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedKpi}
            onValueChange={(v) => {
              setSelectedKpi(v);
              const idx = executiveIndicesStatic.find((i) => i.id === v);
              setValue(idx ? idx.value : 0.14);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {kpiIds.map((id) => (
                <SelectItem key={id} value={id}>
                  {id} — {kpiLabels[id] ?? id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{kpiLabels[selectedKpi] ?? selectedKpi}</CardTitle>
            <Badge className={severity.color}>{severity.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Valore</span>
              <span className="font-mono font-bold text-lg text-foreground">{pct}%</span>
            </div>
            <Slider
              value={[value * 100]}
              onValueChange={([v]) => setValue(v / 100)}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              {boundaries.map((b) => (
                <span key={b} className="border-l border-border pl-1">
                  {b === Infinity ? "∞" : Math.round(b * 100) + "%"}
                </span>
              ))}
              <span>100%</span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">Frase generata:</p>
            <p className="text-foreground leading-relaxed">
              {narrative || (
                <span className="italic text-muted-foreground">Nessun generatore disponibile</span>
              )}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Soglie per {selectedKpi}:</p>
            <div className="flex flex-wrap gap-2">
              {thresholds.map((t, i) => {
                const labels = ["Critico", "Basso", "Moderato", "Buono"];
                const isActive = thresholds.findIndex((th) => value < th.max) === i;
                return (
                  <span
                    key={i}
                    className={`text-xs px-2 py-1 rounded-full border ${isActive ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}
                  >
                    {labels[i]}: &lt; {t.max === Infinity ? "∞" : Math.round(t.max * 100) + "%"}
                  </span>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Coverage Report ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Copertura Generatori Narrativi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <p className="text-2xl font-extrabold text-foreground">{totalIndicators}</p>
              <p className="text-xs text-muted-foreground">Indicatori totali</p>
            </div>
            <div className="rounded-lg border bg-[hsl(var(--chart-green))]/10 p-3 text-center">
              <p className="text-2xl font-extrabold text-[hsl(var(--chart-green))]">
                {withNarrative}
              </p>
              <p className="text-xs text-muted-foreground">Con generatore narrativo</p>
            </div>
            <div className="rounded-lg border bg-destructive/10 p-3 text-center">
              <p className="text-2xl font-extrabold text-destructive">{withoutNarrative}</p>
              <p className="text-xs text-muted-foreground">Senza generatore</p>
            </div>
          </div>

          {missingIndicators.length > 0 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
              <p className="text-sm font-bold text-destructive flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Indicatori senza generatore narrativo ({missingIndicators.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {missingIndicators.map((ind) => (
                  <span
                    key={ind.id}
                    className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive font-mono"
                  >
                    {ind.id} ({ind.pillar})
                  </span>
                ))}
              </div>
            </div>
          )}

          {missingIndicators.length === 0 && (
            <div className="rounded-lg border border-[hsl(var(--chart-green))]/30 bg-[hsl(var(--chart-green))]/5 p-3">
              <p className="text-sm font-bold text-[hsl(var(--chart-green))] flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                Tutti gli indicatori hanno un generatore narrativo!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Full Indicator Table ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base">Tabella Completa Indicatori</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Cerca indicatore..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-xs w-48"
                />
              </div>
              <Select value={filterPillar} onValueChange={setFilterPillar}>
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i Pillar</SelectItem>
                  {Object.entries(pillarLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {k} — {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-bold text-muted-foreground">ID</th>
                  <th className="text-left py-2 px-2 font-bold text-muted-foreground">
                    Indicatore
                  </th>
                  <th className="text-left py-2 px-2 font-bold text-muted-foreground">Pillar</th>
                  <th className="text-left py-2 px-2 font-bold text-muted-foreground">Livello</th>
                  <th className="text-left py-2 px-2 font-bold text-muted-foreground">Formula</th>
                  <th className="text-left py-2 px-2 font-bold text-muted-foreground">Fonte</th>
                  <th className="text-right py-2 px-2 font-bold text-muted-foreground">Valore</th>
                  <th className="text-center py-2 px-2 font-bold text-muted-foreground">Stato</th>
                  <th className="text-center py-2 px-2 font-bold text-muted-foreground">
                    Narrativo
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredIndicators.map((ind) => (
                  <tr
                    key={ind.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-2 px-2 font-mono font-bold text-primary">{ind.id}</td>
                    <td className="py-2 px-2 text-foreground max-w-[200px]">{ind.label}</td>
                    <td className="py-2 px-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                        {ind.pillar}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-muted-foreground capitalize">{ind.level}</td>
                    <td
                      className="py-2 px-2 text-muted-foreground max-w-[250px] truncate"
                      title={ind.formula}
                    >
                      {ind.formula}
                    </td>
                    <td className="py-2 px-2 text-muted-foreground">{ind.fonte}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold">
                      {ind.value < 0 ? ind.value.toFixed(3) : (ind.value * 100).toFixed(0) + "%"}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          ind.assessment === "Critico" || ind.assessment === "Basso"
                            ? "bg-destructive/10 text-destructive"
                            : ind.assessment === "Buono" || ind.assessment === "Eccellente"
                              ? "bg-[hsl(var(--chart-green))]/10 text-[hsl(var(--chart-green))]"
                              : ind.assessment === "Placeholder"
                                ? "bg-muted text-muted-foreground"
                                : "bg-[hsl(var(--chart-orange))]/10 text-[hsl(var(--chart-orange))]"
                        }`}
                      >
                        {ind.assessment}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      {ind.hasNarrative ? (
                        <Check className="h-4 w-4 text-[hsl(var(--chart-green))] mx-auto" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-destructive mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            {filteredIndicators.length} indicatori mostrati su {totalIndicators} totali
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
