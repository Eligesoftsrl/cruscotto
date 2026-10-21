# Cruscotto HR — Adeguamento all'accessibilità (Linee Guida AgID)

**Documento di avanzamento per il committente**

| | |
|---|---|
| **Prodotto** | Cruscotto HR — Sistema di Monitoraggio HR della Pubblica Amministrazione |
| **Riferimento normativo** | Legge 4/2004, Linee Guida AgID sull'accessibilità degli strumenti informatici, norma UNI EN 301 549 |
| **Livello di conformità obiettivo** | WCAG 2.1 — livello AA, con i criteri aggiuntivi delle WCAG 2.2 |
| **Versione documento** | 1.1 |
| **Ultimo aggiornamento** | Ottobre 2026 |

> Questo documento viene aggiornato a ogni fase completata. Lo storico delle versioni è in fondo.

---

## 1. Sintesi

L'adeguamento è organizzato in fasi successive, così da migliorare l'accessibilità senza
interrompere l'uso del Cruscotto e senza cambiare in modo visibile la grafica attuale.

| Fase | Contenuto | Stato |
|---|---|---|
| **Fase 0 · Fondamenta** | Contrasto dei colori, struttura delle pagine, dimensione minima del testo | ✅ Completata |
| **Fase 1 · Componenti** | Uso da tastiera, nomi dei controlli, tabelle, annunci, schermi piccoli e zoom | ✅ Completata |
| **Fase 1-bis · Verifiche avanzate e WCAG 2.2** | Scadenza della sessione, spaziatura del testo, suggerimenti, movimento, focus non coperto, dimensione dei pulsanti, file esportati, controllo automatico permanente | ✅ Completata |
| **Verifiche specialistiche** | Prove con lettori di schermo reali, pagina di accesso Keycloak | ⏳ A cura di esperti / gestore Keycloak |
| **Fase 2 · Adempimenti** | Dichiarazione di Accessibilità e canale per le segnalazioni | ⏳ In attesa di informazioni dal committente |
| **Fase 3 · Grafici** | Alternative testuali e tabellari ai grafici | 📅 Pianificata |

**Risultato della verifica attuale**: controllo automatico permanente su **28 pagine** del
Cruscotto, ciascuna verificata con **due profili** (utente del Dipartimento e responsabile HR
di ente), con le regole WCAG 2.0, 2.1 e 2.2 di livello A e AA e con le prove di riflusso,
spaziatura del testo e focus non coperto — **nessun errore residuo**, esclusi i grafici che
saranno trattati nella Fase 3.

---

## 2. Come verifichiamo

- **Controllo automatico** con uno strumento di analisi riconosciuto a livello
  internazionale (axe-core), che applica le regole WCAG 2.0, 2.1 e 2.2 di livello A e AA.
- **Controllo automatico permanente**: lo stesso controllo è incluso nel progetto e si esegue
  con un solo comando prima di ogni rilascio; in caso di problemi il rilascio viene segnalato
  come non conforme. Oltre alle regole WCAG verifica in automatico il riflusso a 320 pixel,
  la spaziatura del testo e che l'elemento selezionato da tastiera non resti nascosto.
- **Prove manuali con la sola tastiera**: navigazione completa, apertura e chiusura di filtri,
  menu e finestre.
- **Prove su schermi stretti e con zoom**: larghezza di 320 pixel (smartphone) e
  ingrandimento al 200%.
- **Prove con utenti di profilo diverso**: utente del Dipartimento e responsabile HR di ente.

Le pagine verificate comprendono: Vista Executive, Vista Sintetica (D1–D6), Conto Annuale
(tutte le schede), SIPrO (tutte le schede), InPA, Minerva, Syllabus, KPI Riforma PA,
Lavoro Pubblico, Pannello di Governo, Amministrazione, pagina di benvenuto e pagina di accesso.

---

## 3. Interventi realizzati

### 3.1 Fase 0 · Fondamenta

| Intervento | Cosa cambia per l'utente | Criterio WCAG |
|---|---|---|
| **Contrasto dei colori** | Testi, etichette, badge e voci del menu che risultavano troppo chiari sono stati leggermente scuriti (verde, turchese, arancione, grigi, semafori). Le percentuali sulle barre colorate hanno un piccolo sfondo scuro. | 1.4.3 Contrasto (minimo) |
| **Struttura delle pagine** | Intestazione, menu, contenuto principale e piè di pagina sono riconoscibili dai lettori di schermo. Ogni pagina ha un titolo principale e i titoli seguono un ordine corretto. | 1.3.1 Informazioni e correlazioni · 2.4.6 Intestazioni ed etichette |
| **Icone decorative** | Le icone puramente grafiche vengono ignorate dai lettori di schermo, che leggono solo il testo utile. | 1.1.1 Contenuti non testuali |
| **Menu a tendina dei filtri** | Ogni menu di selezione ha un nome leggibile (es. «Regione», «Comparto»). | 4.1.2 Nome, ruolo, valore |
| **Elenchi scorrevoli** | Le liste e le tabelle con barra di scorrimento si possono raggiungere e scorrere anche da tastiera. | 2.1.1 Tastiera |
| **Testi molto piccoli** | I testi più piccoli sono stati portati a una dimensione minima di 10 pixel. | Buona pratica di leggibilità |

### 3.2 Fase 1 · Componenti

| Intervento | Cosa cambia per l'utente | Criterio WCAG |
|---|---|---|
| **Titolo della scheda del browser** | Il titolo della scheda riporta sempre la sezione aperta (es. «Conto Annuale · Analisi per età · Cruscotto HR»). Utile per orientarsi e per chi usa più schede. | 2.4.2 Titolo della pagina |
| **Annuncio del cambio pagina** | Quando si cambia sezione, il lettore di schermo annuncia il nome della nuova pagina. | 4.1.3 Messaggi di stato |
| **Annunci di caricamento** | Se i dati impiegano più di un istante, il lettore di schermo annuncia «Caricamento dati in corso…» e poi «Dati caricati.». | 4.1.3 Messaggi di stato |
| **Messaggi di errore** | Gli avvisi di errore vengono letti immediatamente dal lettore di schermo. | 4.1.3 Messaggi di stato |
| **Collegamento «Vai al contenuto principale»** | Il primo tasto Tab mostra il collegamento che porta direttamente al contenuto, saltando menu e intestazione. | 2.4.1 Salto di blocchi |
| **Filtri da tastiera** | I filtri in alto (Anno, Regione, Comparto…) si aprono con Invio o Freccia giù, si scorrono con le frecce, si chiudono con Esc tornando al filtro. | 2.1.1 Tastiera · 2.4.3 Ordine del focus |
| **Card degli indici** | Le card della Vista Executive e della Vista Sintetica si aprono con Invio. | 2.1.1 Tastiera |
| **Finestre e menu** | Si chiudono con Esc e riportano il cursore al punto di partenza. | 2.1.2 Nessun impedimento all'uso della tastiera |
| **Evidenziazione del focus** | Ogni elemento raggiunto con la tastiera è evidenziato da un contorno ben visibile, anche i pulsanti che compaiono solo al passaggio del mouse. | 2.4.7 Focus visibile |
| **Nomi dei controlli** | Campi di ricerca, cursori di simulazione e pulsanti con sola icona (chiudi, elimina, sposta, pagina precedente/successiva) hanno un nome leggibile. La pagina corrente della paginazione viene annunciata. | 4.1.2 Nome, ruolo, valore · 3.3.2 Etichette o istruzioni |
| **Tabelle** | Tutte le intestazioni di colonna sono dichiarate e ogni tabella ha un titolo, così il lettore di schermo associa ogni valore alla sua colonna. | 1.3.1 Informazioni e correlazioni |
| **Schermi piccoli e zoom al 200%** | Sotto i 1024 pixel di larghezza il menu laterale diventa un menu a scomparsa (pulsante «Menu» in alto a sinistra). Card, filtri e intestazioni vanno a capo: nessuno scorrimento orizzontale fino a 320 pixel, escluse le tabelle molto larghe che scorrono al loro interno. | 1.4.10 Riflusso · 1.4.4 Ridimensionamento del testo |
| **Leggibilità della Vista Sintetica** | Le card non selezionate non vengono più «sbiadite» (il testo risultava poco leggibile): sono distinte da un leggero sfondo grigio. | 1.4.3 Contrasto (minimo) |

### 3.3 Fase 1-bis · Verifiche avanzate e criteri WCAG 2.2

| Intervento | Cosa cambia per l'utente | Criterio WCAG |
|---|---|---|
| **Avviso di scadenza della sessione** | Se l'utente sta lavorando, la sessione viene prolungata automaticamente. Se è inattivo, compare un avviso almeno 2 minuti prima della scadenza con il pulsante «Resta collegato» (o «Esci»). A sessione scaduta compare il pulsante «Accedi di nuovo», che riporta alla stessa pagina. | 2.2.1 Regolazione dei tempi |
| **Spaziatura del testo** | Aumentando interlinea, spaziatura tra lettere, parole e paragrafi con gli strumenti dell'utente, nessun testo viene tagliato o sovrapposto (verificato su tutte le pagine). | 1.4.12 Spaziatura del testo |
| **Suggerimenti (tooltip)** | I suggerimenti che compaiono al passaggio del mouse si aprono anche raggiungendo l'elemento da tastiera, restano visibili finché servono e si chiudono con Esc. | 1.4.13 Contenuto con hover o focus |
| **Riduzione del movimento** | Se l'utente ha chiesto al sistema operativo di ridurre le animazioni, il Cruscotto elimina transizioni e animazioni, comprese quelle dei grafici e della guida iniziale. | 2.3.3 Animazioni da interazioni |
| **Guida iniziale** | La guida si usa interamente da tastiera (frecce per avanzare e tornare, Esc per chiudere), il cursore resta all'interno del riquadro e il pulsante di chiusura ha un nome leggibile. | 2.1.1 Tastiera · 2.1.2 Nessun impedimento · 4.1.2 Nome, ruolo, valore |
| **Focus non coperto** | Scorrendo la pagina con il tasto Tab, l'elemento selezionato non resta mai nascosto sotto l'intestazione fissa. | 2.4.11 Focus non oscurato (WCAG 2.2) |
| **Dimensione dei pulsanti** | Tutti i pulsanti e i controlli rispettano la dimensione minima di 24×24 pixel o la distanza minima dagli altri controlli. | 2.5.8 Dimensione minima dell'obiettivo (WCAG 2.2) |
| **Aiuto coerente** | Guida e Glossario sono sempre nella stessa posizione del menu. | 3.2.6 Aiuto coerente (WCAG 2.2) |
| **Lingua dei termini inglesi** | Il termine «Executive» (titoli, menu, percorso) e l'etichetta «Mock-up» sono indicati come inglesi, così il lettore di schermo li pronuncia correttamente. I termini tecnici entrati nell'uso comune (es. benchmark, turnover, score, KPI) restano in italiano, come consentito dalle WCAG. | 3.1.2 Parti in lingua |
| **File esportati** | I file Excel riportano titolo e autore; i PDF riportano titolo, argomento, autore e lingua italiana, e il lettore PDF mostra il titolo del documento. Nel menu di esportazione l'Excel è indicato come «accessibile» e il PDF come «per la stampa». | EN 301 549 cap. 10 (documenti) |

### 3.4 Cosa resta invariato

- La **grafica complessiva** del Cruscotto (colori istituzionali, font Titillium Web,
  impaginazione su schermo grande) resta quella attuale: le modifiche ai colori sono
  leggere scuriture delle stesse tonalità.
- **Funzionalità e dati** non cambiano.

---

## 4. Attività in programma

### Fase 2 · Adempimenti (in attesa di informazioni)

- **Dichiarazione di Accessibilità** secondo il modello AgID, raggiungibile dal piè di pagina.
- **Meccanismo di feedback**: modalità con cui gli utenti possono segnalare problemi di
  accessibilità.

**Informazioni richieste al committente:**

1. Denominazione dell'**amministrazione responsabile** del servizio.
2. **Indirizzo email** (o modulo web) per le segnalazioni sull'accessibilità.
3. Indicazione se il Cruscotto è un **servizio rivolto al pubblico** o uno **strumento
   interno** per operatori della PA. Nel primo caso si valuterà anche l'adozione della
   palette colori del Design System AGID, con un cambiamento grafico visibile.

### Verifiche specialistiche (a cura di terzi)

- **Prove con lettori di schermo reali** (NVDA o JAWS su Windows, VoiceOver su Mac) da parte di
  un esperto o di utenti che li usano abitualmente: verificano la comprensibilità all'ascolto,
  che nessuno strumento automatico può accertare.
- **Pagina di accesso Keycloak**: è la prima pagina del servizio ma il suo aspetto è gestito
  dall'amministratore di Keycloak. Va verificata con gli stessi criteri e deve consentire il
  riempimento automatico delle credenziali (WCAG 2.2 — 3.3.8 Autenticazione accessibile).

### Adempimenti ricorrenti dell'amministrazione

- Pubblicazione della **Dichiarazione di Accessibilità** sul portale AgID e suo
  **aggiornamento annuale entro il 23 settembre**.
- Pubblicazione degli **obiettivi di accessibilità entro il 31 marzo** di ogni anno.
- Se il Cruscotto è un servizio rivolto ai cittadini, applicazione delle **Linee guida di
  design dei servizi digitali della PA** (Designers Italia).

### Fase 3 · Grafici

- Per ogni grafico: **tabella dei dati** consultabile in alternativa e **breve descrizione
  testuale** del contenuto, leggibili dai lettori di schermo.
- Verifica del contrasto di linee, barre e legende.

---

## 5. Limitazioni note

| Ambito | Situazione attuale | Intervento previsto |
|---|---|---|
| Grafici | Non dispongono ancora di un'alternativa testuale o tabellare completa. | Fase 3 |
| Dichiarazione di Accessibilità | Non ancora pubblicata. | Fase 2 |
| Tabelle molto larghe | Su schermi stretti scorrono orizzontalmente al loro interno (comportamento ammesso dalle WCAG). | — |
| PDF esportati | I PDF prodotti dal Cruscotto non sono «taggati» (struttura per i lettori di schermo). Per ogni esportazione è disponibile la versione Excel della stessa tabella, accessibile. | Valutazione di un generatore di PDF taggati |
| Tema scuro | Non disponibile per gli utenti: i contrasti sono verificati sul tema chiaro, l'unico in uso. | Da verificare se verrà introdotto |
| Lettori di schermo | Non ancora provati con utenti reali. | Verifiche specialistiche |
| Pagina di accesso Keycloak | Fuori dal perimetro del Cruscotto. | A cura del gestore di Keycloak |

---

## 6. Storico delle versioni

| Versione | Data | Contenuto |
|---|---|---|
| 1.0 | Ottobre 2026 | Prima emissione: Fase 0 e Fase 1 completate, Fasi 2 e 3 pianificate. |
| 1.1 | Ottobre 2026 | Fase 1-bis completata (criteri WCAG 2.2, sessione, spaziatura, movimento, file esportati, controllo automatico permanente); aggiunte verifiche specialistiche e adempimenti ricorrenti. |
