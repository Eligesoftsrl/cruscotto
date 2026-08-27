import { useEffect, useState } from "react";
import { useFilteredEnteIds } from "@/hooks/useFilteredEnteIds";
import { fetchInpaBandi } from "@/services/dw/inpaService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Cell,
} from "recharts";
import { PaginatedTable } from "@/components/dashboard/charts/PaginatedTable";

/**
 * Sezione ridefinita: Focus sulla Saturazione dei bandi
 * Identifica bandi critici per eccesso o difetto di candidature
 */
export const InpaEfficaciaSection = () => {
  const { data: enteIds } = useFilteredEnteIds();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const bandi = await fetchInpaBandi(enteIds);
      if (!bandi) return;

      const mapped = bandi
        .filter((b: any) => (b.num_posti ?? 0) > 0)
        .map((b: any) => {
          const cands = b.num_candidature_submitted ?? 0;
          const posti = b.num_posti ?? 0;
          const saturazione = posti > 0 ? Math.round((cands / posti) * 100) : 0;
          const classe =
            saturazione > 500
              ? "Critico"
              : saturazione > 200
                ? "Sovrasaturo"
                : saturazione >= 50
                  ? "Equilibrato"
                  : "Sottosaturo";
          return {
            titolo: (b.figura_ricercata ?? b.codice ?? "N/D").substring(0, 22),
            regione: b.regione ?? "-",
            tipo: b.tipo_procedura ?? "-",
            candidature: cands,
            posti,
            saturazione,
            classe,
          };
        })
        .sort((a, b) => b.saturazione - a.saturazione);
      setData(mapped);
    };
    load();
  }, [enteIds]);

  const classi = { Critico: 0, Sovrasaturo: 0, Equilibrato: 0, Sottosaturo: 0 };
  data.forEach((d) => {
    if (d.classe in classi) classi[d.classe as keyof typeof classi]++;
  });
  const totale = data.length;

  const classColors: Record<string, string> = {
    Critico: "hsl(0,70%,55%)",
    Sovrasaturo: "hsl(30,85%,55%)",
    Equilibrato: "hsl(150,60%,40%)",
    Sottosaturo: "hsl(210,80%,45%)",
  };

  const distribuzione = Object.entries(classi).map(([name, value]) => ({
    name,
    value,
    pct: totale > 0 ? +((value / totale) * 100).toFixed(1) : 0,
  }));

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {distribuzione.map((d) => (
          <div key={d.name} className="tableau-card">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: classColors[d.name] }}>
                {d.value}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">{d.name}</div>
              <div className="text-[9px] text-muted-foreground/60 mt-0.5">{d.pct}% dei bandi</div>
            </div>
          </div>
        ))}
      </div>

      <div className="tableau-card">
        <div className="tableau-card-header">
          Saturazione Bandi (Candidature / Posti × 100)
          <span className="ml-2 text-[10px] font-normal text-muted-foreground">
            &lt;50% = Sottosaturo · 50-200% = Equilibrato · 200-500% = Sovrasaturo · &gt;500% =
            Critico
          </span>
        </div>
        <div className="p-4" style={{ height: 380 }}>
          <ResponsiveContainer>
            <BarChart data={data.slice(0, 20)} layout="vertical" margin={{ left: 130 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tableau-grid))" />
              <XAxis type="number" tick={{ fontSize: 11 }} unit="%" />
              <YAxis type="category" dataKey="titolo" tick={{ fontSize: 10 }} width={120} />
              <Tooltip formatter={(v: any) => `${v}%`} />
              <ReferenceLine
                x={100}
                stroke="hsl(var(--foreground))"
                strokeDasharray="5 5"
                label={{ value: "100%", fontSize: 10 }}
              />
              <Bar dataKey="saturazione" name="Saturazione %">
                {data.slice(0, 20).map((entry, i) => (
                  <Cell key={i} fill={classColors[entry.classe] ?? "hsl(210,80%,45%)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tableau-card">
        <div className="tableau-card-header">Dettaglio Bandi per Classe di Saturazione</div>
        <div className="p-4">
          <PaginatedTable
            data={data}
            columns={[
              { key: "titolo", header: "Figura" },
              { key: "regione", header: "Regione" },
              { key: "tipo", header: "Tipo" },
              { key: "posti", header: "Posti", align: "right" },
              { key: "candidature", header: "Candidature", align: "right" },
              {
                key: "saturazione",
                header: "Saturazione %",
                align: "right",
                render: (r: any) => (
                  <span className="font-semibold" style={{ color: classColors[r.classe] }}>
                    {r.saturazione}%
                  </span>
                ),
              },
              {
                key: "classe",
                header: "Classe",
                render: (r: any) => (
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: classColors[r.classe] + "20",
                      color: classColors[r.classe],
                    }}
                  >
                    {r.classe}
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
