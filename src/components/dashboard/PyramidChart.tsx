const rows = [
  { fascia: "≤ 25", uomini: 90, donne: 72 },
  { fascia: "26–35", uomini: 280, donne: 350 },
  { fascia: "36–45", uomini: 860, donne: 960 },
  { fascia: "46–55", uomini: 2380, donne: 2680 },
  { fascia: "56–60", uomini: 1720, donne: 1840 },
  { fascia: "> 60", uomini: 960, donne: 1120 },
];

const maxVal = Math.max(...rows.map((r) => Math.max(r.uomini, r.donne)));

export const PyramidChart = () => {
  return (
    <div className="bg-card border rounded-lg flex flex-col col-span-5">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <div className="text-[13px] font-semibold text-foreground">Piramide per età e genere</div>
          <div className="text-[10.5px] text-muted-foreground/60 mt-0.5">Anno 2023 · distribuzione</div>
        </div>
      </div>
      <div className="flex-1 px-4 py-3">
        {/* Legend */}
        <div className="flex gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(var(--chart-blue))" }} />
            Uomini
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(var(--chart-orange))" }} />
            Donne
          </div>
        </div>

        {/* Header row */}
        <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: "60px 1fr 50px 1fr 60px" }}>
          <div className="text-[9px] text-muted-foreground/50 text-center">Uomini</div>
          <div />
          <div className="text-[9px] text-muted-foreground/50 text-center">Fascia</div>
          <div />
          <div className="text-[9px] text-muted-foreground/50 text-center">Donne</div>
        </div>

        {/* Data rows */}
        {rows.map((row) => (
          <div
            key={row.fascia}
            className="grid gap-1 mb-[5px] items-center"
            style={{ gridTemplateColumns: "60px 1fr 50px 1fr 60px" }}
          >
            <div className="text-[10px] text-muted-foreground text-right">{row.uomini.toLocaleString("it-IT")}</div>
            <div className="flex justify-end">
              <div
                className="h-4 rounded-sm"
                style={{
                  width: `${(row.uomini / maxVal) * 100}%`,
                  background: "hsl(var(--chart-blue))",
                }}
              />
            </div>
            <div className="text-[10px] text-muted-foreground/60 text-center whitespace-nowrap">{row.fascia}</div>
            <div className="flex justify-start">
              <div
                className="h-4 rounded-sm"
                style={{
                  width: `${(row.donne / maxVal) * 100}%`,
                  background: "hsl(var(--chart-orange))",
                }}
              />
            </div>
            <div className="text-[10px] text-muted-foreground">{row.donne.toLocaleString("it-IT")}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
