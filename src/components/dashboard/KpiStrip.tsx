const kpis = [
  {
    label: "Personale in servizio",
    value: "12.847",
    unit: "",
    change: "▲ −2,3% vs 2022",
    changeType: "up" as const,
    mini: [
      { label: "Min storico", value: "12.104" },
      { label: "Max", value: "16.230" },
    ],
    color: "hsl(var(--chart-blue))",
  },
  {
    label: "Età media",
    value: "51,2",
    unit: " anni",
    change: "▲ +0,8 aa vs 2022",
    changeType: "up" as const,
    mini: [
      { label: "Cluster", value: "50,4" },
      { label: "Totale PA", value: "49,8" },
    ],
    color: "hsl(var(--chart-orange))",
  },
  {
    label: "Quota over 55",
    value: "48",
    unit: "%",
    change: "▲ +2,1 pp vs 2022",
    changeType: "up" as const,
    mini: [
      { label: "Cluster", value: "44%" },
      { label: "Gap", value: "+4 pp", highlight: true },
    ],
    color: "hsl(var(--chart-red))",
  },
  {
    label: "Quota under 35",
    value: "7",
    unit: "%",
    change: "▼ −0,6 pp vs 2022",
    changeType: "down" as const,
    mini: [
      { label: "Cluster", value: "10%" },
      { label: "Gap", value: "−3 pp", highlight: true },
    ],
    color: "hsl(var(--chart-green))",
  },
  {
    label: "Anzianità media",
    value: "19,3",
    unit: " aa",
    change: "→ +0,2 aa vs 2022",
    changeType: "neutral" as const,
    mini: [
      { label: "Cluster", value: "18,1" },
      { label: "PA", value: "17,8" },
    ],
    color: "hsl(var(--chart-purple))",
  },
];

export const KpiStrip = () => {
  return (
    <div className="col-span-12 grid grid-cols-5 gap-2.5">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="bg-card border rounded-lg px-4 pt-3.5 pb-3 relative overflow-hidden"
        >
          {/* Left accent bar */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
            style={{ background: kpi.color }}
          />

          <div className="pl-2">
            <div className="text-[10.5px] text-muted-foreground font-medium">{kpi.label}</div>
            <div className="text-[28px] font-bold leading-tight mt-1.5 mb-1 font-mono">
              {kpi.value}
              {kpi.unit && (
                <span className="text-sm font-normal text-muted-foreground font-sans">
                  {kpi.unit}
                </span>
              )}
            </div>
            <div
              className={`text-[11px] flex items-center gap-1 ${
                kpi.changeType === "up"
                  ? "text-destructive"
                  : kpi.changeType === "down"
                    ? "text-chart-green"
                    : "text-muted-foreground"
              }`}
              style={{
                color:
                  kpi.changeType === "up"
                    ? "hsl(var(--kpi-up))"
                    : kpi.changeType === "down"
                      ? "hsl(var(--kpi-down))"
                      : "hsl(var(--kpi-neutral))",
              }}
            >
              {kpi.change}
            </div>

            {/* Mini comparison */}
            <div className="flex justify-between mt-2 pt-2 border-t">
              {kpi.mini.map((m) => (
                <div key={m.label} className="text-[10px] text-muted-foreground/60">
                  {m.label}{" "}
                  <strong
                    className={m.highlight ? "text-destructive" : "text-muted-foreground"}
                    style={m.highlight ? { color: "hsl(var(--kpi-up))" } : undefined}
                  >
                    {m.value}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
