import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { SiproFilters, type SiproFilterValues, effectiveEnteIds } from "./SiproFilters";
import { useAuth } from "@/contexts/AuthContext";
import { PaginatedTable } from "./PaginatedTable";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  PieChart, Pie,
} from "recharts";

const TEAL = "hsl(175,60%,50%)";
const DARK = "hsl(0,0%,35%)";

interface TempoRow { name: string; previsto: number; effettivo: number }
interface FreqRow { name: string; value: number }

export const TempiPicchiChart = () => {
  const { profile } = useAuth();
  const initialEnteId = profile?.role === "ente_hr" ? profile.ente_id : null;
  const [filters, setFilters] = useState<SiproFilterValues>({ enteId: initialEnteId, enteIds: [] });
  const [tempi, setTempi] = useState<TempoRow[]>([]);
  const [freqData, setFreqData] = useState<FreqRow[]>([]);
  const [intData, setIntData] = useState<FreqRow[]>([]);
  const [presidioData, setPresidioData] = useState<{ name: string; value: number }[]>([]);
  const [picchiCounts, setPicchiCounts] = useState({ con: 0, senza: 0 });
  const [presidioCounts, setPresidioCounts] = useState({ con: 0, senza: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const ids = effectiveEnteIds(filters);

      let q = supabase
        .from("ft_sipo_processi")
        .select("denominazione, giorni_previsti, tempo_medio_effettivo, picchi_stagionali, presidio_continuativo, picchi_frequenza_id, picchi_intensita_id")
        .is("data_fine", null);

      if (ids.length === 1) q = q.eq("ente_id", ids[0]);
      else if (ids.length > 1) q = q.in("ente_id", ids);

      const [procRes, freqRes, intRes] = await Promise.all([
        q,
        supabase.from("lk_picchi_frequenza_annuale_processi").select("*"),
        supabase.from("lk_picchi_intensita_processi").select("*"),
      ]);

      if (!procRes.data) { setLoading(false); return; }
      const procs = procRes.data as any[];

      const freqMap = new Map((freqRes.data ?? []).map((f: any) => [f.picchi_frequenza_id, f.frequenza]));
      const intMap = new Map((intRes.data ?? []).map((i: any) => [i.picchi_intensita_id, i.intensita]));

      setTempi(procs.filter(p => p.giorni_previsti || p.tempo_medio_effettivo).map(p => ({
        name: p.denominazione.length > 20 ? p.denominazione.substring(0, 18) + "…" : p.denominazione,
        previsto: p.giorni_previsti ?? 0,
        effettivo: p.tempo_medio_effettivo ?? 0,
      })));

      const fCounts: Record<string, number> = {};
      const iCounts: Record<string, number> = {};
      let conPicchi = 0, senzaPicchi = 0, conPresidio = 0, senzaPresidio = 0;

      for (const p of procs) {
        if (p.picchi_stagionali === 1) {
          conPicchi++;
          if (p.picchi_frequenza_id) {
            const label = freqMap.get(p.picchi_frequenza_id) ?? `Freq ${p.picchi_frequenza_id}`;
            fCounts[label] = (fCounts[label] || 0) + 1;
          }
          if (p.picchi_intensita_id) {
            const label = intMap.get(p.picchi_intensita_id) ?? `Int ${p.picchi_intensita_id}`;
            iCounts[label] = (iCounts[label] || 0) + 1;
          }
        } else {
          senzaPicchi++;
        }
        if (p.presidio_continuativo === 1) conPresidio++;
        else senzaPresidio++;
      }

      setFreqData(Object.entries(fCounts).map(([k, v]) => ({ name: k, value: v })));
      setIntData(Object.entries(iCounts).map(([k, v]) => ({ name: k, value: v })));
      setPicchiCounts({ con: conPicchi, senza: senzaPicchi });
      setPresidioCounts({ con: conPresidio, senza: senzaPresidio });

      const total = conPresidio + senzaPresidio;
      setPresidioData([
        { name: "Sì", value: total > 0 ? Math.round((conPresidio / total) * 100) : 0 },
        { name: "No", value: total > 0 ? Math.round((senzaPresidio / total) * 100) : 0 },
      ]);

      setLoading(false);
    };
    load();
  }, [filters]);

  if (loading) {
    return (
      <div className="space-y-4">
        <SiproFilters value={filters} onChange={setFilters} />
        <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  const tempiColumns = [
    { key: "name", header: "Nome Processo", render: (r: TempoRow) => <span className="font-medium text-foreground">{r.name}</span> },
    { key: "previsto", header: "Tempo previsto (giorni)", align: "right" as const, render: (r: TempoRow) => <span className="text-muted-foreground">{r.previsto}</span> },
    { key: "effettivo", header: "Tempo effettivo (giorni)", align: "right" as const, render: (r: TempoRow) => <span className="text-muted-foreground">{r.effettivo}</span> },
  ];

  return (
    <div className="space-y-6">
      <SiproFilters value={filters} onChange={setFilters} />

      <div className="bg-card border rounded-xl p-5 space-y-3">
        <h3 className="text-[15px] font-bold text-foreground">Tempi di esecuzione</h3>
        <p className="text-xs text-muted-foreground">Tempi di esecuzione previsti/effettivi dei processi censiti.</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground text-center mb-2">Confronto tra tempi di esecuzione previsti e tempi effettivi medi</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tempi.slice(0, 15)} margin={{ top: 10, right: 10, left: -5, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="effettivo" name="Tempo effettivo" fill={TEAL} radius={[3, 3, 0, 0]} maxBarSize={32} />
                <Bar dataKey="previsto" name="Tempo previsto" fill={DARK} radius={[3, 3, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <PaginatedTable data={tempi} columns={tempiColumns} pageSize={10} />
        </div>
      </div>

      {/* Stagionalità e presidio continuativo */}
      <div className="bg-card border rounded-xl p-5 space-y-3">
        <h3 className="text-[15px] font-bold text-foreground">Stagionalità e presidio continuativo</h3>
        <p className="text-xs text-muted-foreground">Informazioni sui picchi stagionali e sulla necessità di presidio continuativo.</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground text-center mb-2">Distribuzione per frequenza</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={freqData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="value" name="Numero Processi" fill={TEAL} radius={[3, 3, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground text-center mb-2">Distribuzione per intensità</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={intData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="value" name="Numero Processi" fill={TEAL} radius={[3, 3, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground text-center mb-2">% Processi che richiedono presidio continuativo</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={presidioData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} label={({ value }) => `${value}`}>
                  <Cell fill={TEAL} />
                  <Cell fill={DARK} />
                </Pie>
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-sm font-bold text-foreground">Processi con picchi stagionali</p>
            <p className="text-xs text-muted-foreground">Senza picchi stagionali: <strong className="text-foreground">{picchiCounts.senza}</strong></p>
            <p className="text-xs text-muted-foreground">Con picchi stagionali: <strong className="text-foreground">{picchiCounts.con}</strong></p>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Processi che richiedono presidio continuativo</p>
            <p className="text-xs text-muted-foreground">Processi senza presidio continuativo: <strong className="text-foreground">{presidioCounts.senza}</strong></p>
            <p className="text-xs text-muted-foreground">Processi con presidio continuativo: <strong className="text-foreground">{presidioCounts.con}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};
