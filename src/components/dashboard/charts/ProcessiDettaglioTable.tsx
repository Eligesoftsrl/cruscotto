import { useEffect, useState } from "react";
import { sipoFrom } from "@/services/dw/siproService";
import { Loader2 } from "lucide-react";
import { SiproFilters, type SiproFilterValues, effectiveEnteIds } from "./SiproFilters";
import { useAuth } from "@/contexts/AuthContext";
import { PaginatedTable } from "./PaginatedTable";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const COLORS = ["hsl(175,60%,50%)", "hsl(340,60%,55%)", "hsl(210,60%,50%)", "hsl(40,80%,50%)", "hsl(0,0%,40%)"];

interface ProcessRow {
  denominazione: string;
  funzione: string;
  tipologia: string;
  obiettivi: string;
  rilevanza: string;
  altre_amm: string;
  semplificato: string;
  presidio: string;
  picchi: string;
  criticita: string;
}

export const ProcessiDettaglioTable = () => {
  const { profile } = useAuth();
  const initialEnteId = profile?.role === "ente_hr" ? profile.ente_id : null;
  const [filters, setFilters] = useState<SiproFilterValues>({ enteId: initialEnteId, enteIds: [] });
  const [rows, setRows] = useState<ProcessRow[]>([]);
  const [obiettivi, setObiettivi] = useState<{ name: string; value: number }[]>([]);
  const [rilevanzaData, setRilevanzaData] = useState<{ name: string; obiettivi: string; rilevanza: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const ids = effectiveEnteIds(filters);

      let procQuery = sipoFrom("ft_sipo_processi")
        .select("processo_id, denominazione, tipologia_id, obiettivo_strategico_id, grado_rilevanza_id, coinvolgimento_amministrazioni, presidio_continuativo, picchi_stagionali, processo_semplificazione_id, ente_id")
        .is("data_fine", null);

      if (ids.length === 1) procQuery = procQuery.eq("ente_id", ids[0]);
      else if (ids.length > 1) procQuery = procQuery.in("ente_id", ids);

      const [procRes, tipRes, objRes, rilRes, semplRes, critProcRes, critLkRes] = await Promise.all([
        procQuery,
        sipoFrom("lk_sipo_tipologia_funzione").select("*"),
        sipoFrom("lk_sipo_obiettivi_strategici_processi").select("*"),
        sipoFrom("lk_sipo_grado_rilevanza_processi").select("*"),
        sipoFrom("lk_sipo_semplificazione_processi").select("*"),
        sipoFrom("ft_sipo_criticita_processi").select("*"),
        sipoFrom("lk_sipo_criticita_processi").select("*"),
      ]);

      if (!procRes.data) { setLoading(false); return; }

      const tipMap = new Map((tipRes.data ?? []).map((t: any) => [t.tipologia_id, t]));
      const objMap = new Map((objRes.data ?? []).map((o: any) => [o.obiettivo_id, o.descrizione]));
      const rilMap = new Map((rilRes.data ?? []).map((r: any) => [r.grado_id, r.descrizione]));
      const semplMap = new Map((semplRes.data ?? []).map((s: any) => [s.semplificazione_id, s.descrizione]));

      const critPerProc = new Map<number, number>();
      for (const c of (critProcRes.data ?? []) as any[]) {
        critPerProc.set(c.processo_id, (critPerProc.get(c.processo_id) || 0) + 1);
      }

      const TIPOLOGIA_TO_FUNZIONE: Record<string, string> = {
        Strategico: "Caratterizzanti",
        Operativo: "Caratterizzanti",
        Supporto: "Di supporto",
      };

      const objCounts: Record<string, number> = {};

      const tableRows: ProcessRow[] = (procRes.data as any[]).map((p) => {
        const tip = tipMap.get(p.tipologia_id);
        const funzione = tip ? (TIPOLOGIA_TO_FUNZIONE[tip.tipologia] ?? tip.tipologia) : "—";
        const tipologia = tip?.funzione ?? "—";

        let objLabel = "no";
        if (p.obiettivo_strategico_id) {
          const numObj = p.obiettivo_strategico_id;
          if (numObj === 1) objLabel = "sì, 1 obiettivo";
          else if (numObj <= 3) objLabel = "sì, fino a 3 obiettivi";
          else objLabel = "sì, oltre 3 obiettivi";
        }
        objCounts[objLabel] = (objCounts[objLabel] || 0) + 1;

        const rilevanza = rilMap.get(p.grado_rilevanza_id) ?? "—";
        const altreAmm = p.coinvolgimento_amministrazioni === 1 ? "Sì" : "No";
        const semplDesc = semplMap.get(p.processo_semplificazione_id);
        const semplificato = semplDesc && semplDesc !== "No" ? (semplDesc.includes("parte") ? "Sì, in parte" : "No") : "No";
        const presidio = p.presidio_continuativo === 1 ? "Sì" : "No";
        const picchi = p.picchi_stagionali === 1 ? "Sì" : "No";
        const hasCrit = (critPerProc.get(p.processo_id) || 0) > 0;

        return {
          denominazione: p.denominazione,
          funzione,
          tipologia,
          obiettivi: objLabel,
          rilevanza,
          altre_amm: altreAmm,
          semplificato,
          presidio,
          picchi,
          criticita: hasCrit ? "Sì" : "No",
        };
      });

      setRows(tableRows);
      setObiettivi(Object.entries(objCounts).map(([k, v]) => ({ name: k, value: v })));
      setRilevanzaData(tableRows.map((r) => ({ name: r.denominazione, obiettivi: r.obiettivi, rilevanza: r.rilevanza })));
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

  const mainColumns = [
    { key: "denominazione", header: "Processo", render: (r: ProcessRow) => <span className="font-medium text-foreground max-w-[220px] truncate block">{r.denominazione}</span> },
    { key: "funzione", header: "Funzione", render: (r: ProcessRow) => <span className="text-muted-foreground">{r.funzione}</span> },
    { key: "tipologia", header: "Tipologia", render: (r: ProcessRow) => <span className="text-muted-foreground max-w-[180px] block">{r.tipologia}</span> },
    { key: "obiettivi", header: "Obiettivi Strategici", render: (r: ProcessRow) => <span className="text-muted-foreground">{r.obiettivi}</span> },
    { key: "rilevanza", header: "Rilevanza", render: (r: ProcessRow) => <span className="text-muted-foreground">{r.rilevanza}</span> },
    { key: "altre_amm", header: "Altre amm.", render: (r: ProcessRow) => <span className="text-muted-foreground">{r.altre_amm}</span> },
    { key: "semplificato", header: "Semplificato", render: (r: ProcessRow) => <span className="text-muted-foreground">{r.semplificato}</span> },
    { key: "presidio", header: "Presidio", render: (r: ProcessRow) => <span className="text-muted-foreground">{r.presidio}</span> },
    { key: "picchi", header: "Picchi", render: (r: ProcessRow) => <span className="text-muted-foreground">{r.picchi}</span> },
    { key: "criticita", header: "Criticità", render: (r: ProcessRow) => <span className="text-muted-foreground">{r.criticita}</span> },
  ];

  const rilColumns = [
    { key: "name", header: "Nome Processo", render: (r: any) => <span className="font-medium text-foreground">{r.name}</span> },
    { key: "obiettivi", header: "Obiettivi strategici", render: (r: any) => <span className="text-muted-foreground">{r.obiettivi}</span> },
    { key: "rilevanza", header: "Grado di rilevanza", render: (r: any) => <span className="text-muted-foreground">{r.rilevanza}</span> },
  ];

  return (
    <div className="space-y-6">
      <SiproFilters value={filters} onChange={setFilters} />

      <div className="bg-card border rounded-xl p-5 space-y-3">
        <h3 className="text-[15px] font-bold text-foreground">Elenco Processi Censiti</h3>
        <p className="text-xs text-muted-foreground">Dettaglio completo dei processi mappati con attributi chiave.</p>
        <PaginatedTable data={rows} columns={mainColumns} pageSize={10} />
      </div>

      <div className="bg-card border rounded-xl p-5 space-y-3">
        <h3 className="text-[15px] font-bold text-foreground">Strategia</h3>
        <p className="text-xs text-muted-foreground">Collegamento dei processi agli obiettivi strategici.</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground text-center mb-2">Per obiettivi strategici</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={obiettivi} dataKey="value" nameKey="name" cx="50%" cy="55%" innerRadius={55} outerRadius={95} startAngle={180} endAngle={0} paddingAngle={2} label={({ value }) => `${value}`} labelLine>
                  {obiettivi.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <PaginatedTable data={rilevanzaData} columns={rilColumns} pageSize={8} />
        </div>
      </div>
    </div>
  );
};
