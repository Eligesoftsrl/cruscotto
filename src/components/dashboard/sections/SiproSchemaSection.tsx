import { useState, useMemo } from "react";
import { siproTables, type TableDef } from "@/data/siproSchema";
import {
  Database,
  Table2,
  Key,
  ArrowRight,
  Search,
  ChevronDown,
  ChevronRight,
  Link2,
  Shield,
  Layers,
} from "lucide-react";

const categoryMeta: Record<string, { label: string; color: string; icon: typeof Database }> = {
  lookup: { label: "Lookup (lk_)", color: "hsl(var(--chart-blue))", icon: Layers },
  fact: { label: "Fact (ft_)", color: "hsl(var(--chart-teal))", icon: Table2 },
  system: { label: "Sistema", color: "hsl(var(--chart-orange))", icon: Shield },
};

const typeColor = (t: string) => {
  if (t.startsWith("int") || t.startsWith("float")) return "hsl(var(--chart-blue))";
  if (t.startsWith("varchar") || t === "text" || t.startsWith("bpchar"))
    return "hsl(var(--chart-teal))";
  if (t === "timestamp") return "hsl(var(--chart-purple))";
  return "hsl(var(--muted-foreground))";
};

export const SiproSchemaSection = () => {
  const [search, setSearch] = useState("");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    new Set(["lookup", "fact", "system"]),
  );

  const filtered = useMemo(() => {
    if (!search) return siproTables;
    const q = search.toLowerCase();
    return siproTables.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.columns.some((c) => c.name.toLowerCase().includes(q)),
    );
  }, [search]);

  const grouped = useMemo(() => {
    const g: Record<string, TableDef[]> = { lookup: [], fact: [], system: [] };
    filtered.forEach((t) => g[t.category].push(t));
    return g;
  }, [filtered]);

  const selected = selectedTable ? siproTables.find((t) => t.name === selectedTable) : null;

  const toggleCat = (cat: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Stats
  const totalTables = siproTables.length;
  const totalColumns = siproTables.reduce((s, t) => s + t.columns.length, 0);
  const totalFKs = siproTables.reduce((s, t) => s + t.foreignKeys.length, 0);

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-12 gap-3">
        {[
          {
            label: "Tabelle totali",
            value: totalTables,
            icon: Database,
            color: "hsl(var(--chart-blue))",
          },
          {
            label: "Colonne totali",
            value: totalColumns,
            icon: Table2,
            color: "hsl(var(--chart-teal))",
          },
          {
            label: "Foreign Keys",
            value: totalFKs,
            icon: Link2,
            color: "hsl(var(--chart-orange))",
          },
          { label: "Schema", value: "gru_test", icon: Shield, color: "hsl(var(--chart-purple))" },
        ].map((k, i) => (
          <div key={i} className="col-span-3 bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {k.label}
              </div>
              <k.icon className="h-4 w-4" style={{ color: k.color }} />
            </div>
            <div className="text-xl font-bold text-foreground mt-1">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Left: table list */}
        <div className="col-span-4 bg-card border rounded-lg flex flex-col max-h-[calc(100vh-220px)]">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cerca tabella o colonna..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-[12px] rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2">
            {(["lookup", "fact", "system"] as const).map((cat) => {
              const tables = grouped[cat];
              if (tables.length === 0) return null;
              const meta = categoryMeta[cat];
              const isExpanded = expandedCats.has(cat);

              return (
                <div key={cat} className="mb-1">
                  <button
                    onClick={() => toggleCat(cat)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                    <meta.icon className="h-3 w-3" style={{ color: meta.color }} />
                    <span>{meta.label}</span>
                    <span className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded">
                      {tables.length}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="ml-2">
                      {tables.map((t) => (
                        <button
                          key={t.name}
                          onClick={() => setSelectedTable(t.name)}
                          className={`flex items-center gap-2 w-full px-2 py-1.5 text-[11px] rounded transition-all ${
                            selectedTable === t.name
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }`}
                        >
                          <Table2 className="h-3 w-3 flex-shrink-0" style={{ color: meta.color }} />
                          <span className="truncate">{t.name}</span>
                          <span className="ml-auto text-[9px] opacity-60">
                            {t.columns.length} col
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: table detail */}
        <div className="col-span-8 bg-card border rounded-lg max-h-[calc(100vh-220px)] overflow-y-auto">
          {selected ? (
            <div>
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white"
                    style={{ background: categoryMeta[selected.category].color }}
                  >
                    {selected.category}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{selected.schema}</span>
                </div>
                <h2 className="text-base font-bold text-foreground">{selected.name}</h2>
                <p className="text-[11px] text-muted-foreground mt-1">{selected.description}</p>
                <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
                  <span>{selected.columns.length} colonne</span>
                  <span>{selected.columns.filter((c) => c.pk).length} PK</span>
                  <span>{selected.foreignKeys.length} FK</span>
                  <span>{selected.columns.filter((c) => !c.nullable).length} NOT NULL</span>
                </div>
              </div>

              {/* Columns table */}
              <div className="p-4">
                <h3 className="text-xs font-semibold text-foreground mb-2">Colonne</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 py-2 text-left text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">
                          Nome
                        </th>
                        <th className="px-3 py-2 text-left text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">
                          Tipo
                        </th>
                        <th className="px-3 py-2 text-center text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">
                          PK
                        </th>
                        <th className="px-3 py-2 text-center text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">
                          NULL
                        </th>
                        <th className="px-3 py-2 text-left text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">
                          Default
                        </th>
                        <th className="px-3 py-2 text-left text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">
                          FK →
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.columns.map((col) => {
                        const fk = selected.foreignKeys.find((f) => f.column === col.name);
                        return (
                          <tr
                            key={col.name}
                            className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-3 py-2 font-mono font-medium text-foreground">
                              <div className="flex items-center gap-1.5">
                                {col.pk && (
                                  <Key
                                    className="h-3 w-3 flex-shrink-0"
                                    style={{ color: "hsl(var(--chart-orange))" }}
                                  />
                                )}
                                {fk && !col.pk && (
                                  <Link2
                                    className="h-3 w-3 flex-shrink-0"
                                    style={{ color: "hsl(var(--chart-blue))" }}
                                  />
                                )}
                                {col.name}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className="font-mono px-1.5 py-0.5 rounded text-[10px]"
                                style={{
                                  color: typeColor(col.type),
                                  background: "hsl(var(--muted))",
                                }}
                              >
                                {col.type}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              {col.pk && (
                                <span
                                  className="inline-block w-4 h-4 leading-4 rounded text-[8px] font-bold text-white"
                                  style={{ background: "hsl(var(--chart-orange))" }}
                                >
                                  PK
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span
                                className={
                                  col.nullable
                                    ? "text-muted-foreground"
                                    : "font-semibold text-foreground"
                                }
                              >
                                {col.nullable ? "✓" : "✗"}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">
                              {col.defaultVal || "—"}
                            </td>
                            <td className="px-3 py-2">
                              {fk ? (
                                <button
                                  onClick={() => setSelectedTable(fk.refTable)}
                                  className="flex items-center gap-1 text-[10px] hover:underline"
                                  style={{ color: "hsl(var(--chart-blue))" }}
                                >
                                  <ArrowRight className="h-2.5 w-2.5" />
                                  {fk.refTable}.{fk.refColumn}
                                </button>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FK summary */}
              {selected.foreignKeys.length > 0 && (
                <div className="px-4 pb-4">
                  <h3 className="text-xs font-semibold text-foreground mb-2">
                    Relazioni (Foreign Keys)
                  </h3>
                  <div className="space-y-1.5">
                    {selected.foreignKeys.map((fk, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-[11px] bg-muted/30 rounded px-3 py-1.5"
                      >
                        <span className="font-mono text-foreground">{fk.column}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <button
                          onClick={() => setSelectedTable(fk.refTable)}
                          className="font-mono hover:underline"
                          style={{ color: "hsl(var(--chart-blue))" }}
                        >
                          {fk.refTable}
                        </button>
                        <span className="text-muted-foreground">({fk.refColumn})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Referenced by */}
              {(() => {
                const refs = siproTables.filter((t) =>
                  t.foreignKeys.some((f) => f.refTable === selected.name),
                );
                if (refs.length === 0) return null;
                return (
                  <div className="px-4 pb-4">
                    <h3 className="text-xs font-semibold text-foreground mb-2">Referenziata da</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {refs.map((r) => (
                        <button
                          key={r.name}
                          onClick={() => setSelectedTable(r.name)}
                          className="text-[10px] px-2 py-1 rounded border border-border hover:bg-muted/50 transition-colors text-foreground"
                        >
                          {r.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <Database className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Seleziona una tabella</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">
                  Clicca su una tabella nella lista per vederne la struttura
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
