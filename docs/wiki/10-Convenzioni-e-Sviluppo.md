# 10. Convenzioni e sviluppo

[◀ Torna all'indice](Home.md)

## Convenzioni di codice

- **TypeScript** ovunque; si prediligono tipi espliciti su input/output dei servizi.
- **Componenti funzionali** React; la logica di stato server sta negli hook, non nella UI.
- **Nessun accesso dati nella UI**: le chiamate passano sempre dal service layer.
- **Nessun segreto/URL hardcoded**: tutto da `src/config/env.ts`.
- **Formattazione e lint** gestite da strumenti di progetto (`yarn format`, `yarn lint`).

## Aggiungere una nuova scheda del Conto Annuale

1. Creare il servizio in `src/services/ca/` con le RPC pertinenti.
2. Creare l'hook in `src/hooks/` (React Query) che combina filtri e perimetro ente.
3. Creare il componente di presentazione in `src/components/dashboard/`.
4. Registrare la scheda nel catalogo `src/config/schedeCatalog.ts` (etichetta, icona,
   identificativo e feature flag).
5. Verificare il comportamento con i filtri a cascata e con i due profili (DFP / ente).

## Gestione dello stato server (React Query)

- Usare **chiavi di query** coerenti che includano i filtri e il perimetro, così la cache
  si invalida correttamente al variare del contesto.
- Impostare `staleTime` adeguati per ridurre le richieste ridondanti.
- Gestire sempre gli stati di caricamento ed errore nella UI.

## Modalità dati delle sezioni accessorie

Alcune sezioni non appartenenti al Conto Annuale possono funzionare in modalità
dimostrativa quando le sorgenti dati non sono ancora disponibili. In tal caso:

- i dati provengono da `src/fixtures/`;
- l'interfaccia mostra un avviso esplicito che segnala la natura dimostrativa;
- il comportamento è controllato dalla configurazione in `src/config`.

## Test

- Test unitari/di trasformazione con il runner di progetto (`yarn test`).
- Priorità ai test sulle trasformazioni dei servizi (dati → strutture per la UI).

## Accessibilità

È previsto un percorso di adeguamento alle linee guida di accessibilità della PA
(WCAG 2.1 AA). Il documento di proposta è disponibile nella cartella `docs/`.

## Struttura della documentazione

- **`docs/`** — guide operative, script SQL, definizioni viste, mappature schede.
- **`docs/wiki/`** — questa wiki tecnica.
- Le guide di deploy contengono i passi operativi per il proxy, il reverse proxy e gli
  script RLS.

[◀ Torna all'indice](Home.md)
