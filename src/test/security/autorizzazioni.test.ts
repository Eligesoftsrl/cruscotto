/**
 * Test di sicurezza (security by design) · autorizzazioni e perimetro dei dati.
 * Verificano le regole con cui un token Keycloak diventa un profilo applicativo.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const kc = vi.hoisted(() => ({ authenticated: true, tokenParsed: {} as Record<string, unknown> }));
vi.mock("@/auth/keycloak", () => ({ isKeycloakEnabled: true, keycloak: kc, initKeycloak: vi.fn() }));
vi.stubEnv("VITE_KEYCLOAK_CLIENT_ID", "cruscotto");

import { resolveKeycloak } from "@/contexts/AuthContext";

const token = (t: Record<string, unknown>) => {
  kc.authenticated = true;
  kc.tokenParsed = { name: "Utente di prova", ...t };
};
const realm = (...roles: string[]) => ({ realm_access: { roles } });

describe("Autorizzazioni (token Keycloak → profilo)", () => {
  beforeEach(() => token({}));

  it("utente non autenticato: nessun profilo, nessun accesso", () => {
    kc.authenticated = false;
    expect(resolveKeycloak()).toEqual({ profile: null, unauthorized: false });
  });

  it("ruolo non previsto: accesso negato", () => {
    token(realm("offline_access", "uma_authorization", "utente"));
    expect(resolveKeycloak()).toEqual({ profile: null, unauthorized: true });
  });

  it("responsabile HR senza codice fiscale ente: accesso negato (nessun dato nazionale)", () => {
    token(realm("ente_hr"));
    expect(resolveKeycloak()).toEqual({ profile: null, unauthorized: true });
  });

  it("responsabile HR: perimetro limitato ai codici fiscali del token", () => {
    token({ ...realm("ente_hr"), enti_cf: [" 02438750586 ", "80209930587"] });
    const r = resolveKeycloak();
    expect(r.unauthorized).toBe(false);
    expect(r.profile).toMatchObject({ role: "ente_hr", is_admin: false, enti_cf: ["02438750586", "80209930587"] });
  });

  it("responsabile HR: elenco CF in stringa separata da virgole", () => {
    token({ ...realm("ente_hr"), enti_cf: "02438750586,80209930587" });
    expect(resolveKeycloak().profile?.enti_cf).toEqual(["02438750586", "80209930587"]);
  });

  it("ruolo DFP: vista globale ma NON amministratore", () => {
    token(realm("dfp"));
    expect(resolveKeycloak().profile).toMatchObject({ role: "dfp", is_admin: false, enti_cf: [] });
  });

  it("ruolo amministratore: vista globale e pannello di amministrazione", () => {
    token(realm("ADMIN"));
    expect(resolveKeycloak().profile).toMatchObject({ role: "dfp", is_admin: true });
  });

  it("ruoli client considerati solo per il client del Cruscotto", () => {
    token({ resource_access: { "altra-app": { roles: ["admin"] } } });
    expect(resolveKeycloak()).toEqual({ profile: null, unauthorized: true });
    token({ resource_access: { cruscotto: { roles: ["dfp"] } } });
    expect(resolveKeycloak().profile?.role).toBe("dfp");
  });

  it("claim ente non numerico ignorato (nessun ente arbitrario)", () => {
    token({ ...realm("ente_hr"), enti_cf: ["02438750586"], istatcode: "1 OR 1=1" });
    expect(resolveKeycloak().profile?.ente_id).toBeNull();
  });
});
