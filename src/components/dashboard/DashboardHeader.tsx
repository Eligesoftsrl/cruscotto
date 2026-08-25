import { Bell, Search, Filter } from "lucide-react";

const sectionTitles: Record<string, string> = {
  overview: "Panoramica Generale",
  eta: "Analisi per Età",
  anzianita: "Anzianità di Servizio",
  cessazioni: "Cessazioni e Turnover",
  formazione: "Formazione del Personale",
  progressioni: "Progressioni di Carriera",
  flessibile: "Lavoro Flessibile e Agile",
  genere: "Analisi per Genere",
};

interface DashboardHeaderProps {
  activeSection: string;
}

export const DashboardHeader = ({ activeSection }: DashboardHeaderProps) => {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          {sectionTitles[activeSection] || "Cruscotto Direzionale"}
        </h2>
        <p className="text-xs text-muted-foreground">
          Dati del Conto Annuale — Ultimo aggiornamento: 2023
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cerca..."
            className="w-40 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background hover:bg-secondary transition-colors">
          <Filter className="h-4 w-4 text-muted-foreground" />
        </button>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border bg-background hover:bg-secondary transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent border-2 border-card" />
        </button>
      </div>
    </header>
  );
};
