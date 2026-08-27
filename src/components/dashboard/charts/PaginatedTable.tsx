import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

interface PaginatedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  caption?: string;
  exportable?: boolean;
  exportFilename?: string;
}

export function PaginatedTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize = 10,
  caption,
  exportable = true,
  exportFilename = "export",
}: PaginatedTableProps<T>) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const paged = useMemo(
    () => data.slice(page * pageSize, (page + 1) * pageSize),
    [data, page, pageSize],
  );

  // Reset page when data changes
  useMemo(() => {
    if (page >= totalPages) setPage(0);
  }, [data.length]);

  const alignClass = (a?: string) =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";

  const handleExport = useCallback(() => {
    const bom = "\uFEFF";
    const headers = columns.map((c) => c.header);
    const rows = data.map((row) => columns.map((c) => String(row[c.key] ?? "")));
    const csv =
      bom +
      [
        headers.join(";"),
        ...rows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";")),
      ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFilename}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data, columns, exportFilename]);

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-muted/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2 font-semibold text-muted-foreground border-b border-border whitespace-nowrap ${alignClass(col.align)} ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-2 ${alignClass(col.align)} ${col.className ?? ""}`}
                  >
                    {col.render ? col.render(row, page * pageSize + i) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {caption ? caption : `${data.length} elementi · Pagina ${page + 1} di ${totalPages}`}
        </span>
        <div className="flex items-center gap-2">
          {exportable && data.length > 0 && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded border border-border hover:bg-muted transition-colors"
              title="Esporta CSV"
            >
              <Download className="h-3 w-3" />
              CSV
            </button>
          )}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (page < 3) {
                  pageNum = i;
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`min-w-[24px] h-6 rounded text-[11px] font-medium ${
                      pageNum === page ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
