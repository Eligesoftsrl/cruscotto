import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Building2, FileText, Users, Layers, Shield, BarChart3, Loader2, AlertCircle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList,
  PieChart, Pie, Legend, ResponsiveContainer,
} from "recharts";
import { SiproFilters, type SiproFilterValues, effectiveEnteIds } from "@/components/dashboard/charts/SiproFilters";
import { useAuth } from "@/contexts/AuthContext";

const PIE_COLORS = [
  "hsl(210, 64%, 30%)", "hsl(330, 55%, 55%)", "hsl(40, 90%, 55%)",
  "hsl(120, 45%, 45%)", "hsl(210, 64%, 50%)", "hsl(175, 60%, 50%)",
  "hsl(0, 60%, 55%)", "hsl(270, 50%, 55%)",
];
const BAR_COLOR = "hsl(175, 60%, 50%)";

/* ─── Stato Organizzazione ─── */
const StatoOrgView = () => {
  const { profile } = useAuth();
  const [filters, setFilters] = useState<SiproFilterValues>({ enteId: profile?.role === "ente_hr" ? profile.ente_id : null, enteIds: [] });
  const [data, setData] = useState<any[]>([]);
  const [statusLookup, setStatusLookup] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [orgRes, statusRes, entiRes] = await Promise.all([
        supabase.from("ft_sipo_organizzazione").select("*"),
        supabase.from("lk_sipo_stato_organizzazione").select("*"),
        supabase.from("lk_enti").select("ente_id, denominazione"),
      ]);
      const sMap: Record<number, string> = {};
      (statusRes.data ?? []).forEach((s: any) => { sMap[s.stato_organizzazione_id] = s.descrizione; });
      setStatusLookup(sMap);
      const eMap = new Map((entiRes.data ?? []).map((e: any) => [e.ente_id, e.denominazione]));

      const ids = effectiveEnteIds(filters);
      let rows = orgRes.data ?? [];
      if (ids.length > 0) rows = rows.filter((r: any) => ids.includes(r.ente_id));

      const enriched = rows.map((r: any) => ({
        ...r,
        ente_nome: (eMap.get(r.ente_id) ?? `Ente ${r.ente_id}`).replace("Comune di ", ""),
        stato_label: sMap[r.stato_organizzazione_id] ?? "N/D",
      }));
      setData(enriched);
      setLoading(false);
    };
    load();
  }, [filters]);

  const byStatus = Object.entries(
    data.reduce((acc: Record<string, number>, r) => { acc[r.stato_label] = (acc[r.stato_label] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-4">
      <SiproFilters value={filters} onChange={setFilters} />
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <KpiBox label="Organizzazioni totali" value={data.length} />
            <KpiBox label="Formalizzate" value={data.filter(d => d.stato_label === "Formalizzata").length} />
            <KpiBox label="In bozza" value={data.filter(d => d.stato_label === "Bozza").length} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border rounded-xl p-5">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Distribuzione per stato</p>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={95} paddingAngle={2}>
                    {byStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border rounded-xl p-5">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Dettaglio enti</p>
              <div className="space-y-2 max-h-[260px] overflow-y-auto">
                {data.map((r, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                    <div>
                      <div className="text-xs font-medium text-foreground">{r.ente_nome}</div>
                      <div className="text-[10px] text-muted-foreground">{r.denominazione}</div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${r.stato_label === "Formalizzata" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                      {r.stato_label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ─── Provvedimenti ─── */
const ProvvedimentiView = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [provRes, orgRes, entiRes] = await Promise.all([
        supabase.from("ft_sipo_provvedimenti_organizzazione").select("*"),
        supabase.from("ft_sipo_organizzazione").select("organizzazione_id, ente_id"),
        supabase.from("lk_enti").select("ente_id, denominazione"),
      ]);
      const orgMap = new Map((orgRes.data ?? []).map((o: any) => [o.organizzazione_id, o.ente_id]));
      const eMap = new Map((entiRes.data ?? []).map((e: any) => [e.ente_id, e.denominazione]));

      const enriched = (provRes.data ?? []).map((r: any) => ({
        ...r,
        ente_nome: (eMap.get(orgMap.get(r.organizzazione_id)) ?? "N/D").replace("Comune di ", ""),
      })).sort((a: any, b: any) => new Date(b.data_adozione_provvedimento).getTime() - new Date(a.data_adozione_provvedimento).getTime());

      setData(enriched);
      setLoading(false);
    };
    load();
  }, []);

  const byMonth = Object.entries(
    data.reduce((acc: Record<string, number>, r) => {
      const m = r.data_adozione_provvedimento ? new Date(r.data_adozione_provvedimento).toLocaleDateString("it-IT", { month: "short", year: "2-digit" }) : "N/D";
      acc[m] = (acc[m] || 0) + 1; return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return loading ? <LoadingSpinner /> : (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <KpiBox label="Provvedimenti totali" value={data.length} />
        <KpiBox label="Enti coinvolti" value={new Set(data.map(d => d.ente_nome)).size} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-5">
          <p className="text-xs font-semibold text-muted-foreground mb-3">Provvedimenti per mese di adozione</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byMonth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" name="Provvedimenti" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={40}>
                <LabelList dataKey="value" position="top" style={{ fontSize: 12, fontWeight: 700, fill: "hsl(var(--foreground))" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border rounded-xl p-5">
          <p className="text-xs font-semibold text-muted-foreground mb-3">Timeline provvedimenti</p>
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {data.map((r, i) => (
              <div key={i} className="flex items-start gap-3 bg-muted/30 rounded-lg px-3 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-foreground">{r.denominazione}</div>
                  <div className="text-[10px] text-muted-foreground">{r.ente_nome} · Adottato: {r.data_adozione_provvedimento ? new Date(r.data_adozione_provvedimento).toLocaleDateString("it-IT") : "N/D"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── FTE Programmati vs Assegnati ─── */
const FteView = () => (
  <EmptyDataView title="FTE Programmati vs Assegnati" description="I dati sui FTE programmati e assegnati per profilo di ruolo non sono ancora stati caricati nel sistema. Questa sezione sarà attiva non appena gli enti inseriranno i dati relativi all'allocazione delle risorse." />
);

/* ─── Copertura Profili ─── */
const CoperturaView = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("lk_sipo_copertura_profili_di_ruolo").select("*").then(({ data: d }) => {
      setData(d ?? []);
      setLoading(false);
    });
  }, []);

  return loading ? <LoadingSpinner /> : (
    <div className="space-y-4">
      <KpiBox label="Livelli di copertura definiti" value={data.length} />
      <div className="bg-card border rounded-xl p-5">
        <p className="text-xs font-semibold text-muted-foreground mb-3">Range di copertura profili di ruolo</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.map(d => ({ name: d.descrizione, min: d.range_min * 100, max: d.range_max * 100 }))} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[0, 150]} unit="%" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={140} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="max" name="Range max" fill="hsl(210, 64%, 45%)" radius={[0, 4, 4, 0]} maxBarSize={24} />
            <Bar dataKey="min" name="Range min" fill="hsl(175, 60%, 50%)" radius={[0, 4, 4, 0]} maxBarSize={24} />
            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ─── Fabbisogno ─── */
const FabbisognoView = () => (
  <EmptyDataView title="Fabbisogno per Profilo" description="L'analisi del fabbisogno richiede i dati FTE programmati e assegnati per profilo di ruolo. Questa sezione sarà popolata non appena gli enti completeranno la mappatura delle risorse nel sistema SIPrO." />
);

/* ─── Catalogo Profili di Ruolo (per ente) ─── */
const CatalogoView = () => {
  const { profile } = useAuth();
  const [filters, setFilters] = useState<SiproFilterValues>({ enteId: profile?.role === "ente_hr" ? profile.ente_id : null, enteIds: [] });
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [profRes, entiRes] = await Promise.all([
        supabase.from("lk_sipo_profili_di_ruolo").select("*"),
        supabase.from("lk_enti").select("ente_id, denominazione"),
      ]);
      const eMap = new Map((entiRes.data ?? []).map((e: any) => [e.ente_id, e.denominazione]));
      const ids = effectiveEnteIds(filters);
      let rows = profRes.data ?? [];
      if (ids.length > 0) rows = rows.filter((r: any) => ids.includes(r.ente_id));

      const enriched = rows.map((r: any) => ({
        ...r,
        ente_nome: (eMap.get(r.ente_id) ?? `Ente ${r.ente_id}`).replace("Comune di ", ""),
      }));
      setData(enriched);
      setLoading(false);
    };
    load();
  }, [filters]);

  const byComparto = Object.entries(
    data.reduce((acc: Record<string, number>, r) => { acc[r.comparto ?? "N/D"] = (acc[r.comparto ?? "N/D"] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-4">
      <SiproFilters value={filters} onChange={setFilters} />
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <KpiBox label="Profili totali" value={data.length} />
            <KpiBox label="Comparti" value={new Set(data.map(d => d.comparto)).size} />
            <KpiBox label="Enti" value={new Set(data.map(d => d.ente_id)).size} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border rounded-xl p-5">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Profili per comparto</p>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={byComparto} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={95} paddingAngle={2}>
                    {byComparto.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border rounded-xl p-5">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Elenco profili</p>
              <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
                {data.map((r, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted/30 rounded px-3 py-1.5">
                    <div>
                      <div className="text-[11px] font-medium text-foreground">{r.profilo_ruolo}</div>
                      <div className="text-[9px] text-muted-foreground">{r.codice_profilo} · {r.ente_nome}</div>
                    </div>
                    <span className="text-[9px] text-muted-foreground">{r.comparto}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ─── Famiglie / Minerva views ─── */
const MinervaTableView = ({ tableName, title, labelField }: { tableName: string; title: string; labelField: string }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from(tableName as any).select("*").then(({ data: d }) => {
      setData(d ?? []);
      setLoading(false);
    });
  }, [tableName]);

  return loading ? <LoadingSpinner /> : (
    <div className="space-y-4">
      <KpiBox label={`Elementi nel catalogo`} value={data.length} />
      <div className="bg-card border rounded-xl p-5">
        <p className="text-xs font-semibold text-muted-foreground mb-3">{title}</p>
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
          {data.map((r, i) => (
            <div key={i} className="flex items-center justify-between bg-muted/30 rounded px-3 py-2">
              <div className="text-[11px] font-medium text-foreground">{r[labelField] ?? r.descrizione ?? "N/D"}</div>
              {r.codice && <span className="text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{r.codice}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Evoluzione Profili ─── */
const EvoluzioneView = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("lk_sipo_profili_di_ruolo").select("*").then(({ data: d }) => {
      setData(d ?? []);
      setLoading(false);
    });
  }, []);

  const active = data.filter(d => !d.data_eliminazione).length;
  const eliminated = data.filter(d => d.data_eliminazione).length;

  return loading ? <LoadingSpinner /> : (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <KpiBox label="Profili totali" value={data.length} />
        <KpiBox label="Attivi" value={active} />
        <KpiBox label="Eliminati" value={eliminated} />
      </div>
      <div className="bg-card border rounded-xl p-5">
        <p className="text-xs font-semibold text-muted-foreground mb-3">Stato profili di ruolo</p>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={[{ name: "Attivi", value: active }, { name: "Eliminati", value: eliminated }]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={95} paddingAngle={2}>
              <Cell fill="hsl(120, 45%, 45%)" />
              <Cell fill="hsl(0, 60%, 55%)" />
            </Pie>
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ─── Shared components ─── */
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

const KpiBox = ({ label, value }: { label: string; value: number | string }) => (
  <div className="bg-card border rounded-lg p-4">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{label}</div>
    <div className="text-xl font-bold text-foreground">{typeof value === "number" ? value.toLocaleString("it-IT") : value}</div>
  </div>
);

const EmptyDataView = ({ title, description }: { title: string; description: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="bg-card border rounded-lg p-10 text-center max-w-lg">
      <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

/* ─── Router ─── */
const viewMap: Record<string, React.FC> = {
  "sipro-stato-org": StatoOrgView,
  "sipro-provvedimenti": ProvvedimentiView,
  "sipro-fte": FteView,
  "sipro-copertura": CoperturaView,
  "sipro-fabbisogno": FabbisognoView,
  "sipro-evoluzione-profili": EvoluzioneView,
};

const minervaMap: Record<string, { tableName: string; title: string; labelField: string }> = {
  "sipro-famiglie": { tableName: "lk_minerva_famiglia_professionale", title: "Famiglie Professionali", labelField: "descrizione" },
  "sipro-profili-minerva": { tableName: "lk_minerva_profilo_professionale", title: "Profili Professionali Minerva", labelField: "descrizione" },
  "sipro-ambiti-ruolo": { tableName: "lk_minerva_ambito_ruolo", title: "Ambiti di Ruolo", labelField: "descrizione" },
  "sipro-aree-contrattuali": { tableName: "lk_minerva_area_contrattuale", title: "Aree Contrattuali", labelField: "descrizione" },
};

export const SiproIndicatorSection = ({ indicatorId }: { indicatorId: string }) => {
  const ViewComponent = viewMap[indicatorId];
  if (ViewComponent) {
    return (
      <div className="space-y-4">
        <ViewComponent />
      </div>
    );
  }

  const minerva = minervaMap[indicatorId];
  if (minerva) {
    return (
      <div className="space-y-4">
        <MinervaTableView {...minerva} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="bg-card border rounded-lg p-10 text-center max-w-md">
        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-base font-semibold text-foreground mb-2">Indicatore non configurato</h3>
        <p className="text-sm text-muted-foreground">L'indicatore "{indicatorId}" non dispone ancora di una visualizzazione dedicata.</p>
      </div>
    </div>
  );
};
