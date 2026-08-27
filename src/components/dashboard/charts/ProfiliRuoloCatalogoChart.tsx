import { useEffect, useState } from "react";
import { sipoFrom } from "@/services/dw/siproService";
import { Loader2 } from "lucide-react";
import { SiproFilters, type SiproFilterValues, effectiveEnteIds } from "./SiproFilters";
import { useAuth } from "@/contexts/AuthContext";
import { PaginatedTable } from "./PaginatedTable";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";

const TEAL = "hsl(175,60%,50%)";
const DARK = "hsl(220,20%,20%)";
const BLUE = "hsl(210,64%,50%)";
const PINK = "hsl(330,60%,55%)";
const COLORS = [TEAL, DARK, BLUE, PINK, "hsl(38,80%,55%)", "hsl(280,50%,55%)"];

interface ProfileRow {
  famiglia: string;
  ambito: string;
  areaContrattuale: string;
  profiloRuolo: string;
  origine: string;
  fteProgrammati: number;
  fteAssegnati: number;
}

export const ProfiliRuoloCatalogoChart = () => {
  const { profile } = useAuth();
  const initialEnteId = profile?.role === "ente_hr" ? profile.ente_id : null;
  const [filters, setFilters] = useState<SiproFilterValues>({ enteId: initialEnteId, enteIds: [] });
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const ids = effectiveEnteIds(filters);

      let profQ = sipoFrom("lk_sipo_profili_di_ruolo")
        .select(
          "profilo_ruolo_id, profilo_ruolo, ente_id, id_minerva_profilo_professionale, id_famiglia_professionale, id_ambito_ruolo, id_area_contrattuale",
        )
        .is("data_eliminazione", null);
      if (ids.length === 1) profQ = profQ.eq("ente_id", ids[0]);
      else if (ids.length > 1) profQ = profQ.in("ente_id", ids);

      const [profRes, famRes, ambitoRes, areaRes, fteRes] = await Promise.all([
        profQ,
        sipoFrom("lk_minerva_famiglia_professionale").select("id, descrizione"),
        sipoFrom("lk_minerva_ambito_ruolo").select("id, descrizione"),
        sipoFrom("lk_minerva_area_contrattuale").select("id, descrizione"),
        sipoFrom("ft_sipo_profili_di_ruolo_fasi").select(
          "sipo_profilo_di_ruolo_id, fte_programmati, fte_assegnati",
        ),
      ]);

      if (!profRes.data) {
        setLoading(false);
        return;
      }

      const famMap = new Map((famRes.data ?? []).map((f: any) => [f.id, f.descrizione]));
      const ambMap = new Map((ambitoRes.data ?? []).map((a: any) => [a.id, a.descrizione]));
      const areaMap = new Map((areaRes.data ?? []).map((a: any) => [a.id, a.descrizione]));

      // Aggregate FTE by profilo_ruolo_id
      const fteByProfile = new Map<number, { prog: number; ass: number }>();
      for (const f of (fteRes.data ?? []) as any[]) {
        if (f.sipo_profilo_di_ruolo_id == null) continue;
        const cur = fteByProfile.get(f.sipo_profilo_di_ruolo_id) || { prog: 0, ass: 0 };
        cur.prog += f.fte_programmati || 0;
        cur.ass += f.fte_assegnati || 0;
        fteByProfile.set(f.sipo_profilo_di_ruolo_id, cur);
      }

      const tableRows: ProfileRow[] = (profRes.data as any[]).map((p) => {
        const fte = fteByProfile.get(p.profilo_ruolo_id) || { prog: 0, ass: 0 };
        return {
          famiglia: famMap.get(p.id_famiglia_professionale) || "—",
          ambito: ambMap.get(p.id_ambito_ruolo) || "—",
          areaContrattuale: areaMap.get(p.id_area_contrattuale) || "—",
          profiloRuolo: p.profilo_ruolo,
          origine: p.id_minerva_profilo_professionale ? "Minerva" : "SIPrO",
          fteProgrammati: Math.round(fte.prog * 10) / 10,
          fteAssegnati: Math.round(fte.ass * 10) / 10,
        };
      });

      setRows(tableRows.sort((a, b) => a.famiglia.localeCompare(b.famiglia)));
      setLoading(false);
    };
    load();
  }, [filters]);

  if (loading) {
    return (
      <div className="space-y-4">
        <SiproFilters value={filters} onChange={setFilters} />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // --- Aggregations for charts ---
  const minervaCount = rows.filter((r) => r.origine === "Minerva").length;
  const siproCount = rows.filter((r) => r.origine === "SIPrO").length;
  const originData = [
    { name: "Minerva", value: minervaCount },
    { name: "SIPrO", value: siproCount },
  ].filter((d) => d.value > 0);

  const countBy = (key: keyof ProfileRow) => {
    const map: Record<string, number> = {};
    for (const r of rows) {
      const k = r[key] as string;
      map[k] = (map[k] || 0) + 1;
    }
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({
        name: name.length > 25 ? name.substring(0, 23) + "…" : name,
        value,
      }));
  };

  const famigliaData = countBy("famiglia");
  const ambitoData = countBy("ambito");

  const distData = [
    { name: "Profili di ruolo", value: rows.length },
    { name: "Famiglia Prof.", value: new Set(rows.map((r) => r.famiglia)).size },
    { name: "Ambito di Ruolo", value: new Set(rows.map((r) => r.ambito)).size },
    { name: "Area contrattuale", value: new Set(rows.map((r) => r.areaContrattuale)).size },
  ];

  const columns = [
    {
      key: "famiglia",
      header: "Famiglia professionale",
      render: (r: ProfileRow) => (
        <span className="font-medium text-foreground text-[11px] max-w-[140px] block">
          {r.famiglia}
        </span>
      ),
    },
    {
      key: "ambito",
      header: "Ambito",
      render: (r: ProfileRow) => (
        <span className="text-muted-foreground text-[11px] max-w-[140px] block">{r.ambito}</span>
      ),
    },
    {
      key: "areaContrattuale",
      header: "Area contrattuale",
      render: (r: ProfileRow) => (
        <span className="text-muted-foreground text-[11px]">{r.areaContrattuale}</span>
      ),
    },
    {
      key: "profiloRuolo",
      header: "Profilo di ruolo",
      render: (r: ProfileRow) => (
        <span className="text-foreground text-[11px] max-w-[180px] block">{r.profiloRuolo}</span>
      ),
    },
    {
      key: "origine",
      header: "Origine",
      align: "center" as const,
      render: (r: ProfileRow) => (
        <span className="text-muted-foreground text-[11px]">{r.origine}</span>
      ),
    },
    {
      key: "fteProgrammati",
      header: "Risorse progr.",
      align: "right" as const,
      render: (r: ProfileRow) => <span className="text-muted-foreground">{r.fteProgrammati}</span>,
    },
    {
      key: "fteAssegnati",
      header: "Risorse in servizio",
      align: "right" as const,
      render: (r: ProfileRow) => <span className="text-muted-foreground">{r.fteAssegnati}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <SiproFilters value={filters} onChange={setFilters} />

      {/* Distribution charts */}
      <div className="bg-card border rounded-xl p-5 space-y-3">
        <h3 className="text-[15px] font-bold text-foreground">
          Distribuzione dei Profili di Ruolo per Origine e Famiglia professionale
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground text-center mb-2">
              Per origine (Minerva, SIPrO)
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={originData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine
                >
                  {originData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground text-center mb-2">
              Per famiglia professionale, ambito, area e profilo
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={distData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="value"
                  name="Conteggio"
                  fill={TEAL}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                >
                  <LabelList
                    dataKey="value"
                    position="top"
                    style={{ fontSize: 11, fontWeight: 700, fill: "hsl(var(--foreground))" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Per Famiglia and Ambito */}
      <div className="bg-card border rounded-xl p-5 space-y-3">
        <h3 className="text-[15px] font-bold text-foreground">
          Dettaglio per Famiglia professionale e Ambito di Ruolo
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground text-center mb-2">
              Per famiglia professionale
            </p>
            <ResponsiveContainer width="100%" height={Math.max(200, famigliaData.length * 32)}>
              <BarChart
                data={famigliaData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  tick={{ fontSize: 9 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="value"
                  name="Profili"
                  fill={TEAL}
                  radius={[0, 4, 4, 0]}
                  maxBarSize={24}
                >
                  <LabelList
                    dataKey="value"
                    position="insideRight"
                    style={{ fontSize: 11, fontWeight: 700, fill: "#fff" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground text-center mb-2">
              Per ambito di ruolo
            </p>
            <ResponsiveContainer width="100%" height={Math.max(200, ambitoData.length * 32)}>
              <BarChart
                data={ambitoData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  tick={{ fontSize: 9 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="value"
                  name="Profili"
                  fill={BLUE}
                  radius={[0, 4, 4, 0]}
                  maxBarSize={24}
                >
                  <LabelList
                    dataKey="value"
                    position="insideRight"
                    style={{ fontSize: 11, fontWeight: 700, fill: "#fff" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Resources table */}
      <div className="bg-card border rounded-xl p-5 space-y-3">
        <h3 className="text-[15px] font-bold text-foreground">
          Risorse programmate e assegnate per i profili di ruolo
        </h3>
        <p className="text-xs text-muted-foreground">
          Dettaglio delle risorse programmate (PIAO/PEG) e delle risorse effettivamente in servizio
          per ciascun profilo di ruolo.
        </p>
        <PaginatedTable data={rows} columns={columns} pageSize={10} />
      </div>
    </div>
  );
};
