import { Info } from "lucide-react";

/**
 * Badge riutilizzabile per segnalare sezioni ancora basate su dati dimostrativi
 * (fixtures), in attesa che le relative tabelle vengano popolate su Supabase.
 */
export const DemoDataBadge = ({ note }: { note?: string }) => (
  <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
    <Info className="h-3.5 w-3.5 shrink-0" />
    <span>{note ?? "Dati dimostrativi: questa sezione usa valori di esempio in attesa del caricamento delle tabelle sorgente."}</span>
  </div>
);
