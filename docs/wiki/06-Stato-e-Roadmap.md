# 6. Stato e attività

[◀ Torna all'indice](Home)

La presente pagina costituisce un documento di monitoraggio, da aggiornare con il
procedere delle attività. Riepiloga quanto realizzato, quanto in corso e quanto ancora da
svolgere o da verificare.

> Modalità di aggiornamento: spostare le voci tra le sezioni (Da fare → In corso → Da
> testare → Completato) e aggiornare la data seguente.
>
> **Ultimo aggiornamento:** 05/10/2026

---

## 🟢 In corso

- Consolidamento e verifica dei dati delle analisi già disponibili.

## 🟡 Da fare

- **Selettore dell'ente nella barra superiore**: rendere la scelta dell'ente sempre
  visibile su tutte le schede, per gli utenti abilitati a più enti.
- **Indicazione del perimetro**: riportare in ogni pagina un riferimento chiaro all'ente
  attualmente selezionato.
- **Accessibilità**: proseguire l'adeguamento alle linee guida di accessibilità della PA.
- **Nuove analisi e nuovi dati**: ampliare progressivamente le sezioni con dati definitivi
  in sostituzione di quelli dimostrativi.

## 🔵 Da testare / verificare

- Accesso con i diversi profili (amministratore e responsabile di ente).
- Corretto isolamento dei dati tra enti distinti.
- Cambio ente per gli utenti abilitati a più enti.
- Attivazione e disattivazione delle schede dal pannello di gestione.
- Ricezione dell'avviso di aggiornamento e ricarica alla nuova versione.
- Coerenza dei dati al variare dei filtri.

## 📦 Prossima release (in preparazione) — completamento SIPrO e migliorie Amministrazione

Release in fase di verifica, in rilascio a breve. Attività realizzate:

**Completamento del modulo SIPrO (dati reali)**

- Migrate a dati reali tutte e quattro le sezioni SIPrO: **Organizzazione**, **Processi**,
  **Profili e Cataloghi** e **Benchmark** (confronto multi-ente), in sostituzione dei
  precedenti dati dimostrativi.
- Impaginazione adattiva di tabelle e grafici (impilati sugli schermi piccoli, affiancati su
  quelli ampi), etichette leggibili nei grafici a torta e menù laterale SIPrO raggruppato
  per categoria con apertura/chiusura "a fisarmonica".

**Area di amministrazione**

- **Gestione schede estesa al SIPrO**: anche le schede SIPrO si possono attivare/disattivare
  dal pannello, come già per il Conto Annuale.
- **«Schede più consultate» ora alimentata**: il tracciamento registra la consultazione
  delle singole schede (Conto Annuale e SIPrO), così il grafico mostra le schede
  effettivamente più utilizzate.
- **Voce «Pannello Admin» protetta**: non più disattivabile dall'interfaccia, per evitare la
  perdita accidentale dell'accesso all'area di amministrazione.

**Configurazione e dati dinamici**

- **Anno di riferimento dinamico**: l'applicazione propone automaticamente l'ultimo anno
  disponibile nei dati, superando il riferimento fisso all'anno precedente.
- **Limite enti del Benchmark configurabile da base dati** (parametro `benchmark_max_enti`),
  modificabile dal sistemista senza nuovi rilasci.
- Pulizia del codice: rimossi i componenti e i servizi dimostrativi non più utilizzati.

**Nota per il sistemista:** per rendere persistenti i nuovi parametri è previsto un breve
script SQL (tabella di configurazione `app_config` e nuove chiavi delle schede SIPrO nella
tabella dei feature flag), fornito a corredo del rilascio.

## 📦 Rilascio del 25/09/2026 — attività completate

**Build di riferimento (buildId):** `1790353325754`

Messa in produzione (staging) dello **strato di protezione dei dati (proxy)** e relativa
messa a punto. Attività svolte e verificate end-to-end:

- **Proxy di sicurezza attivo**: scambio del token di accesso aziendale con un token per la
  base dati; endpoint dell'area di amministrazione serviti tramite il proxy.
- **Autenticazione allineata**: risolto lo sfasamento di orario tra i server (i token non
  vengono più rifiutati); accesso e scambio token funzionanti.
- **Separazione DFP / Amministratore**: l'utente con sola vista globale (DFP) vede tutti
  gli enti ma non accede all'amministrazione; l'accesso al pannello richiede un ruolo
  amministrativo. Regola applicata sia nell'interfaccia sia nel proxy.
- **Pannello di gestione operativo**: feature flag, statistiche d'uso e registri
  (accessi/eventi/errori) letti e scritti correttamente.
- **Font applicativo servito localmente**: rimossa la dipendenza esterna, risolto il blocco
  dovuto alle policy di sicurezza del browser (CSP).
- **Icona dell'applicazione (favicon)**: ripristinata l'immagine personalizzata e corretta
  la gestione della cache, così gli aggiornamenti si propagano correttamente.
- **Robustezza all'avvio**: le chiamate all'area amministrazione attendono il completamento
  del login, eliminando gli errori transitori in fase di accesso.

## ✅ Completato

- Interfaccia con schede, grafici, tabelle e filtri dinamici.
- Accesso tramite credenziali aziendali (single sign-on) con controllo delle
  autorizzazioni.
- Visualizzazione dei soli dati di competenza (perimetro per ente).
- Riorganizzazione del codice a livelli (componenti, hook, servizi) con isolamento
  dell'accesso ai dati in un unico punto.
- Rimozione dei dati simulati e del codice verboso dalle sezioni principali.
- Pannello di gestione per l'attivazione delle schede e la consultazione di statistiche e
  registri.
- Meccanismo di aggiornamento sicuro delle versioni.
- Schermata dedicata per gli utenti non abilitati.

---

## Segnalazione di problemi e proposte di miglioramento

1. Descrivere l'attività in corso al momento del problema e l'esito riscontrato.
2. Indicare, ove possibile, la scheda o la sezione interessata e i filtri attivi.
3. Allegare eventuali immagini della schermata.
4. Trasmettere la segnalazione al referente del progetto, che provvederà a inserirla
   nell'elenco soprastante.

[◀ Torna all'indice](Home)
