import Keycloak from "keycloak-js";

const url = import.meta.env.VITE_KEYCLOAK_URL as string | undefined;
const realm = import.meta.env.VITE_KEYCLOAK_REALM as string | undefined;
const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string | undefined;

/**
 * Vero quando Keycloak e configurato via variabili d'ambiente.
 * In caso contrario l'app continua a usare il login dimostrativo (mock),
 * cosi l'ambiente resta funzionante finche non sono pronti client pubblico
 * (PKCE) e redirect URI lato Keycloak.
 */
export const isKeycloakEnabled = Boolean(url && realm && clientId);

export const keycloak = isKeycloakEnabled
  ? new Keycloak({ url: url as string, realm: realm as string, clientId: clientId as string })
  : (null as unknown as Keycloak);

let initialization: Promise<boolean> | undefined;

/** Inizializza Keycloak una sola volta (idempotente, sicuro con React StrictMode). */
export function initKeycloak(): Promise<boolean> {
  if (!isKeycloakEnabled) return Promise.resolve(false);
  initialization ??= keycloak.init({
    onLoad: "check-sso",
    pkceMethod: "S256",
    checkLoginIframe: false,
    silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
  });
  return initialization;
}

/** Restituisce un access token fresco (rinnova se in scadenza entro 30s). */
export async function ensureFreshToken(): Promise<string | undefined> {
  if (!isKeycloakEnabled || !keycloak?.authenticated) return undefined;
  try {
    await keycloak.updateToken(30);
  } catch {
    // il refresh e fallito: il chiamante gestira il re-login
  }
  return keycloak.token;
}
