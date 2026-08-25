import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { SiproFilters, type SiproFilterValues, effectiveEnteIds } from "./SiproFilters";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
  PieChart, Pie, Cell,
} from "recharts";

const TEAL = "hsl(175,60%,50%)";
const DARK = "hsl(220,20%,20%)";
const BLUE = "hsl(210,64%,50%)";
const COLORS = [TEAL, DARK, BLUE, "hsl(38,80%,55%)", "hsl(330,60%,55%)", "hsl(280,50%,55%)"];

interface ProcProfile {
  processo: string;
  numProfili: number;
  fteProg: number;
  fteAss: number;
}

export const ProfiliRuoloProcessoChart = () => {
  const { profile } = useAuth();
  const initialEnteId = profile?.role === "ente_hr" ? profile.ente_id : null;
  const [filters, setFilters] = useState<SiproFilterValues>({ enteId: initialEnteId, enteIds: [] });
  const [procData, setProcData] = useState<ProcProfile[]>([]);
  const [ambitoData, setAmbitoData] = useState<{ name: string; value: number }[]>([]);
  const [areaData, setAreaData] = useState<{ name: string; value: number }[]>([]);
  const [profData, setProfData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const ids = effectiveEnteIds(filters);

      let procQ = supabase.from("ft_sipo_processi")
        .select("processo_id, denominazione, ente_id")
        .is("data_fine", null);
      if (ids.length === 1) procQ = procQ.eq("ente_id", ids[0]);
      else if (ids.length > 1) procQ = procQ.in("ente_id", ids);

      const [procRes, fasiRes, profFasiRes, profRuoloRes, ambitoRes, areaRes] = await Promise.all([
        procQ,
        supabase.from("ft_sipo_fasi").select("fase_id, processo_id"),
        supabase.from("ft_sipo_profili_di_ruolo_fasi").select("profilo_fase_id, fase_id, sipo_profilo_di_ruolo_id, fte_programmati, fte_assegnati"),
        supabase.from("lk_sipo_profili_di_ruolo").select("profilo_ruolo_id, profilo_ruolo, id_ambito_ruolo, id_area_contrattuale, ente_id").is("data_eliminazione", null),
        supabase.from("lk_minerva_ambito_ruolo").select("id, descrizione"),
        supabase.from("lk_minerva_area_contrattuale").select("id, descrizione"),
      ]);

      if (!procRes.data) { setLoading(false); return; }

      const procById = new Map((procRes.data as any[]).map(p => [p.processo_id, p]));
      const fasiByProc = new Map<number, number[]>();
      for (const f of (fasiRes.data ?? []) as any[]) {
        if (!fasiByProc.has(f.processo_id)) fasiByProc.set(f.processo_id, []);
        fasiByProc.get(f.processo_id)!.push(f.fase_id);
      }

      const faseSet = new Set<number>();
      for (const fasi of fasiByProc.values()) fasi.forEach(f => faseSet.add(f));

      // Group profili_fasi by processo
      const profFasiByFase = new Map<number, any[]>();
      for (const pf of (profFasiRes.data ?? []) as any[]) {
        if (!faseSet.has(pf.fase_id)) continue;
        if (!profFasiByFase.has(pf.fase_id)) profFasiByFase.set(pf.fase_id, []);
        profFasiByFase.get(pf.fase_id)!.push(pf);
      }

      // Aggregate per processo
      const procProfiles: ProcProfile[] = [];
      for (const [procId, proc] of procById) {
        const fasi = fasiByProc.get(procId) ?? [];
        const profilIds = new Set<number>();
        let fteProg = 0, fteAss = 0;
        for (const fId of fasi) {
          const pfs = profFasiByFase.get(fId) ?? [];
          for (const pf of pfs) {
            if (pf.sipo_profilo_di_ruolo_id) profilIds.add(pf.sipo_profilo_di_ruolo_id);
            fteProg += pf.fte_programmati || 0;
            fteAss += pf.fte_assegnati || 0;
          }
        }
        if (profilIds.size > 0 || fteProg > 0) {
          procProfiles.push({
            processo: proc.denominazione,
            numProfili: profilIds.size,
            fteProg: Math.round(fteProg * 10) / 10,
            fteAss: Math.round(fteAss * 10) / 10,
          });
        }
      }
      setProcData(procProfiles.sort((a, b) => b.numProfili - a.numProfili));

      // Aggregate by ambito, area, profilo
      const profRuoloMap = new Map((profRuoloRes.data ?? []).map((p: any) => [p.profilo_ruolo_id, p]));
      const ambMap = new Map((ambitoRes.data ?? []).map((a: any) => [a.id, a.descrizione]));
      const arMap = new Map((areaRes.data ?? []).map((a: any) => [a.id, a.descrizione]));

      const relevantIds = new Set<number>();
      for (const pfs of profFasiByFase.values()) {
        for (const pf of pfs) if (pf.sipo_profilo_di_ruolo_id) relevantIds.add(pf.sipo_profilo_di_ruolo_id);
      }

      const ambCount: Record<string, number> = {};
      const arCount: Record<string, number> = {};
      const prCount: Record<string, number> = {};
      for (const id of relevantIds) {
        const pr = profRuoloMap.get(id);
        if (!pr) continue;
        const amb = ambMap.get(pr.id_ambito_ruolo) || "Altro";
        const ar = arMap.get(pr.id_area_contrattuale) || "Altro";
        const name = pr.profilo_ruolo?.length > 20 ? pr.profilo_ruolo.substring(0, 18) + "…" : pr.profilo_ruolo;
        ambCount[amb.length > 20 ? amb.substring(0, 18) + "…" : amb] = (ambCount[amb.length > 20 ? amb.substring(0, 18) + "…" : amb] || 0) + 1;
        arCount[ar] = (arCount[ar] || 0) + 1;
        prCount[name] = (prCount[name] || 0) + 1;
      }

      setAmbitoData(Object.entries(ambCount).sort(([, a], [, b]) => b - a).map(([name, value]) => ({ name, value })));
      setAreaData(Object.entries(arCount).sort(([, a], [, b]) => b - a).map(([name, value]) => ({ name, value })));
      setProfData(Object.entries(prCount).sort(([, a], [, b]) => b - a).slice(0, 10).map(([name, value]) => ({ name, value })));
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

  const chartProc = procData.slice(0, 12);

  return (
    <div className="space-y-4">
      <SiproFilters value={filters} onChange={setFilters} />

      <div className="bg-card border rounded-xl p-5 space-y-3">
        <h3 className="text-[15px] font-bold text-foreground">Profili di Ruolo per Processo</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nr profili per processo */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground text-center mb-2">Numero profili di ruolo per Processo/Fase</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartProc} margin={{ top: 5, right: 10, left: -5, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="processo" tick={{ fontSize: 8 }} angle={-30} textAnchor="end" stroke="hsl(var(--muted-foreground))" interval={0} />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="numProfili" name="Nr. Profili" fill={TEAL} radius={[4, 4, 0, 0]} maxBarSize={40}>
                  <LabelList dataKey="numProfili" position="top" style={{ fontSize: 11, fontWeight: 700, fill: "hsl(var(--foreground))" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risorse programmate vs in servizio */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground text-center mb-2">Confronto risorse programmate (PIAO/PEG) e risorse in servizio</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartProc} margin={{ top: 5, right: 10, left: -5, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="processo" tick={{ fontSize: 8 }} angle={-30} textAnchor="end" stroke="hsl(var(--muted-foreground))" interval={0} />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="fteProg" name="Risorse programmate" fill={TEAL} radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="fteAss" name="Risorse in servizio" fill={DARK} radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ambito, Area, Profili */}
      <div className="bg-card border rounded-xl p-5 space-y-3">
        <h3 className="text-[15px] font-bold text-foreground">Distribuzione per Ambito, Area contrattuale e Profilo</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground text-center mb-2">Per ambito di ruolo</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ambitoData.slice(0, 8)} margin={{ top: 5, right: 10, left: -5, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 8 }} angle={-25} textAnchor="end" stroke="hsl(var(--muted-foreground))" interval={0} />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" name="Numero profili" fill={TEAL} radius={[4, 4, 0, 0]} maxBarSize={36}>
                  <LabelList dataKey="value" position="top" style={{ fontSize: 11, fontWeight: 700, fill: "hsl(var(--foreground))" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground text-center mb-2">Per area contrattuale</p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={areaData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} label={({ value }) => `${value}`} labelLine>
                  {areaData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground text-center mb-2">Per profili professionali</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={profData.slice(0, 6)} margin={{ top: 5, right: 10, left: -5, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 8 }} angle={-25} textAnchor="end" stroke="hsl(var(--muted-foreground))" interval={0} />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" name="Numero profili" fill={TEAL} radius={[4, 4, 0, 0]} maxBarSize={36}>
                  <LabelList dataKey="value" position="top" style={{ fontSize: 11, fontWeight: 700, fill: "hsl(var(--foreground))" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
