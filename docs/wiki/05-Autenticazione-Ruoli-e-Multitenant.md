# 5. Autenticazione, ruoli e multi-ente

[◀ Torna all'indice](Home.md)

## Accesso tramite SSO (Keycloak)

L'autenticazione è delegata a Keycloak tramite OpenID Connect con flusso **PKCE**
(client pubblico). L'inizializzazione avviene una sola volta (idempotente, compatibile
con React StrictMode) e usa il **redirect** invece dell'iframe silenzioso, per evitare i
blocchi imposti dalle policy `frame-ancestors` degli IdP.

File di riferimento: `src/auth/keycloak.ts`
- `initKeycloak()` — inizializza il client una sola volta.
- `ensureFreshToken()` — restituisce un access token fresco (rinnovo se in scadenza).

> Se le variabili d'ambiente di Keycloak non sono configurate, l'app usa un login
> dimostrativo locale, utile in sviluppo.

## Dal token al profilo applicativo

`src/contexts/AuthContext.tsx` traduce i claim del token in un **profilo applicativo**:

- Legge i ruoli sia da `realm_access.roles` sia da `resource_access.<client>.roles`.
- Determina il profilo:
  - **DFP / Amministratore** → vista globale, nessun perimetro.
  - **Responsabile HR di ente** → consentito solo se ha almeno un ente abilitato.
  - **Nessun ruolo previsto** → `unauthorized = true` (accesso negato).

Profilo risultante (`UserProfile`):

| Campo | Significato |
|------|-------------|
| `role` | `dfp` oppure `ente_hr` |
| `enti_cf` | codici fiscali degli enti abilitati (per gli utenti ente) |
| `full_name` | nome visualizzato |
| `ente_denominazione` | denominazione dell'ente (quando applicabile) |

### Mappatura dei ruoli
I nomi dei ruoli riconosciuti sono elencati nel contesto di autenticazione e confrontati
in modo case-insensitive. Esistono due insiemi: ruoli "amministrativi" (profilo DFP) e
ruoli "ente" (profilo HR). Un ruolo fuori da questi insiemi comporta l'accesso negato.

## Isolamento multi-ente (perimetro dati)

Il claim del token con i codici fiscali degli enti (`enti_cf`) definisce il **perimetro**
dell'utente. L'hook `src/hooks/useEnteScope.tsx`:

- determina il codice fiscale da applicare come filtro a **tutte** le RPC del Conto Annuale;
- risolve la denominazione dell'ente per l'intestazione delle schede;
- se l'utente è abilitato a **più enti**, espone un selettore per cambiare ente;
- per il profilo DFP non c'è perimetro: l'ente si sceglie tramite la ricerca dedicata.

Una sentinella impedisce che un utente ente senza codici fiscali validi possa vedere dati
non suoi (in tal caso non viene restituito alcun dato).

> **Nota importante**: l'isolamento lato interfaccia è necessario ma non sufficiente.
> L'isolamento "forte" è imposto a livello di database dalle policy RLS descritte nella
> pagina [Sicurezza: proxy e RLS](06-Sicurezza-Proxy-e-RLS.md).

## Ciclo di vita della sessione

- Al ritorno dal redirect, il client completa il login leggendo i parametri dall'URL.
- Il token viene rinnovato automaticamente quando prossimo alla scadenza.
- Gli eventi di logout / errore di refresh azzerano il profilo in memoria.

[▶ Prossima pagina: Sicurezza: proxy e RLS](06-Sicurezza-Proxy-e-RLS.md)
