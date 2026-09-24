# 3. Panoramica dell'architettura

[◀ Torna all'indice](Home)

Questa pagina offre una **visione d'insieme**, non tecnica, di come è costruito il
cruscotto. L'obiettivo è far capire i principi generali, senza entrare nei dettagli
realizzativi (che sono interni e in continua evoluzione).

## 3.1 Le parti principali

Il cruscotto è composto, in sintesi, da tre parti:

1. **L'applicazione web** che l'utente usa nel browser (l'interfaccia con schede, grafici
   e filtri).
2. **Il sistema di accesso** aziendale, che identifica l'utente e ne stabilisce le
   autorizzazioni.
3. **La base dati**, dove risiedono le informazioni che alimentano le analisi.

Tra l'applicazione e la base dati è previsto uno strato di protezione che garantisce
accessi controllati e l'isolamento dei dati tra enti.

## 3.2 Un'applicazione organizzata a livelli

Per essere solida e facile da mantenere ed estendere, l'applicazione è organizzata a
**livelli separati**, ciascuno con un compito preciso:

- **Presentazione** — ciò che l'utente vede: schede, grafici, tabelle, filtri.
- **Logica di visualizzazione** — coordina il caricamento e l'aggiornamento dei dati
  quando l'utente cambia filtri o sezione.
- **Livello di servizio** — il punto unico che si occupa di **recuperare i dati** dalla
  base dati. L'interfaccia non accede mai ai dati “da sola”: passa sempre da questo
  livello.
- **Configurazione** — i parametri dell'ambiente (indirizzi dei servizi, impostazioni)
  sono centralizzati e non scritti dentro il codice.

Questa separazione porta vantaggi concreti:

- è più semplice **aggiungere nuove analisi** senza toccare il resto;
- eventuali modifiche alle fonti dati restano **confinate** al livello di servizio;
- il codice è più **leggibile, testabile e riutilizzabile**.

## 3.3 Accesso e protezione dei dati

- L'utente si autentica una sola volta con le credenziali aziendali.
- In base al profilo, il cruscotto mostra soltanto i dati consentiti.
- Uno strato di protezione tra applicazione e base dati assicura che le richieste siano
  legittime e che ogni utente resti nel proprio perimetro.

## 3.4 Aggiornamenti sicuri

Ogni nuova versione dell'applicazione viene distribuita in modo che gli utenti ricevano
automaticamente le novità, con un avviso che invita a ricaricare quando serve. Così si
evita di lavorare su versioni obsolete.

## 3.5 Un progetto in evoluzione

Le analisi disponibili e i dati che le alimentano vengono ampliati e affinati nel tempo.
Alcune sezioni possono quindi essere aggiunte, riviste o temporaneamente presentate a
scopo dimostrativo. Lo stato aggiornato delle attività è nella pagina
[Stato e attività](04-Stato-e-Roadmap).

[▶ Prossima pagina: Stato e attività (roadmap)](04-Stato-e-Roadmap)
