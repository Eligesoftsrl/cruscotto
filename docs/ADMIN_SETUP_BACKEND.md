# Cruscotto HR — Setup Backend per il Pannello di Amministrazione

> Documento operativo da consegnare al **collega backend / gestore Keycloak**.
> Contiene: (A) lo **SQL delle tabelle** necessarie ORA per l'Admin Panel e
> (B) la **specifica dei claim Keycloak** (fonte unica: utente + ruolo + enti).

---

## A. Tabelle DB (Supabase / PostgreSQL)

Script pronto: **`docs/sql/admin_tables.sql`** (eseguire sul progetto Supabase del cliente).

Crea 4 tabelle + 2 viste nello schema `public` (esposto via PostgREST):

| Oggetto | Tipo | Scopo (funzione Admin) |
|---|---|---|
| `feature_flags` | tabella | Gestione funzionalità (attiva/disattiva on/off) |
| `log_accessi` | tabella | Lista accessi (login con orario) |
| `log_eventi` | tabella | Log eventi / navigazione |
| `log_errori` | tabella | Log errori applicativi |
| `v_stat_utilizzo` | vista | Statistiche utilizzo per sezione |
| `v_stat_funzionalita` | vista | Utilizzo per funzionalità (evidenzia le mai usate) |

**Note importanti**
- Le chiavi di `feature_flags.key` **devono coincidere** con quelle del frontend
  (`src/services/admin/featureRegistry.ts`): lo script include già il seed corretto.
- L'app usa **Keycloak** per l'autenticazione, quindi verso Supabase arriva sempre
  il ruolo `anon` (chiave publishable). Le policy RLS nello script sono perciò
  **permissive** per `anon`/`authenticated`. Per restringere la **lettura dei log**
  ai soli amministratori in produzione, valutare funzioni RPC `SECURITY DEFINER`
  o un piccolo proxy backend (la UI Admin è comunque già riservata al profilo DFP).
- Finché le tabelle non esistono, il frontend funziona su **fallback locale**
  (localStorage): nessun errore, nessuna chiamata a tabelle inesistenti.

---

## B. Specifica Claim Keycloak (fonte unica)

Obiettivo: dal token Keycloak l'app ricava **identità utente**, **ruolo** ed **enti
associati** (con relativi comuni). Chiave canonica di comune/ente = **codice fiscale**
(non ISTAT).

### B.1 Ruoli (realm roles)
Inserire in `realm_access.roles` uno tra:

| Ruolo | Significato | Comportamento app |
|---|---|---|
| `admin` | Amministratore di sistema | Vede il Pannello di Amministrazione |
| `dfp` | Dipartimento Funzione Pubblica | Vista globale (tutti gli enti) |
| `ente_hr` | Utente HR di uno o più enti | Vista filtrata sugli enti associati |

> Mappatura attuale nel frontend (`AuthContext.tsx`): i ruoli `admin`,
> `amministratore`, `super_admin`, `amministratore-gru`, `amministratore-formez`,
> `amministratore-unico` vengono ricondotti al profilo amministratore (`dfp`).
> Se il ruolo amministratore ha un **nome diverso**, comunicarlo per aggiungerlo.

### B.2 Claim `enti` (lista — un utente può avere più enti)
Aggiungere al token un claim `enti` come **array**. Ogni ente ha una lista `comuni`
(1 solo comune = comune singolo; più comuni = unione). Chiave = **codice fiscale**.

```json
{
  "sub": "uuid-utente",
  "preferred_username": "mario.rossi",
  "name": "Mario Rossi",
  "email": "mario.rossi@ente.it",
  "realm_access": { "roles": ["ente_hr"] },
  "enti": [
    {
      "cf_ente": "...",
      "descrizione": "...",
      "tipo": "comune_singolo | unione",
      "comuni": [
        { "cf_comune": "...", "descrizione": "..." }
      ]
    }
  ]
}
```

#### Esempio 1 — Ente = 1 solo comune
```json
{
  "preferred_username": "hr.roccabianca",
  "realm_access": { "roles": ["ente_hr"] },
  "enti": [
    {
      "cf_ente": "00514490010",
      "descrizione": "Comune di Roccabianca",
      "tipo": "comune_singolo",
      "comuni": [
        { "cf_comune": "00514490010", "descrizione": "Roccabianca" }
      ]
    }
  ]
}
```
> Per il comune singolo, `cf_ente` coincide con il CF del comune stesso.

#### Esempio 2 — Ente = unione di più comuni
```json
{
  "preferred_username": "hr.unione",
  "realm_access": { "roles": ["ente_hr"] },
  "enti": [
    {
      "cf_ente": "90012340019",
      "descrizione": "Unione dei Comuni Terre Verdiane",
      "tipo": "unione",
      "comuni": [
        { "cf_comune": "00514490010", "descrizione": "Roccabianca" },
        { "cf_comune": "00297090012", "descrizione": "Sissa Trecasali" },
        { "cf_comune": "00212880348", "descrizione": "Fontanellato" }
      ]
    }
  ]
}
```

#### Esempio 3 — Utente associato a PIÙ enti (es. consulente): [e1, e2, e3]
```json
{
  "preferred_username": "consulente.hr",
  "realm_access": { "roles": ["ente_hr"] },
  "enti": [
    { "cf_ente": "00514490010", "descrizione": "Comune di Roccabianca", "tipo": "comune_singolo",
      "comuni": [ { "cf_comune": "00514490010", "descrizione": "Roccabianca" } ] },
    { "cf_ente": "90012340019", "descrizione": "Unione Terre Verdiane", "tipo": "unione",
      "comuni": [ { "cf_comune": "00297090012", "descrizione": "Sissa Trecasali" } ] },
    { "cf_ente": "00227060287", "descrizione": "Comune di Padova", "tipo": "comune_singolo",
      "comuni": [ { "cf_comune": "00227060287", "descrizione": "Padova" } ] }
  ]
}
```

> Per `admin` / `dfp` il claim `enti` può essere omesso (vista globale).

### B.3 Come configurarlo in Keycloak
- **Ruoli**: definire i realm role `admin`, `dfp`, `ente_hr` e assegnarli agli utenti.
- **Claim `enti`**: popolarlo tramite *Protocol Mapper*. Opzioni:
  - **User Attribute mapper** con attributo JSON (`enti`) → *Token Claim Name* `enti`,
    *Claim JSON Type* = `JSON`, "Add to ID token" + "Add to access token" attivi;
  - oppure mapper personalizzato/script che costruisce l'array dagli enti dell'utente.

### B.4 Alternativa MINIMA (se l'array annidato è complesso)
Se iniettare l'oggetto annidato è difficile, in prima battuta basta un claim piatto
con la sola **lista dei codici fiscali** degli enti:

```json
{ "cf_enti": ["00514490010", "90012340019", "00227060287"] }
```

L'app può partire così (filtro dati per CF) e recuperare descrizioni/comuni dalle
viste anagrafiche lato DB (es. `dw_ente`; per i comuni è sufficiente esporre una
vista `public.dw_comuni` su `dwh.lk_comuni`, dati già presenti).

---

## Riepilogo richieste al collega
1. Eseguire `docs/sql/admin_tables.sql` sul Supabase del cliente.
2. Configurare in Keycloak i ruoli `admin` / `dfp` / `ente_hr`.
3. Iniettare nel token il claim `enti` (o, in minimo, `cf_enti`) secondo B.2/B.4.
4. (Facoltativo, per anagrafica comuni) esporre la vista `public.dw_comuni` su `dwh.lk_comuni`.
