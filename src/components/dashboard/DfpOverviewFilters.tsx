import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown } from "lucide-react";

export interface DfpOverviewFilterValues {
  comparto: string;
  area: string;
  dimensione: string;
}

interface Props {
  value: DfpOverviewFilterValues;
  onChange: (v: DfpOverviewFilterValues) => void;
}

export const DFP_FILTER_DEFAULTS: DfpOverviewFilterValues = {
  comparto: "",
  area: "",
  dimensione: "",
};

export const DfpOverviewFilters = ({ value, onChange }: Props) => {
  const [comparti, setComparti] = useState<string[]>([]);
  const [aree, setAree] = useState<string[]>([]);

  useEffect(() => {
    // Fetch distinct comparto values
    supabase
      .from("lk_enti")
      .select("comparto")
      .not("comparto", "is", null)
      .order("comparto")
      .then(({ data }) => {
        if (data) {
          const unique = [...new Set(data.map((r) => r.comparto).filter(Boolean))] as string[];
          setComparti(unique);
        }
      });

    // Fetch distinct regione values as "Area Geografica"
    supabase
      .from("lk_enti")
      .select("regione")
      .not("regione", "is", null)
      .order("regione")
      .then(({ data }) => {
        if (data) {
          const unique = [...new Set(data.map((r) => r.regione).filter(Boolean))] as string[];
          setAree(unique);
        }
      });
  }, []);

  const dimensioni = ["< 100 dipendenti", "100–500", "500–2.000", "2.000–10.000", "> 10.000"];

  const selectClass =
    "appearance-none rounded-lg border border-input bg-background pl-4 pr-9 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring w-full cursor-pointer";

  return (
    <div className="bg-card border rounded-lg p-5 space-y-3">
      <h3 className="text-[13px] font-semibold text-primary">Filtri di visualizzazione</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Comparto */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-primary text-center block">Comparto</label>
          <div className="relative">
            <select
              value={value.comparto}
              onChange={(e) => onChange({ ...value, comparto: e.target.value })}
              className={selectClass}
            >
              <option value="">Tutti i comparti</option>
              {comparti.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Area Geografica */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-primary text-center block">Area Geografica</label>
          <div className="relative">
            <select
              value={value.area}
              onChange={(e) => onChange({ ...value, area: e.target.value })}
              className={selectClass}
            >
              <option value="">Tutte le aree</option>
              {aree.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Dimensione PA */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-primary text-center block">Dimensione PA</label>
          <div className="relative">
            <select
              value={value.dimensione}
              onChange={(e) => onChange({ ...value, dimensione: e.target.value })}
              className={selectClass}
            >
              <option value="">Tutte le dimensioni</option>
              {dimensioni.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
