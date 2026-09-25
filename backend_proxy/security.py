"""
Verifica del token Keycloak, risoluzione dei ruoli e conio del token Supabase.

Flusso:
- Il browser fa login con Keycloak e ottiene l'access token (come oggi).
- Qui VERIFICHIAMO quel token contro le chiavi pubbliche di Keycloak (JWKS, RS256).
- Se valido e AUTORIZZATO, coniamo un NUOVO token firmato col JWT_SECRET di
  Supabase, con i claim usati dalle RLS: role=authenticated, is_global, enti_cf.

Differenze rispetto alla prima bozza:
- Blocco dei ruoli NON consentiti (require_authorized), coerente con il frontend.
- app_role(): restituisce il ruolo applicativo significativo (dfp/ente_hr),
  non il primo ruolo grezzo (che poteva essere default-roles-*).
- Lettura ruoli anche da resource_access (client roles), oltre a realm_access.
"""

import os
import time

import jwt  # PyJWT
from jwt import PyJWKClient
from fastapi import Depends, Header, HTTPException

KEYCLOAK_ISSUER = os.environ["KEYCLOAK_ISSUER"]          # es. https://identity.progetto-gru.it/realms/gru
KEYCLOAK_AUDIENCE = os.environ.get("KEYCLOAK_AUDIENCE")  # opzionale ma consigliato
SUPABASE_JWT_SECRET = os.environ["SUPABASE_JWT_SECRET"]  # lo stesso JWT_SECRET dell'istanza PostgREST/Supabase
TOKEN_TTL_SECONDS = int(os.environ.get("TOKEN_TTL_SECONDS", "3600"))


def _role_set(env_name: str, default: str) -> set[str]:
    raw = os.environ.get(env_name, default)
    return {r.strip().lower() for r in raw.split(",") if r.strip()}


# Confronto sempre in minuscolo (case-insensitive), come nel frontend.
DFP_ROLES = _role_set(
    "DFP_ROLES",
    "admin,amministratore,super_admin,dfp,"
    "amministratore-gru,amministratore-formez,amministratore-unico",
)
ENTE_ROLES = _role_set("ENTE_ROLES", "hr-cruscotto,ente_hr,ente-hr,hr_cruscotto")

# Ruoli con privilegi di AMMINISTRAZIONE (accesso agli endpoint /admin/*).
# NB: il solo ruolo `dfp` NON è incluso: vista globale sì, amministrazione no.
# Coerente con il frontend (profilo `dfp` vs flag `is_admin`).
ADMIN_ROLES = _role_set(
    "ADMIN_ROLES",
    "admin,amministratore,super_admin,"
    "amministratore-gru,amministratore-formez,amministratore-unico",
)

_jwks_client = PyJWKClient(f"{KEYCLOAK_ISSUER}/protocol/openid-connect/certs")


def verify_keycloak_token(token: str) -> dict:
    """Verifica firma, issuer, scadenza (e audience se configurata)."""
    try:
        key = _jwks_client.get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            key.key,
            algorithms=["RS256"],
            issuer=KEYCLOAK_ISSUER,
            audience=KEYCLOAK_AUDIENCE or None,
            options={"verify_aud": bool(KEYCLOAK_AUDIENCE)},
        )
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Token Keycloak non valido: {e}")


def roles_of(claims: dict) -> list[str]:
    """Ruoli realm + eventuali ruoli client (resource_access)."""
    realm = claims.get("realm_access", {}).get("roles", []) or []
    res = claims.get("resource_access", {}) or {}
    client = []
    for _, v in res.items():
        client.extend((v or {}).get("roles", []) or [])
    return [*realm, *client]


def is_global(claims: dict) -> bool:
    """True se l'utente ha un ruolo admin/DFP -> vista globale."""
    return any(r.lower() in DFP_ROLES for r in roles_of(claims))


def is_admin(claims: dict) -> bool:
    """True se l'utente ha un ruolo con privilegi di amministrazione.

    Il solo ruolo `dfp` (vista globale) NON è sufficiente: serve un ruolo
    presente in ADMIN_ROLES. Coerente col frontend (flag `is_admin`).
    """
    return any(r.lower() in ADMIN_ROLES for r in roles_of(claims))


def is_ente(claims: dict) -> bool:
    """True se l'utente ha un ruolo ente (es. Hr-Cruscotto)."""
    return any(r.lower() in ENTE_ROLES for r in roles_of(claims))


def enti_cf_of(claims: dict) -> list[str]:
    """Lista dei CF a cui l'utente ha accesso (claim enti_cf)."""
    v = claims.get("enti_cf") or []
    if isinstance(v, str):
        v = [x for x in v.replace(";", ",").split(",") if x.strip()]
    return [str(x).strip() for x in v if str(x).strip()]


def app_role(claims: dict) -> str | None:
    """Ruolo applicativo significativo: 'dfp' | 'ente_hr' | None."""
    if is_global(claims):
        return "dfp"
    if is_ente(claims):
        return "ente_hr"
    return None


def mint_supabase_token(claims: dict) -> str:
    """Conia il token che il browser usera' con Supabase (PostgREST)."""
    now = int(time.time())
    payload = {
        "sub": claims["sub"],
        "role": "authenticated",   # indispensabile per PostgREST
        "aud": "authenticated",
        "iat": now,
        "exp": now + TOKEN_TTL_SECONDS,
        "email": claims.get("email"),
        "preferred_username": claims.get("preferred_username"),
        # --- claim letti dalle RLS ---
        "is_global": is_global(claims),
        "enti_cf": enti_cf_of(claims),
    }
    return jwt.encode(payload, SUPABASE_JWT_SECRET, algorithm="HS256")


# ---- Dependency FastAPI ----

def _bearer(authorization: str) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Header Authorization mancante o malformato")
    return authorization.split(" ", 1)[1]


def current_claims(authorization: str = Header(...)) -> dict:
    """Verifica il token Keycloak e restituisce i claim (utente autenticato)."""
    return verify_keycloak_token(_bearer(authorization))


def require_authorized(claims: dict = Depends(current_claims)) -> dict:
    """
    Consente solo i ruoli previsti dal progetto:
      - DFP/admin  -> ok (vista globale);
      - ente HR    -> ok SOLO se ha almeno un CF in enti_cf;
      - altrimenti -> 403 (accesso negato), coerente col frontend.
    """
    if is_global(claims):
        return claims
    if is_ente(claims):
        if not enti_cf_of(claims):
            raise HTTPException(status_code=403, detail="Ente senza codici fiscali abilitati")
        return claims
    raise HTTPException(status_code=403, detail="Ruolo non abilitato all'utilizzo del Cruscotto")


def require_admin(claims: dict = Depends(current_claims)) -> dict:
    """Consente solo gli utenti con privilegi di amministrazione.

    Il solo ruolo `dfp` (vista globale) non basta: serve un ruolo ADMIN_ROLES.
    """
    if not is_admin(claims):
        raise HTTPException(status_code=403, detail="Accesso riservato agli amministratori")
    return claims
