import { useEffect, useState } from "react";
import { useFilteredEnteIds } from "@/hooks/useFilteredEnteIds";
import { fetchInpaBandiWithScadenza } from "@/services/dw/inpaService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export const InpaDurataSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [data, setData] = useState<any[]>([]);
  const [avg, setAvg] = useState(0);

  useEffect(() => {
    const load = async () => {
      const bandi = await fetchInpaBandiWithScadenza(enteIds);
      if (!bandi) return;

      const mapped = bandi.filter((b: any) => b.data_pubblicazione && b.data_scadenza).map((b: any) => {
        const pub = new Date(b.data_pubblicazione);
        const scad = new Date(b.data_scadenza);
        const durata = Math.round((scad.getTime() - pub.getTime()) / 86400000);
        return {
          titolo: (b.figura_ricercata ?? b.codice ?? "N/D").substring(0, 25),
          regione: b.regione ?? "-",
          durata: Math.max(0, durata),
        };
      }).filter(d => d.durata > 0);
      setData(mapped.sort((a, b) => b.durata - a.durata));
      if (mapped.length) setAvg(Math.round(mapped.reduce((s, d) => s + d.durata, 0) / mapped.length));
    };
    load();
  }, [enteIds]);

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="tableau-card"><div className="p-4 text-center"><div className="text-2xl font-bold">{avg}</div><div className="text-[11px] text-muted-foreground">Durata Media (gg)</div></div></div>
        <div className="tableau-card"><div className="p-4 text-center"><div className="text-2xl font-bold">{data.length ? Math.min(...data.map(d => d.durata)) : "-"}</div><div className="text-[11px] text-muted-foreground">Durata Minima (gg)</div></div></div>
        <div className="tableau-card"><div className="p-4 text-center"><div className="text-2xl font-bold">{data.length ? Math.max(...data.map(d => d.durata)) : "-"}</div><div className="text-[11px] text-muted-foreground">Durata Massima (gg)</div></div></div>
      </div>
      <div className="tableau-card">
        <div className="tableau-card-header">Durata Bandi (Pubblicazione → Scadenza)</div>
        <div className="p-4" style={{ height: 380 }}>
          <ResponsiveContainer>
            <BarChart data={data.slice(0, 20)} layout="vertical" margin={{ left: 140 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis type="number" tick={{ fontSize: 11 }} label={{ value: "Giorni", position: "bottom", fontSize: 11 }} />
              <YAxis type="category" dataKey="titolo" tick={{ fontSize: 10 }} width={130} />
              <Tooltip />
              <ReferenceLine x={avg} stroke="hsl(0,70%,55%)" strokeDasharray="5 5" label={{ value: `Media: ${avg}gg`, fontSize: 10 }} />
              <Bar dataKey="durata" name="Durata (gg)" fill="hsl(210,80%,45%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
