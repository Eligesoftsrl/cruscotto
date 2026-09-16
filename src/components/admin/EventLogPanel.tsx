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

export const EventLogPanel = () => {
  const { eventi } = useAdminState();
  const [q, setQ] = useState("");

  const rows = useMemo(
    () =>
      eventi.filter((r) =>
        [r.username, r.azione, r.sezione].join(" ").toLowerCase().includes(q.toLowerCase()),
      ),
    [eventi, q],
  );

  const csvRows = rows.map((r) => ({
    ts: r.ts,
    username: r.username,
    ruolo: r.ruolo,
    azione: r.azione,
    sezione: r.sezione,
    dettagli: r.dettagli ? JSON.stringify(r.dettagli) : "",
  }));

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca azione / sezione / utente…"
              className="pl-8 h-9"
            />
          </div>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground">{rows.length} eventi</span>
          <Button variant="outline" size="sm" onClick={() => exportCsv("eventi.csv", csvRows)}>
            <Download className="h-4 w-4 mr-1.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => clearLog("eventi")}>
            <Trash2 className="h-4 w-4 mr-1.5" /> Svuota
          </Button>
        </div>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data / Ora</TableHead>
                <TableHead>Utente</TableHead>
                <TableHead>Azione</TableHead>
                <TableHead>Sezione</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                    Nessun evento registrato
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs whitespace-nowrap">{fmt(r.ts)}</TableCell>
                  <TableCell className="font-medium">{r.username}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{r.azione}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{r.sezione}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
