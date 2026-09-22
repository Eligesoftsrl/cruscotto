import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isKeycloakEnabled, keycloak, initKeycloak } from "@/auth/keycloak";
import { setLogUser, resetLogUser, logAccesso, clearAccessDedupe } from "@/services/admin/logger";

export type AppRole = "dfp" | "ente_hr";

/** Ruoli Keycloak considerati amministratore (profilo `dfp`). */
const DFP_ROLES = [
  "dfp",
  "super_admin",
  "superadmin",
  "admin",
  "amministratore",
  "amministratore-gru",
  "amministratore-formez",
  "amministratore-unico",
];

/** Ruoli Keycloak consentiti per gli utenti-ente (profilo `ente_hr`). */
const ENTE_ROLES = ["ente_hr", "ente-hr", "hr_ente", "hr-cruscotto", "hr_cruscotto"];

interface UserProfile {
  role: AppRole;
  ente_id: number | null;
  /** Codici fiscali degli enti abilitati (claim Keycloak `enti_cf`). */
  enti_cf: string[];
  full_name: string;
  ente_denominazione?: string;
}

interface AuthContextValue {
  profile: UserProfile | null;
  loading: boolean;
  /** true = utente autenticato ma con ruolo NON consentito (accesso negato). */
  unauthorized: boolean;
  signIn: (role: AppRole, enteId?: number | null) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  profile: null,
  loading: true,
  unauthorized: false,
  signIn: async () => {},
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

/**
 * Risolve l'autenticazione Keycloak in profilo applicativo.
 * Restituisce `unauthorized: true` quando l'utente è autenticato ma:
 *  - NON possiede un ruolo consentito (DFP o ente HR), oppure
 *  - è un ente HR privo di codici fiscali (`enti_cf`) nel token.
 * In questi casi l'accesso viene inibito (nessun profilo) per evitare errori.
 */
function resolveKeycloak(): { profile: UserProfile | null; unauthorized: boolean } {
  if (!keycloak?.authenticated || !keycloak.tokenParsed) {
    return { profile: null, unauthorized: false };
  }
  const c = keycloak.tokenParsed as Record<string, unknown>;
  const realmRoles = ((c.realm_access as { roles?: string[] } | undefined)?.roles ?? []) as string[];
  const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string | undefined;
  const resourceAccess = (c.resource_access as Record<string, { roles?: string[] }> | undefined) ?? {};
  const clientRoles = (clientId ? resourceAccess[clientId]?.roles ?? [] : []) as string[];
  const roles = [...realmRoles, ...clientRoles].map((r) => r.toLowerCase());

  const isDfp = roles.some((r) => DFP_ROLES.includes(r));
  const isEnte = roles.some((r) => ENTE_ROLES.includes(r));

  const fullName =
    (c.name as string) ??
    (c.preferred_username as string) ??
    (isDfp ? "Utente DFP" : "Responsabile HR");

  // Amministratore/DFP: accesso completo, nessun perimetro ente.
  if (isDfp) {
    return {
      profile: { role: "dfp", ente_id: null, enti_cf: [], full_name: fullName },
      unauthorized: false,
    };
  }

  // Utente-ente: consentito solo se ha un ruolo ente valido.
  if (isEnte) {
    // Ente di appartenenza (claim provvisorio `istatcode`).
    const enteRaw = (c.istatcode ?? c.ente_id ?? c.enteId ?? null) as string | number | null;
    const enteParsed = enteRaw != null && enteRaw !== "" ? Number(enteRaw) : null;
    const ente_id = enteParsed != null && Number.isFinite(enteParsed) ? enteParsed : null;

    // Codici fiscali degli enti abilitati (claim `enti_cf`).
    const rawCf = c.enti_cf ?? c.cf_ente ?? null;
    let enti_cf: string[] = [];
    if (Array.isArray(rawCf)) {
      enti_cf = rawCf.map((v) => String(v).trim()).filter(Boolean);
    } else if (typeof rawCf === "string" && rawCf.trim()) {
      enti_cf = rawCf.split(/[,;\s]+/).map((v) => v.trim()).filter(Boolean);
    }

    // Scelta cliente: ente HR senza alcun CF -> accesso negato (evita errori).
    if (enti_cf.length === 0) {
      return { profile: null, unauthorized: true };
    }

    return {
      profile: { role: "ente_hr", ente_id, enti_cf, full_name: fullName },
      unauthorized: false,
    };
  }

  // Nessun ruolo consentito -> accesso negato.
  return { profile: null, unauthorized: true };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- Modalita Keycloak (quando configurato via env) ---
    if (isKeycloakEnabled) {
      let active = true;
      const refresh = () => {
        if (!active) return;
        const { profile: p, unauthorized: u } = resolveKeycloak();
        setProfile(p);
        setUnauthorized(u);
        if (p) {
          setLogUser({ username: p.full_name, ruolo: p.role });
          logAccesso("success");
        } else if (u) {
          // Accesso negato: registro il tentativo (ruolo non consentito).
          const tp = (keycloak.tokenParsed ?? {}) as Record<string, unknown>;
          const uname =
            (tp.preferred_username as string) ?? (tp.name as string) ?? "sconosciuto";
          setLogUser({ username: uname, ruolo: "non_autorizzato" });
          logAccesso("fail");
        }
      };
      initKeycloak()
        .then(refresh)
        .catch((e) => console.error("Keycloak: inizializzazione fallita", e))
        .finally(() => {
          if (active) setLoading(false);
        });
      keycloak.onAuthSuccess = refresh;
      keycloak.onAuthRefreshSuccess = refresh;
      keycloak.onAuthLogout = () => {
        if (!active) return;
        setProfile(null);
        setUnauthorized(false);
      };
      keycloak.onAuthRefreshError = () => {
        if (!active) return;
        setProfile(null);
        setUnauthorized(false);
      };
      return () => {
        active = false;
      };
    }

    // --- Fallback: login dimostrativo (mock) ---
    const stored = sessionStorage.getItem("mock_profile");
    if (stored) {
      try {
        const p = JSON.parse(stored) as UserProfile;
        setProfile(p);
        setLogUser({ username: p.full_name, ruolo: p.role });
      } catch {
        // sessione malformata: ignoro e resto non autenticato
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (role: AppRole, enteId?: number | null) => {
    // Con Keycloak il login avviene via redirect: ruolo/ente arrivano dai claim.
    if (isKeycloakEnabled) {
      await keycloak.login({ redirectUri: window.location.href });
      return;
    }

    // Login dimostrativo (mock)
    let enteDenom: string | undefined;
    if (role === "ente_hr" && enteId) {
      const { data } = await supabase
        .from("dw_ente")
        .select("denominazione")
        .eq("id_ente", enteId)
        .maybeSingle();
      if (data) enteDenom = data.denominazione;
    }

    const p: UserProfile = {
      role,
      ente_id: role === "dfp" ? null : (enteId ?? null),
      // Demo locale (senza Keycloak): CF Comune di Roma per l'utente ente.
      enti_cf: role === "ente_hr" ? ["80054330586"] : [],
      full_name: role === "dfp" ? "Utente DFP" : "Responsabile HR",
      ente_denominazione: enteDenom,
    };
    setProfile(p);
    sessionStorage.setItem("mock_profile", JSON.stringify(p));
    setLogUser({ username: p.full_name, ruolo: p.role });
    logAccesso("success");
  };

  const signOut = () => {
    resetLogUser();
    clearAccessDedupe();
    if (isKeycloakEnabled) {
      void keycloak.logout({ redirectUri: `${window.location.origin}/` });
      return;
    }
    setProfile(null);
    sessionStorage.removeItem("mock_profile");
  };

  return (
    <AuthContext.Provider value={{ profile, loading, unauthorized, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
