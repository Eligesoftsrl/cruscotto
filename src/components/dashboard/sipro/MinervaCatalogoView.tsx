import { TableExport } from "@/components/dashboard/_shared/TableExport";
import { useMemo } from "react";
import { useMinerva } from "@/hooks/useSchedaSiproProfili";
import { LoadingSpinner, ErrorBox, KpiBox } from "./_shared";

type MinervaTipo = "famiglia" | "profilo_professionale" | "ambito" | "area";

interface Props {
  tipo: MinervaTipo;
  titolo: string;
  kpiLabel: string;
  colonnaLabel: string;
}

/**
 * Cataloghi Minerva (S10 Famiglie, S11 Profili, S12 Ambiti, S13 Aree).
 * Cataloghi GLOBALI: sipro_cataloghi_minerva non accetta ente/regione → nessun filtro.
 */
export const MinervaCatalogoView = ({ tipo, titolo, kpiLabel, colonnaLabel }: Props) => {
  const q = useMinerva(tipo);

  const { items, totale } = useMemo(() => {
    const rows = q.data ?? [];
    const seen = new Set<string>();
    const out: { codice: string; denominazione: string }[] = [];
    rows.forEach((row) => {
      const code = String(row.codice ?? "").trim();
      if (!code || seen.has(code)) return;
      seen.add(code);
      out.push({ codice: code, denominazione: row.denominazione });
    });
    out.sort((a, b) => a.denominazione.localeCompare(b.denominazione, "it"));
    return { items: out, totale: rows[0]?.totale ?? out.length };
  }, [q.data]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
        Catalogo professionale di riferimento (Minerva) — dato globale, non filtrabile per ente o regione.
      </div>
      {q.error ? <ErrorBox error={q.error} /> : q.isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <KpiBox label={kpiLabel} value={totale} />
            <KpiBox label="Voci elencate" value={items.length} />
          </div>
          <div className="bg-card border rounded-xl p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-muted-foreground">{titolo}</p>
              <TableExport filename="minerva_catalogo" title={titolo} />
            </div>
            <div className="overflow-auto rounded-md border max-h-[520px]">
              <table className="w-full text-[12px]">
                <thead className="sticky top-0">
                  <tr className="border-b bg-muted text-muted-foreground">
                    <th className="text-left px-3 py-2 font-semibold w-40">Codice</th>
                    <th className="text-left px-3 py-2 font-semibold">{colonnaLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={2} className="text-center py-8 text-muted-foreground">Nessun dato disponibile</td></tr>
                  ) : items.map((it) => (
                    <tr key={it.codice} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{it.codice}</td>
                      <td className="px-3 py-2 text-foreground">{it.denominazione}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
