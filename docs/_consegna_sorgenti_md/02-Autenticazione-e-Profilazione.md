# 2. Autenticazione e profilazione — Keycloak

**Cruscotto HR · Versione 1.0 · Ottobre 2026**

## Attività svolte (voce del SAL)

- Integrazione SSO con Keycloak
- Profilazione degli utenti e dei ruoli
- Perimetro degli enti tramite codice fiscale
- Flusso di accesso e gestione degli utenti non autorizzati
- Ambiente locale e documentazione per la gestione di Keycloak

## 2.1 Descrizione dell'intervento

- **Accesso unico aziendale (SSO)** tramite Keycloak: nessuna password dedicata al Cruscotto.
- **Profilazione** degli utenti in base ai ruoli assegnati in Keycloak.
- **Perimetro per ente**: i responsabili di ente vedono solo i dati degli enti indicati nel
  proprio profilo, identificati dal **codice fiscale**.
- **Gestione degli utenti non autorizzati**: chi non ha un ruolo previsto, o un responsabile
  di ente senza codice fiscale associato, riceve un messaggio chiaro e non accede ai dati.
- **Sessione**: avviso qualche minuto prima della scadenza, con possibilità di prolungarla;
  uscita sicura dal pulsante «Esci».
- **Ambiente locale e documentazione** per la configurazione di Keycloak (questo documento).

## 2.2 Profili

| Profilo | Ruoli Keycloak riconosciuti | Vista dati | Pannello di gestione |
|---|---|---|---|
| **Amministratore** | `amministratore-gru`, `amministratore-formez`, `amministratore-unico`, `amministratore`, `admin`, `super_admin` | Tutti gli enti | ✅ |
| **Utente DFP** | `dfp` | Tutti gli enti (sola consultazione) | — |
| **Responsabile di ente** | `ente_hr` (o `hr_cruscotto`) | Solo gli enti del proprio profilo | — |
| Altri ruoli | — | Accesso negato | — |

Sono considerati solo i ruoli del realm e quelli del client del Cruscotto: i ruoli assegnati
in altre applicazioni dello stesso realm non hanno effetto.

## 2.3 Configurazione richiesta in Keycloak

**Client**
- Tipo: applicazione pubblica (SPA) con PKCE (S256).
- Indirizzi di ritorno (redirect URI) e origini web: gli indirizzi del Cruscotto per ciascun
  ambiente.

**Informazioni nel token di accesso**

| Informazione | Obbligatoria | Uso |
|---|---|---|
| Ruoli (`realm_access.roles` o `resource_access.<client>.roles`) | Sì | Determina il profilo |
| `enti_cf` — codice fiscale dell'ente, o elenco se l'utente gestisce più enti | Sì per i responsabili di ente | Limita i dati agli enti indicati |
| `name`, `preferred_username` | Consigliate | Nome mostrato nell'applicazione |
| `email` | Facoltativa | — |
| Destinatario del token (audience) | Sì | Il token deve essere emesso per il Cruscotto |

`enti_cf` può essere un elenco oppure un testo con i codici separati da virgola, punto e
virgola o spazio.

**Esempio (estratto del token)**

```
{
  "preferred_username": "mario.rossi",
  "name": "Mario Rossi",
  "realm_access": { "roles": ["ente_hr"] },
  "enti_cf": ["80012345678", "80098765432"]
}
```

## 2.4 Flusso di accesso

1. L'utente apre il Cruscotto e sceglie «Accedi con SSO».
2. Si autentica sulla pagina di Keycloak con le credenziali aziendali.
3. Il Cruscotto legge profilo ed enti dal token e mostra solo i dati consentiti.
4. Se più enti sono associati, l'utente li cambia dal selettore in alto.
5. Alla scadenza della sessione, o con «Esci», l'utente torna alla pagina di accesso.
