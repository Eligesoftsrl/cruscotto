"""Test di sicurezza dello strato di protezione (security by design).

Uso:  cd backend_proxy && pip install -r requirements.txt pytest && pytest -q
Verificano firma, emittente, client, ruoli e perimetro ente senza contattare Keycloak.
"""
import os
import time

import pytest

os.environ.setdefault("KEYCLOAK_ISSUER", "https://idp.test/realms/gru")
os.environ.setdefault("SUPABASE_JWT_SECRET", "segreto-di-test-lungo-almeno-32-caratteri!!")
os.environ.setdefault("KEYCLOAK_CLIENT_ID", "cruscotto")

import jwt  # noqa: E402
from cryptography.hazmat.primitives.asymmetric import rsa  # noqa: E402
from fastapi import HTTPException  # noqa: E402

import security as sec  # noqa: E402

KEY = rsa.generate_private_key(public_exponent=65537, key_size=2048)
OTHER_KEY = rsa.generate_private_key(public_exponent=65537, key_size=2048)


class _K:
    key = KEY.public_key()


@pytest.fixture(autouse=True)
def _jwks(monkeypatch):
    monkeypatch.setattr(sec._jwks_client, "get_signing_key_from_jwt", lambda _t: _K())


def tok(key=KEY, **over):
    now = int(time.time())
    c = {"iss": os.environ["KEYCLOAK_ISSUER"], "sub": "u1", "iat": now, "exp": now + 300, "azp": "cruscotto"}
    c.update(over)
    return jwt.encode(c, key, algorithm="RS256")


def test_token_valido():
    assert sec.verify_keycloak_token(tok())["sub"] == "u1"


@pytest.mark.parametrize(
    "token",
    [
        tok(key=OTHER_KEY),                       # firma non valida
        tok(iss="https://altro-idp/realms/x"),    # emittente diverso
        tok(exp=int(time.time()) - 3600),         # scaduto
        tok(azp="altra-applicazione"),            # emesso per un altro client
    ],
)
def test_token_rifiutati(token):
    with pytest.raises(HTTPException) as e:
        sec.verify_keycloak_token(token)
    assert e.value.status_code == 401
    assert "Traceback" not in str(e.value.detail)


def test_alg_none_rifiutato():
    t = jwt.encode({"iss": os.environ["KEYCLOAK_ISSUER"], "sub": "x", "exp": 9999999999, "iat": 1}, None, algorithm="none")
    with pytest.raises(HTTPException):
        sec.verify_keycloak_token(t)


def test_ruolo_admin_di_altro_client_non_conta():
    claims = {"resource_access": {"altra-app": {"roles": ["admin"]}}}
    assert not sec.is_admin(claims) and not sec.is_global(claims)
    with pytest.raises(HTTPException) as e:
        sec.require_authorized(claims)
    assert e.value.status_code == 403


def test_ruolo_client_del_cruscotto_conta():
    assert sec.is_admin({"resource_access": {"cruscotto": {"roles": ["admin"]}}})


def test_dfp_non_e_amministratore():
    c = {"realm_access": {"roles": ["dfp"]}}
    assert sec.is_global(c) and not sec.is_admin(c)
    with pytest.raises(HTTPException) as e:
        sec.require_admin(c)
    assert e.value.status_code == 403


def test_ente_senza_cf_negato():
    with pytest.raises(HTTPException) as e:
        sec.require_authorized({"realm_access": {"roles": ["ente_hr"]}})
    assert e.value.status_code == 403


def test_token_dati_contiene_solo_il_perimetro_dell_ente():
    c = {"sub": "u1", "realm_access": {"roles": ["ente_hr"]}, "enti_cf": "02438750586; 80209930587"}
    t = jwt.decode(sec.mint_supabase_token(c), os.environ["SUPABASE_JWT_SECRET"], algorithms=["HS256"], audience="authenticated")
    assert t["is_global"] is False
    assert t["enti_cf"] == ["02438750586", "80209930587"]
    assert t["exp"] - t["iat"] <= sec.TOKEN_TTL_SECONDS
