# 4. Funzionamento e sicurezza

[◀ Torna all'indice](Home)

La presente sezione offre un quadro d'insieme di come è organizzato il servizio, senza
entrare nei dettagli tecnici.

## 4.1 Come è composto il servizio

Il Cruscotto HR si utilizza dal browser e si articola in tre parti:

1. l'**applicazione web**, cioè le schede, i grafici e le tabelle che l'utente consulta;
2. il **sistema di autenticazione** aziendale, che riconosce l'utente e ne stabilisce le
   autorizzazioni;
3. la **base dati**, che raccoglie e integra i dati provenienti dalle diverse fonti
   (Conto Annuale, SIPrO, KPI della Riforma PA).

Tra l'applicazione e la base dati opera uno strato di protezione che verifica ogni
richiesta e garantisce che ciascun utente veda solo i dati del proprio perimetro.

## 4.2 Da dove arrivano i dati

- I dati mostrati sono quelli **reali** delle fonti collegate, aggiornati secondo i cicli di
  rilevazione di ciascuna fonte.
- Gli **anni disponibili** nei filtri sono letti dai dati stessi: quando arriva un nuovo
  anno, il cruscotto lo propone automaticamente.
- Le sezioni per cui la fonte non è ancora collegata sono presentate con **dati
  dimostrativi**, sempre segnalati («Dati mock-up»).
- Gli score degli indici sono calcolati dalla base dati: il cruscotto li presenta e ne
  illustra il calcolo, senza modificarli.

## 4.3 Accesso e protezione dei dati

- L'utente si autentica una sola volta con le credenziali aziendali.
- In funzione del profilo, l'applicazione espone i soli dati consentiti; la verifica è
  ripetuta anche dallo strato di protezione, così che il perimetro non possa essere
  aggirato.
- Le informazioni riservate di configurazione non sono contenute nell'applicazione.
- Accessi, eventi ed errori sono registrati e consultabili dagli amministratori.

## 4.4 Governo delle funzionalità

Gli amministratori possono attivare o disattivare schede e indici dal
[Pannello di gestione](03-Pannello-di-Gestione), rendendo disponibili le novità in modo
graduale e controllato.

## 4.5 Aggiornamenti

Le nuove versioni sono rilasciate in modo che gli utenti ne ricevano automaticamente le
novità, con un avviso che invita alla ricarica quando necessario, evitando l'utilizzo di
versioni non aggiornate.

## 4.6 Natura evolutiva del progetto

Le analisi disponibili e i dati che le alimentano vengono progressivamente ampliati e
affinati. Alcune sezioni possono pertanto essere aggiunte, riviste o temporaneamente
presentate a scopo dimostrativo. Lo stato aggiornato delle attività è riportato nella
pagina [Stato e attività](06-Stato-e-Roadmap).

[▶ Pagina successiva: Glossario](05-Glossario)
