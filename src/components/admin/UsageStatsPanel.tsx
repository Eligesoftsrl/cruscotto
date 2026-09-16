import { useMemo } from "react";
import { useAdminState } from "@/services/admin/adminStore";
import type { UsageStat } from "@/services/admin/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString("it-IT") : "mai");

export const UsageStatsPanel = () => {
  const { eventi, flags } = useAdminState();

  const stats = useMemo<UsageStat[]>(() => {
    const counts = new Map<string, { count: number; last: string }>();
    eventi.forEach((e) => {
      const cur = counts.get(e.sezione) ?? { count: 0, last: e.ts };
      cur.count += 1;
      if (e.ts > cur.last) cur.last = e.ts;
      counts.set(e.sezione, cur);
    });
    const fromFlags: UsageStat[] = flags.map((f) => {
      const c = counts.get(f.label);
      return { label: f.label, category: f.category, enabled: f.enabled, count: c?.count ?? 0, last: c?.last ?? null };
    });
    const extra: UsageStat[] = Array.from(counts.entries())
      .filter(([k]) => !flags.some((f) => f.label === k))
      .map(([k, v]) => ({ label: k, category: "Altro", enabled: true, count: v.count, last: v.last }));
    return [...fromFlags, ...extra].sort((a, b) => b.count - a.count);
  }, [eventi, flags]);

  const max = Math.max(1, ...stats.map((s) => s.count));
  const totalEvents = eventi.length;
  const usedCount = stats.filter((s) => s.count > 0).length;
  const unused = stats.filter((s) => s.count === 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{totalEvents}</div>
            <div className="text-xs text-muted-foreground">Eventi registrati</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{usedCount}</div>
            <div className="text-xs text-muted-foreground">Funzioni utilizzate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">{unused.length}</div>
            <div className="text-xs text-muted-foreground">Funzioni mai utilizzate</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Utilizzo per funzionalità</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {stats.map((s) => (
            <div key={s.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-foreground truncate">{s.label}</span>
                  {!s.enabled && (
                    <Badge variant="secondary" className="text-[10px]">OFF</Badge>
                  )}
                  {s.count === 0 && (
                    <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300">
                      mai utilizzata
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {s.count} · ult. {fmt(s.last)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(s.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
