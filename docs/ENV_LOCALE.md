# Configurazione ambiente locale (PSN reale) + claim Keycloak enti

## 1. File `.env` da usare in locale
> I file `.env*` sono **gitignored** (non viaggiano su git). Copia il blocco seguente in un file
> `.env` nella root del progetto. Con queste variabili Keycloak è **ATTIVO** → login come
> amministratore (DFP) sul realm reale.

```dotenv
# --- Supabase (progetto reale progetto-gru / PSN) ---
VITE_SUPABASE_URL="https://api-cr.progetto-gru.it"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzg4MzU2NDc4LCJleHAiOjE5NDYwMzY0Nzh9.OIkNpiyGJlDzjpfsv59OAy1kjNVgrvrae4HZruXVMhQ"

# --- Keycloak (realm gru) ---
VITE_KEYCLOAK_URL="https://identity.progetto-gru.it"
VITE_KEYCLOAK_REALM="gru"
VITE_KEYCLOAK_CLIENT_ID="oqtane-gru-cruscotto"
```

- Per **disattivare** Keycloak in locale (login mock, senza IdP): crea un `.env.local` con
  `VITE_KEYCLOAK_URL=` / `VITE_KEYCLOAK_REALM=` / `VITE_KEYCLOAK_CLIENT_ID=` vuoti.
- Ricordati che le variabili Vite si leggono all'avvio: dopo aver modificato `.env` riavvia `vite`.

---

## 2. Claim Keycloak per l'ente (da passare al token)

### Come il sistema identifica l'ente (dato reale verificato)
Le RPC accettano l'ente in due modi equivalenti (verificati live su Roma Capitale):
- `p_codice_fiscale` = **codice fiscale ente** (es. `02438750586`) ✅ **consigliato**
- `p_istituzione` = **codice istituzione** (es. `C6144`)

Il **codice fiscale** è la chiave naturale/stabile (coincide con l'anagrafica e con `mv_filtri`
tipo `codice_fiscale`). Consiglio quindi di veicolare il **CF** nel token.

### Struttura del claim consigliata
| Caso | Claim | Tipo | Esempio |
|---|---|---|---|
| Utente legato a **1** ente | `cf_ente` | stringa (11 cifre) | `"02438750586"` |
| Utente legato a **più** enti | `enti` | array di stringhe | `["02438750586","80078750587"]` |

- Formato: **codice fiscale ente** (11 cifre). In alternativa il codice istituzione (`C6144`),
  ma il CF è preferibile.
- Utenti **amministratori (DFP)**: **nessun** claim ente necessario (vedono tutto e hanno il
  selettore ente in UI). Basta il ruolo amministratore già presente nel token.
- Utenti **ente** (`ente_hr`): devono avere `cf_ente` (o `enti`) valorizzato.

### Come configurarlo su Keycloak (mapper)
1. Salvare il CF come **attributo utente** (es. attributo `cf_ente`), manualmente o via
   sincronizzazione dall'anagrafica/`login_enti`.
2. Client `oqtane-gru-cruscotto` → **Client scopes** → dedicated scope → **Mappers** →
   *Add mapper* → **User Attribute**:
   - Name / User Attribute / Token Claim Name: `cf_ente` (per multi-ente: `enti` + **Multivalued: ON**)
   - Claim JSON Type: `String`
   - **Add to access token: ON** (l'app legge l'access token)

### Esempio token utente ente
```json
{
  "name": "Mario Rossi",
  "realm_access": { "roles": ["ente_hr"] },
  "cf_ente": "02438750587"
}
```

### Cosa farà l'app (lato codice, quando cablo ente_hr)
- Se ruolo `ente_hr`: legge `cf_ente`/`enti` dal token → passa `p_codice_fiscale` alle RPC →
  l'utente vede **solo la propria amministrazione**; il selettore ente resta **nascosto**.
- Se ruolo `dfp` (amministratore): nessun vincolo, selettore ente **visibile** (già attivo).
