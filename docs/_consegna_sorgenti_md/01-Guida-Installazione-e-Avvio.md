# 1. Guida all'installazione e all'avvio

**Cruscotto HR · Versione 1.0 · Ottobre 2026**

## Attività svolte (voce del SAL)

- Configurazione unica per tutti gli ambienti (sviluppo, staging, produzione)
- Pulizia del repository (codice, componenti e dati dimostrativi non più usati)
- Documentazione di avvio (requisiti, impostazioni, comandi, pubblicazione)

## 1.1 Descrizione dell'intervento

- **Configurazione unica per tutti gli ambienti** (sviluppo, staging, produzione): lo stesso
  pacchetto applicativo si adatta all'ambiente tramite poche impostazioni esterne, senza
  modificare il codice.
- **Pulizia del repository**: rimossi file, componenti e dati dimostrativi non più usati;
  struttura delle cartelle ordinata per area funzionale; nessuna credenziale nel codice.
- **Documentazione di avvio**: requisiti, impostazioni e comandi riportati di seguito.

## 1.2 Requisiti

| Componente | Versione |
|---|---|
| Node.js | 20 o successiva |
| Yarn | 1.22 |
| Browser supportati | Chrome, Edge, Firefox e Safari nelle versioni correnti |

## 1.3 Impostazioni dell'ambiente

Le impostazioni si indicano come variabili d'ambiente al momento della compilazione.

| Impostazione | A cosa serve |
|---|---|
| `VITE_SUPABASE_URL` | Indirizzo della base dati |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chiave pubblica della base dati |
| `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID` | Collegamento al servizio di accesso aziendale (Keycloak) |
| `VITE_EXCHANGE_URL` | Indirizzo dello strato di protezione (in produzione è predefinito) |
| `VITE_A11Y_STATEMENT_URL`, `VITE_A11Y_FEEDBACK_EMAIL` | Link alla Dichiarazione di accessibilità e indirizzo per le segnalazioni |

I valori di ciascun ambiente sono conservati dall'amministrazione e dal sistemista.

## 1.4 Comandi

| Comando | Uso |
|---|---|
| `yarn install` | Installa le dipendenze |
| `yarn dev` | Avvia l'applicazione in locale per lo sviluppo |
| `yarn build` | Produce il pacchetto da pubblicare (cartella `dist/`) |
| `yarn test` | Esegue i test automatici |
| `yarn security` | Esegue le verifiche di sicurezza |
| `yarn a11y` | Esegue la verifica automatica di accessibilità |

## 1.5 Pubblicazione

1. Impostare le variabili dell'ambiente di destinazione.
2. Eseguire `yarn build`.
3. Pubblicare il contenuto della cartella `dist/` sul server web.
4. Dopo la pubblicazione, gli utenti già collegati ricevono un avviso e possono ricaricare la
   nuova versione.
