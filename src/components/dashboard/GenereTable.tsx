const rows = [
  { fascia: "≤ 25", uomini: 90, donne: 72, totale: 162, percDonne: "44%", delta: "−5 pp", deltaType: "down" as const },
  { fascia: "26–35", uomini: 280, donne: 350, totale: 630, percDonne: "56%", delta: "+3 pp", deltaType: "up" as const },
  { fascia: "36–45", uomini: 860, donne: 960, totale: 1820, percDonne: "53%", delta: "+1 pp", deltaType: "up" as const },
  { fascia: "46–55", uomini: 2380, donne: 2680, totale: 5060, percDonne: "53%", delta: "–", deltaType: "neutral" as const },
  { fascia: "56–60", uomini: 1720, donne: 1840, totale: 3560, percDonne: "52%", delta: "−2 pp", deltaType: "down" as const },
  { fascia: "> 60", uomini: 960, donne: 1120, totale: 2080, percDonne: "54%", delta: "+2 pp", deltaType: "up" as const },
];

const totalRow = {
  fascia: "Totale",
  uomini: 6290,
  donne: 7022,
  totale: 13312,
  percDonne: "53%",
  delta: "–",
};

const fmt = (n: number) => n.toLocaleString("it-IT");

export const GenereTable = () => {
  return (
    <div className="bg-card border rounded-lg flex flex-col col-span-6">
      <div className="px-4 py-3 border-b">
        <div className="text-[13px] font-semibold text-foreground">Analisi per genere e fascia d'età</div>
        <div className="text-[10.5px] text-muted-foreground/60 mt-0.5">Anno 2023 · quota donne per fascia</div>
      </div>
      <div className="flex-1 px-4 py-3">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr>
              {["Fascia d'età", "Uomini", "Donne", "Totale", "% Donne", "Δ PA"].map((h) => (
                <th
                  key={h}
                  className="py-[5px] px-2 text-left text-[10px] text-muted-foreground/60 uppercase tracking-wide font-semibold border-b-2"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.fascia} className="hover:bg-secondary/50 transition-colors">
                <td className="py-1.5 px-2 border-b text-muted-foreground">{r.fascia}</td>
                <td className="py-1.5 px-2 border-b text-muted-foreground">{fmt(r.uomini)}</td>
                <td className="py-1.5 px-2 border-b text-muted-foreground">{fmt(r.donne)}</td>
                <td className="py-1.5 px-2 border-b text-muted-foreground">{fmt(r.totale)}</td>
                <td className="py-1.5 px-2 border-b text-muted-foreground">{r.percDonne}</td>
                <td className="py-1.5 px-2 border-b">
                  {r.delta === "–" ? (
                    <span className="text-muted-foreground">–</span>
                  ) : (
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        r.deltaType === "up"
                          ? "bg-red-50 text-destructive"
                          : "bg-green-50"
                      }`}
                      style={
                        r.deltaType === "down"
                          ? { color: "hsl(var(--chart-green))" }
                          : undefined
                      }
                    >
                      {r.delta}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {/* Total row */}
            <tr className="font-semibold bg-secondary/50">
              <td className="py-1.5 px-2 border-b text-foreground">{totalRow.fascia}</td>
              <td className="py-1.5 px-2 border-b text-foreground">{fmt(totalRow.uomini)}</td>
              <td className="py-1.5 px-2 border-b text-foreground">{fmt(totalRow.donne)}</td>
              <td className="py-1.5 px-2 border-b text-foreground">{fmt(totalRow.totale)}</td>
              <td className="py-1.5 px-2 border-b">
                <strong className="text-primary">{totalRow.percDonne}</strong>
              </td>
              <td className="py-1.5 px-2 border-b text-muted-foreground">–</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
