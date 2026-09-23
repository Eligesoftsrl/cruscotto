# 9. Build, deploy e cache

[◀ Torna all'indice](Home.md)

## Comandi principali

| Comando | Effetto |
|---------|---------|
| `yarn dev` | Avvia il server di sviluppo (con proxy dati disattivo). |
| `yarn build` | Produce la build di produzione nella cartella `dist/`. |
| `yarn preview` | Serve localmente la build di produzione. |
| `yarn lint` | Analisi statica del codice. |
| `yarn test` | Esegue i test. |

## Cosa si distribuisce

La messa in produzione prevede **due componenti separati**:

1. **Frontend** — la cartella `dist/` (file statici) pubblicata sul web server in HTTPS.
2. **Proxy di sicurezza** — la cartella `backend_proxy/` avviata sulla macchina server
   (in ascolto su `127.0.0.1:8000`), con il web server che inoltra `/auth/*` al proxy.

> `dist/` **non** contiene `backend_proxy/`: sono due pacchetti distinti.

## Attivazione del proxy dati (build-time)

L'uso del proxy da parte del frontend è deciso **al momento della build**:

- In produzione (`yarn build`) il proxy è attivo di default sul percorso relativo `/auth`
  (stesso dominio della SPA). Non serve conoscere il dominio in fase di build.
- In sviluppo il proxy è disattivo (accesso diretto).
- Override opzionale con la variabile d'ambiente `VITE_EXCHANGE_URL`:
  - un URL specifico per forzare un endpoint diverso;
  - il valore `off` per disattivare il proxy anche in produzione (rollback).

La logica è centralizzata in `src/integrations/supabase/exchangeToken.ts`.

## Configurazione lato server (sintesi)

1. **Proxy**: valorizzare i segreti nel file d'ambiente del proxy (segreto di firma del
   token dati e credenziali del database), quindi avviarlo come servizio.
2. **Web server**: reverse proxy `/auth/ → 127.0.0.1:8000`, sullo stesso dominio della SPA.
3. **Database**: eseguire gli script RLS e adeguare le RPC (vedi
   [Sicurezza: proxy e RLS](06-Sicurezza-Proxy-e-RLS.md)).

Dettagli operativi nelle guide in `docs/` (deploy proxy e header di cache).

## Gestione della cache (cache busting)

Per evitare che i browser servano una versione obsoleta dopo un aggiornamento:

- ogni build ha un **identificativo di versione** incorporato;
- un controllo periodico confronta la versione in uso con quella pubblicata e, se diversa,
  propone all'utente un **banner di aggiornamento** con ricarica;
- gli **header di cache** vengono configurati in modo che l'`index` non sia messo in cache
  a lungo, mentre gli asset con hash nel nome possono essere memorizzati stabilmente.

Utilità in `src/lib/cacheBusting.ts`; configurazioni cache documentate in `docs/`.

## Variabili d'ambiente

Le variabili (endpoint dati, chiave pubblica, parametri SSO, eventuale URL proxy) sono
lette in modo centralizzato da `src/config/env.ts`. I file d'ambiente non vengono
versionati: in un nuovo ambiente vanno reimpostati. Un file di esempio documenta le
chiavi attese.

[▶ Prossima pagina: Convenzioni e sviluppo](10-Convenzioni-e-Sviluppo.md)
