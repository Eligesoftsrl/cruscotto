"""
Proxy FastAPI: mette in sicurezza l'accesso ai dati e alle tabelle Admin.

Due responsabilita':
  1) POST /exchange   -> scambio token Keycloak -> token Supabase (dati con RLS).
                         Riservato ai ruoli previsti (require_authorized).
  2) /admin/*         -> tabelle Admin (feature_flags, log_*, statistiche) nello
                         schema `scruscotto`, lette/scritte direttamente dal proxy.
                         Le LETTURE sono riservate agli admin (require_admin);
                         gli INSERT di log sono aperti agli utenti autenticati ma
                         username/ruolo vengono presi dal TOKEN, non dal client.

Avvio:  uvicorn main:app --host 0.0.0.0 --port 8000
"""

import json
import os

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from security import (
    current_claims,
    require_admin,
    require_authorized,
    mint_supabase_token,
    app_role,
    TOKEN_TTL_SECONDS,
)
from db import get_cursor

ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app = FastAPI(title="Proxy sicurezza Cruscotto HR")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS if o.strip()],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


def _username(claims: dict) -> str:
    return claims.get("preferred_username") or claims.get("email") or claims["sub"]


def _ruolo(claims: dict) -> str:
    # Ruolo applicativo significativo (dfp/ente_hr), non il primo ruolo grezzo.
    return app_role(claims) or "non_autorizzato"


# ============================================================
# 1) SCAMBIO TOKEN  (tabelle dati protette da RLS su Supabase)
# ============================================================

class ExchangeResponse(BaseModel):
    access_token: str
    expires_in: int


@app.post("/exchange", response_model=ExchangeResponse)
def exchange(claims: dict = Depends(require_authorized)):
    return ExchangeResponse(
        access_token=mint_supabase_token(claims),
        expires_in=TOKEN_TTL_SECONDS,
    )


# ============================================================
# 2) FEATURE FLAGS
# ============================================================

@app.get("/admin/feature-flags")
def list_flags(_: dict = Depends(require_authorized)):
    # Lettura consentita a ogni utente AUTORIZZATO: le flag servono al frontend
    # per il gating del menu (anche per gli utenti ente). La SCRITTURA resta
    # riservata agli admin (vedi set_flag).
    with get_cursor() as cur:
        cur.execute(
            "select key, label, description, category, enabled, updated_by, updated_at "
            "from feature_flags order by category, label"
        )
        return {"items": cur.fetchall()}


class FlagIn(BaseModel):
    key: str
    enabled: bool


@app.post("/admin/feature-flags")
def set_flag(body: FlagIn, claims: dict = Depends(require_admin)):
    """Attiva/disattiva una funzionalita'. Solo admin verificato dal token."""
    with get_cursor() as cur:
        cur.execute(
            "update feature_flags set enabled = %s, updated_by = %s, updated_at = now() "
            "where key = %s returning key, enabled",
            (body.enabled, _username(claims), body.key),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Chiave non trovata: {body.key}")
        return row


# ============================================================
# 3) LOG ACCESSI
# ============================================================

@app.get("/admin/log-accessi")
def list_accessi(_: dict = Depends(require_admin), limit: int = 200):
    with get_cursor() as cur:
        cur.execute(
            "select id, ts, username, ruolo, esito, ip, user_agent "
            "from log_accessi order by ts desc limit %s",
            (limit,),
        )
        return {"items": cur.fetchall()}


class AccessoIn(BaseModel):
    esito: str = "success"          # 'success' | 'fail'
    ip: str | None = None
    user_agent: str | None = None


@app.post("/admin/log-accessi")
def add_accesso(body: AccessoIn, claims: dict = Depends(current_claims)):
    """Registra un accesso. username/ruolo dal token (non falsificabili)."""
    with get_cursor() as cur:
        cur.execute(
            "insert into log_accessi (username, ruolo, esito, ip, user_agent) "
            "values (%s, %s, %s, %s, %s) returning id",
            (_username(claims), _ruolo(claims), body.esito, body.ip, body.user_agent),
        )
        return {"id": cur.fetchone()["id"]}


# ============================================================
# 4) LOG EVENTI
# ============================================================

@app.get("/admin/log-eventi")
def list_eventi(_: dict = Depends(require_admin), limit: int = 200):
    with get_cursor() as cur:
        cur.execute(
            "select id, ts, username, ruolo, azione, sezione, dettagli "
            "from log_eventi order by ts desc limit %s",
            (limit,),
        )
        return {"items": cur.fetchall()}


class EventoIn(BaseModel):
    azione: str
    sezione: str | None = None
    dettagli: dict | None = None


@app.post("/admin/log-eventi")
def add_evento(body: EventoIn, claims: dict = Depends(current_claims)):
    with get_cursor() as cur:
        cur.execute(
            "insert into log_eventi (username, ruolo, azione, sezione, dettagli) "
            "values (%s, %s, %s, %s, %s) returning id",
            (
                _username(claims), _ruolo(claims), body.azione, body.sezione,
                json.dumps(body.dettagli) if body.dettagli is not None else None,
            ),
        )
        return {"id": cur.fetchone()["id"]}


# ============================================================
# 5) LOG ERRORI
# ============================================================

@app.get("/admin/log-errori")
def list_errori(_: dict = Depends(require_admin), limit: int = 200):
    with get_cursor() as cur:
        cur.execute(
            "select id, ts, username, livello, origine, messaggio, stack "
            "from log_errori order by ts desc limit %s",
            (limit,),
        )
        return {"items": cur.fetchall()}


class ErroreIn(BaseModel):
    messaggio: str
    livello: str = "error"          # 'error' | 'warn'
    origine: str | None = None      # 'query' | 'boundary' | 'runtime'
    stack: str | None = None


@app.post("/admin/log-errori")
def add_errore(body: ErroreIn, claims: dict = Depends(current_claims)):
    with get_cursor() as cur:
        cur.execute(
            "insert into log_errori (username, livello, origine, messaggio, stack) "
            "values (%s, %s, %s, %s, %s) returning id",
            (_username(claims), body.livello, body.origine, body.messaggio, body.stack),
        )
        return {"id": cur.fetchone()["id"]}


# ============================================================
# 6) STATISTICHE (viste)
# ============================================================

@app.get("/admin/stat-utilizzo")
def stat_utilizzo(_: dict = Depends(require_admin)):
    with get_cursor() as cur:
        cur.execute("select funzione, utilizzi, ultimo_utilizzo from v_stat_utilizzo")
        return {"items": cur.fetchall()}


@app.get("/admin/stat-funzionalita")
def stat_funzionalita(_: dict = Depends(require_admin)):
    with get_cursor() as cur:
        cur.execute(
            "select key, label, category, enabled, utilizzi, ultimo_utilizzo "
            "from v_stat_funzionalita"
        )
        return {"items": cur.fetchall()}


@app.get("/health")
def health():
    return {"status": "ok"}
