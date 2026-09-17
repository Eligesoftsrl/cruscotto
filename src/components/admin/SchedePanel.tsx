import { useMemo, useState } from "react";
import {
  ChevronDown,
  LayoutGrid,
  CheckCircle2,
  CircleSlash,
  Sparkles,
  Lock,
  Power,
  BarChart3,
  PieChart as PieIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminState, toggleFlag, setManyFlags } from "@/services/admin/adminStore";
import { SCHEDE_SECTIONS, type SezioneDef } from "@/config/schedeCatalog";
import { tooltipStyle } from "@/components/dashboard/chartTheme";

const COLOR_ON = "hsl(var(--primary))";
const COLOR_OFF = "hsl(215 16% 65%)";

export const SchedePanel = () => {
  const { flags, eventi } = useAdminState();
  const [openSection, setOpenSection] = useState<string>("conto-annuale");

  const isOn = (key: string) => flags.find((f) => f.key === key)?.enabled ?? true;

  // Aggregati globali (tutte le sezioni disponibili)
  const allSchede = useMemo(
    () => SCHEDE_SECTIONS.filter((s) => s.available).flatMap((s) => s.schede),
    [],
  );
  const total = allSchede.length;
  const active = allSchede.filter((s) => isOn(s.flagKey)).length;
  const disabled = total - active;
  const availableSections = SCHEDE_SECTIONS.filter((s) => s.available).length;

  const pieData = [
    { name: "Attive", value: active, color: COLOR_ON },
    { name: "Disattive", value: disabled, color: COLOR_OFF },
  ];

  // Utilizzo per scheda (dagli eventi tracciati) — top 8
  const usageData = useMemo(() => {
    const counts = new Map<string, number>();
    eventi.forEach((e) => counts.set(e.sezione, (counts.get(e.sezione) ?? 0) + 1));
    return allSchede
      .map((s) => ({ label: s.label, count: counts.get(s.label) ?? 0, on: isOn(s.flagKey) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventi, flags]);

  const hasUsage = usageData.some((u) => u.count > 0);

  return (
    <div className="space-y-5">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/90 via-primary to-primary/70 text-primary-foreground shadow-lg">
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 right-24 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold">
                Gestione Schede <Sparkles className="h-4 w-4 opacity-80" />
              </h2>
              <p className="max-w-xl text-sm text-primary-foreground/80">
                Attiva o disattiva le schede per macro-sezione. Le modifiche sono immediate,
                per l'amministratore e per gli utenti.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <HeroStat value={active} label="Attive" tone="on" />
            <HeroStat value={disabled} label="Disattive" tone="off" />
            <HeroStat value={total} label="Totali" tone="neutral" />
          </div>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <PieIcon className="h-4 w-4 text-primary" /> Stato attivazione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[190px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {pieData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">{active}</span>
                <span className="text-[11px] text-muted-foreground">di {total} attive</span>
              </div>
            </div>
            <div className="mt-1 flex justify-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLOR_ON }} />
                Attive ({active})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLOR_OFF }} />
                Disattive ({disabled})
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <BarChart3 className="h-4 w-4 text-primary" /> Schede più consultate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasUsage ? (
              <div className="h-[190px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageData} layout="vertical" margin={{ left: 8, right: 12 }}>
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={120}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
                      {usageData.map((u, i) => (
                        <Cell key={i} fill={u.on ? COLOR_ON : COLOR_OFF} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[190px] flex-col items-center justify-center text-center text-muted-foreground">
                <BarChart3 className="mb-2 h-8 w-8 opacity-30" />
                <p className="text-xs">
                  Nessun dato di utilizzo ancora disponibile.
                  <br />
                  Le consultazioni verranno registrate qui.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Sezioni ── */}
      <div className="space-y-3">
        {SCHEDE_SECTIONS.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            isOpen={openSection === section.id}
            onToggleOpen={() =>
              setOpenSection((cur) => (cur === section.id ? "" : section.id))
            }
            isOn={isOn}
          />
        ))}
      </div>
    </div>
  );
};

const HeroStat = ({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "on" | "off" | "neutral";
}) => (
  <div className="min-w-[68px] rounded-xl bg-white/15 px-3 py-2 text-center backdrop-blur">
    <div className="text-xl font-bold leading-none">{value}</div>
    <div className="mt-1 text-[10px] uppercase tracking-wide text-primary-foreground/80">
      {label}
    </div>
  </div>
);

const SectionCard = ({
  section,
  isOpen,
  onToggleOpen,
  isOn,
}: {
  section: SezioneDef;
  isOpen: boolean;
  onToggleOpen: () => void;
  isOn: (key: string) => boolean;
}) => {
  const SectionIcon = section.icon;
  const active = section.schede.filter((s) => isOn(s.flagKey)).length;
  const total = section.schede.length;
  const allOn = total > 0 && active === total;
  const allOff = active === 0;

  const disabled = !section.available;

  return (
    <Card className={disabled ? "opacity-70" : ""}>
      <button
        type="button"
        onClick={disabled ? undefined : onToggleOpen}
        disabled={disabled}
        className={`flex w-full items-center gap-3 p-4 text-left transition-colors ${
          disabled ? "cursor-not-allowed" : "hover:bg-muted/40"
        }`}
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            disabled ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
          }`}
        >
          <SectionIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{section.label}</span>
            {disabled ? (
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Lock className="h-3 w-3" /> Prossimamente
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px]">
                {active}/{total} attive
              </Badge>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">{section.description}</p>
        </div>
        {!disabled && (
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {!disabled && isOpen && (
        <CardContent className="border-t pt-4 duration-200 animate-in fade-in-0 slide-in-from-top-1">
          {/* Azioni rapide */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {active} di {total} schede attive in questa sezione
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 text-xs"
                disabled={allOn}
                onClick={() => setManyFlags(section.schede.map((s) => s.flagKey), true)}
              >
                <Power className="h-3.5 w-3.5" /> Attiva tutte
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 text-xs"
                disabled={allOff}
                onClick={() => setManyFlags(section.schede.map((s) => s.flagKey), false)}
              >
                <CircleSlash className="h-3.5 w-3.5" /> Disattiva tutte
              </Button>
            </div>
          </div>

          {/* Griglia schede */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {section.schede.map((s) => {
              const on = isOn(s.flagKey);
              const CardIcon = s.icon;
              return (
                <div
                  key={s.flagKey}
                  className={`group flex items-start gap-3 rounded-xl border p-3 transition-all ${
                    on
                      ? "border-primary/30 bg-primary/[0.04]"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      on ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <CardIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-semibold text-foreground">
                        {s.label}
                      </span>
                      {on ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                      ) : null}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                      {s.description}
                    </p>
                  </div>
                  <Switch
                    checked={on}
                    onCheckedChange={(v) => toggleFlag(s.flagKey, v)}
                    aria-label={`Attiva/disattiva ${s.label}`}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
