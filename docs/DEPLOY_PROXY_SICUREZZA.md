# Cruscotto HR — Guida al deploy del Proxy di Sicurezza (Keycloak ↔ Supabase)

Documento operativo per il **sistemista**. Contiene tutto il necessario per mettere
in produzione il proxy che blinda l'accesso ai dati (RLS) e alle tabelle Admin.

---

## 1. Architettura (opzione A: stesso dominio, reverse proxy)

```
 Browser (SPA)
   │  1) login SSO ───────────────► Keycloak (identity.progetto-gru.it/realms/gru)
   │  2) POST /auth/exchange (Bearer token Keycloak)
   ▼
 Apache (HTTPS, stesso dominio della SPA)
   │  /auth/*  ──► reverse proxy ──►  Proxy FastAPI (127.0.0.1:8000)
   │                                   ├─ /exchange : conia token Supabase (RLS)
   │                                   └─ /admin/*  : tabelle Admin (schema scruscotto)
   ▼                                         │
 Supabase/PostgREST (api-cr.progetto-gru.it) │ (rete privata)
   (dati fa_ca_* con RLS)                     ▼
                                     Postgres 172.16.0.15 / db cruscotto
```

- **Dati** (`fa_ca_*`): la SPA li legge direttamente da Supabase, ma con il **token coniato** dal proxy (claim `is_global`/`enti_cf`) → RLS attive.
- **Admin** (`feature_flags`, `log_*`, statistiche): la SPA li legge/scrive **solo tramite il proxy** (`/auth/admin/*`).

---

## 2. Prerequisiti
- Una macchina che raggiunge **sia** `172.16.0.15:5432` **sia** Keycloak.
- Python 3.10+.
- Apache con `mod_proxy`, `mod_proxy_http`, `mod_headers`, `mod_ssl`, `mod_rewrite`.
- I file del proxy: cartella **`backend_proxy/`** del repository.

---

## 3. Segreti / parametri da predisporre
Nel file `backend_proxy/.env` (già presente, **non** in git) valorizzare i `CHANGE_ME`:

| Variabile | Valore | Dove reperirlo |
|---|---|---|
| `SUPABASE_JWT_SECRET` | *(da inserire)* | `JWT_SECRET` dell'istanza Supabase/PostgREST che serve gli RPC (`api-cr`). In self-hosted è nel `.env` dello stack; in Studio: *Settings → API → JWT Secret*. |
| `DATABASE_URL` (password) | `postgresql://cruscapp:****@172.16.0.15:5432/cruscotto` | Password utente `cruscapp` (già impostata; ruotarla se serve). |
| `KEYCLOAK_ISSUER` | `https://identity.progetto-gru.it/realms/gru` | già impostato |
| `KEYCLOAK_AUDIENCE` | `oqtane-gru-cruscotto` (consigliato) | client Keycloak della SPA |
| `DB_SCHEMA` | `scruscotto` | già impostato |
| `ALLOWED_ORIGINS` | (non necessario in opzione A, stessa origine) | — |
| `ADMIN_ROLES` | `admin,amministratore,super_admin,amministratore-gru,amministratore-formez,amministratore-unico` | Ruoli con accesso al pannello `/admin/*`. **NON** include `dfp` da solo: il DFP vede tutti gli enti ma non amministra. Già impostato. |

> ℹ️ **Separazione DFP / Amministratore**: la vista globale (`DFP_ROLES`, che include `dfp`)
> è distinta dai privilegi di amministrazione (`ADMIN_ROLES`, che **non** include `dfp`).
> Gli endpoint `/admin/*` sono protetti da `require_admin`, coerente con il frontend.

> ⚠️ **Requisito chiave**: `SUPABASE_JWT_SECRET` **deve coincidere** col JWT secret con cui PostgREST verifica i token (stessa istanza degli RPC), altrimenti i token coniati verranno rifiutati.

---

## 4. Avvio del proxy (systemd)

```bash
cd /opt/cruscotto/backend_proxy      # posizione a scelta
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
# valorizzare .env (SUPABASE_JWT_SECRET + password)
```

`/etc/systemd/system/cruscotto-proxy.service`:
```ini
[Unit]
Description=Cruscotto HR - Proxy sicurezza
After=network.target

[Service]
WorkingDirectory=/opt/cruscotto/backend_proxy
EnvironmentFile=/opt/cruscotto/backend_proxy/.env
ExecStart=/opt/cruscotto/backend_proxy/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now cruscotto-proxy
curl -s http://127.0.0.1:8000/health      # atteso: {"status":"ok"}
```

---

## 5. Apache — reverse proxy sullo stesso dominio
Nel VirtualHost **HTTPS** che serve la SPA, aggiungere:
```apache
<IfModule mod_proxy.c>
    ProxyPreserveHost On
    # /auth/* -> proxy FastAPI (togliendo il prefisso /auth)
    ProxyPass        /auth/ http://127.0.0.1:8000/
    ProxyPassReverse /auth/ http://127.0.0.1:8000/
</IfModule>
```
Così `https://IL-DOMINIO/auth/exchange` arriva al proxy come `/exchange`.
(Header di cache per la SPA: vedi `docs/DEPLOY_CACHE_HEADERS.md`.)

---

## 6. Database — tabelle Admin (schema `scruscotto`)
1. Creare le tabelle (se non già fatto) usando **`docs/sql/admin_tables.sql`**, ma **nello schema `scruscotto`** (anteporre `set search_path = scruscotto;` o qualificare i nomi).
2. Permessi e isolamento (da **`docs/sql/rls_perimetro_e_rpc.sql`**, sezione 4):
   ```sql
   grant usage on schema scruscotto to cruscapp;
   grant select, insert, update on all tables in schema scruscotto to cruscapp;
   revoke all on all tables in schema scruscotto from anon, authenticated;
   revoke usage on schema scruscotto from anon, authenticated;
   ```
3. **PostgREST**: la config `db-schemas` (`PGRST_DB_SCHEMAS`) deve contenere **solo `public`** (NON `scruscotto`), così le tabelle Admin non sono raggiungibili via anon.

---

## 7. Database — RLS + adeguamento RPC (il passaggio decisivo)
Eseguire **`docs/sql/rls_perimetro_e_rpc.sql`**:
1. Crea gli helper `app.is_global()`, `app.enti_cf()`, `app.cf_effettivo()`.
2. Applica le **RLS** alle tabelle/viste dati con colonna `cfiscale`.
3. In **ogni** funzione `fa_ca_*` che accetta `p_codice_fiscale`, aggiungere in testa:
   ```sql
   v_cf := app.cf_effettivo(p_codice_fiscale);
   ```
   e usare `v_cf` al posto di `p_codice_fiscale` nella query.
   → il DFP può scegliere l'ente (o Totale PA); l'ente è limitato ai propri CF; un CF non consentito viene rifiutato (errore 42501).

> Senza questo punto il proxy aggiunge autenticazione ma **non** l'isolamento dei dati.

---

## 8. Frontend — attivazione
`VITE_EXCHANGE_URL` è una variabile **build-time**: impostarla e **ricostruire**.
```bash
# nel .env del frontend (build) o nella pipeline:
VITE_EXCHANGE_URL=https://IL-DOMINIO/auth
yarn build
```
- Senza questa variabile l'app funziona come prima (chiave anon) → **rollback immediato** rimuovendola e ricostruendo.
- Con la variabile: i dati usano il token coniato e l'Admin passa dal proxy.

---

## 9. Checklist di verifica (dopo il deploy)
1. `curl -s https://IL-DOMINIO/auth/health` → `{"status":"ok"}`.
2. Ottenere un token Keycloak (utente admin) e:
   ```bash
   curl -s -X POST https://IL-DOMINIO/auth/exchange -H "Authorization: Bearer <TOKEN_KC>"
   # atteso: { "access_token": "...", "expires_in": 3600 }
   ```
3. Decodificare l'access_token (jwt.io): deve contenere `role=authenticated`, `is_global`, `enti_cf`.
4. `GET /auth/admin/feature-flags` con token **admin** → 200; con token **ente** → 200 (lettura consentita); scrittura flag con token ente → **403**.
   - Con token **DFP senza ruolo admin**: lettura flag → 200, ma `/auth/admin/*` riservati (scrittura flag, log, statistiche) → **403** e pannello non accessibile dalla SPA.
5. Login nella SPA:
   - **DFP (solo `dfp`)**: vede tutti gli enti; **non** vede la voce Amministrazione.
   - **DFP + ruolo amministrativo**: vede tutto **e** accede al pannello di amministrazione.
   - **Ente (Hr-Cruscotto)**: vede solo i propri dati; con 2 CF appare il selettore.
   - Prova a forzare un CF non proprio in una RPC → **errore/negato** (RLS/guard).
   - **Ruolo non previsto** → schermata "Accesso non autorizzato".

---

## 10. Note di sicurezza
- Servire **solo in HTTPS** (opzione A: stessa origine, nessun problema CORS/mixed-content).
- Ruotare la password `cruscapp` dopo i test.
- `KEYCLOAK_AUDIENCE` impostata → i token sono vincolati al client del cruscotto.
- I log errori: valutare se salvare lo `stack` (il frontend NON lo invia; il proxy lo accetta ma è facoltativo).

---

## Riferimenti file nel repository
- `backend_proxy/` — proxy FastAPI (`main.py`, `security.py`, `db.py`, `requirements.txt`, `.env`, `README.md`)
- `docs/sql/admin_tables.sql` — tabelle Admin (da creare in `scruscotto`)
- `docs/sql/rls_perimetro_e_rpc.sql` — helper, RLS, adeguamento RPC, permessi
- `docs/DEPLOY_CACHE_HEADERS.md` — header di cache SPA (Apache)
