import { useMemo } from "react";
import { useAdminState, toggleFlag } from "@/services/admin/adminStore";
import type { FeatureFlag } from "@/services/admin/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export const FeatureFlagsPanel = () => {
  const { flags } = useAdminState();

  const grouped = useMemo(() => {
    const m = new Map<string, FeatureFlag[]>();
    flags.forEach((f) => {
      const arr = m.get(f.category) ?? [];
      arr.push(f);
      m.set(f.category, arr);
    });
    return Array.from(m.entries());
  }, [flags]);

  const activeCount = flags.filter((f) => f.enabled).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {activeCount} di {flags.length} funzionalità attive. Disattivando una voce, la relativa
        funzione può essere nascosta/disabilitata nell'app.
      </p>
      {grouped.map(([cat, list]) => (
        <Card key={cat}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">{cat}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {list.map((f) => (
              <div
                key={f.key}
                className="flex items-center justify-between py-2.5 border-b last:border-0"
              >
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{f.label}</span>
                    <Badge variant={f.enabled ? "default" : "secondary"} className="text-[10px]">
                      {f.enabled ? "ON" : "OFF"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
                </div>
                <Switch
                  checked={f.enabled}
                  onCheckedChange={(v) => toggleFlag(f.key, v)}
                  aria-label={`Attiva/disattiva ${f.label}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
