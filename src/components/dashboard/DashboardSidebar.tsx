import {
  Users, Calendar, Clock, LogOut, TrendingUp, GraduationCap,
  ArrowUpRight, Briefcase, UserCheck, ChevronLeft, ChevronRight, LayoutDashboard
} from "lucide-react";

const sections = [
  { id: "overview", label: "Panoramica", icon: LayoutDashboard },
  { id: "eta", label: "Analisi per Età", icon: Calendar },
  { id: "anzianita", label: "Anzianità di Servizio", icon: Clock },
  { id: "cessazioni", label: "Cessazioni e Turnover", icon: LogOut },
  { id: "formazione", label: "Formazione", icon: GraduationCap },
  { id: "progressioni", label: "Progressioni", icon: ArrowUpRight },
  { id: "flessibile", label: "Lavoro Flessibile", icon: Briefcase },
  { id: "genere", label: "Analisi per Genere", icon: UserCheck },
];

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const DashboardSidebar = ({
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
}: DashboardSidebarProps) => {
  return (
    <aside
      className={`relative flex flex-col border-r border-sidebar-border transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
      style={{ background: "var(--gradient-sidebar)" }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
          <Users className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="truncate text-sm font-bold text-sidebar-foreground">Cruscotto HR</h1>
            <p className="truncate text-[10px] text-sidebar-foreground/60">Conto Annuale PA</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSectionChange(id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
              activeSection === id
                ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
            title={collapsed ? label : undefined}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-sidebar-border p-4">
          <p className="text-[10px] text-sidebar-foreground/40">
            Fonte: Conto Annuale 2023
          </p>
          <p className="text-[10px] text-sidebar-foreground/40">
            Serie storica 2016–2023
          </p>
        </div>
      )}

      {/* Collapse button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-card shadow-sm hover:bg-secondary transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-foreground" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-foreground" />
        )}
      </button>
    </aside>
  );
};
