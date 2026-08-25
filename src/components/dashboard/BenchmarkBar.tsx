interface BenchmarkItem {
  label: string;
  amministrazione: number;
  cluster: number;
  complesso: number;
  suffix?: string;
}

interface BenchmarkBarProps {
  items: BenchmarkItem[];
}

export const BenchmarkBar = ({ items }: BenchmarkBarProps) => {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="section-title">Benchmarking</h3>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-chart-blue" />
            Tua amministrazione
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-chart-teal" />
            Cluster
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            Complesso PA
          </span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {items.map(item => (
          <div key={item.label} className="rounded-lg border bg-background p-3">
            <p className="mb-2 text-[11px] font-medium text-muted-foreground">{item.label}</p>
            <div className="space-y-1.5">
              {[
                { v: item.amministrazione, color: "bg-chart-blue", label: "Tua" },
                { v: item.cluster, color: "bg-chart-teal", label: "Cluster" },
                { v: item.complesso, color: "bg-muted-foreground/30", label: "PA" },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-2">
                  <div className="w-full rounded-full bg-muted h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${row.color}`}
                      style={{ width: `${Math.min((row.v / Math.max(item.amministrazione, item.cluster, item.complesso)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="min-w-[3.5rem] text-right text-xs font-semibold text-foreground">
                    {row.v}{item.suffix || ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
