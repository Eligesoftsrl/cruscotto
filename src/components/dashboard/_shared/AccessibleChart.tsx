/**
 * ResponsiveContainer accessibile (sostituisce quello di Recharts, stessa interfaccia).
 *
 * Per ogni grafico aggiunge il pulsante «Visualizza in tabella» (raggiungibile con Tab,
 * si apre con Invio/Spazio) che mostra in una finestra i dati del grafico in una tabella
 * con intestazioni di riga e di colonna (WCAG 1.1.1, 1.3.1, 2.1.1 — linee guida AGID).
 * La finestra trattiene il focus, si chiude con Esc o «Chiudi» e restituisce il focus al pulsante.
 *
 * Uso: import { ResponsiveContainer } from "@/components/dashboard/_shared/AccessibleChart";
 * Opzioni: `tableTitle` (titolo della tabella; di default il titolo della card),
 *          `table={false}` per i grafici puramente decorativi.
 */
import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import { ResponsiveContainer as RechartsResponsiveContainer } from "recharts";
import { Table2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { extractChartTable, type ChartTable } from "@/lib/a11y/chartTable";

type RechartsProps = ComponentProps<typeof RechartsResponsiveContainer>;

type Props = RechartsProps & {
  /** Titolo della tabella dati (default: titolo della card che contiene il grafico). */
  tableTitle?: string;
  /** false = grafico decorativo, nessuna tabella. */
  table?: boolean;
};

const FALLBACK_TITLE = "Dati del grafico";
const HEADING_SELECTOR = "h1, h2, h3, h4, h5, [role='heading']";

/** Titolo più vicino che precede il grafico nella pagina (risale fino a 6 livelli). */
function findChartTitle(el: HTMLElement | null): string | null {
  let node = el?.parentElement ?? null;
  for (let depth = 0; node && depth < 6; depth++) {
    const headings = Array.from(node.querySelectorAll<HTMLElement>(HEADING_SELECTOR)).filter(
      (h) => !!el && h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING,
    );
    const last = headings[headings.length - 1];
    const text = last?.textContent?.trim();
    if (text) return text;
    node = node.parentElement;
  }
  return null;
}

export const ChartDataTable = ({ table, title }: { table: ChartTable; title: string }) => (
  <div
    className="max-h-[60vh] overflow-auto rounded-md border"
    tabIndex={0}
    role="region"
    aria-label={`Tabella: ${title}`}
  >
    <table className="w-full text-sm">
      <caption className="sr-only">{title}</caption>
      <thead className="sticky top-0 bg-muted">
        <tr>
          {table.columns.map((c, i) => (
            <th
              key={`${c}-${i}`}
              scope="col"
              className={`px-3 py-2 font-semibold text-foreground ${i === 0 ? "text-left" : "text-right"}`}
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((r, ri) => (
          <tr key={ri} className="border-t">
            {r.map((cell, ci) =>
              ci === 0 ? (
                <th key={ci} scope="row" className="px-3 py-1.5 text-left font-medium text-foreground">
                  {cell}
                </th>
              ) : (
                <td key={ci} className="px-3 py-1.5 text-right tabular-nums text-foreground">
                  {cell}
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ChartTableButton = ({ table, title }: { table: ChartTable; title: string }) => (
  <Dialog>
    <DialogTrigger asChild>
      <button
        type="button"
        data-testid="chart-table-button"
        className="inline-flex items-center gap-1 rounded border bg-card px-2 py-0.5 text-xs font-medium text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Table2 aria-hidden="true" className="h-3.5 w-3.5" />
        Visualizza in tabella
        <span className="sr-only">({title})</span>
      </button>
    </DialogTrigger>
    <DialogContent className="max-w-3xl" data-testid="chart-table-dialog">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          Dati rappresentati nel grafico · {table.rows.length} {table.rows.length === 1 ? "riga" : "righe"}
        </DialogDescription>
      </DialogHeader>
      <ChartDataTable table={table} title={title} />
    </DialogContent>
  </Dialog>
);

export const ResponsiveContainer = ({ tableTitle, table: withTable = true, ...props }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [autoTitle, setAutoTitle] = useState<string | null>(null);
  const data = useMemo(
    () => (withTable ? extractChartTable(props.children) : null),
    [withTable, props.children],
  );

  useEffect(() => {
    if (!tableTitle && data) setAutoTitle(findChartTitle(ref.current));
  }, [tableTitle, data]);

  if (!data) return <RechartsResponsiveContainer {...props} />;

  const title = tableTitle ?? autoTitle ?? FALLBACK_TITLE;
  const { width = "100%", height = "100%", aspect } = props;
  const button = (
    <div className="flex shrink-0 justify-end pb-1 print:hidden">
      <ChartTableButton table={data} title={title} />
    </div>
  );
  const chartLabel = `Grafico: ${title}. I dati sono disponibili con il pulsante «Visualizza in tabella».`;

  // Altezza fissa o proporzione: il pulsante si aggiunge sopra, il grafico mantiene la sua dimensione.
  if (typeof height === "number" || aspect) {
    return (
      <div ref={ref} style={{ width }}>
        {button}
        <div role="img" aria-label={chartLabel}>
          <RechartsResponsiveContainer {...props} />
        </div>
      </div>
    );
  }

  // Altezza relativa al contenitore: pulsante e grafico si dividono lo spazio disponibile.
  return (
    <div ref={ref} className="flex flex-col" style={{ width, height }}>
      {button}
      <div role="img" aria-label={chartLabel} className="min-h-0 flex-1">
        <RechartsResponsiveContainer {...props} width="100%" height="100%" />
      </div>
    </div>
  );
};
