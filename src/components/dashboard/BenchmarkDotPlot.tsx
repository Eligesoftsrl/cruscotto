import { useState } from "react";

const views = ["Comparto", "Tipo amm.", "Regione"] as const;

const compartoData = [
  { label: "Amm. Centrali", value: 50.8, position: 50, isHighlighted: false },
  { label: "Enti Ricerca/Univ.", value: 48.2, position: 38, isHighlighted: false },
  { label: "Reg./Prov./Comuni", value: 51.2, position: 55, isHighlighted: true },
  { label: "Piccoli Comuni", value: 53.4, position: 73, isHighlighted: false },
  { label: "Enti Previdenziali", value: 49.9, position: 46, isHighlighted: false },
  { label: "SSN", value: 47.0, position: 28, isHighlighted: false },
];

export const BenchmarkDotPlot = () => {
  const [activeView, setActiveView] = useState<string>(views[0]);

  return (
    <div className="bg-card border rounded-lg flex flex-col col-span-6">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <div className="text-[13px] font-semibold text-foreground">Benchmarking età media</div>
          <div className="text-[10.5px] text-muted-foreground/60 mt-0.5">
            Anno 2023 · ● questa amm. ○ cluster
          </div>
        </div>
        <div className="flex gap-1">
          {views.map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`px-2 py-[3px] text-[10.5px] rounded border transition-colors ${
                activeView === v
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 px-4 py-3">
        {/* Legend */}
        <div className="flex gap-3 mb-2">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(var(--chart-blue))" }} />
            Valore comparto
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span
              className="w-2.5 h-2.5 rounded-full border-2"
              style={{ borderColor: "hsl(var(--chart-red))" }}
            />
            Questa amm.
          </div>
        </div>

        <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-semibold mb-1.5">
          Età media per comparto
        </div>

        <div className="space-y-[7px]">
          {compartoData.map((row) => (
            <div key={row.label} className="flex items-center gap-1.5">
              <div
                className={`text-[11px] w-[120px] shrink-0 ${
                  row.isHighlighted ? "text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                {row.label} {row.isHighlighted && "←"}
              </div>
              <div className="flex-1 h-px bg-border relative">
                {/* Dot */}
                <div
                  className="absolute w-2.5 h-2.5 rounded-full -top-[4.5px]"
                  style={{
                    left: `${row.position}%`,
                    transform: "translateX(-50%)",
                    background: row.isHighlighted
                      ? "hsl(var(--chart-red))"
                      : "hsl(var(--chart-blue))",
                  }}
                />
                {/* Reference circle for admin */}
                <div
                  className="absolute w-3 h-3 rounded-full border-2 -top-[5.5px]"
                  style={{
                    left: "55%",
                    transform: "translateX(-50%)",
                    borderColor: row.isHighlighted
                      ? "hsl(var(--chart-red))"
                      : "hsl(var(--chart-red))",
                    background: "transparent",
                  }}
                />
              </div>
              <div
                className={`text-[10.5px] ml-1.5 w-[35px] shrink-0 ${
                  row.isHighlighted ? "text-destructive font-semibold" : "text-muted-foreground"
                }`}
                style={row.isHighlighted ? { color: "hsl(var(--chart-red))" } : undefined}
              >
                {row.value}
              </div>
            </div>
          ))}
        </div>

        <div className="text-[10px] text-muted-foreground/50 mt-2">
          Scale: 44 anni ←————————→ 56 anni
        </div>
      </div>
    </div>
  );
};
