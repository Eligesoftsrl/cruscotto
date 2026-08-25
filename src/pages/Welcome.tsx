import { useNavigate } from "react-router-dom";
import { Compass, BarChart3, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { TopBar } from "@/components/dashboard/TopBar";
import headerLogos from "@/assets/header-logos.png";

const Welcome = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const orgLabel = profile?.role === "dfp"
    ? "Dipartimento della Funzione Pubblica"
    : profile?.ente_denominazione ?? "Il tuo Ente";

  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <TopBar nav={{ level: "executive" }} />

      <main className="max-w-[960px] mx-auto px-6 py-16">
        {/* Welcome header */}
        <div className="mb-12 text-center">
          <p className="text-sm text-muted-foreground mb-1 capitalize">{today}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Benvenuto nel Cruscotto HR
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            {orgLabel} — Sistema di Monitoraggio HR della Pubblica Amministrazione.
            Scegli come esplorare i dati del tuo ente.
          </p>
        </div>

        {/* Dual path cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Narrative path */}
          <button
            onClick={() => navigate("/bussola")}
            className="group bg-card border-2 border-transparent hover:border-primary/40 rounded-xl p-8 text-left transition-all hover:shadow-lg flex flex-col"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition">
              <Compass className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Navigazione Guidata</h2>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
              Esplora i dati attraverso domande e percorsi narrativi, pensato per chi cerca risposte rapide e un quadro d'insieme.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all">
              Inizia il percorso <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* Technical path */}
          <button
            onClick={() => navigate("/dashboard")}
            className="group bg-card border-2 border-transparent hover:border-primary/40 rounded-xl p-8 text-left transition-all hover:shadow-lg flex flex-col"
          >
            <div className="w-14 h-14 rounded-2xl bg-accent/60 flex items-center justify-center mb-5 group-hover:bg-accent transition">
              <BarChart3 className="h-7 w-7 text-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Vista Tecnica</h2>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
              Accedi direttamente agli indicatori, ai benchmark e alle analisi di dettaglio, pensato per analisti e statistici.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground group-hover:text-foreground group-hover:gap-3 transition-all">
              Accedi al cruscotto <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        </div>

        {/* Footer logos */}
        <div className="flex justify-center">
          <img src={headerLogos} alt="Loghi istituzionali" className="h-10 object-contain opacity-60" />
        </div>
      </main>
    </div>
  );
};

export default Welcome;
