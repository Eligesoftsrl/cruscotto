# Cruscotto HR — Adeguamento all'accessibilità (Linee Guida AgID)

**Documento di avanzamento per il committente**

| | |
|---|---|
| **Prodotto** | Cruscotto HR — Sistema di Monitoraggio HR della Pubblica Amministrazione |
| **Riferimento normativo** | Legge 4/2004, Linee Guida AgID sull'accessibilità degli strumenti informatici, norma UNI EN 301 549 |
| **Livello di conformità obiettivo** | WCAG 2.1 — livello AA |
| **Versione documento** | 1.0 |
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
| **Fase 2 · Adempimenti** | Dichiarazione di Accessibilità e canale per le segnalazioni | ⏳ In attesa di informazioni dal committente |
| **Fase 3 · Grafici** | Alternative testuali e tabellari ai grafici | 📅 Pianificata |

**Risultato della verifica attuale**: controllo automatico su **44 pagine** del Cruscotto
(tutte le sezioni e le schede principali) — **nessun errore residuo**, esclusi i grafici che
saranno trattati nella Fase 3.

---

## 2. Come verifichiamo

- **Controllo automatico** con uno strumento di analisi riconosciuto a livello
  internazionale (axe-core), che applica le regole WCAG 2.1 A e AA.
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

### 3.3 Cosa resta invariato

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

---

## 6. Storico delle versioni

| Versione | Data | Contenuto |
|---|---|---|
| 1.0 | Ottobre 2026 | Prima emissione: Fase 0 e Fase 1 completate, Fasi 2 e 3 pianificate. |
