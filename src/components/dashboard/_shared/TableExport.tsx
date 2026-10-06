import { useRef, useState } from "react";
import { Download, FileSpreadsheet, FileText, FileType, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportTables,
  extractTablesIn,
  type ExportFormat,
  type ExportTable,
} from "@/lib/tableExport";

interface TableExportProps {
  /** Nome base del file (senza estensione). */
  filename: string;
  /** Titolo mostrato nel PDF e usato come nome foglio Excel. */
  title?: string;
  /** Modalità DATA-DRIVEN: tabelle già pronte. */
  data?: ExportTable[];
  /** Modalità DOM: riferimento al contenitore da cui estrarre le <table>. */
  targetRef?: React.RefObject<HTMLElement>;
  /** Variante grafica del pulsante. */
  variant?: "compact" | "default";
  className?: string;
}

const FORMATS: { key: ExportFormat; label: string; icon: typeof FileText }[] = [
  { key: "csv", label: "CSV", icon: FileText },
  { key: "xlsx", label: "Excel (.xlsx)", icon: FileSpreadsheet },
  { key: "pdf", label: "PDF", icon: FileType },
];

/**
 * Pulsante a tendina per esportare una o più tabelle in CSV / Excel / PDF.
 *
 * Tre modalità di risoluzione dei dati (in ordine di priorità):
 *  1. `data`      → tabelle già pronte (export completo, indipendente dal DOM).
 *  2. `targetRef` → estrae le <table> dal contenitore indicato.
 *  3. AUTO        → risale il DOM dal proprio nodo fino al primo contenitore
 *                   che contiene una <table> (nessun ref richiesto nel chiamante).
 *
 * Usa un import dinamico per le librerie pesanti (xlsx, jspdf).
 */
export function TableExport({
  filename,
  title,
  data,
  targetRef,
  variant = "compact",
  className = "",
}: TableExportProps) {
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);

  const resolveTables = (): ExportTable[] => {
    if (data && data.length) return data;
    if (targetRef?.current) return extractTablesIn(targetRef.current, title ?? filename);
    // AUTO: cerca il contenitore-tabella più vicino risalendo gli antenati.
    let node: HTMLElement | null = anchorRef.current?.parentElement ?? null;
    while (node) {
      if (node.querySelector("table")) return extractTablesIn(node, title ?? filename);
      node = node.parentElement;
    }
    return [];
  };

  const handle = async (format: ExportFormat) => {
    const tables = resolveTables();
    if (!tables.length) return;
    try {
      setBusy(format);
      await exportTables(format, tables, filename, title);
    } catch (err) {
      console.error("[TableExport] esportazione fallita", err);
    } finally {
      setBusy(null);
    }
  };

  const triggerCls =
    variant === "compact"
      ? "inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded border border-border hover:bg-muted transition-colors"
      : "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-border bg-card hover:bg-muted transition-colors";

  return (
    <span ref={anchorRef} className="inline-flex shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={`${triggerCls} ${className}`}
          title="Esporta dati (CSV, Excel, PDF)"
          aria-label="Esporta dati"
        >
          {busy ? (
            <Loader2 className={variant === "compact" ? "h-3 w-3 animate-spin" : "h-3.5 w-3.5 animate-spin"} />
          ) : (
            <Download className={variant === "compact" ? "h-3 w-3" : "h-3.5 w-3.5"} />
          )}
          Esporta
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[160px]">
          {FORMATS.map(({ key, label, icon: Icon }) => (
            <DropdownMenuItem
              key={key}
              onClick={() => handle(key)}
              disabled={busy !== null}
              className="gap-2 text-xs cursor-pointer"
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
}
