import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isKeycloakEnabled, keycloak, initKeycloak } from "@/auth/keycloak";

export type AppRole = "dfp" | "ente_hr";

interface UserProfile {
  role: AppRole;
  ente_id: number | null;
  full_name: string;
  ente_denominazione?: string;
}

interface AuthContextValue {
  profile: UserProfile | null;
  loading: boolean;
  signIn: (role: AppRole, enteId?: number | null) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  profile: null,
  loading: true,
  signIn: async () => {},
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

/**
 * Deriva il profilo applicativo dai claim del token Keycloak.
 * NB: la mappatura ruolo/ente e provvisoria e verra rifinita quando l'admin
 * definira i claim (`ente_id`, ruoli) nel token di accesso.
 */
function profileFromKeycloak(): UserProfile | null {
  if (!keycloak?.authenticated || !keycloak.tokenParsed) return null;
  const c = keycloak.tokenParsed as Record<string, unknown>;
  const realmRoles = ((c.realm_access as { roles?: string[] } | undefined)?.roles ?? []) as string[];
  const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string | undefined;
  const resourceAccess = (c.resource_access as Record<string, { roles?: string[] }> | undefined) ?? {};
  const clientRoles = (clientId ? resourceAccess[clientId]?.roles ?? [] : []) as string[];
  const roles = [...realmRoles, ...clientRoles].map((r) => r.toLowerCase());

  const isDfp = roles.some((r) =>
    ["dfp", "super_admin", "superadmin", "admin", "amministratore-gru", "amministratore"].includes(
      r,
    ),
  );
  const role: AppRole = isDfp ? "dfp" : "ente_hr";

  const enteRaw = (c.ente_id ?? c.enteId ?? null) as string | number | null;
  const ente_id = enteRaw != null && enteRaw !== "" ? Number(enteRaw) : null;

  const fullName =
    (c.name as string) ??
    (c.preferred_username as string) ??
    (role === "dfp" ? "Utente DFP" : "Responsabile HR");

  return { role, ente_id: role === "dfp" ? null : ente_id, full_name: fullName };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- Modalita Keycloak (quando configurato via env) ---
    if (isKeycloakEnabled) {
      let active = true;
      const refresh = () => {
        if (active) setProfile(profileFromKeycloak());
      };
      initKeycloak()
        .then(refresh)
        .catch((e) => console.error("Keycloak: inizializzazione fallita", e))
        .finally(() => {
          if (active) setLoading(false);
        });
      keycloak.onAuthSuccess = refresh;
      keycloak.onAuthRefreshSuccess = refresh;
      keycloak.onAuthLogout = () => active && setProfile(null);
      keycloak.onAuthRefreshError = () => active && setProfile(null);
      return () => {
        active = false;
      };
    }

    // --- Fallback: login dimostrativo (mock) ---
    const stored = sessionStorage.getItem("mock_profile");
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
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
        .from("lk_enti")
        .select("denominazione")
        .eq("ente_id", enteId)
        .maybeSingle();
      if (data) enteDenom = data.denominazione;
    }

    const p: UserProfile = {
      role,
      ente_id: role === "dfp" ? null : (enteId ?? null),
      full_name: role === "dfp" ? "Utente DFP" : "Responsabile HR",
      ente_denominazione: enteDenom,
    };
    setProfile(p);
    sessionStorage.setItem("mock_profile", JSON.stringify(p));
  };

  const signOut = () => {
    if (isKeycloakEnabled) {
      void keycloak.logout({ redirectUri: `${window.location.origin}/` });
      return;
    }
    setProfile(null);
    sessionStorage.removeItem("mock_profile");
  };

  return (
    <AuthContext.Provider value={{ profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
