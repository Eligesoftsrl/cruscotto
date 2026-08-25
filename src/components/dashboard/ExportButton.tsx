import { Download } from "lucide-react";
import { useState } from "react";

interface ExportButtonProps {
  getData: () => { headers: string[]; rows: (string | number)[][] };
  filename?: string;
  label?: string;
}

export const ExportButton = ({ getData, filename = "export", label = "Esporta CSV" }: ExportButtonProps) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    try {
      const { headers, rows } = getData();
      const bom = "\uFEFF";
      const csv = bom + [
        headers.join(";"),
        ...rows.map(row => row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";")),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50"
      title={label}
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </button>
  );
};
