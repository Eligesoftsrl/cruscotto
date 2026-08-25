/**
 * Schede metodologiche per tutti gli indicatori Executive.
 * Fonte: documenti "Indicatori executive e sintetici" del Tavolo Metodologico GRU.
 */

export type MetodologiaEntry = {
  definizione: string;
  calcolo: string;
  interpretazione: string;
  note?: string;
};

export const metodologie: Record<string, MetodologiaEntry> = {
  /* ═══════════ D1 — Classificazione professioni e competenze ═══════════ */

  IAC: {
    definizione:
      "Misura il livello di diffusione del modello competency-based tra le amministrazioni accreditate in Minerva. Consente di valutare il perimetro delle organizzazioni che hanno avviato le attività di progettazione del modello professionale.",
    calcolo:
      "IAC = Amministrazioni che hanno attivato profili professionali / Amministrazioni accreditate in Minerva\n\nDominio: [0; 1]",
    interpretazione:
      "Consente di misurare il perimetro delle organizzazioni che hanno avviato le attività di progettazione del modello professionale rispetto al totale delle amministrazioni che hanno accesso alla base dati Minerva.\n\n• IAC elevato → ampia diffusione del modello competency-based\n• IAC basso → limitata adesione al modello",
  },

  "IIMP/R": {
    definizione:
      "Misura il grado di sviluppo del sistema professionale adottato dalle amministrazioni, osservando il numero di profili professionali e profili di ruolo attivati in relazione alla dimensione dell'organico.",
    calcolo:
      "IIMP = N° profili professionali attivati / Totale risorse in organico\nIMMR = N° profili di ruolo attivati / Totale risorse in organico\n\nDominio: [0; +∞)",
    interpretazione:
      "Il rapporto tra numero di profili e numero di dipendenti fornisce una proxy del livello di articolazione del sistema professionale, che tende ad aumentare al crescere della dimensione organizzativa e della specializzazione delle funzioni.",
  },

  ICPR: {
    definizione:
      "Misura il grado di utilizzo del sistema professionale nell'organizzazione, osservando la quota di personale a cui è stato assegnato un profilo di ruolo.",
    calcolo:
      "ICPR = Numero dipendenti con profilo di ruolo assegnato / Totale risorse in organico\n\nDominio: [0; 1]",
    interpretazione:
      "• ICPR elevato → il sistema professionale è diffuso e utilizzato nella gestione del personale\n• ICPR medio → il sistema è parzialmente utilizzato\n• ICPR basso → il modello è presente ma scarsamente utilizzato",
  },

  ICVC: {
    definizione:
      "Misura la diffusione delle attività di valutazione delle competenze nelle amministrazioni.",
    calcolo:
      "ICVC = Risorse valutate nel periodo / Totale risorse in organico\n\nDominio: [0; 1]",
    interpretazione:
      "Valori elevati indicano maggiore diffusione dei processi di valutazione delle competenze.",
    note:
      "Misurato rispetto ad arco temporale definito (es. ultimi 3 anni).",
  },

  IACU: {
    definizione:
      "Descrive la distribuzione dei livelli di copertura delle competenze possedute dal personale rispetto ai livelli di competenza richiesti dai profili di ruolo ricoperti. Per ciascun dipendente viene calcolato il tasso di copertura del profilo. L'indicatore non è utilizzato come valore medio, ma come distribuzione dei livelli di copertura nel personale.",
    calcolo:
      "IACU = 1 − (∑ max(Tᵢ − Vᵢⱼ, 0)) / ∑Tᵢ\n\ndove:\n• i = competenza prevista dal profilo di ruolo\n• j = dipendente\n• Tᵢ = livello di competenza richiesto\n• Vᵢⱼ = livello di competenza valutato\n\nDominio: [0; 1]",
    interpretazione:
      "Il livello di copertura viene analizzato osservando la distribuzione dei valori di copertura individuali:\n• 90–100% → piena copertura del profilo\n• 70–90% → buona copertura\n• 50–70% → gap moderati\n• <50% → forte mismatch competenze–ruolo",
    note:
      "L'analisi non si concentra sulla costruzione di un singolo valore medio, ma sull'osservazione della distribuzione dei livelli di copertura nel personale. A livello di singola amministrazione può essere analizzato per singolo profilo di ruolo.",
  },

  "IIMP/R_sub": { // alias - the main entry is already under "IIMP/R"
    definizione: "Alias per IIMP/R",
    calcolo: "",
    interpretazione: "",
  },

  /* ═══════════ D2 — Programmazione fabbisogno ═══════════ */

  IGF: {
    definizione:
      "Misura la capacità dell'Ente di programmare e governare in modo intenzionale la dinamica delle entrate di personale. Integra la coerenza strutturale della variazione occupazionale, la stabilità contrattuale del reclutamento e il presidio del ricambio generazionale. Valori elevati indicano un fabbisogno gestito in modo strutturale e sostenibile; valori bassi segnalano una gestione prevalentemente reattiva.",
    calcolo:
      "IGF = ((IRS + IDP_Norm)/2 + PTI + IRG_Norm) / 3\n\nDominio: [0; 1]\n\nComponenti:\n• IRS = Indice di replica strutturale\n• IDP_Norm = Direzione della progressività (normalizzato)\n• PTI = Peso del tempo indeterminato\n• IRG_Norm = Ricambio generazionale (normalizzato)",
    interpretazione:
      "• IGF → 0: Debole governo strategico del fabbisogno.\n• IGF ≈ 0,5: Gestione parzialmente strutturata.\n• IGF → 1: Elevato governo strategico del fabbisogno.",
    note:
      "L'IGF è un indicatore composito che aggrega quattro sotto-indicatori sintetici. Il suo valore deve essere letto congiuntamente ai valori delle singole componenti per comprendere quali dimensioni trainano o frenano il punteggio complessivo.",
  },

  IRS: {
    definizione: "Misura il rapporto tra personale effettivamente in servizio e dotazione organica prevista. Consente di valutare il livello di copertura delle posizioni.",
    calcolo: "IRS = Personale in servizio / Dotazione organica\n\nDominio: [0; 1]",
    interpretazione: "• IRS → 1: Piena copertura della dotazione organica\n• IRS ≈ 0,7: Scopertura significativa\n• IRS → 0: Forte sottorganico",
    note: "Fonte: Conto Annuale.",
  },

  IDP_Norm: {
    definizione: "Misura la direzione della progressività occupazionale, ovvero se il saldo netto tra assunti e cessati è positivo (espansione) o negativo (contrazione).",
    calcolo: "IDP = (Assunti − Cessati) / Cessati\n\nNormalizzato in [0; 1]",
    interpretazione: "• IDP > 0,5: Saldo netto positivo (crescita)\n• IDP = 0,5: Equilibrio tra entrate e uscite\n• IDP < 0,5: Saldo netto negativo (contrazione)",
    note: "Fonte: Conto Annuale.",
  },

  PTI: {
    definizione: "Misura la quota di assunzioni effettuate con contratto a tempo indeterminato sul totale delle assunzioni. Consente di valutare la stabilità contrattuale del reclutamento.",
    calcolo: "PTI = Assunti a tempo indeterminato / Totale assunti\n\nDominio: [0; 1]",
    interpretazione: "• PTI elevato → reclutamento orientato alla stabilizzazione\n• PTI medio → mix contrattuale equilibrato\n• PTI basso → prevalenza di forme flessibili",
    note: "Fonte: Conto Annuale.",
  },

  IRG_Norm: {
    definizione: "Misura il rapporto tra nuove assunzioni di giovani (under 35) e cessazioni di personale prossimo al pensionamento (over 60). Consente di valutare l'adeguatezza del ricambio generazionale.",
    calcolo: "IRG = Assunti under 35 / Cessati over 60\n\nNormalizzato in [0; 1]",
    interpretazione: "• IRG → 1: Pieno ricambio generazionale\n• IRG ≈ 0,5: Ricambio parziale\n• IRG → 0: Insufficiente ricambio; rischio invecchiamento",
    note: "Fonte: Conto Annuale.",
  },

  /* ═══════════ D3 — Recruiting ═══════════ */

  IAR: {
    definizione:
      "Misura la capacità delle amministrazioni di attivare politiche di reclutamento coerenti con i fabbisogni di ricambio generazionale, mettendo in relazione i posti banditi nelle procedure concorsuali con il numero di dipendenti prossimi al pensionamento.",
    calcolo:
      "IAR = Posti banditi / Dipendenti con età ≥ 63 anni\n\nL'indicatore dovrebbe essere applicato considerando i posti banditi complessivamente negli ultimi 3 anni, rapportandolo al numero medio di risorse con età superiore a 63 anni.",
    interpretazione:
      "• IAR elevato → reclutamento coerente o superiore al fabbisogno di ricambio generazionale\n• IAR medio → attivazione parziale delle politiche di reclutamento\n• IAR basso → possibile disallineamento tra fabbisogni di ricambio e politiche di reclutamento",
    note:
      "Fonte: InPA e Conto Annuale. L'indice IAR svolge una funzione di collegamento tra il Pillar D2 (programmazione del fabbisogno) e il Pillar D3 (recruiting).",
  },

  DDP: {
    definizione:
      "Misura la composizione dei posti banditi dalle amministrazioni pubbliche nei diversi profili professionali, consentendo di osservare quali famiglie/profili sono maggiormente richieste nel sistema pubblico.",
    calcolo:
      "DDP_profilo = Posti banditi per profilo / Totale posti banditi\n\nDominio: [0; 1]",
    interpretazione:
      "• Valori elevati → maggiore concentrazione della domanda di reclutamento in uno specifico profilo professionale\n• Valori distribuiti → maggiore diversificazione delle professionalità ricercate",
    note:
      "Fonte: Lavoro Pubblico. L'indicatore è particolarmente significativo a livello aggregato (cluster di amministrazioni o sistema PA) e su orizzonti temporali pluriennali (almeno 3 anni).",
  },

  IAP: {
    definizione:
      "Misura il livello di attrattività delle posizioni pubblicate dalle amministrazioni, valutando il rapporto tra il numero di candidature ricevute e il numero di posizioni ricercate. L'indicatore fornisce una misura sintetica della capacità del sistema pubblico di attrarre candidati per le posizioni offerte.",
    calcolo:
      "IAP = Candidature ricevute / Posizioni ricercate\n\nDominio: [0; +∞)",
    interpretazione:
      "• IAP elevato → elevata attrattività delle posizioni pubbliche\n• IAP medio → livello di attrazione coerente con il mercato del lavoro\n• IAP basso → possibile difficoltà di attrazione o mismatch tra domanda e offerta",
    note:
      "Fonte: InPA. L'indicatore può essere analizzato per tipologia di selezione, titolo di studio richiesto, fascia salariale della posizione, e consente di analizzare le candidature per genere e fasce di età.",
  },

  IAT: {
    definizione:
      "Misura la capacità di una selezione pubblica di attrarre candidature provenienti da altre regioni rispetto al bacino territoriale locale dell'amministrazione che ha pubblicato il bando. Consente di valutare il grado di apertura territoriale della selezione e la sua capacità di attrarre candidati oltre il contesto locale.",
    calcolo:
      "IAT = Numero candidature provenienti da altre regioni / Numero candidature provenienti dalla stessa regione della PA\n\nDominio: [0; +∞)",
    interpretazione:
      "• IAT alto → forte attrazione di candidati provenienti da altre regioni\n• IAT medio → equilibrio tra candidature locali ed extra-regionali\n• IAT basso → prevalenza di candidature locali",
    note:
      "Fonte: InPA. Può essere analizzato per tipologia di selezione, titolo di studio richiesto, fascia salariale e per genere/fasce di età.",
  },

  TSC: {
    definizione:
      "Misura il grado di selettività delle procedure di reclutamento mettendo in relazione il numero di candidati idonei inseriti in graduatoria con il numero complessivo dei candidati partecipanti alla selezione. Consente di valutare il livello di selettività della procedura e, indirettamente, il grado di adeguatezza delle candidature.",
    calcolo:
      "TSC = Numero idonei / Numero candidati\n\nDominio: [0; +∞)",
    interpretazione:
      "• TSC ≈ 1 → numero di idonei in linea con i posti disponibili\n• TSC > 1 → graduatorie ampie con numero di idonei superiore ai posti disponibili\n• TSC < 1 → difficoltà nel generare una platea di idonei sufficiente",
    note:
      "Fonte: Applicazione Graduatorie Portale Lavoro Pubblico. Analizzato su cluster omogenei, può segnalare ambiti professionali nei quali il reclutamento risulta più complesso.",
  },

  TCP: {
    definizione:
      "Misura la durata complessiva delle procedure concorsuali, calcolata come intervallo tra la data di pubblicazione del bando e la data di approvazione della graduatoria.",
    calcolo:
      "TCP = Data approvazione graduatoria − Data pubblicazione bando in G.U.\n\nEspresso in giorni.",
    interpretazione:
      "• TCP basso → procedure di selezione rapide\n• TCP medio → durata fisiologica delle procedure\n• TCP elevato → procedure lunghe o complesse",
    note:
      "Fonte: Applicazione Graduatorie Portale Lavoro Pubblico. Consente di valutare l'efficienza amministrativa delle procedure di reclutamento.",
  },

  TCPB: {
    definizione:
      "Misura la capacità delle procedure concorsuali di coprire i posti messi a bando attraverso l'assunzione dei vincitori.",
    calcolo:
      "TCPB = Numero vincitori assunti / Numero posti banditi\n\nDominio: [0; 1]",
    interpretazione:
      "• TCPB elevato → posti coperti in modo efficace\n• TCPB medio → copertura parziale dei posti\n• TCPB basso → difficoltà nel completamento delle assunzioni",
    note:
      "Fonte: Applicazione Graduatorie Portale Lavoro Pubblico.",
  },

  /* ═══════════ D4 — Sviluppo professionale ═══════════ */

  CGC: {
    definizione: "Misura il grado con cui l'Ente governa le competenze come oggetto esplicito di progettazione organizzativa, integrando estensione e intensità della formazione, attivazione delle dinamiche di crescita interna e coerenza tra capitale umano posseduto e struttura delle qualifiche.",
    calcolo: "CGC = (TCF + IFM_Norm + DPI_Norm + CQT) / 4\n\nDominio: [0; 1]",
    interpretazione: "• CGC → 0: Debole capacità di governo delle competenze.\n• CGC ≈ 0,5: Gestione parzialmente strutturata.\n• CGC → 1: Elevata capacità di gestione delle competenze.",
    note: "Fonte: Conto Annuale.",
  },

  TCF: {
    definizione: "Misura la quota di personale che ha partecipato ad attività formative nel periodo di riferimento sul totale dell'organico.",
    calcolo: "TCF = Personale formato / Personale totale\n\nDominio: [0; 1]",
    interpretazione: "• TCF elevato → formazione diffusa\n• TCF medio → copertura parziale\n• TCF basso → formazione limitata a specifici segmenti",
    note: "Fonte: Conto Annuale.",
  },

  IFM_Norm: {
    definizione: "Misura l'intensità media della formazione erogata, calcolata come giornate medie di formazione per dipendente formato, rapportata al target normativo.",
    calcolo: "IFM = Giornate formazione medie per dipendente / Target giornate (6 gg/anno)\n\nNormalizzato in [0; 1]",
    interpretazione: "• IFM → 1: Investimento formativo in linea con il target\n• IFM ≈ 0,5: Investimento inferiore al target\n• IFM → 0: Formazione marginale",
    note: "Fonte: Conto Annuale. Il target di 6 giornate è quello previsto dalla normativa.",
  },

  DPI_Norm: {
    definizione: "Misura l'intensità delle progressioni verticali rispetto alla dimensione dell'organico. Indica la dinamicità del sistema di carriera interna.",
    calcolo: "DPI = Progressioni verticali / Personale totale\n\nNormalizzato in [0; 1]",
    interpretazione: "• DPI elevato → alta mobilità interna\n• DPI moderato → dinamicità nella norma\n• DPI basso → struttura statica",
    note: "Fonte: Conto Annuale. Utilizzato sia in D4 (sviluppo) sia in D5 (carriera).",
  },

  CQT: {
    definizione: "Misura la coerenza tra il titolo di studio posseduto dal personale e la qualifica ricoperta. Consente di valutare l'allineamento tra capitale umano formale e struttura delle posizioni.",
    calcolo: "CQT = Personale con titolo coerente alla qualifica / Personale totale\n\nDominio: [0; 1]",
    interpretazione: "• CQT → 1: Piena coerenza tra titoli e qualifiche\n• CQT ≈ 0,5: Coerenza parziale\n• CQT → 0: Forte mismatch tra titoli e posizioni",
    note: "Fonte: Conto Annuale. Non misura la qualità delle competenze ma l'allineamento formale.",
  },

  ISTP_Norm: {
    definizione: "Misura la quota di dipendenti che hanno un percorso di specializzazione tecnico-professionale attivo sul totale dei dipendenti con profilo assegnato.",
    calcolo: "ISTP = Dipendenti con percorso specialistico / Dipendenti con profilo\n\nNormalizzato in [0; 1]",
    interpretazione: "• ISTP elevato → forte investimento in specializzazione\n• ISTP moderato → specializzazione in corso\n• ISTP basso → specializzazione limitata",
    note: "Fonte: Sistema Minerva.",
  },

  IDFP: {
    definizione: "Misura la varietà delle famiglie professionali attive nell'amministrazione rispetto al catalogo nazionale. Indica il grado di diversificazione delle professionalità.",
    calcolo: "IDFP = Famiglie professionali attive / Famiglie catalogo DFP\n\nDominio: [0; 1]",
    interpretazione: "• IDFP → 1: Piena copertura del catalogo professionale\n• IDFP ≈ 0,5: Copertura parziale\n• IDFP → 0: Limitata diversificazione",
    note: "Fonte: Sistema Minerva.",
  },

  ICRP: {
    definizione: "Misura la quota di ruoli professionali definiti nel sistema che risultano effettivamente coperti da almeno un dipendente.",
    calcolo: "ICRP = Ruoli con almeno 1 dipendente / Ruoli definiti totali\n\nDominio: [0; 1]",
    interpretazione: "• ICRP → 1: Tutti i ruoli definiti sono operativamente coperti\n• ICRP ≈ 0,5: Metà dei ruoli sono vuoti\n• ICRP → 0: Forte disconnessione tra modello e realtà",
    note: "Fonte: Sistema Minerva.",
  },

  IEF_Norm: {
    definizione: "Misura l'efficacia della formazione in termini di completamento con successo dei percorsi formativi avviati.",
    calcolo: "IEF = Corsi completati con successo / Corsi iniziati\n\nNormalizzato in [0; 1]",
    interpretazione: "• IEF elevato → alta efficacia formativa\n• IEF moderato → efficacia parziale\n• IEF basso → alto tasso di abbandono",
    note: "Fonte: Syllabus.",
  },

  ICQ: {
    definizione: "Misura la quota di completamenti formativi che hanno portato a un riconoscimento formale (badge, certificazione, qualificazione).",
    calcolo: "ICQ = Completamenti con qualificazione / Completamenti totali\n\nDominio: [0; 1]",
    interpretazione: "• ICQ elevato → formazione qualificante diffusa\n• ICQ moderato → qualificazione parziale\n• ICQ basso → formazione prevalentemente non qualificante",
    note: "Fonte: Syllabus.",
  },

  ICEC: {
    definizione: "Misura la coerenza evolutiva delle competenze: il grado in cui i percorsi formativi producono un effettivo avanzamento nel colmare i gap di competenze.",
    calcolo: "ICEC = Δ competenze post-formazione / Gap iniziale\n\nDominio: [0; 1]",
    interpretazione: "• ICEC → 1: Formazione altamente efficace nel colmare i gap\n• ICEC ≈ 0,5: Efficacia parziale\n• ICEC → 0: Formazione non produce miglioramenti significativi",
    note: "Fonte: Syllabus.",
  },

  ISCP: {
    definizione: "Sintetizza il livello complessivo di sviluppo e articolazione del capitale professionale dell'Amministrazione.",
    calcolo: "ISCP = (ISTP_Norm + IDFP + ICRP) / 3\n\nDominio: [0; 1]",
    interpretazione: "• ISCP → 1: Massima copertura delle dimensioni professionali.\n• ISCP ≈ 0,5: Livello intermedio.\n• ISCP → 0: Nessuna strutturazione professionale.",
    note: "Fonte: Sistema Minerva.",
  },

  IESF: {
    definizione: "Sintetizza il grado con cui i percorsi formativi producono un effettivo sviluppo delle competenze del personale.",
    calcolo: "IESF = (IEF_Norm + ICQ + ICEC) / 3\n\nDominio: [0; 1]",
    interpretazione: "• IESF → 1: Elevata efficacia formativa.\n• IESF ≈ 0,5: Efficacia parziale.\n• IESF → 0: Formazione non efficace.",
    note: "Fonte: Syllabus.",
  },

  ICS_Norm: {
    definizione: "Misura la variazione relativa della retribuzione media nel tempo, indicando se nel tempo aumenta la quota di personale collocato nelle categorie superiori.",
    calcolo: "ICS = Δ retribuzione media / Retribuzione media\n\nNormalizzato in [0; 1]",
    interpretazione: "• ICS elevato → crescita strutturale significativa\n• ICS moderato → crescita contenuta\n• ICS basso → struttura retributiva statica",
    note: "Fonte: Conto Annuale.",
  },

  /* ═══════════ D5 — Rewarding e carriera ═══════════ */

  IDC: {
    definizione:
      "Misura la capacità dell'Ente di attivare e governare percorsi di crescita professionale attraverso leve interne, combinando l'intensità delle progressioni e mobilità con gli effetti strutturali prodotti sulla distribuzione delle qualifiche nel tempo. Valori elevati indicano un sistema di carriera attivo e capace di incidere sull'assetto professionale dell'organico.",
    calcolo:
      "IDC = (DPI_Norm + ICS_Norm) / 2\n\nDominio: [0; 1)\n\nComponenti:\n• DPI_Norm = Dinamicità del personale interna (normalizzata) — quante progressioni, mobilità o riqualificazioni avvengono rispetto al totale del personale\n• ICS_Norm = Indice di crescita strutturale (normalizzato) — se, nel tempo, aumenta la quota di personale collocato nelle categorie superiori",
    interpretazione:
      "• IDC → 0: Struttura sostanzialmente statica o regressiva. La mobilità interna è limitata e non produce effetti evolutivi significativi.\n\n• IDC ≈ 0,5: Dinamicità moderata o strutturalmente neutra. L'Ente utilizza le leve di carriera, ma senza produrre cambiamenti strutturali marcati.\n\n• IDC → 1: Sistema di carriera fortemente attivo e strutturalmente incisivo. È tipico di fasi di riorganizzazione, upgrading o rafforzamento delle competenze interne.",
    note:
      "Fonte: Conto Annuale. L'indicatore tiene insieme la dinamicità interna e la crescita strutturale. I 'passaggi' non sono semplici variazioni amministrative, ma movimenti che modificano la posizione professionale del dipendente.",
  },

  /* ═══════════ D6 — Capacity building e sostenibilità ═══════════ */

  TVO: {
    definizione:
      "Misura la variazione netta della consistenza complessiva del personale in un determinato periodo (es. 3 o 5 anni), rapportata alla dimensione media dell'organico. Consente di valutare se l'amministrazione sia in fase di espansione, contrazione o stabilità dimensionale.",
    calcolo:
      "TVO = ΔOrganico / Organico medio\n\ndove:\n• ΔOrganico = Organico_t − Organico_{t-n}\n• Organico medio = (Organico_t + Organico_{t-1}) / 2",
    interpretazione:
      "• TVO > 0 → crescita dell'organico\n• TVO = 0 → stabilità dimensionale\n• TVO < 0 → riduzione dell'organico",
  },

  ISG: {
    definizione:
      "Misura il rapporto tra il personale nelle fasce di età più elevate (oltre 60 anni) e il personale nelle fasce più giovani (inferiore a 40 anni). Consente di valutare il grado di equilibrio generazionale dell'organico, evidenziando eventuali asimmetrie nella distribuzione per età.",
    calcolo:
      "ISG = Personale > 60 / Personale < 40\n\nDominio: [0; +∞)",
    interpretazione:
      "• ISG = 1 → equilibrio generazionale (pari numero di over 60 e under 40)\n• ISG > 1 → prevalenza di personale prossimo al pensionamento; potenziale rischio di squilibrio e pressione sul ricambio\n• ISG < 1 → prevalenza di personale giovane; struttura demografica più sostenibile",
    note:
      "I valori 40 e 60 potranno essere rivisti anche sulla base dei dati relativi ai valori mediani dell'età del personale.",
  },

  TEP: {
    definizione:
      "Misura la quota di personale che si colloca in una fascia di età prossima al pensionamento, fornendo un'indicazione della pressione potenziale in uscita nel breve–medio periodo. Supporta la pianificazione del ricambio generazionale.",
    calcolo:
      "TEP = Totale personale ≥ 63 / Totale Personale\n\nDominio: [0; 1]",
    interpretazione:
      "• TEP basso (< 10–15%) → limitata pressione demografica nel breve periodo\n• TEP medio (15–25%) → esposizione significativa; necessità di monitoraggio\n• TEP elevato (> 25–30%) → forte potenziale pressione in uscita; rischio di perdita di competenze",
    note:
      "Il valore di 63 utilizzato come soglia dovrà essere oggetto di approfondimento. I valori di riferimento per i livelli sono indicativi.",
  },

  IQP: {
    definizione:
      "Misura la quota di personale in possesso di titolo di studio universitario sul totale del personale in servizio. Consente di valutare il livello medio di qualificazione formale dell'organico.",
    calcolo:
      "IQP = Personale laureato / Totale personale\n\nDominio: [0; 1]",
    interpretazione:
      "• IQP elevato → maggiore dotazione di capitale umano formalmente qualificato\n• IQP medio → struttura mista, con presenza significativa ma non prevalente di personale laureato\n• IQP basso → prevalenza di personale con titoli di studio non universitari",
  },

  IEQ: {
    definizione:
      "Misura la variazione relativa della quota di personale in possesso di titolo universitario in un orizzonte temporale pluriennale (es. ultimi tre anni), evidenziando la direzione strutturale dell'evoluzione del capitale umano.",
    calcolo:
      "IEQ = (%Laureati_t − %Laureati_{t-3}) / %Laureati_{t-3}\n\nDominio: (-∞; +∞)",
    interpretazione:
      "• > 0: crescita relativa della quota di laureati\n• = 0: stabilità\n• < 0: riduzione",
  },

  VQF: {
    definizione:
      "Misura la differenza, tra due periodi consecutivi, nella percentuale di donne sul totale del personale in servizio. Consente di valutare l'evoluzione della composizione di genere dell'organico.",
    calcolo:
      "VQF = (Donne_t / Totale_t) − (Donne_{t-1} / Totale_{t-1})",
    interpretazione:
      "• Δ Quota > 0 → incremento della presenza femminile\n• Δ Quota = 0 → stabilità nella composizione di genere\n• Δ Quota < 0 → riduzione della presenza femminile",
  },

  IPD: {
    definizione:
      "Misura il grado di coerenza tra la presenza femminile nei ruoli dirigenziali e la presenza femminile complessiva nell'organico. Consente di valutare se le donne risultano proporzionalmente rappresentate nei ruoli di vertice.",
    calcolo:
      "IPD = %Donne dirigenti / %Donne totale\n\nDominio: [0; +∞)\n1 = piena proporzionalità",
    interpretazione:
      "• IPD = 1 → piena proporzionalità: la presenza femminile in dirigenza è coerente con la presenza complessiva nell'organico\n• IPD < 1 → sottorappresentazione femminile nei ruoli dirigenziali\n• IPD > 1 → sovrarappresentazione femminile nei ruoli dirigenziali\n\nValori significativamente inferiori a 1 indicano un potenziale squilibrio nella distribuzione delle opportunità di accesso ai ruoli apicali.",
  },

  IRG: {
    definizione:
      "Misura la coerenza del ricambio rispetto all'equilibrio di genere, valutando se la quota di assunzioni femminili è coerente con la presenza femminile nell'organico.",
    calcolo:
      "IRG = (Assunzioni Donne / Assunti Totali) / (Tot Donne / Tot Organico)\n\nDominio: [0; +∞)\n1 = neutralità",
    interpretazione:
      "• IRG > 1 → le assunzioni valorizzano le donne più della loro presenza attuale\n• IRG = 1 → neutralità\n• IRG < 1 → le assunzioni non compensano (o penalizzano) la presenza femminile",
  },

  IFL: {
    definizione:
      "Misura l'incidenza del personale con contratto di lavoro flessibile sul totale del personale in servizio. Consente di valutare il grado di ricorso a forme contrattuali non stabili (es. tempo determinato, LSU, interinali, formazione lavoro).",
    calcolo:
      "IFL = Personale flessibile / Totale personale\n\nDominio: [0; 1]",
    interpretazione:
      "• IFL basso → prevalenza di personale stabile; struttura contrattuale consolidata\n• IFL medio → presenza significativa di forme flessibili; possibile utilizzo per esigenze temporanee\n• IFL elevato → forte ricorso al lavoro flessibile; potenziale instabilità strutturale",
    note:
      "Valori elevati possono indicare maggiore adattabilità organizzativa, ma anche una possibile fragilità nella continuità operativa. L'interpretazione dei dati deve considerare le caratteristiche funzionali dell'amministrazione.",
  },

  IDLA: {
    definizione:
      "Misura l'incidenza del personale che svolge attività in modalità di lavoro agile sul totale del personale in servizio. Consente di valutare il grado di adozione del lavoro agile nell'amministrazione.",
    calcolo:
      "IDLA = Personale in lavoro agile / Totale personale\n\nDominio: [0; 1]",
    interpretazione:
      "• IDLA basso → limitata diffusione del lavoro agile; prevalenza di modalità organizzative tradizionali\n• IDLA medio → adozione significativa ma non generalizzata\n• IDLA elevato → ampia diffusione del lavoro agile; forte orientamento a modelli organizzativi flessibili",
    note:
      "Valori elevati possono indicare maggiore adattabilità organizzativa e digitalizzazione dei processi, ma devono essere interpretati alla luce delle caratteristiche funzionali dell'amministrazione (es. presenza di attività non remotizzabili).",
  },

  TEPD: {
    definizione:
      "Misura la variazione nel tempo dell'Indice di parità dirigenziale, evidenziando se l'amministrazione stia progressivamente riducendo o ampliando eventuali squilibri nella rappresentanza femminile in dirigenza.",
    calcolo:
      "TEPD = IPD_t − IPD_{t-n}\n\nDominio: [-1; +1]",
    interpretazione:
      "• TEPD > 0 → miglioramento della proporzionalità di genere in dirigenza\n• TEPD = 0 → stabilità\n• TEPD < 0 → peggioramento dell'equilibrio",
  },

  TFL: {
    definizione:
      "Misura la variazione relativa, in un orizzonte pluriennale, dell'incidenza del personale con contratto flessibile sul totale del personale. Consente di valutare se il ricorso al lavoro flessibile rappresenti una dinamica crescente.",
    calcolo:
      "TFL = IFL_t − IFL_{t-n}\n\ndove IFL_t = Personale flessibile_t / Totale personale_t\n\nDominio: [-1; +1]",
    interpretazione:
      "• TFL > 0 → aumento relativo del ricorso al lavoro flessibile\n• TFL = 0 → stabilità del livello di flessibilità\n• TFL < 0 → riduzione del lavoro flessibile; possibile stabilizzazione dell'organico",
  },

  TDLA: {
    definizione:
      "Misura l'evoluzione nel tempo dell'incidenza del personale in lavoro agile sul totale del personale, evidenziando la direzione del cambiamento organizzativo.",
    calcolo:
      "TDLA = IDLA_t − IDLA_{t-n}\n\nDominio: [-1; +1]",
    interpretazione:
      "• Trend crescente → consolidamento o ampliamento del modello agile\n• Trend stabile → assetto organizzativo consolidato\n• Trend decrescente → riduzione dell'utilizzo del lavoro agile",
  },

  ISC: {
    definizione:
      "Misura il grado di sovra-qualificazione dei candidati alle procedure concorsuali, evidenziando lo scostamento tra il titolo di studio posseduto e quello minimo richiesto dal bando.",
    calcolo:
      "ISC = Candidati con titolo di studio superiore al richiesto / Candidati totali\n\nDominio: [0; 1]",
    interpretazione:
      "• ISC elevato → forte attrattività delle posizioni ma rischio mismatch e turnover post-assunzione\n• ISC moderato → buon allineamento tra domanda e offerta di competenze\n• ISC basso → possibile scarsa attrattività o requisiti già elevati",
    note: "Un ISC persistentemente alto può indicare la necessità di rivedere i requisiti dei bandi o di prevedere percorsi di valorizzazione per evitare sotto-utilizzo delle competenze.",
  },
};
