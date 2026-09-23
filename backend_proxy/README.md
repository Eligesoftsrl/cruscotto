# Proxy sicurezza Cruscotto HR

Servizio FastAPI che mette in sicurezza l'accesso ai dati e alle tabelle Admin.

## Cosa fa
1. **`POST /exchange`** — verifica il token Keycloak (RS256/JWKS) e, **solo per i
   ruoli consentiti**, conia un token firmato col `SUPABASE_JWT_SECRET` con i claim
   `role=authenticated`, `is_global`, `enti_cf`. Il browser lo usa con Supabase:
   PostgREST lo accetta e applica le **RLS**.
2. **`/admin/*`** — legge/scrive le tabelle Admin (schema `scruscotto`) via
   connessione Postgres diretta (utente `cruscapp`). Le letture sono riservate agli
   admin; gli insert di log prendono `username`/`ruolo` **dal token**.

## ⚠️ Dove va eseguito
Su una macchina della **stessa rete privata** del Postgres `172.16.0.15`
(non è raggiungibile da Internet/preview). Il proxy espone HTTPS verso il browser
e parla col DB in rete interna.

## Requisiti
- Python 3.10+
- Accesso di rete a `172.16.0.15:5432` e a Keycloak (`identity.progetto-gru.it`)

## Setup
```bash
cd backend_proxy
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # poi valorizzare i CHANGE_ME (password DB + SUPABASE_JWT_SECRET)
uvicorn main:app --host 0.0.0.0 --port 8000
```
Produzione (esempio):
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
# meglio dietro reverse proxy (nginx/apache) con HTTPS, come systemd service
```

## Variabili d'ambiente
Vedi `.env.example`. Le due da recuperare dal sistemista:
- `SUPABASE_JWT_SECRET` — JWT secret dell'istanza PostgREST/Supabase (quella degli RPC)
- password in `DATABASE_URL` — utente `cruscapp`

## Frontend
- Impostare `VITE_EXCHANGE_URL` all'URL pubblico del proxy (es. `https://proxy.tuodominio`).
- Dati: agganciare il token di `/exchange` a supabase-js (opzione `accessToken` in v2),
  con riemissione alla scadenza (`expires_in`).
- Admin: usare `AdminService.ts` al posto dell'accesso via anon key.

## ‼️ Punto critico (lato DB, da fare col sistemista)
Le RPC/tabelle dati devono applicare il perimetro **dal token** (`enti_cf`,
`is_global`), non dal parametro `p_codice_fiscale` inviato dal client. Senza RLS/
controlli server-side, il proxy aggiunge autenticazione ma non l'isolamento dati.
