import { useMemo } from "react";
import { Lock } from "lucide-react";
import { useAdminState, toggleFlag } from "@/services/admin/adminStore";
import type { FeatureFlag } from "@/services/admin/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

/**
 * Funzionalità PROTETTE: non disattivabili dall'interfaccia per evitare il
 * "lock-out" dell'amministratore. Il «Pannello Admin» resta sempre accessibile;
 * un eventuale blocco va gestito esclusivamente via query SQL sul database.
 */
const PROTECTED_FLAG_KEYS = new Set<string>(["admin_panel"]);

export const FeatureFlagsPanel = () => {
  const { flags } = useAdminState();

  // Le schede (Conto Annuale + SIPrO) hanno una sezione dedicata ("Schede"): qui
  // gestiamo solo le altre funzionalità (Navigazione, Sistema, ...).
  const generalFlags = useMemo(
    () => flags.filter((f) => !f.category.startsWith("Schede ")),
    [flags],
  );

  const grouped = useMemo(() => {
    const m = new Map<string, FeatureFlag[]>();
    generalFlags.forEach((f) => {
      const arr = m.get(f.category) ?? [];
      arr.push(f);
      m.set(f.category, arr);
    });
    return Array.from(m.entries());
  }, [generalFlags]);

  const activeCount = generalFlags.filter((f) => f.enabled).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {activeCount} di {generalFlags.length} funzionalità attive. Disattivando una voce, la relativa
        funzione può essere nascosta/disabilitata nell'app. Le schede del Conto Annuale si gestiscono
        dalla sezione «Schede».
      </p>
      {grouped.map(([cat, list]) => (
        <Card key={cat}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">{cat}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {list.map((f) => {
              const protectedFlag = PROTECTED_FLAG_KEYS.has(f.key);
              return (
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
                      {protectedFlag && (
                        <Badge
                          variant="outline"
                          className="gap-1 border-amber-300 text-[10px] text-amber-700"
                        >
                          <Lock className="h-3 w-3" /> Protetta
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
                    {protectedFlag && (
                      <p className="mt-1 text-[11px] text-amber-700">
                        Funzionalità critica: non disattivabile da qui per evitare di perdere
                        l'accesso al pannello. Un'eventuale disattivazione va effettuata dal
                        sistemista via query SQL sul database.
                      </p>
                    )}
                  </div>
                  <Switch
                    checked={f.enabled}
                    disabled={protectedFlag}
                    onCheckedChange={(v) => {
                      if (protectedFlag) return;
                      toggleFlag(f.key, v);
                    }}
                    aria-label={`Attiva/disattiva ${f.label}`}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
