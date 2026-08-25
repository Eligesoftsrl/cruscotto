import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("mock_profile");
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch {}
    }
    setLoading(false);
  }, []);

  const signIn = async (role: AppRole, enteId?: number | null) => {
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
    setProfile(null);
    sessionStorage.removeItem("mock_profile");
  };

  return (
    <AuthContext.Provider value={{ profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
