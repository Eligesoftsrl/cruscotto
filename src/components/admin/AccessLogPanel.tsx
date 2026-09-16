import { useMemo, useState } from "react";
import { useAdminState, clearLog, exportCsv } from "@/services/admin/adminStore";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Trash2, Search } from "lucide-react";

const fmt = (iso: string) => new Date(iso).toLocaleString("it-IT");

export const AccessLogPanel = () => {
  const { access } = useAdminState();
  const [q, setQ] = useState("");

  const rows = useMemo(
    () =>
      access.filter((r) =>
        [r.username, r.ruolo, r.esito].join(" ").toLowerCase().includes(q.toLowerCase()),
      ),
    [access, q],
  );

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca utente / ruolo / esito…"
              className="pl-8 h-9"
            />
          </div>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground">{rows.length} accessi</span>
          <Button variant="outline" size="sm" onClick={() => exportCsv("accessi.csv", rows as unknown as Record<string, unknown>[])}>
            <Download className="h-4 w-4 mr-1.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => clearLog("access")}>
            <Trash2 className="h-4 w-4 mr-1.5" /> Svuota
          </Button>
        </div>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data / Ora</TableHead>
                <TableHead>Utente</TableHead>
                <TableHead>Ruolo</TableHead>
                <TableHead>Esito</TableHead>
                <TableHead>Dispositivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                    Nessun accesso registrato
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs whitespace-nowrap">{fmt(r.ts)}</TableCell>
                  <TableCell className="font-medium">{r.username}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] uppercase">{r.ruolo}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={r.esito === "success" ? "default" : "destructive"}
                      className="text-[10px]"
                    >
                      {r.esito === "success" ? "OK" : "FALLITO"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate max-w-[260px]">
                    {r.userAgent}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
