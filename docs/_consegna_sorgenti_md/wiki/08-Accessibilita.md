# 8. Accessibilità

Il Cruscotto HR viene adeguato progressivamente ai requisiti di accessibilità previsti per
la Pubblica Amministrazione (Linee Guida AgID, WCAG 2.1 livello AA).

## Fase 0 · Fondamenta — completata

Interventi che non cambiano l'aspetto della pagina, verificati con un controllo automatico
su tutte le sezioni (Vista Executive, Vista Sintetica D1–D6, Conto Annuale, InPA, Minerva,
SIPrO, Syllabus, KPI Riforma PA, Lavoro Pubblico, Pannello di Governo, Amministrazione,
pagina di accesso): **nessun errore residuo**.

- **Contrasto dei colori**: i colori che non raggiungevano il contrasto minimo (verde,
  turchese e arancione degli indici, testi grigi chiari, voci del menu laterale, etichette
  dei semafori) sono stati leggermente scuriti. Le etichette percentuali sulle barre di
  composizione hanno ora uno sfondo scuro.
- **Struttura della pagina**: intestazione, menu, contenuto principale e piè di pagina sono
  riconoscibili dai lettori di schermo; ogni pagina ha un titolo principale e i titoli
  seguono un ordine corretto.
- **Icone decorative**: ignorate dai lettori di schermo, così da non leggere elementi senza
  significato.
- **Campi di selezione**: tutti i menu a tendina dei filtri hanno un nome leggibile.
- **Paginazione delle tabelle**: i pulsanti «pagina precedente/successiva» hanno un nome e la
  pagina corrente è annunciata.
- **Elenchi scorrevoli**: raggiungibili e scorrevoli anche da tastiera.
- **Testi molto piccoli**: portati a una dimensione minima di 10 px.

## Fase 1 · Componenti — completata

Verificata con il controllo automatico su 44 pagine (nessun errore residuo)
e con prove di navigazione da tastiera.

- **Titolo della scheda del browser**: riporta sempre la sezione aperta, ad esempio
  «Conto Annuale · Analisi per età · Cruscotto HR». Il cambio di pagina viene annunciato
  ai lettori di schermo.
- **Annunci di caricamento**: quando i dati impiegano più di un istante, il lettore di schermo
  annuncia «Caricamento dati in corso…» e poi «Dati caricati.». I messaggi di errore vengono
  letti subito.
- **Tastiera**:
  - «Vai al contenuto principale» porta direttamente al contenuto della pagina;
  - i filtri in alto (Anno, Regione, Comparto…) si aprono con Invio o Freccia giù, si
    scorrono con le frecce e si chiudono con Esc, tornando al filtro;
  - le card degli indici si aprono con Invio;
  - finestre e menu si chiudono con Esc e riportano il cursore al punto di partenza;
  - ogni elemento selezionato è evidenziato da un contorno ben visibile.
- **Nomi dei controlli**: tutti i campi di ricerca, i cursori di simulazione e i pulsanti con
  sola icona (chiudi, elimina, sposta, pagina precedente/successiva) hanno un nome leggibile.
- **Tabelle**: tutte le intestazioni di colonna sono dichiarate e ogni tabella ha un titolo.
- **Schermi piccoli e zoom al 200%**: sotto i 1024 px il menu laterale diventa un menu a
  scomparsa (pulsante «Menu» in alto a sinistra, chiusura con Esc); le card e i filtri vanno a
  capo e la pagina non scorre in orizzontale fino a 320 px di larghezza.

## Fase 1-bis · Verifiche avanzate e WCAG 2.2 — completata

- **Scadenza della sessione**: chi sta lavorando resta collegato automaticamente; in caso di
  inattività compare un avviso 2 minuti prima con «Resta collegato» o «Esci»; a sessione
  scaduta, «Accedi di nuovo» riporta alla stessa pagina.
- **Spaziatura del testo**: aumentando interlinea e spaziature nessun testo viene tagliato.
- **Suggerimenti**: si aprono anche da tastiera e si chiudono con Esc.
- **Riduzione del movimento**: con l'impostazione di sistema «riduci movimento» il Cruscotto
  elimina animazioni e transizioni, anche dei grafici e della guida iniziale.
- **Guida iniziale**: utilizzabile da tastiera (frecce ed Esc).
- **Focus non coperto** e **dimensione minima dei pulsanti** (criteri WCAG 2.2) verificati.
- **Termini inglesi**: «Executive» e «Mock-up» letti con pronuncia inglese.
- **File esportati**: Excel con titolo e autore e **PDF accessibili** (PDF/UA «taggati»:
  intestazioni, tabelle con intestazioni di riga e colonna, lingua italiana).
- **Controllo automatico permanente**: verifica WCAG 2.0/2.1/2.2 A e AA su 28 pagine con due
  profili, da eseguire prima di ogni rilascio.

## Fase 3 · Grafici — completata

- Ogni grafico ha il pulsante **«Visualizza in tabella»**: si apre una finestra con la tabella
  dei dati (intestazioni di riga e colonna), che si chiude con Esc o «Chiudi».
- Dalla finestra si può **scaricare la tabella in Excel**.
- Colori di barre, linee e fette con **contrasto di almeno 3:1** rispetto allo sfondo.

## Prossime fasi
- **Fase 2 · Adempimenti**: la bozza della «Dichiarazione di Accessibilità» secondo il modello
  AgID e i link «Dichiarazione di accessibilità» e «Segnala un problema di accessibilità» sono
  pronti; si attivano non appena l'amministrazione comunica i propri riferimenti.

> Da definire con il committente: se il Cruscotto è un servizio pubblico o uno strumento
> interno (nel primo caso andrà adottata anche la palette colori AGID).
