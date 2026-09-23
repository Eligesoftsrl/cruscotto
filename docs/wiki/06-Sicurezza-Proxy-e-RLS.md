# 6. Sicurezza: proxy e RLS

[◀ Torna all'indice](Home.md)

## Il problema da risolvere

Un client che parla direttamente con un'API di database (PostgREST) usando una sola
chiave pubblica potrebbe, in teoria, comporre query arbitrarie. Inoltre l'isolamento dei
dati non deve dipendere da un parametro inviato dal browser (facilmente falsificabile),
ma dai **claim verificati** dell'utente.

Soluzione: un **proxy applicativo** che verifica il token SSO e conia un token dati
firmato, unito a policy **RLS** (Row Level Security) che filtrano i dati a livello di riga.

## Architettura (stesso dominio)

```
 Browser (SPA)
   │  1) login SSO ─────────────► Keycloak
   │  2) POST /auth/exchange (token SSO)
   ▼
 Web server (HTTPS, stesso dominio della SPA)
   │  /auth/*  ── reverse proxy ──►  Proxy FastAPI (127.0.0.1:8000)
   │                                   ├─ /exchange : conia il token dati (RLS)
   │                                   └─ /admin/*  : tabelle Admin
   ▼
 Database (PostgREST + RPC, con RLS attive)
```

- **Dati** (`fa_ca_*`): la SPA li legge dal backend dati usando il **token coniato** dal
  proxy (che porta i claim di perimetro) → le RLS filtrano.
- **Admin** (flag, log, statistiche): la SPA li legge/scrive **solo tramite il proxy**.

## Il proxy (`backend_proxy/`)

Applicazione FastAPI con tre responsabilità:

1. **`POST /exchange`** — verifica il token SSO contro le chiavi pubbliche dell'IdP
   (JWKS, RS256), controlla il ruolo e conia un **nuovo token** firmato con il segreto
   del backend dati. Il token coniato contiene i claim usati dalle RLS:
   - `role: authenticated` (necessario al backend dati),
   - `is_global` (true per il profilo DFP),
   - `enti_cf` (codici fiscali del perimetro).
2. **`/admin/*`** — espone le tabelle Admin. Le letture sono riservate agli amministratori;
   l'inserimento dei log è consentito agli utenti autenticati, ma username e ruolo vengono
   presi **dal token**, non dal client.
3. **`/health`** — endpoint di verifica.

File principali:
- `security.py` — verifica token, risoluzione ruoli, conio del token dati.
- `main.py` — definizione degli endpoint e CORS.
- `db.py` — connessione al database per le tabelle Admin.

> **Nota sul claim `role`**: non va configurato lato IdP. È il proxy ad aggiungerlo al
> token coniato. L'IdP deve solo fornire i ruoli utente e il claim con gli enti.

## RLS e adeguamento delle RPC

Gli script in `docs/sql/rls_perimetro_e_rpc.sql` definiscono:

- **Helper** che leggono i claim dal token lato database:
  - `app.is_global()` → true per il profilo globale (DFP),
  - `app.enti_cf()` → array dei codici fiscali abilitati,
  - `app.cf_effettivo(p_cf)` → restituisce il codice fiscale **valido** da usare,
    bloccando quelli non consentiti.
- **Policy RLS** sulle tabelle/viste che espongono il codice fiscale.
- **Adeguamento delle RPC**: le funzioni `fa_ca_*` girano in modalità che bypassa le
  RLS, quindi il perimetro va imposto **dentro** la funzione aggiungendo in testa:

```sql
v_cf := app.cf_effettivo(p_codice_fiscale);
-- e usare v_cf al posto di p_codice_fiscale nella query
```

Risultato:
- il DFP può scegliere qualsiasi ente (o il totale PA);
- l'utente ente è limitato ai propri codici fiscali;
- un codice fiscale non consentito viene rifiutato con errore di autorizzazione.

## Attivazione lato frontend

Il frontend commuta automaticamente tra modalità diretta e modalità proxy:

- **Sviluppo / anteprima**: proxy disattivo (accesso diretto, per comodità di sviluppo).
- **Produzione**: proxy attivo di default sul percorso `/auth` (stesso dominio).
- È previsto un override tramite la variabile `VITE_EXCHANGE_URL` per forzare un URL
  diverso o disattivare il proxy in produzione.

Logica centralizzata in `src/integrations/supabase/exchangeToken.ts` e nel client dati
`src/integrations/supabase/client.ts`.

## Altre misure di sicurezza

- **Nessun segreto nel codice**: endpoint e chiavi provengono da variabili d'ambiente.
- **Esportazioni CSV**: i valori che iniziano con caratteri potenzialmente pericolosi
  vengono neutralizzati per prevenire la formula/CSV injection nei fogli di calcolo.
- **Log errori**: non viene persistito lo stack trace applicativo.
- **Tabelle Admin non pubbliche**: raggiungibili solo tramite il proxy, con permessi
  concessi al solo utente del proxy.

[▶ Prossima pagina: Modello dati, RPC e filtri](07-Modello-Dati-RPC-e-Filtri.md)
