/**
 * Accessibilità · WCAG 2.2.1 «Regolazione dei tempi».
 *
 * La sessione SSO (Keycloak) scade dopo un periodo di inattività. Prima della scadenza:
 *  - se l'utente è attivo (mouse/tastiera/scorrimento nell'ultimo minuto) la sessione viene
 *    prolungata automaticamente, senza interruzioni;
 *  - altrimenti compare un avviso con almeno 2 minuti di anticipo e la possibilità di
 *    restare collegati con un solo comando (o di uscire).
 * A sessione scaduta compare un avviso con il pulsante «Accedi di nuovo».
 */
import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { isKeycloakEnabled, keycloak } from "@/auth/keycloak";
import { useAuth } from "@/contexts/AuthContext";
import { announce } from "@/lib/a11y/announcer";

const WARN_BEFORE_MS = 120_000; // avviso 2 minuti prima
const ACTIVE_WINDOW_MS = 60_000; // "attivo" = interazione nell'ultimo minuto
const CHECK_EVERY_MS = 5_000;

/** Millisecondi alla scadenza della sessione SSO (refresh token), null se non nota. */
function msToExpiry(): number | null {
  const exp = keycloak?.refreshTokenParsed?.exp;
  if (!exp) return null;
  const skewMs = (keycloak?.timeSkew ?? 0) * 1000;
  return exp * 1000 - Date.now() + skewMs;
}

const fmt = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  return m > 0 ? `${m} min ${String(s % 60).padStart(2, "0")} s` : `${s} secondi`;
};

export const SessionTimeoutWarning = () => {
  const { profile, signOut } = useAuth();
  const [state, setState] = useState<"ok" | "warning" | "expired">("ok");
  const [remaining, setRemaining] = useState(0);
  const lastActivity = useRef(Date.now());
  const extending = useRef(false);

  const extend = async () => {
    if (!keycloak || extending.current) return false;
    extending.current = true;
    try {
      await keycloak.updateToken(-1); // forza il rinnovo: prolunga la sessione SSO
      return true;
    } catch {
      return false;
    } finally {
      extending.current = false;
    }
  };

  useEffect(() => {
    if (!isKeycloakEnabled || !profile) return;
    const mark = () => {
      lastActivity.current = Date.now();
    };
    const evs = ["mousedown", "keydown", "wheel", "touchstart"] as const;
    evs.forEach((e) => window.addEventListener(e, mark, { passive: true }));

    const tick = async () => {
      const ms = msToExpiry();
      if (ms == null) return;
      if (ms <= 0) {
        setState((s) => {
          if (s !== "expired") announce("Sessione scaduta. Accedi di nuovo per continuare.");
          return "expired";
        });
        return;
      }
      if (ms > WARN_BEFORE_MS) {
        setState((s) => (s === "expired" ? s : "ok"));
        return;
      }
      // In scadenza: se l'utente è attivo si rinnova in silenzio.
      if (Date.now() - lastActivity.current < ACTIVE_WINDOW_MS) {
        if (await extend()) return;
      }
      setRemaining(ms);
      setState((s) => (s === "ok" ? "warning" : s));
    };
    void tick();
    const id = window.setInterval(() => void tick(), CHECK_EVERY_MS);
    return () => {
      window.clearInterval(id);
      evs.forEach((e) => window.removeEventListener(e, mark));
    };
  }, [profile]);

  if (!isKeycloakEnabled || !profile || state === "ok") return null;

  if (state === "expired") {
    return (
      <AlertDialog open>
        <AlertDialogContent data-testid="session-expired">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Clock aria-hidden="true" className="h-5 w-5 text-primary" />
              Sessione scaduta
            </AlertDialogTitle>
            <AlertDialogDescription>
              Per motivi di sicurezza la sessione è terminata dopo un periodo di inattività.
              Accedi di nuovo per continuare: tornerai alla pagina in cui ti trovavi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => void keycloak?.login({ redirectUri: window.location.href })}>
              Accedi di nuovo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open>
      <AlertDialogContent data-testid="session-warning">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock aria-hidden="true" className="h-5 w-5 text-primary" />
            La sessione sta per scadere
          </AlertDialogTitle>
          <AlertDialogDescription>
            Per inattività la sessione terminerà tra circa <strong>{fmt(remaining)}</strong>.
            Vuoi restare collegato?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={signOut}>Esci</AlertDialogCancel>
          <AlertDialogAction
            autoFocus
            onClick={async () => {
              const ok = await extend();
              setState(ok ? "ok" : "expired");
              if (ok) announce("Sessione prolungata.");
            }}
          >
            Resta collegato
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
