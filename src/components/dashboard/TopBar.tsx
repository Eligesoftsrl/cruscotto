import { LogOut, Compass, Home, ShieldCheck, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import type { NavState } from "./AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import headerLogos from "@/assets/header-logos.png";

interface TopBarProps {
  nav: NavState;
  onNavigate?: (nav: NavState) => void;
}

export const TopBar = ({ nav, onNavigate }: TopBarProps) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isWelcome = location.pathname === "/";
  const isAdmin = profile?.role === "dfp";
  const isPannelloOrRapporto =
    location.pathname.startsWith("/bussola") || location.pathname.startsWith("/rapporto");

  return (
    <div className="sticky top-0 z-40">
      {/* Row 1: Institutional dark bar */}
      <header className="bg-[#004080] text-white h-10 flex items-center px-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[8px] font-bold">
            🏛
          </div>
          <span className="font-semibold tracking-wide">Dipartimento della Funzione Pubblica</span>
        </div>

        <div className="flex-1" />

        {profile && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded px-2 py-1 outline-none transition hover:bg-white/10 focus:ring-2 focus:ring-white/40">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold bg-white/20">
                {profile.full_name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <span className="text-white/90 text-[11px] font-medium truncate max-w-[140px]">
                {profile.full_name}
              </span>
              <ChevronDown className="h-3 w-3 text-white/60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold leading-tight">{profile.full_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {isAdmin
                      ? "Amministratore (DFP)"
                      : (profile.ente_denominazione ?? "Responsabile HR")}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isAdmin && (
                <DropdownMenuItem onClick={() => navigate("/admin")}>
                  <ShieldCheck className="h-4 w-4 mr-2" /> Amministrazione
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigate("/")}>
                <Home className="h-4 w-4 mr-2" /> Home
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={signOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" /> Esci
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      {/* Row 2: Product bar */}
      <div className="bg-card border-b flex items-center h-12 px-6">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <div className="text-sm font-bold text-foreground leading-tight">Cruscotto HR</div>
            <div className="text-[9px] text-muted-foreground leading-tight">
              Sistema di Monitoraggio HR della Pubblica Amministrazione
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Institutional logos strip */}
        <div className="hidden md:flex items-center">
          <img
            src={headerLogos}
            alt="Loghi istituzionali: NextGenerationEU, Dipartimento della Funzione Pubblica, PNRR, FORMEZ"
            className="h-8 object-contain"
          />
        </div>

        <div className="w-px h-5 bg-border mx-3" />

        {!isWelcome && (
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition mr-2"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="font-semibold">Home</span>
          </button>
        )}

        {!isPannelloOrRapporto && !isWelcome && (
          <button
            onClick={() => navigate("/bussola")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition"
          >
            <Compass className="h-3.5 w-3.5" />
            <span className="font-semibold">Pannello di Governo</span>
          </button>
        )}

        {profile?.role === "dfp" && (
          <span className="ml-2 px-2.5 py-1 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wide">
            DFP
          </span>
        )}
      </div>
    </div>
  );
};
