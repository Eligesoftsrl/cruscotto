import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface InpaLocalFiltersProps {
  filters: InpaFilters;
  onChange: (f: InpaFilters) => void;
}

export interface InpaFilters {
  anno: string;
  regione: string;
  tipo_procedura: string;
  settore: string;
  stato: string;
}

export const DEFAULT_INPA_FILTERS: InpaFilters = {
  anno: "",
  regione: "",
  tipo_procedura: "",
  settore: "",
  stato: "",
};

export const applyInpaLocalFilters = (bandi: any[], filters: InpaFilters): any[] => {
  return bandi.filter((b) => {
    if (filters.anno && String(b.anno ?? new Date(b.data_pubblicazione).getFullYear()) !== filters.anno) return false;
    if (filters.regione && (b.regione ?? "") !== filters.regione) return false;
    if (filters.tipo_procedura && (b.tipo_procedura ?? "") !== filters.tipo_procedura) return false;
    if (filters.settore && (b.settore_pubblicazione ?? "") !== filters.settore) return false;
    if (filters.stato && (b.stato_bando ?? "") !== filters.stato) return false;
    return true;
  });
};

export const InpaLocalFilters = ({ filters, onChange }: InpaLocalFiltersProps) => {
  const [options, setOptions] = useState<{
    anni: string[];
    regioni: string[];
    tipi: string[];
    settori: string[];
    stati: string[];
  }>({ anni: [], regioni: [], tipi: [], settori: [], stati: [] });

  useEffect(() => {
    const load = async () => {
      const { data: bandi } = await supabase.from("dw_inpa_bandi").select("anno, regione, tipo_procedura, settore_pubblicazione, stato_bando");
      if (!bandi) return;
      const anni = new Set<string>();
      const regioni = new Set<string>();
      const tipi = new Set<string>();
      const settori = new Set<string>();
      const stati = new Set<string>();
      bandi.forEach((b: any) => {
        if (b.anno) anni.add(String(b.anno));
        if (b.regione) regioni.add(b.regione);
        if (b.tipo_procedura) tipi.add(b.tipo_procedura);
        if (b.settore_pubblicazione) settori.add(b.settore_pubblicazione);
        if (b.stato_bando) stati.add(b.stato_bando);
      });
      setOptions({
        anni: [...anni].sort(),
        regioni: [...regioni].sort(),
        tipi: [...tipi].sort(),
        settori: [...settori].sort(),
        stati: [...stati].sort(),
      });
    };
    load();
  }, []);

  const sel = "h-7 text-[11px] rounded border border-border bg-background px-2 text-foreground";

  const handleChange = (key: keyof InpaFilters, val: string) => {
    onChange({ ...filters, [key]: val });
  };

  const hasActive = Object.values(filters).some(Boolean);

  return (
    <div className="flex items-center gap-2 flex-wrap px-4 py-2 border-b border-border/40 bg-muted/20">
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mr-1">Filtri InPA</span>

      <select className={sel} value={filters.anno} onChange={(e) => handleChange("anno", e.target.value)}>
        <option value="">Tutti gli anni</option>
        {options.anni.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>

      <select className={sel} value={filters.regione} onChange={(e) => handleChange("regione", e.target.value)}>
        <option value="">Tutte le regioni</option>
        {options.regioni.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>

      <select className={sel} value={filters.tipo_procedura} onChange={(e) => handleChange("tipo_procedura", e.target.value)}>
        <option value="">Tutti i tipi</option>
        {options.tipi.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      {options.settori.length > 0 && (
        <select className={sel} value={filters.settore} onChange={(e) => handleChange("settore", e.target.value)}>
          <option value="">Tutti i settori</option>
          {options.settori.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      )}

      {options.stati.length > 0 && (
        <select className={sel} value={filters.stato} onChange={(e) => handleChange("stato", e.target.value)}>
          <option value="">Tutti gli stati</option>
          {options.stati.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      )}

      {hasActive && (
        <button
          onClick={() => onChange(DEFAULT_INPA_FILTERS)}
          className="text-[10px] text-primary hover:underline ml-1"
        >
          Reset
        </button>
      )}
    </div>
  );
};
