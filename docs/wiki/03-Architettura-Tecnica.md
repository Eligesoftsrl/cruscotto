# 3. Architettura tecnica

[◀ Torna all'indice](Home)

La presente sezione illustra la struttura dell'applicazione e il lavoro di riorganizzazione
svolto. L'obiettivo è fornire un quadro tecnico d'insieme, senza esporre dettagli
realizzativi delle singole analisi (interni e in evoluzione).

## 3.1 Impianto generale

L'applicazione è una Single Page Application (React con TypeScript), distribuita come
insieme di file statici e servita su web server in HTTPS. Si articola, in sintesi, in tre
componenti:

1. l'**applicazione web** utilizzata nel browser;
2. il **sistema di autenticazione** aziendale, che identifica l'utente e ne stabilisce le
   autorizzazioni;
3. la **base dati**, che raccoglie e integra i dati provenienti da diverse fonti a
   supporto delle analisi.

Tra l'applicazione e la base dati opera uno strato di protezione che regola gli accessi e
garantisce l'isolamento dei dati tra enti.

## 3.2 Suddivisione del codice a livelli

Il codice è organizzato per responsabilità nette, secondo un modello a livelli:

- **Component (presentazione)** — i componenti dell'interfaccia (schede, grafici, tabelle,
  filtri). Non contengono logica di accesso ai dati: si limitano a ricevere le
  informazioni e a renderle. Sono realizzati a partire da un insieme di **componenti di
  base riutilizzabili** (design system interno), per garantire coerenza visiva e ridurre
  la duplicazione.

- **Hook** — incapsulano la logica di orchestrazione: gestiscono il caricamento dei dati,
  gli stati di attesa ed errore e la memorizzazione temporanea (cache), esponendo ai
  componenti un'interfaccia pulita. Combinano i filtri selezionati con il perimetro
  dell'utente.

- **Service (accesso ai dati)** — punto **unico** deputato al recupero dei dati dalla
  base dati. L'interfaccia non dialoga mai direttamente con le fonti: ogni richiesta
  transita da questo livello. In questo modo eventuali variazioni delle fonti restano
  confinate a un solo punto del codice.

- **Configurazione** — i parametri d'ambiente (indirizzi dei servizi e impostazioni) sono
  centralizzati e non incorporati nel codice.

## 3.3 Lavoro di riorganizzazione svolto

Rispetto all'impianto iniziale (prototipo con dati simulati e logica dispersa nei
componenti), sono stati realizzati i seguenti interventi:

- **Isolamento dell'accesso ai dati** in un unico livello di servizio, in precedenza
  distribuito tra i vari componenti dell'interfaccia. Ne derivano maggiore manutenibilità
  e un unico punto di intervento in caso di modifiche.

- **Rimozione del codice verboso e dei dati simulati** (mockup) dalle sezioni principali,
  sostituiti dal collegamento alle fonti dati reali. Il codice risulta più snello e
  leggibile.

- **Riutilizzo dei componenti** dell'interfaccia, mediante un insieme di elementi di base
  condivisi, con conseguente riduzione delle duplicazioni e uniformità di comportamento.

- **Messa in sicurezza**: eliminazione di endpoint e chiavi dal codice (esternalizzati in
  configurazione), accesso ai dati regolato da uno strato di protezione dedicato e
  isolamento dei dati per ente applicato a più livelli.

- **Robustezza e tipizzazione**: adozione sistematica di TypeScript sugli input e sugli
  output dei servizi, a beneficio dell'affidabilità e della prevenzione degli errori.

- **Governo delle funzionalità**: introduzione di un pannello di gestione che consente di
  attivare o disattivare le schede e di consultare statistiche d'uso e registri di
  attività.

## 3.4 Accesso e protezione dei dati

L'utente si autentica una sola volta con le credenziali aziendali; in funzione del profilo,
l'applicazione espone i soli dati consentiti. Lo strato di protezione interposto tra
applicazione e base dati verifica la legittimità delle richieste e assicura che ciascun
utente operi entro il proprio perimetro.

## 3.5 Distribuzione e aggiornamenti

L'applicazione web e lo strato di protezione dei dati costituiscono due componenti
distinti, distribuiti separatamente. Le nuove versioni sono rilasciate in modo che gli
utenti ne ricevano automaticamente le novità, con un avviso che invita alla ricarica
quando necessario, evitando l'utilizzo di versioni non aggiornate.

## 3.6 Natura evolutiva del progetto

Le analisi disponibili e i dati che le alimentano vengono progressivamente ampliati e
affinati. Alcune sezioni possono pertanto essere aggiunte, riviste o temporaneamente
presentate a scopo dimostrativo. Lo stato aggiornato delle attività è riportato nella
pagina [Stato e attività](04-Stato-e-Roadmap).

[▶ Pagina successiva: Stato e attività](04-Stato-e-Roadmap)
