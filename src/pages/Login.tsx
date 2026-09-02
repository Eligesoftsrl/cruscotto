import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isKeycloakEnabled } from "@/auth/keycloak";
import { Building2, Shield, Loader2, ChevronDown, LogIn } from "lucide-react";

interface Ente {
  ente_id: number;
  denominazione: string;
}

const Login = () => {
  const { profile, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"choose" | "pick_ente">("choose");
  const [enti, setEnti] = useState<Ente[]>([]);
  const [selectedEnte, setSelectedEnte] = useState<number | null>(null);
  const [loadingEnti, setLoadingEnti] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && profile) navigate("/", { replace: true });
  }, [profile, loading, navigate]);

  const handleDfp = async () => {
    setSigningIn(true);
    await signIn("dfp");
    setSigningIn(false);
  };

  const handleEnteClick = async () => {
    setLoadingEnti(true);
    // Fonte allineata ai dati della dashboard: dw_ente (id_ente),
    // cosi l'ente selezionato corrisponde ai dati effettivamente mostrati.
    const { data } = await supabase
      .from("dw_ente")
      .select("id_ente, denominazione")
      .order("denominazione");
    if (data) {
      setEnti((data as { id_ente: number; denominazione: string }[]).map((e) => ({
        ente_id: e.id_ente,
        denominazione: e.denominazione,
      })));
    }
    setLoadingEnti(false);
    setStep("pick_ente");
  };

  const handleSso = async () => {
    setSigningIn(true);
    // In modalita Keycloak il ruolo passato viene ignorato: ruolo ed ente
    // arrivano dai claim del token dopo il redirect di login.
    await signIn("dfp");
    setSigningIn(false);
  };

  const handleEnteConfirm = async () => {
    if (!selectedEnte) return;
    setSigningIn(true);
    await signIn("ente_hr", selectedEnte);
    setSigningIn(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // --- Modalita Keycloak: accesso solo via SSO ---
  // Ruolo (dfp / ente_hr) ed ente arrivano dai claim del token: niente
  // scelta profilo ne selezione ente. Il flusso mock resta come fallback
  // quando Keycloak non e configurato (variabili .env assenti).
  if (isKeycloakEnabled) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="h-1 w-full bg-primary" />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary text-primary-foreground text-3xl shadow-lg">
              🏛️
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Cruscotto HR</h1>
            <p className="text-[14px] text-muted-foreground max-w-md leading-relaxed">
              Accedi con le credenziali istituzionali (SSO)
            </p>
          </div>

          <div className="w-full max-w-md rounded-lg border-2 bg-card p-7 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-primary text-primary-foreground">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-foreground">Accesso riservato</h2>
                <p className="text-[12px] text-muted-foreground">
                  Il profilo e l'ente vengono determinati automaticamente dal tuo account
                </p>
              </div>
            </div>

            <button
              onClick={handleSso}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground py-3 text-[14px] font-bold transition-colors hover:bg-primary/90 disabled:opacity-60 disabled:cursor-wait uppercase tracking-wide"
            >
              {signingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Reindirizzamento...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" /> Accedi con SSO
                </>
              )}
            </button>
          </div>

          <p className="mt-10 text-[12px] text-muted-foreground/60">
            Autenticazione gestita tramite Identity Provider (Keycloak)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* AGID-style top band */}
      <div className="h-1 w-full bg-primary" />

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary text-primary-foreground text-3xl shadow-lg">
            🏛️
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Cruscotto HR</h1>
          <p className="text-[14px] text-muted-foreground max-w-md leading-relaxed">
            Seleziona il profilo con cui accedere alla piattaforma
          </p>
        </div>

        {step === "choose" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
            {/* DFP Card */}
            <button
              onClick={handleDfp}
              disabled={signingIn}
              className="group relative flex flex-col items-start gap-5 rounded-lg border-2 bg-card p-7 text-left transition-all hover:shadow-xl hover:border-primary/50 disabled:opacity-60 disabled:cursor-wait"
            >
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-lg bg-primary" />
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary text-primary-foreground">
                {signingIn ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Shield className="h-6 w-6" />
                )}
              </div>
              <div className="space-y-2">
                <h2 className="text-[16px] font-bold text-foreground leading-snug">
                  Dipartimento della Funzione Pubblica
                </h2>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Accesso completo a tutti gli enti. Visualizzazione aggregata, filtri e confronto
                  tra amministrazioni.
                </p>
              </div>
              <div className="mt-auto pt-3 text-[12px] font-bold text-primary group-hover:underline uppercase tracking-wide">
                {signingIn ? "Accesso in corso..." : "Accedi →"}
              </div>
            </button>

            {/* Ente HR Card */}
            <button
              onClick={handleEnteClick}
              disabled={signingIn || loadingEnti}
              className="group relative flex flex-col items-start gap-5 rounded-lg border-2 bg-card p-7 text-left transition-all hover:shadow-xl hover:border-accent/50 disabled:opacity-60 disabled:cursor-wait"
            >
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-lg bg-accent" />
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-accent text-accent-foreground">
                {loadingEnti ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Building2 className="h-6 w-6" />
                )}
              </div>
              <div className="space-y-2">
                <h2 className="text-[16px] font-bold text-foreground leading-snug">
                  Responsabile HR — Ente
                </h2>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Accesso limitato ai dati del proprio ente. Seleziona il comune per visualizzare i
                  dati.
                </p>
              </div>
              <div className="mt-auto pt-3 text-[12px] font-bold text-accent group-hover:underline uppercase tracking-wide">
                {loadingEnti ? "Caricamento enti..." : "Seleziona ente →"}
              </div>
            </button>
          </div>
        )}

        {step === "pick_ente" && (
          <div className="w-full max-w-md space-y-4">
            <button
              onClick={() => {
                setStep("choose");
                setSelectedEnte(null);
              }}
              className="text-[13px] text-primary hover:underline font-semibold transition-colors"
            >
              ← Torna alla selezione profilo
            </button>

            <div className="rounded-lg border-2 bg-card p-7 space-y-5">
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-lg bg-accent" />
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-accent text-accent-foreground">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-foreground">Responsabile HR</h2>
                  <p className="text-[12px] text-muted-foreground">
                    Seleziona l'ente di appartenenza
                  </p>
                </div>
              </div>

              <div className="relative">
                <select
                  value={selectedEnte ?? ""}
                  onChange={(e) => setSelectedEnte(e.target.value ? Number(e.target.value) : null)}
                  className="appearance-none w-full rounded-md border-2 border-input bg-background pl-3 pr-8 py-3 text-[14px] text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer transition-all"
                >
                  <option value="">— Seleziona un ente —</option>
                  {enti.map((e) => (
                    <option key={e.ente_id} value={e.ente_id}>
                      {e.denominazione}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              <button
                onClick={handleEnteConfirm}
                disabled={!selectedEnte || signingIn}
                className="w-full rounded-md bg-primary text-primary-foreground py-3 text-[14px] font-bold transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
              >
                {signingIn ? "Accesso in corso..." : "Accedi come Responsabile HR"}
              </button>
            </div>
          </div>
        )}

        <p className="mt-10 text-[12px] text-muted-foreground/60">
          Ambiente dimostrativo — dati simulati per 6 comuni pilota
        </p>
      </div>
    </div>
  );
};

export default Login;
