/**
 * Interconnessioni tra indicatori Executive e Pillar della Riforma PA.
 * Fonte: Documenti metodologici "Indicatori executive e sintetici" D1-D6.
 *
 * Ogni indicatore può essere collegato a più pillar (oltre al proprio),
 * con una breve spiegazione del motivo della correlazione.
 */

export interface PillarConnection {
  pillar: string; // e.g. "D2"
  label: string; // e.g. "Programmazione fabbisogno"
  reason: string; // breve spiegazione del collegamento
}

export interface IndicatorInterconnections {
  connections: PillarConnection[];
  bridgeNote?: string; // nota "indicatore ponte" se presente
}

const PILLAR_LABELS: Record<string, string> = {
  D1: "Classificazione professioni",
  D2: "Programmazione fabbisogno",
  D3: "Recruiting",
  D4: "Sviluppo professionale",
  D5: "Rewarding e carriera",
  D6: "Capacity building",
};

const conn = (pillar: string, reason: string): PillarConnection => ({
  pillar,
  label: PILLAR_LABELS[pillar],
  reason,
});

export const interconnessioni: Record<string, IndicatorInterconnections> = {
  /* ═══════════ D1 ═══════════ */
  IAC: {
    connections: [
      conn(
        "D6",
        "La diffusione del modello competency-based influenza la capacità amministrativa e la qualità del capitale umano dell'organizzazione.",
      ),
    ],
  },
  "IIMP/R": {
    connections: [
      conn(
        "D2",
        "La disponibilità di profili strutturati è presupposto per una programmazione del fabbisogno basata sulle competenze.",
      ),
      conn(
        "D3",
        "L'articolazione dei profili professionali orienta le strategie di reclutamento verso i profili effettivamente necessari.",
      ),
      conn(
        "D6",
        "Il livello di strutturazione del sistema professionale contribuisce al rafforzamento della capacità amministrativa.",
      ),
    ],
    bridgeNote:
      "Indicatore ponte tra programmazione (D2), reclutamento (D3) e capacità amministrativa (D6).",
  },
  ICPR: {
    connections: [
      conn(
        "D2",
        "La copertura del sistema professionale alimenta la programmazione del fabbisogno di personale.",
      ),
      conn("D3", "La mappatura delle competenze orienta le strategie di recruiting."),
      conn(
        "D5",
        "La copertura dei profili di ruolo presuppone una chiara identificazione delle competenze per lo sviluppo di carriera.",
      ),
    ],
    bridgeNote: "Indicatore ponte tra programmazione (D2), recruiting (D3) e rewarding (D5).",
  },
  ICVC: {
    connections: [
      conn(
        "D4",
        "La valutazione delle competenze alimenta i percorsi di sviluppo professionale e formazione.",
      ),
      conn(
        "D6",
        "La disponibilità di dati sulle competenze contribuisce alla qualità del capitale umano.",
      ),
    ],
  },
  IACU: {
    connections: [
      conn(
        "D2",
        "L'adeguatezza del capitale umano consente di orientare la programmazione dei fabbisogni.",
      ),
      conn("D3", "I gap di competenze evidenziano necessità di reclutamento mirato."),
      conn(
        "D4",
        "I gap individuati supportano la progettazione di percorsi di sviluppo e formazione.",
      ),
      conn("D6", "Il livello di copertura delle competenze determina la capacità amministrativa."),
    ],
    bridgeNote:
      "Indicatore ponte tra tutti i pillar: collega programmazione, reclutamento, sviluppo e capacità organizzativa.",
  },

  /* ═══════════ D2 ═══════════ */
  IGF: {
    connections: [
      conn(
        "D1",
        "L'indice utilizza la coerenza strutturale che presuppone la classificazione delle professioni.",
      ),
      conn(
        "D3",
        "Il governo del fabbisogno determina l'attivazione e la qualità delle procedure di recruiting.",
      ),
      conn(
        "D6",
        "La programmazione strategica del fabbisogno contribuisce alla sostenibilità organizzativa.",
      ),
    ],
    bridgeNote:
      "Indicatore composito che collega programmazione (D2), reclutamento (D3) e sostenibilità (D6).",
  },

  /* ═══════════ D3 ═══════════ */
  IAR: {
    connections: [
      conn(
        "D2",
        "Il piano dei fabbisogni (IGF) determina quanti posti dovrebbero essere banditi: IAR misura l'attivazione effettiva.",
      ),
      conn(
        "D6",
        "Il reclutamento contribuisce al rafforzamento della capacità amministrativa e al ricambio generazionale.",
      ),
    ],
    bridgeNote:
      "Indicatore ponte tra programmazione del fabbisogno (D2) e capacità amministrativa (D6). Correlati operativi: pubblicazioni medie PA, posti banditi, cessati/anno, tasso sostituzione.",
  },
  DDP: {
    connections: [
      conn(
        "D1",
        "La distribuzione della domanda professionale presuppone un sistema di classificazione delle professioni.",
      ),
      conn(
        "D2",
        "La composizione dei posti banditi riflette le scelte di programmazione del fabbisogno.",
      ),
    ],
    bridgeNote:
      "Correlati operativi: % pubblicazioni per categoria, % candidature per figura ricercata.",
  },
  IAP: {
    connections: [
      conn(
        "D1",
        "L'attrattività delle posizioni dipende dalla chiarezza dei profili professionali.",
      ),
      conn(
        "D5",
        "Il livello di attrattività è influenzato dalle opportunità di crescita e valorizzazione.",
      ),
    ],
    bridgeNote:
      "Correlati operativi: iscritti residenti area, intensità partecipazione locale, ISC (sovra-qualificazione), IAT, % candidature per area geografica.",
  },
  IAT: {
    connections: [
      conn(
        "D4",
        "L'attrazione territoriale è legata alla qualità dei percorsi di sviluppo offerti.",
      ),
    ],
  },
  TSC: {
    connections: [
      conn(
        "D1",
        "La selettività delle procedure riflette la coerenza tra profili richiesti e competenze dei candidati.",
      ),
      conn(
        "D4",
        "La selettività segnala il livello di adeguatezza delle competenze disponibili nel mercato.",
      ),
    ],
    bridgeNote:
      "Correlati operativi: numero candidature, candidature/posizioni (pressione competitiva).",
  },
  TCP: {
    connections: [
      conn(
        "D2",
        "L'efficienza procedurale impatta sulla capacità di tradurre la programmazione in assunzioni.",
      ),
      conn(
        "D6",
        "Tempi lunghi riducono la capacità amministrativa e ritardano il rafforzamento dell'organico.",
      ),
    ],
    bridgeNote: "Correlati operativi: % graduatorie pubblicate, numero candidature, cessati/anno.",
  },
  TCPB: {
    connections: [
      conn(
        "D2",
        "La copertura dei posti banditi misura l'efficacia della programmazione del fabbisogno.",
      ),
      conn("D6", "La copertura effettiva dei posti contribuisce al rafforzamento dell'organico."),
    ],
    bridgeNote:
      "Correlati operativi: candidature, candidature/posizioni, % graduatorie, tasso sostituzione, TUG.",
  },
  TUG: {
    connections: [
      conn(
        "D3",
        "Il tasso di utilizzo delle graduatorie misura quanto l'ente sfrutta il bacino di idonei disponibili.",
      ),
      conn(
        "D2",
        "L'utilizzo delle graduatorie contribuisce alla copertura organica prevista dalla programmazione.",
      ),
    ],
    bridgeNote: "Indicatore sintetico collegato a TCPB: misura idonei assunti / idonei totali.",
  },

  /* ═══════════ D4 ═══════════ */
  CGC: {
    connections: [
      conn(
        "D1",
        "La gestione delle competenze richiede un sistema di classificazione professionale strutturato.",
      ),
      conn(
        "D2",
        "La coerenza tra qualifiche e competenze orienta la programmazione del fabbisogno.",
      ),
      conn("D5", "La formazione e lo sviluppo delle competenze alimentano i percorsi di carriera."),
      conn(
        "D6",
        "La capacità di gestione delle competenze rafforza il capitale umano dell'organizzazione.",
      ),
    ],
  },
  ISCP: {
    connections: [
      conn(
        "D2",
        "Lo sviluppo del capitale professionale orienta la programmazione del fabbisogno.",
      ),
      conn("D3", "La diversificazione professionale guida le strategie di reclutamento."),
      conn("D5", "La copertura dei ruoli professionali è collegata ai percorsi di valorizzazione."),
      conn(
        "D6",
        "Il livello di sviluppo professionale determina la capacità amministrativa complessiva.",
      ),
    ],
  },
  IESF: {
    connections: [
      conn(
        "D1",
        "L'efficacia formativa è misurabile solo in presenza di un sistema di competenze strutturato.",
      ),
      conn(
        "D2",
        "La formazione efficace contribuisce a colmare i gap di competenze individuati dalla programmazione.",
      ),
      conn(
        "D3",
        "L'efficacia formativa riduce la dipendenza dal reclutamento esterno per le competenze.",
      ),
      conn(
        "D5",
        "La formazione efficace alimenta lo sviluppo di carriera e la valorizzazione del personale.",
      ),
      conn(
        "D6",
        "Lo sviluppo formativo rafforza complessivamente la capacità dell'organizzazione.",
      ),
    ],
  },

  /* ═══════════ D5 ═══════════ */
  IDC: {
    connections: [
      conn(
        "D4",
        "La dinamicità della carriera è strettamente legata allo sviluppo delle competenze interne.",
      ),
      conn(
        "D6",
        "Il sistema di carriera attivo contribuisce alla sostenibilità e crescita dell'organizzazione.",
      ),
    ],
  },

  /* ═══════════ D6 ═══════════ */
  TVO: {
    connections: [
      conn("D1", "La variazione dell'organico modifica la struttura delle competenze disponibili."),
      conn("D3", "La variazione dell'organico è determinata dall'efficacia del reclutamento."),
    ],
  },
  ISG: {
    connections: [
      conn("D1", "Lo squilibrio generazionale impatta sulla distribuzione delle competenze."),
      conn(
        "D2",
        "L'invecchiamento dell'organico richiede una programmazione mirata del fabbisogno.",
      ),
      conn(
        "D3",
        "Lo squilibrio generazionale determina l'urgenza e la tipologia del reclutamento.",
      ),
    ],
  },
  TEP: {
    connections: [
      conn(
        "D1",
        "L'esposizione al pensionamento rischia di depauperare il patrimonio di competenze.",
      ),
      conn(
        "D2",
        "Il tasso di pensionamento è un driver fondamentale della programmazione del fabbisogno.",
      ),
    ],
  },
  IQP: {
    connections: [
      conn(
        "D2",
        "Il livello di qualificazione del personale orienta la programmazione del fabbisogno.",
      ),
      conn("D3", "La qualificazione dell'organico influenza le strategie di reclutamento."),
    ],
  },
  IEQ: {
    connections: [
      conn(
        "D2",
        "L'evoluzione della qualificazione riflette l'efficacia della programmazione nel tempo.",
      ),
      conn("D3", "Il trend di qualificazione è influenzato dalla qualità del reclutamento."),
    ],
  },
  VQF: {
    connections: [],
  },
  IPD: {
    connections: [
      conn(
        "D2",
        "La parità dirigenziale riflette le scelte di programmazione per i ruoli apicali.",
      ),
    ],
  },
  IRG: {
    connections: [
      conn(
        "D5",
        "Il riequilibrio di genere nelle assunzioni è correlato alle politiche di valorizzazione.",
      ),
    ],
  },
  IFL: {
    connections: [
      conn(
        "D1",
        "Il livello di flessibilità contrattuale impatta sulla stabilità delle competenze.",
      ),
      conn("D2", "Il ricorso al lavoro flessibile è una leva di programmazione del fabbisogno."),
    ],
  },
  IDLA: {
    connections: [
      conn("D1", "La diffusione del lavoro agile richiede competenze digitali mappate."),
      conn("D2", "L'adozione del lavoro agile influenza la programmazione organizzativa."),
    ],
  },
  TEPD: {
    connections: [
      conn("D2", "L'evoluzione della parità dirigenziale riflette le scelte di programmazione."),
      conn(
        "D5",
        "Il trend della parità dirigenziale è correlato ai percorsi di sviluppo di carriera.",
      ),
    ],
  },
  TFL: {
    connections: [
      conn("D2", "Il trend di flessibilità è una dinamica da monitorare nella programmazione."),
      conn("D5", "La stabilizzazione contrattuale è parte delle politiche di rewarding."),
    ],
  },
  TDLA: {
    connections: [
      conn("D1", "L'evoluzione del lavoro agile presuppone digitalizzazione delle competenze."),
      conn("D2", "Il trend di lavoro agile influenza la programmazione organizzativa."),
    ],
  },

  ISC: {
    connections: [
      {
        pillar: "D1",
        label: "Classificazione",
        reason:
          "La sovra-qualificazione riflette la coerenza tra profili ricercati e competenze del mercato del lavoro",
      },
      {
        pillar: "D4",
        label: "Sviluppo",
        reason:
          "Un ISC alto implica la necessità di percorsi di valorizzazione per evitare sottoutilizzo",
      },
    ],
  },

  /* ═══════════ Sub-indicators D2 ═══════════ */
  IRS: {
    connections: [
      conn("D6", "La copertura dell'organico incide sulla capacità operativa complessiva."),
    ],
  },
  IDP_Norm: {
    connections: [
      conn(
        "D6",
        "Il saldo tra assunti e cessati determina la sostenibilità dimensionale dell'ente.",
      ),
    ],
  },
  PTI: {
    connections: [
      conn("D6", "La stabilità contrattuale influenza la continuità operativa e la sostenibilità."),
    ],
  },
  IRG_Norm: {
    connections: [
      conn("D6", "Il ricambio generazionale è fattore chiave della sostenibilità dell'organico."),
      conn("D3", "Orienta le strategie di reclutamento verso profili junior."),
    ],
  },

  /* ═══════════ Sub-indicators D4 ═══════════ */
  TCF: {
    connections: [
      conn("D1", "La copertura formativa supporta l'adeguatezza del capitale umano."),
      conn("D6", "La formazione estesa contribuisce alla capacità amministrativa."),
    ],
  },
  IFM_Norm: {
    connections: [conn("D6", "L'intensità formativa è proxy dell'investimento in capitale umano.")],
  },
  DPI_Norm: {
    connections: [
      conn("D5", "Le progressioni alimentano direttamente la dinamicità della carriera."),
    ],
  },
  CQT: {
    connections: [
      conn(
        "D1",
        "La coerenza titoli-qualifiche riflette l'allineamento del sistema professionale.",
      ),
    ],
  },
  ISTP_Norm: {
    connections: [
      conn("D1", "La specializzazione tecnica è collegata all'articolazione dei profili."),
    ],
  },
  IDFP: {
    connections: [
      conn(
        "D1",
        "La diversificazione delle famiglie riflette la ricchezza del catalogo professionale.",
      ),
    ],
  },
  ICRP: {
    connections: [
      conn("D1", "La copertura dei ruoli misura l'operatività del modello professionale."),
    ],
  },
  IEF_Norm: {
    connections: [
      conn("D1", "L'efficacia formativa contribuisce all'adeguatezza del capitale umano."),
    ],
  },
  ICQ: {
    connections: [conn("D6", "I completamenti qualificati rafforzano la capacità amministrativa.")],
  },
  ICEC: {
    connections: [
      conn("D1", "La coerenza evolutiva indica quanto la formazione colma i gap di competenze."),
    ],
  },

  /* ═══════════ Sub-indicator D5 ═══════════ */
  ICS_Norm: {
    connections: [
      conn(
        "D4",
        "La crescita strutturale riflette gli effetti delle politiche di sviluppo del personale.",
      ),
    ],
  },
};

export const PILLAR_COLORS: Record<string, string> = {
  D1: "hsl(var(--chart-teal))",
  D2: "hsl(var(--chart-blue))",
  D3: "hsl(var(--chart-green))",
  D4: "hsl(var(--chart-orange))",
  D5: "hsl(var(--chart-purple))",
  D6: "hsl(var(--chart-red))",
};
