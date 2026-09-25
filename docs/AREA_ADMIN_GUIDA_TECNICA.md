# Area Amministrazione — Guida tecnica (per riuso su altri progetti)

Documento di riferimento sull'area di amministrazione del Cruscotto HR: cosa fa, come è
costruita e come replicarla. Pensato per un team che deve realizzare qualcosa di analogo.

Stack di riferimento: **React + TypeScript (SPA)**, **PostgreSQL** esposto via
**PostgREST/Supabase**, autenticazione **Keycloak (OIDC)**, con un **proxy FastAPI**
opzionale che mette in sicurezza gli accessi ai dati amministrativi.

---

## 1. Cosa offre l'area admin

1. **Feature flag** — attivazione/disattivazione di singole funzionalità/schede.
2. **Log accessi** — chi entra, quando, con quale esito (da Keycloak).
3. **Log eventi** — navigazione e azioni utente (base per le statistiche d'uso).
4. **Log errori** — anomalie applicative (senza stack trace).
5. **Statistiche d'uso** — funzionalità più usate, calcolate **dagli eventi** (non da un contatore).

---

## 2. Idea architetturale in una riga

> Un **unico store in memoria** lato frontend (sorgente dati per i pannelli), che legge/scrive
> su tabelle DB tramite **due modalità intercambiabili**: accesso **diretto** (client PostgREST)
> oppure via **proxy** (endpoint `/admin/*` protetti da ruolo). I dati "grezzi" sono nei log;
> le statistiche sono **viste SQL** che aggregano i log.

```
  Componenti pannello (React)
        │  useAdminState() / mutazioni
        ▼
  adminStore  (cache in memoria, mutazioni ottimistiche)
        │
        ├── modalità DIRETTA  → client PostgREST/Supabase → tabelle public.*
        └── modalità PROXY    → fetch /admin/* (Bearer Keycloak) → FastAPI → DB
                                    └── require_admin (autorizzazione per ruolo)
```

La modalità è scelta da un flag (`EXCHANGE_ENABLED`): se il proxy è configurato si usa il
proxy, altrimenti l'accesso diretto. I pannelli non sanno quale delle due è attiva.

---

## 3. Schema database

Tutte le tabelle nello schema `public` (le viste anche). Estensione `pgcrypto` per gli UUID.

```sql
-- 1) FEATURE FLAGS ----------------------------------------------------------
create table if not exists public.feature_flags (
  key         text primary key,
  label       text not null,
  description text,
  category    text,
  enabled     boolean not null default true,
  updated_by  text,          -- chi ha modificato il flag (username dal token)
  updated_at  timestamptz not null default now()
);

-- 2) LOG ACCESSI ------------------------------------------------------------
create table if not exists public.log_accessi (
  id         uuid primary key default gen_random_uuid(),
  ts         timestamptz not null default now(),
  username   text,
  ruolo      text,
  esito      text not null default 'success' check (esito in ('success','fail')),
  ip         inet,
  user_agent text
);

-- 3) LOG EVENTI (navigazione / azioni) -------------------------------------
create table if not exists public.log_eventi (
  id       uuid primary key default gen_random_uuid(),
  ts       timestamptz not null default now(),
  username text,
  ruolo    text,
  azione   text not null,   -- es. 'navigazione'
  sezione  text,            -- es. 'Analisi Età'
  dettagli jsonb
);

-- 4) LOG ERRORI -------------------------------------------------------------
create table if not exists public.log_errori (
  id        uuid primary key default gen_random_uuid(),
  ts        timestamptz not null default now(),
  username  text,
  livello   text not null default 'error' check (livello in ('error','warn')),
  origine   text,           -- 'query' | 'boundary' | 'runtime'
  messaggio text not null
  -- NB: la colonna stack esiste ma NON viene popolata (vedi §7 sicurezza)
);

-- 5) STATISTICHE D'USO (VISTE derivate: nessuna tabella da mantenere) -------
create or replace view public.v_stat_utilizzo as
  select e.sezione as funzione, count(*)::int as utilizzi, max(e.ts) as ultimo_utilizzo
  from   public.log_eventi e
  group  by e.sezione
  order  by utilizzi desc;

-- Mostra anche le funzionalità MAI usate (join con feature_flags)
create or replace view public.v_stat_funzionalita as
  select f.key, f.label, f.category, f.enabled,
         coalesce(s.utilizzi, 0) as utilizzi, s.ultimo_utilizzo
  from   public.feature_flags f
  left   join (
           select sezione, count(*)::int as utilizzi, max(ts) as ultimo_utilizzo
           from public.log_eventi group by sezione
         ) s on s.sezione = f.label
  order  by utilizzi desc;
```

Indici consigliati: `log_*(ts desc)` e `log_eventi(sezione)`.

---

## 4. Come si raccolgono i dati (il cuore della domanda)

### 4.1 Accessi → da Keycloak
L'evento di accesso è agganciato al **ciclo di autenticazione**: nel contesto di auth, al
completamento del login si registra `logAccesso("success")`, e in caso di fallimento
`logAccesso("fail")`. L'identità (username + ruolo) è quella del **token Keycloak**,
impostata nel logger tramite `setLogUser({ username, ruolo })`.

Per non gonfiare la tabella, l'accesso `success` è **deduplicato una volta per sessione
browser** (marker in `sessionStorage`).

```ts
// AuthContext (semplificato)
setLogUser({ username: profile.full_name, ruolo: profile.role });
logAccesso("success");   // oppure logAccesso("fail")
```

### 4.2 Utilizzo/funzionalità più usate → eventi, NON un counter
Non esiste un contatore incrementale. Un componente **`UsageTracker`** osserva il cambio di
rotta (React Router) e a ogni navigazione registra un evento:

```ts
logEvento("navigazione", label, { path: location.pathname + location.search });
```

Il conteggio "quante volte" è **ricalcolato a query time** dalle viste `v_stat_*`
(`count(*) group by sezione`). Vantaggi: nulla da mantenere, sempre coerente, filtrabile
per periodo, e con `v_stat_funzionalita` si vedono anche le funzioni mai usate.

### 4.3 Errori → intercettati lato app (non da Keycloak)
Due "reti di sicurezza":
- **ErrorBoundary (React)**: errori di rendering → `logErrore(error.message, "boundary")`.
- **React Query `QueryCache.onError`**: errori delle chiamate dati → `logErrore(message, "query")`.

```ts
// App.tsx (semplificato)
new QueryClient({ queryCache: new QueryCache({
  onError: (e) => logErrore(getMessage(e), "query"),
})});
```

### 4.4 Feature flag → toggle con persistenza
Mutazioni **ottimistiche**: lo stato in memoria cambia subito, poi si persiste; in caso di
errore si esegue il **rollback**. Supporta anche il toggle in blocco (`setManyFlags`).

---

## 5. Frontend: pattern dello store

`adminStore` è uno **store esterno** letto dai componenti con `useSyncExternalStore`
(niente Redux/Context per questo). Punti chiave:

- **API sincrona** ai componenti: `getState()` / `useAdminState()`.
- **Caricamento iniziale idempotente** (`ensureAdminLoaded()`), avviato all'import perché i
  flag servono a tutta l'app per il gating delle funzionalità (`isFeatureEnabled(key)`).
- **Mapper snake_case → camelCase**: le righe DB vengono normalizzate ai tipi frontend.
- **Cap ai log in memoria** (es. ultimi 1000) per non appesantire la UI.
- Il **logger** (`logAccesso/logEvento/logErrore`) è chiamabile anche **fuori da React**
  (es. dal `QueryCache.onError` o dal ciclo Keycloak), perché non dipende dai hook.

```ts
export function useAdminState(): AdminState {
  return useSyncExternalStore(subscribe, getState, getState);
}
```

---

## 6. Endpoint del proxy (modalità sicura)

Quando il proxy è attivo, lo store usa questi endpoint (Bearer = token Keycloak; il proxy
verifica firma/ruoli):

| Metodo | Endpoint | Protezione | Uso |
|--------|----------|------------|-----|
| GET  | `/admin/feature-flags` | autenticato | elenco flag |
| POST | `/admin/feature-flags` | **admin** | attiva/disattiva un flag |
| GET  | `/admin/log-accessi`   | **admin** | lettura accessi |
| POST | `/admin/log-accessi`   | autenticato | inserimento accesso (username/ruolo dal token) |
| GET  | `/admin/log-eventi`    | **admin** | lettura eventi |
| POST | `/admin/log-eventi`    | autenticato | inserimento evento |
| GET  | `/admin/log-errori`    | **admin** | lettura errori |
| POST | `/admin/log-errori`    | autenticato | inserimento errore |
| GET  | `/admin/stat-utilizzo` / `/admin/stat-funzionalita` | **admin** | statistiche |

Regola importante: nelle POST di log, **username e ruolo vengono presi dal token**, non dal
body del client (il client non può falsificare chi ha fatto cosa).

---

## 7. Sicurezza (scelte da replicare)

- **Autorizzazione per ruolo nel proxy**: le letture di log/statistiche e la scrittura dei
  flag richiedono un **ruolo amministrativo** (`require_admin`). La sola vista globale non
  basta (distinzione "vista globale" vs "privilegi admin").
- **Tabelle admin non esposte pubblicamente**: se si adotta uno schema dedicato, escluderlo
  da PostgREST (`PGRST_DB_SCHEMAS`) e revocare i privilegi ad `anon`/`authenticated`,
  concedendoli al solo utente di servizio del proxy.
- **SEC-003 — CSV/formula injection**: in export CSV, i valori che iniziano con `= + - @`
  (o tab/CR) vengono prefissati con un apice, per evitare l'esecuzione di formule in
  Excel/Sheets.
- **SEC-004 — niente stack trace persistito**: dei log errori salviamo messaggio (troncato),
  livello, origine e utente; **non** lo stack.
- **Scritture log "fire-and-forget"**: un errore nel logging non deve mai disturbare
  l'utente (le insert dei log ignorano gli errori lato UI).

---

## 8. Come replicarlo altrove — checklist

1. **DB**: creare `feature_flags`, `log_accessi`, `log_eventi`, `log_errori` + viste
   `v_stat_*` (vedi §3). Seed dei flag allineato all'elenco funzionalità dell'app.
2. **Logger** applicativo con `setLogUser()` + `logAccesso/logEvento/logErrore`, chiamabile
   fuori da React.
3. **Accessi**: agganciare `logAccesso` al ciclo di login dell'IdP (success/fail), con
   dedup per sessione.
4. **Uso**: un `UsageTracker` sul cambio rotta che emette eventi `navigazione`; statistiche
   come **viste** aggregate (niente counter).
5. **Errori**: `ErrorBoundary` + hook `onError` del layer dati → `logErrore`.
6. **Store**: uno store esterno (`useSyncExternalStore`) con mutazioni ottimistiche e
   mapper snake→camel; caricamento idempotente all'avvio.
7. **Due modalità**: astrarre lettura/scrittura dietro un flag (diretto vs proxy) così da
   poter passare alla modalità sicura senza toccare i pannelli.
8. **Proxy** (se serve sicurezza forte): endpoint `/admin/*` con autorizzazione per ruolo;
   username/ruolo dal token; schema admin non esposto da PostgREST.

---

## 9. File di riferimento (in questo progetto)

- `src/services/admin/adminStore.ts` — store, mutazioni, export CSV.
- `src/services/admin/logger.ts` — logger (accessi/eventi/errori), dedup accessi.
- `src/services/admin/proxyClient.ts` — client endpoint `/admin/*`.
- `src/services/admin/featureRegistry.ts` — catalogo flag di default (fallback sincrono).
- `src/components/admin/UsageTracker.tsx` — tracciamento navigazione.
- `src/components/ErrorBoundary.tsx` + `src/App.tsx` — cattura errori (boundary + query).
- `src/contexts/AuthContext.tsx` — `setLogUser` + `logAccesso` dal ciclo Keycloak.
- `docs/sql/admin_tables.sql` — DDL tabelle, seed flag e viste statistiche.
- `backend_proxy/main.py` + `backend_proxy/security.py` — endpoint e autorizzazione admin.
