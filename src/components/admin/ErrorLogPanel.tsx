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

export const ErrorLogPanel = () => {
  const { errori } = useAdminState();
  const [q, setQ] = useState("");
  const [onlyErr, setOnlyErr] = useState(false);

  const rows = useMemo(
    () =>
      errori
        .filter((r) => (onlyErr ? r.livello === "error" : true))
        .filter((r) =>
          [r.messaggio, r.origine, r.username ?? ""].join(" ").toLowerCase().includes(q.toLowerCase()),
        ),
    [errori, q, onlyErr],
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
              placeholder="Cerca messaggio / origine…"
              className="pl-8 h-9"
            />
          </div>
          <Button
            variant={onlyErr ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlyErr((v) => !v)}
          >
            Solo errori
          </Button>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground">{rows.length} voci</span>
          <Button variant="outline" size="sm" onClick={() => exportCsv("errori.csv", rows as unknown as Record<string, unknown>[])}>
            <Download className="h-4 w-4 mr-1.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => clearLog("errori")}>
            <Trash2 className="h-4 w-4 mr-1.5" /> Svuota
          </Button>
        </div>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data / Ora</TableHead>
                <TableHead>Livello</TableHead>
                <TableHead>Origine</TableHead>
                <TableHead>Messaggio</TableHead>
                <TableHead>Utente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                    Nessun errore registrato
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs whitespace-nowrap">{fmt(r.ts)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={r.livello === "error" ? "destructive" : "secondary"}
                      className="text-[10px] uppercase"
                    >
                      {r.livello}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{r.origine}</TableCell>
                  <TableCell className="text-sm max-w-[420px] truncate" title={r.messaggio}>
                    {r.messaggio}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.username ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
