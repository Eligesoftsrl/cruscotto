/**
 * Generatori narrativi dinamici per i percorsi guidati.
 * Ogni indicatore ha soglie personalizzate che producono frasi
 * in linguaggio naturale adatte a decisori non tecnici.
 */

interface Threshold {
  max: number;
  generate: (pct: number) => string;
}

export const narrativeThresholds: Record<string, Threshold[]> = {
  /* ── D2: Reclutamento ── */
  IAR: [
    { max: 0.20, generate: (pct) => `Solo il ${pct}% del fabbisogno di personale è stato coperto con nuovi bandi: l'ente sta reclutando molto meno di quanto servirebbe.` },
    { max: 0.40, generate: (pct) => `Meno di un terzo del fabbisogno è coperto (${pct}%): servono più procedure di reclutamento per colmare il divario.` },
    { max: 0.65, generate: (pct) => `Il ${pct}% del fabbisogno è coperto: il reclutamento è parzialmente attivo ma restano margini di miglioramento.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% del fabbisogno è coperto: il reclutamento procede in modo adeguato rispetto alle esigenze.` },
  ],

  DDP: [
    { max: 0.30, generate: (pct) => `Il rapporto domanda/offerta è al ${pct}%: le candidature ricevute sono molto inferiori ai posti disponibili.` },
    { max: 0.50, generate: (pct) => `Il rapporto domanda/offerta è al ${pct}%: le candidature coprono meno della metà dei posti.` },
    { max: 0.70, generate: (pct) => `Il ${pct}% dei posti attira candidature sufficienti: la domanda è in parziale equilibrio con l'offerta.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% dei posti ha una buona copertura di candidature: domanda e offerta sono sostanzialmente allineate.` },
  ],

  IAP: [
    { max: 0.25, generate: (pct) => `Solo il ${pct}% delle posizioni risulta attrattivo per i candidati: l'ente fatica a generare interesse.` },
    { max: 0.45, generate: (pct) => `Il ${pct}% delle posizioni mostra un'attrattività limitata: molti ruoli non riescono a intercettare candidature adeguate.` },
    { max: 0.65, generate: (pct) => `Il ${pct}% delle posizioni ha un livello di attrattività moderato: alcuni ruoli funzionano, altri meno.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% delle posizioni risulta attrattivo: l'ente riesce a intercettare efficacemente i candidati.` },
  ],

  IAT: [
    { max: 0.25, generate: (pct) => `L'attrattività territoriale è al ${pct}%: la sede dell'ente rappresenta un forte svantaggio competitivo.` },
    { max: 0.45, generate: (pct) => `L'attrattività territoriale è al ${pct}%: la localizzazione penalizza parzialmente il reclutamento.` },
    { max: 0.65, generate: (pct) => `L'attrattività territoriale è al ${pct}%: la localizzazione non rappresenta un ostacolo significativo.` },
    { max: Infinity, generate: (pct) => `L'attrattività territoriale è al ${pct}%: la sede dell'ente è un punto di forza nel reclutamento.` },
  ],

  TSC: [
    { max: 0.20, generate: (pct) => `Il tasso di selettività è al ${pct}%: i concorsi riescono a selezionare pochissimi candidati idonei.` },
    { max: 0.40, generate: (pct) => `Il tasso di selettività è al ${pct}%: le procedure filtrano meno della metà dei partecipanti.` },
    { max: 0.60, generate: (pct) => `Il tasso di selettività è al ${pct}%: le procedure di selezione operano con efficacia moderata.` },
    { max: Infinity, generate: (pct) => `Il tasso di selettività è al ${pct}%: i concorsi selezionano efficacemente i candidati più idonei.` },
  ],

  TCP: [
    { max: 0.25, generate: (pct) => `L'efficienza temporale delle procedure è al ${pct}%: i tempi di reclutamento sono criticamente lunghi.` },
    { max: 0.45, generate: (pct) => `L'efficienza temporale è al ${pct}%: le procedure impiegano più tempo del dovuto per concludersi.` },
    { max: 0.65, generate: (pct) => `L'efficienza temporale è al ${pct}%: i tempi di procedura sono nella media ma migliorabili.` },
    { max: Infinity, generate: (pct) => `L'efficienza temporale è al ${pct}%: le procedure si concludono in tempi adeguati.` },
  ],

  TCPB: [
    { max: 0.40, generate: (pct) => `Solo il ${pct}% dei posti banditi viene effettivamente coperto: più della metà dei bandi non raggiunge l'obiettivo.` },
    { max: 0.60, generate: (pct) => `Il ${pct}% dei posti banditi è coperto: una quota significativa di bandi resta senza esito pieno.` },
    { max: 0.80, generate: (pct) => `Il ${pct}% dei posti banditi è coperto: la maggior parte dei bandi raggiunge l'obiettivo.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% dei posti banditi è coperto: i bandi sono quasi totalmente efficaci.` },
  ],

  IGF: [
    { max: 0.30, generate: (pct) => `La capacità di governo del fabbisogno è al ${pct}%: la programmazione del personale è critica e richiede interventi urgenti. Debole governo del fabbisogno: è necessaria una diagnostica per componente critica.` },
    { max: 0.40, generate: (pct) => `Solo il ${pct}% del fabbisogno è governato in modo strutturato: la programmazione è insufficiente.` },
    { max: 0.60, generate: (pct) => `Il ${pct}% del fabbisogno è governato: configurazione intermedia con squilibri interni tra le componenti. È necessario identificare la dimensione limitante per sbloccare il potenziale complessivo.` },
    { max: 0.70, generate: (pct) => `Il ${pct}% del fabbisogno è governato: la gestione è parziale ma con margini di miglioramento.` },
    { max: Infinity, generate: (pct) => `L'ente governa il ${pct}% del fabbisogno in modo strutturato: governo strategico consolidato. Il focus si sposta sulla qualificazione dell'organico e sull'ottimizzazione dei processi.` },
  ],

  TUG: [
    { max: 0.30, generate: (pct) => `Solo il ${pct}% degli idonei in graduatoria viene assunto: le graduatorie sono largamente inutilizzate.` },
    { max: 0.50, generate: (pct) => `Il ${pct}% degli idonei viene assunto: l'utilizzo delle graduatorie è parziale.` },
    { max: 0.70, generate: (pct) => `Il ${pct}% degli idonei viene assunto: buon utilizzo delle graduatorie.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% degli idonei viene assunto: le graduatorie sono sfruttate in modo ottimale.` },
  ],

  /* ── D2: Stabilizzazione e crescita ── */
  IRS: [
    { max: 0.50, generate: (pct) => `L'indice di replica strutturale è al ${pct}%: meno della metà delle cessazioni viene compensata con nuove assunzioni.` },
    { max: 0.70, generate: (pct) => `L'indice di replica è al ${pct}%: le assunzioni compensano parzialmente le uscite ma non bastano a mantenere l'organico.` },
    { max: 0.85, generate: (pct) => `L'indice di replica è al ${pct}%: la maggior parte delle cessazioni viene compensata, l'organico è in lieve calo.` },
    { max: Infinity, generate: (pct) => `L'indice di replica è al ${pct}%: le assunzioni coprono o superano le cessazioni, l'organico è stabile.` },
  ],

  IDP_Norm: [
    { max: 0.30, generate: (pct) => `La direzione di progressività è al ${pct}%: le opportunità di crescita professionale interna sono molto limitate.` },
    { max: 0.50, generate: (pct) => `La progressività è al ${pct}%: le carriere interne avanzano lentamente rispetto alle aspettative.` },
    { max: 0.65, generate: (pct) => `La progressività è al ${pct}%: le opportunità di avanzamento sono presenti ma non uniformi.` },
    { max: Infinity, generate: (pct) => `La progressività è al ${pct}%: l'ente offre buone opportunità di crescita professionale interna.` },
  ],

  PTI: [
    { max: 0.40, generate: (pct) => `Solo il ${pct}% del personale è a tempo indeterminato: la stabilità contrattuale è critica.` },
    { max: 0.60, generate: (pct) => `Il ${pct}% del personale è a tempo indeterminato: una quota rilevante ha contratti precari.` },
    { max: 0.80, generate: (pct) => `Il ${pct}% del personale è a tempo indeterminato: la stabilità contrattuale è buona.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% del personale è a tempo indeterminato: l'organico è altamente stabile.` },
  ],

  IRG_Norm: [
    { max: 0.15, generate: (pct) => `Il ricambio generazionale è al ${pct}%: l'ente non sta inserendo giovani a sufficienza per garantire il futuro.` },
    { max: 0.30, generate: (pct) => `Il ricambio generazionale è al ${pct}%: l'ingresso di giovani è limitato rispetto alle uscite per pensionamento.` },
    { max: 0.50, generate: (pct) => `Il ricambio generazionale è al ${pct}%: c'è un parziale rinnovamento del personale.` },
    { max: Infinity, generate: (pct) => `Il ricambio generazionale è al ${pct}%: l'ente sta investendo adeguatamente nel rinnovamento del personale.` },
  ],

  /* ── D1: Classificazione professioni ── */
  IAC: [
    { max: 0.30, generate: (pct) => `Solo il ${pct}% degli enti ha attivato i profili professionali: l'adesione al catalogo è critica.` },
    { max: 0.50, generate: (pct) => `Il ${pct}% degli enti ha attivato i profili: l'adesione è parziale e richiede azioni di accompagnamento.` },
    { max: 0.70, generate: (pct) => `Il ${pct}% degli enti ha attivato i profili: l'adesione è moderata con margini di crescita.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% degli enti ha attivato i profili professionali: l'adesione al catalogo è buona.` },
  ],

  "IIMP/R": [
    { max: 0.01, generate: (pct) => `Il rapporto profili/organico è al ${pct}%: il modello professionale è in fase iniziale di implementazione.` },
    { max: 0.03, generate: (pct) => `Il rapporto profili/organico è al ${pct}%: il sistema professionale è avviato ma ancora poco articolato.` },
    { max: 0.05, generate: (pct) => `Il rapporto profili/organico è al ${pct}%: il modello professionale raggiunge un'articolazione moderata.` },
    { max: Infinity, generate: (pct) => `Il rapporto profili/organico è al ${pct}%: il sistema professionale è ben articolato e strutturato.` },
  ],

  ICPR: [
    { max: 0.30, generate: (pct) => `Solo il ${pct}% del personale ha un profilo professionale assegnato: la copertura è critica.` },
    { max: 0.50, generate: (pct) => `Il ${pct}% del personale ha un profilo assegnato: la copertura è insufficiente.` },
    { max: 0.70, generate: (pct) => `Il ${pct}% del personale ha un profilo assegnato: la copertura è parziale ma in crescita.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% del personale ha un profilo professionale assegnato: buona copertura del sistema.` },
  ],

  ICVC: [
    { max: 0.30, generate: (pct) => `Solo il ${pct}% del personale con profilo è stato valutato: le valutazioni sono gravemente carenti.` },
    { max: 0.50, generate: (pct) => `Il ${pct}% del personale con profilo è stato valutato: la copertura delle valutazioni è insufficiente.` },
    { max: 0.70, generate: (pct) => `Il ${pct}% del personale con profilo è stato valutato: la copertura è moderata.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% del personale con profilo è stato valutato: buona copertura delle valutazioni.` },
  ],

  IACU: [
    { max: 0.50, generate: (pct) => `L'adeguatezza del capitale umano è al ${pct}%: il gap tra competenze possedute e richieste è molto ampio.` },
    { max: 0.70, generate: (pct) => `L'adeguatezza è al ${pct}%: persistono gap significativi tra competenze possedute e target.` },
    { max: 0.85, generate: (pct) => `L'adeguatezza è al ${pct}%: le competenze sono sostanzialmente allineate ai requisiti.` },
    { max: Infinity, generate: (pct) => `L'adeguatezza del capitale umano è al ${pct}%: le competenze sono pienamente in linea con i requisiti.` },
  ],


  /* ── D4: Sviluppo professionale ── */
  CGC: [
    { max: 0.30, generate: (pct) => `La capacità di gestione delle competenze è al ${pct}%: il sistema formativo è gravemente insufficiente.` },
    { max: 0.50, generate: (pct) => `La gestione competenze è al ${pct}%: il sistema è parzialmente strutturato ma con lacune importanti.` },
    { max: 0.70, generate: (pct) => `La gestione competenze è al ${pct}%: il sistema formativo funziona ma con margini di miglioramento.` },
    { max: Infinity, generate: (pct) => `La gestione competenze è al ${pct}%: il sistema è ben strutturato e produce risultati.` },
  ],

  TCF: [
    { max: 0.30, generate: (pct) => `Solo il ${pct}% del personale è stato formato: la copertura formativa è critica.` },
    { max: 0.50, generate: (pct) => `Il ${pct}% del personale è stato formato: la copertura è insufficiente.` },
    { max: 0.70, generate: (pct) => `Il ${pct}% del personale è stato formato: la copertura è moderata.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% del personale è stato formato: la copertura formativa è buona.` },
  ],

  IFM_Norm: [
    { max: 0.30, generate: (pct) => `L'intensità formativa media è al ${pct}%: le ore di formazione per dipendente sono molto basse.` },
    { max: 0.50, generate: (pct) => `L'intensità formativa è al ${pct}%: le ore di formazione sono sotto il target.` },
    { max: 0.70, generate: (pct) => `L'intensità formativa è al ${pct}%: le ore di formazione si avvicinano al target.` },
    { max: Infinity, generate: (pct) => `L'intensità formativa è al ${pct}%: le ore di formazione raggiungono o superano il target.` },
  ],

  DPI_Norm: [
    { max: 0.03, generate: (pct) => `La dinamicità interna è al ${pct}%: le progressioni verticali sono quasi inesistenti.` },
    { max: 0.10, generate: (pct) => `La dinamicità interna è al ${pct}%: pochissimo personale ha avuto progressione di carriera.` },
    { max: 0.30, generate: (pct) => `La dinamicità interna è al ${pct}%: le progressioni sono limitate ma presenti.` },
    { max: Infinity, generate: (pct) => `La dinamicità interna è al ${pct}%: l'ente offre buone opportunità di progressione.` },
  ],

  CQT: [
    { max: 0.40, generate: (pct) => `Solo il ${pct}% del personale ha un titolo coerente con la qualifica: forte disallineamento.` },
    { max: 0.60, generate: (pct) => `Il ${pct}% del personale ha un titolo coerente: disallineamento significativo.` },
    { max: 0.80, generate: (pct) => `Il ${pct}% del personale ha un titolo coerente con la qualifica: buon allineamento.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% del personale ha un titolo coerente: eccellente corrispondenza titoli-qualifiche.` },
  ],

  ISTP_Norm: [
    { max: 0.30, generate: (pct) => `Solo il ${pct}% dei profili ha un percorso specialistico: lo sviluppo tecnico-professionale è carente.` },
    { max: 0.50, generate: (pct) => `Il ${pct}% dei profili ha un percorso specialistico: lo sviluppo è parziale.` },
    { max: 0.70, generate: (pct) => `Il ${pct}% dei profili ha un percorso specialistico: buona strutturazione.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% dei profili ha un percorso specialistico attivo: sviluppo professionale maturo.` },
  ],

  IDFP: [
    { max: 0.30, generate: (pct) => `Solo il ${pct}% delle famiglie professionali è attivo: la diversificazione è molto limitata.` },
    { max: 0.50, generate: (pct) => `Il ${pct}% delle famiglie professionali è attivo: la diversificazione è parziale.` },
    { max: 0.70, generate: (pct) => `Il ${pct}% delle famiglie professionali è attivo: buona diversificazione.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% delle famiglie professionali è attivo: diversificazione completa.` },
  ],

  ICRP: [
    { max: 0.30, generate: (pct) => `Solo il ${pct}% dei ruoli professionali è coperto: molti ruoli sono senza personale.` },
    { max: 0.50, generate: (pct) => `Il ${pct}% dei ruoli è coperto: copertura insufficiente.` },
    { max: 0.70, generate: (pct) => `Il ${pct}% dei ruoli è coperto: buona copertura con margini di miglioramento.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% dei ruoli professionali è coperto: copertura eccellente.` },
  ],

  IEF_Norm: [
    { max: 0.30, generate: (pct) => `Solo il ${pct}% dei corsi viene completato: l'efficacia formativa è critica.` },
    { max: 0.50, generate: (pct) => `Il ${pct}% dei corsi viene completato: tasso di abbandono elevato.` },
    { max: 0.70, generate: (pct) => `Il ${pct}% dei corsi viene completato: efficacia formativa moderata.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% dei corsi viene completato: buona efficacia formativa.` },
  ],

  ICQ: [
    { max: 0.30, generate: (pct) => `Solo il ${pct}% dei completamenti ha ottenuto una qualificazione: il valore aggiunto è basso.` },
    { max: 0.50, generate: (pct) => `Il ${pct}% dei completamenti è qualificato: la qualificazione è parziale.` },
    { max: 0.70, generate: (pct) => `Il ${pct}% dei completamenti è qualificato: buon livello di qualificazione.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% dei completamenti è qualificato: alta qualificazione formativa.` },
  ],

  ICEC: [
    { max: 0.30, generate: (pct) => `Solo il ${pct}% dei gap iniziali è stato colmato: la formazione non incide a sufficienza.` },
    { max: 0.50, generate: (pct) => `Il ${pct}% dei gap è stato colmato: impatto formativo parziale.` },
    { max: 0.70, generate: (pct) => `Il ${pct}% dei gap è stato colmato: buona coerenza evolutiva delle competenze.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% dei gap è stato colmato: la formazione produce un impatto significativo.` },
  ],

  ISCP: [
    { max: 0.30, generate: (pct) => `Lo sviluppo del capitale professionale è al ${pct}%: il sistema è in fase embrionale.` },
    { max: 0.50, generate: (pct) => `Lo sviluppo è al ${pct}%: il sistema professionale è parzialmente strutturato.` },
    { max: 0.70, generate: (pct) => `Lo sviluppo è al ${pct}%: buona strutturazione del capitale professionale.` },
    { max: Infinity, generate: (pct) => `Lo sviluppo del capitale professionale è al ${pct}%: sistema maturo e ben funzionante.` },
  ],

  IESF: [
    { max: 0.30, generate: (pct) => `L'efficacia dello sviluppo formativo è al ${pct}%: il sistema produce risultati insufficienti.` },
    { max: 0.50, generate: (pct) => `L'efficacia formativa è al ${pct}%: risultati parziali con criticità nel completamento.` },
    { max: 0.70, generate: (pct) => `L'efficacia formativa è al ${pct}%: buoni risultati complessivi.` },
    { max: Infinity, generate: (pct) => `L'efficacia formativa è al ${pct}%: il sistema produce risultati eccellenti.` },
  ],

  /* ── D5: Rewarding e carriera ── */
  IDC: [
    { max: 0.20, generate: (pct) => `La dinamicità della carriera è al ${pct}%: le opportunità di avanzamento sono quasi inesistenti.` },
    { max: 0.40, generate: (pct) => `La dinamicità è al ${pct}%: le carriere avanzano molto lentamente.` },
    { max: 0.60, generate: (pct) => `La dinamicità è al ${pct}%: le opportunità di carriera sono presenti ma limitate.` },
    { max: Infinity, generate: (pct) => `La dinamicità della carriera è al ${pct}%: l'ente offre percorsi di crescita strutturati.` },
  ],

  ICS_Norm: [
    { max: 0.25, generate: (pct) => `La crescita strutturale retributiva è al ${pct}%: gli stipendi crescono pochissimo.` },
    { max: 0.45, generate: (pct) => `La crescita retributiva è al ${pct}%: l'incremento è inferiore alle aspettative.` },
    { max: 0.65, generate: (pct) => `La crescita retributiva è al ${pct}%: l'incremento è nella media.` },
    { max: Infinity, generate: (pct) => `La crescita retributiva è al ${pct}%: gli stipendi crescono in modo significativo.` },
  ],

  /* ── D6: Sostenibilità ── */
  TVO: [
    { max: -0.02, generate: (pct) => `L'organico si è ridotto del ${Math.abs(pct)}%: contrazione significativa della forza lavoro.` },
    { max: 0.00, generate: (pct) => `L'organico è variato del ${pct < 0 ? "" : "+"}${pct}%: lieve contrazione.` },
    { max: 0.02, generate: (pct) => `L'organico è variato del +${pct}%: sostanziale stabilità.` },
    { max: Infinity, generate: (pct) => `L'organico è cresciuto del +${pct}%: espansione significativa.` },
  ],

  ISG: [
    { max: 0.80, generate: (pct) => `Il rapporto over 55/under 40 è ${(pct / 100).toFixed(2)}: forte prevalenza di giovani (< equilibrio).` },
    { max: 1.10, generate: (pct) => `Il rapporto over 55/under 40 è ${(pct / 100).toFixed(2)}: sostanziale equilibrio generazionale.` },
    { max: 1.50, generate: (pct) => `Il rapporto over 55/under 40 è ${(pct / 100).toFixed(2)}: squilibrio moderato verso l'invecchiamento.` },
    { max: Infinity, generate: (pct) => `Il rapporto over 55/under 40 è ${(pct / 100).toFixed(2)}: forte squilibrio generazionale.` },
  ],

  TEP: [
    { max: 0.10, generate: (pct) => `Solo il ${pct}% del personale è prossimo al pensionamento: bassa esposizione.` },
    { max: 0.20, generate: (pct) => `Il ${pct}% del personale è prossimo al pensionamento: esposizione moderata.` },
    { max: 0.30, generate: (pct) => `Il ${pct}% del personale è prossimo al pensionamento: esposizione elevata.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% del personale è prossimo al pensionamento: esposizione critica.` },
  ],

  IQP: [
    { max: 0.30, generate: (pct) => `Solo il ${pct}% del personale è laureato: livello di qualificazione molto basso.` },
    { max: 0.50, generate: (pct) => `Il ${pct}% del personale è laureato: qualificazione insufficiente.` },
    { max: 0.70, generate: (pct) => `Il ${pct}% del personale è laureato: buon livello di qualificazione.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% del personale è laureato: elevato livello di qualificazione.` },
  ],

  IEQ: [
    { max: 0.30, generate: (pct) => `L'evoluzione della qualificazione è al ${pct}%: la quota di laureati cresce molto lentamente.` },
    { max: 0.50, generate: (pct) => `L'evoluzione è al ${pct}%: la quota di laureati cresce ma sotto la media.` },
    { max: 0.70, generate: (pct) => `L'evoluzione è al ${pct}%: la quota di laureati cresce a buon ritmo.` },
    { max: Infinity, generate: (pct) => `L'evoluzione è al ${pct}%: la quota di laureati cresce rapidamente.` },
  ],

  VQF: [
    { max: 0.35, generate: (pct) => `La quota femminile è al ${pct}%: forte sottorappresentazione delle donne.` },
    { max: 0.45, generate: (pct) => `La quota femminile è al ${pct}%: le donne sono sottorappresentate.` },
    { max: 0.55, generate: (pct) => `La quota femminile è al ${pct}%: sostanziale equilibrio di genere.` },
    { max: Infinity, generate: (pct) => `La quota femminile è al ${pct}%: le donne sono maggioritarie nell'organico.` },
  ],

  IPD: [
    { max: 0.30, generate: (pct) => `La parità dirigenziale è al ${pct}%: forte sottorappresentazione femminile nei ruoli dirigenziali.` },
    { max: 0.50, generate: (pct) => `La parità dirigenziale è al ${pct}%: le donne sono sottorappresentate nella dirigenza.` },
    { max: 0.70, generate: (pct) => `La parità dirigenziale è al ${pct}%: la rappresentazione è moderata.` },
    { max: Infinity, generate: (pct) => `La parità dirigenziale è al ${pct}%: buona rappresentazione femminile nei ruoli dirigenziali.` },
  ],

  IRG_genere: [
    { max: 0.70, generate: (pct) => `Il riequilibrio di genere nelle assunzioni è al ${pct}%: forte disparità rispetto alla composizione dell'organico.` },
    { max: 0.85, generate: (pct) => `Il riequilibrio è al ${pct}%: le assunzioni non riflettono pienamente la composizione dell'organico.` },
    { max: 1.05, generate: (pct) => `Il riequilibrio è al ${pct}%: le assunzioni riflettono la composizione dell'organico (neutralità).` },
    { max: Infinity, generate: (pct) => `Il riequilibrio è al ${pct}%: le assunzioni favoriscono il genere meno rappresentato.` },
  ],

  IFL: [
    { max: 0.01, generate: (pct) => `La flessibilità contrattuale è al ${pct}%: praticamente assente.` },
    { max: 0.05, generate: (pct) => `La flessibilità contrattuale è al ${pct}%: marginale.` },
    { max: 0.15, generate: (pct) => `La flessibilità contrattuale è al ${pct}%: presente in misura limitata.` },
    { max: Infinity, generate: (pct) => `La flessibilità contrattuale è al ${pct}%: significativamente diffusa.` },
  ],

  IDLA: [
    { max: 0.15, generate: (pct) => `Solo il ${pct}% del personale è in lavoro agile: diffusione molto limitata.` },
    { max: 0.30, generate: (pct) => `Il ${pct}% del personale è in lavoro agile: diffusione parziale.` },
    { max: 0.50, generate: (pct) => `Il ${pct}% del personale è in lavoro agile: buona diffusione.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% del personale è in lavoro agile: ampia diffusione.` },
  ],

  ISC: [
    { max: 0.20, generate: (pct) => `Solo il ${pct}% dei candidati ha un titolo superiore al richiesto: bassa sovra-qualificazione.` },
    { max: 0.40, generate: (pct) => `Il ${pct}% dei candidati ha un titolo superiore: sovra-qualificazione moderata.` },
    { max: 0.60, generate: (pct) => `Il ${pct}% dei candidati ha un titolo superiore: sovra-qualificazione significativa.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% dei candidati ha un titolo superiore al richiesto: forte sovra-qualificazione.` },
  ],

  /* ── Duplicato D5 (stessa logica di DPI_Norm) ── */
  DPI_Norm_D5: [
    { max: 0.03, generate: (pct) => `La dinamicità interna è al ${pct}%: le progressioni verticali sono quasi inesistenti.` },
    { max: 0.10, generate: (pct) => `La dinamicità interna è al ${pct}%: pochissimo personale ha avuto progressione di carriera.` },
    { max: 0.30, generate: (pct) => `La dinamicità interna è al ${pct}%: le progressioni sono limitate ma presenti.` },
    { max: Infinity, generate: (pct) => `La dinamicità interna è al ${pct}%: l'ente offre buone opportunità di progressione.` },
  ],

  /* ── D6: Indicatori di trend (gestionale) ── */
  TEPD: [
    { max: 0.30, generate: (pct) => `L'evoluzione della parità dirigenziale è al ${pct}%: il trend è negativo o stagnante.` },
    { max: 0.50, generate: (pct) => `L'evoluzione è al ${pct}%: miglioramento lento nella parità dirigenziale.` },
    { max: 0.65, generate: (pct) => `L'evoluzione è al ${pct}%: la parità dirigenziale migliora a ritmo moderato.` },
    { max: Infinity, generate: (pct) => `L'evoluzione è al ${pct}%: forte progressione verso la parità dirigenziale.` },
  ],

  TFL: [
    { max: 0.30, generate: (pct) => `L'evoluzione della flessibilità è al ${pct}%: nessun progresso significativo.` },
    { max: 0.50, generate: (pct) => `L'evoluzione è al ${pct}%: la flessibilità contrattuale è sostanzialmente stabile.` },
    { max: 0.65, generate: (pct) => `L'evoluzione è al ${pct}%: la flessibilità sta crescendo moderatamente.` },
    { max: Infinity, generate: (pct) => `L'evoluzione è al ${pct}%: forte crescita della flessibilità contrattuale.` },
  ],

  TDLA: [
    { max: 0.30, generate: (pct) => `L'evoluzione del lavoro agile è al ${pct}%: la diffusione è in stallo o regresso.` },
    { max: 0.50, generate: (pct) => `L'evoluzione è al ${pct}%: il lavoro agile cresce lentamente.` },
    { max: 0.65, generate: (pct) => `L'evoluzione è al ${pct}%: buona crescita del lavoro agile.` },
    { max: Infinity, generate: (pct) => `L'evoluzione è al ${pct}%: forte espansione del lavoro agile.` },
  ],

  /* ── D1: Placeholder operativi ── */
  "ICSP/R": [
    { max: 0.30, generate: (pct) => `Solo il ${pct}% dei sotto-profili ha almeno un ruolo assegnato: copertura critica.` },
    { max: 0.50, generate: (pct) => `Il ${pct}% dei sotto-profili è coperto: la mappatura è parziale.` },
    { max: 0.70, generate: (pct) => `Il ${pct}% dei sotto-profili è coperto: buona mappatura.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% dei sotto-profili è coperto: mappatura completa.` },
  ],

  ICCOMP: [
    { max: 0.30, generate: (pct) => `Solo il ${pct}% delle competenze è stato mappato con livello: la copertura è critica.` },
    { max: 0.50, generate: (pct) => `Il ${pct}% delle competenze è mappato: copertura insufficiente.` },
    { max: 0.70, generate: (pct) => `Il ${pct}% delle competenze è mappato: copertura moderata.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% delle competenze è mappato con livello: buona copertura.` },
  ],

  ICCR: [
    { max: 0.30, generate: (pct) => `Solo il ${pct}% dei profili di ruolo ha competenze validate: validazione critica.` },
    { max: 0.50, generate: (pct) => `Il ${pct}% dei profili ha competenze validate: copertura parziale.` },
    { max: 0.70, generate: (pct) => `Il ${pct}% dei profili ha competenze validate: buona validazione.` },
    { max: Infinity, generate: (pct) => `Il ${pct}% dei profili di ruolo ha competenze validate: validazione completa.` },
  ],
};

/**
 * Restituisce la frase narrativa dinamica per un indicatore.
 * Fallback: stringa vuota se l'indicatore non ha generatore.
 */
export function getNarrative(id: string, value: number): string {
  const thresholds = narrativeThresholds[id];
  if (!thresholds) return "";
  const pct = Math.round(value * 100);
  const entry = thresholds.find((t) => value < t.max) ?? thresholds[thresholds.length - 1];
  return entry.generate(pct);
}

/* ══════════════════════════════════════════════════════════
   Executive Summary per Pillar — Motore di sintesi avanzato
   ══════════════════════════════════════════════════════════ */

type SeverityLevel = "Buono" | "Moderato" | "Basso" | "Critico";

export function getLevel(id: string, value: number): SeverityLevel {
  const t = narrativeThresholds[id];
  if (!t) return "Moderato";
  const idx = t.findIndex((th) => value < th.max);
  const level = idx === -1 ? t.length - 1 : idx;
  return (["Critico", "Basso", "Moderato", "Buono"] as SeverityLevel[])[level] ?? "Moderato";
}

export interface PillarSummaryResult {
  overallLevel: SeverityLevel;
  summaryText: string;
  distribution: Record<SeverityLevel, number>;
  best: { id: string; label: string; value: number; level: SeverityLevel } | null;
  worst: { id: string; label: string; value: number; level: SeverityLevel } | null;
  totalKpis: number;
  avgPct: number;
}

/* ── Contesto esteso passato ai template ── */
interface TemplateCtx {
  good: number;        // Buono + Moderato
  bad: number;         // Basso + Critico
  total: number;
  buono: number;
  moderato: number;
  basso: number;
  critico: number;
  bestId: string;
  bestPct: number;
  worstId: string;
  worstPct: number;
  avgPct: number;      // media ponderata di tutti i KPI
  secondWorstId: string;
  secondWorstPct: number;
}

type TemplateFn = (ctx: TemplateCtx) => string;

/**
 * 8 fasce di giudizio per pillar (48 template totali).
 * Le chiavi corrispondono alla fascia calcolata da selectTemplateBand().
 */
const pillarTemplates: Record<string, Record<string, TemplateFn>> = {
  D1: {
    excellent: (c) => `Il modello di classificazione professionale è pienamente operativo: tutti i ${c.total} indicatori sono in fascia positiva con una media del ${c.avgPct}%. L'adesione al catalogo (${c.bestId}, ${c.bestPct}%) conferma la maturità del sistema.`,
    good: (c) => `La classificazione professionale è complessivamente solida (${c.buono} su ${c.total} indicatori in fascia Buono, media ${c.avgPct}%). Il punto di forza è ${c.bestId} (${c.bestPct}%), mentre ${c.worstId} (${c.worstPct}%) ha margini di crescita.`,
    mostly_good: (c) => `Il sistema professionale funziona bene nella maggior parte delle dimensioni (${c.good} su ${c.total} adeguati). Resta da consolidare ${c.worstId} (${c.worstPct}%) per completare il modello.`,
    mixed_positive: (c) => `La classificazione mostra un quadro eterogeneo ma con prevalenza positiva: ${c.good} indicatori adeguati su ${c.total}. Le aree di attenzione sono ${c.worstId} (${c.worstPct}%) e ${c.secondWorstId} (${c.secondWorstPct}%).`,
    mixed_negative: (c) => `Il modello professionale evidenzia più criticità che punti di forza: solo ${c.good} su ${c.total} raggiungono livelli adeguati (media ${c.avgPct}%). Servono interventi su ${c.worstId} (${c.worstPct}%).`,
    weak: (c) => `La classificazione presenta debolezze strutturali: ${c.bad} indicatori su ${c.total} sono in area critica. Il dato peggiore è ${c.worstId} (${c.worstPct}%), seguito da ${c.secondWorstId} (${c.secondWorstPct}%).`,
    severe: (c) => `Il sistema di classificazione è gravemente insufficiente: ${c.critico} indicatori in stato critico su ${c.total}. La mappatura professionale (${c.worstId}, ${c.worstPct}%) richiede interventi urgenti e strutturali.`,
    critical: (c) => `La classificazione professionale è in stato di emergenza: quasi tutti i ${c.total} indicatori sono in fascia critica (media ${c.avgPct}%). L'intero modello professionale necessita di una riprogettazione.`,
  },
  D2: {
    excellent: (c) => `La programmazione dei fabbisogni è eccellente: tutti i ${c.total} indicatori positivi (media ${c.avgPct}%). L'ente governa pienamente il ciclo del personale con il punto di forza su ${c.bestId} (${c.bestPct}%).`,
    good: (c) => `Il governo dei fabbisogni è solido (${c.buono} su ${c.total} in fascia Buono, media ${c.avgPct}%). La programmazione funziona, con ${c.worstId} (${c.worstPct}%) come unica area di miglioramento.`,
    mostly_good: (c) => `La gestione dei fabbisogni è prevalentemente positiva: ${c.good} su ${c.total} adeguati. Il ricambio generazionale (${c.worstId}, ${c.worstPct}%) merita attenzione.`,
    mixed_positive: (c) => `I fabbisogni mostrano un quadro misto: ${c.good} indicatori adeguati su ${c.total}. Le aree che rallentano sono ${c.worstId} (${c.worstPct}%) e ${c.secondWorstId} (${c.secondWorstPct}%).`,
    mixed_negative: (c) => `La programmazione del personale è in difficoltà: solo ${c.good} su ${c.total} in area sufficiente (media ${c.avgPct}%). La capacità di mantenere l'organico è compromessa.`,
    weak: (c) => `I fabbisogni evidenziano debolezze strutturali: ${c.bad} indicatori critici su ${c.total}. Il dato più preoccupante è ${c.worstId} (${c.worstPct}%), che erode la dotazione organica.`,
    severe: (c) => `La programmazione è gravemente insufficiente: ${c.critico} indicatori in stato critico. Il ciclo assunzioni-cessazioni (${c.worstId}, ${c.worstPct}%) non è sostenibile.`,
    critical: (c) => `Il governo del fabbisogno è in stato di emergenza: media ${c.avgPct}% su ${c.total} indicatori. L'organico è in contrazione incontrollata e serve un piano straordinario.`,
  },
  D3: {
    excellent: (c) => `Il reclutamento è eccellente su tutti i ${c.total} fronti (media ${c.avgPct}%). Attrattività, tempi e copertura posti sono a livello ottimale, con ${c.bestId} al ${c.bestPct}%.`,
    good: (c) => `Il reclutamento funziona bene (${c.buono} su ${c.total} in fascia Buono, media ${c.avgPct}%). Il punto di forza è ${c.bestId} (${c.bestPct}%), con ${c.worstId} (${c.worstPct}%) da consolidare.`,
    mostly_good: (c) => `Le procedure di selezione sono prevalentemente efficaci: ${c.good} su ${c.total} adeguate. L'area da potenziare è ${c.worstId} (${c.worstPct}%).`,
    mixed_positive: (c) => `Il reclutamento ha luci e ombre: ${c.good} indicatori adeguati su ${c.total}. L'attrattività dei bandi (${c.worstId}, ${c.worstPct}%) e ${c.secondWorstId} (${c.secondWorstPct}%) limitano l'efficacia.`,
    mixed_negative: (c) => `Il reclutamento mostra più debolezze che punti di forza: solo ${c.good} su ${c.total} in area sufficiente. Le procedure faticano ad attrarre e selezionare candidati (media ${c.avgPct}%).`,
    weak: (c) => `Il reclutamento presenta criticità diffuse: ${c.bad} indicatori su ${c.total} in area critica. Le aree più deboli sono ${c.worstId} (${c.worstPct}%) e ${c.secondWorstId} (${c.secondWorstPct}%).`,
    severe: (c) => `Le procedure di selezione sono gravemente inefficaci: ${c.critico} indicatori in stato critico. L'attivazione dei bandi (${c.worstId}, ${c.worstPct}%) è il collo di bottiglia principale.`,
    critical: (c) => `Il reclutamento è in stato di emergenza: quasi tutti i ${c.total} indicatori in fascia critica (media ${c.avgPct}%). L'ente non riesce ad attrarre, selezionare né coprire i posti disponibili.`,
  },
  D4: {
    excellent: (c) => `Lo sviluppo professionale è eccellente: tutti i ${c.total} indicatori positivi (media ${c.avgPct}%). Il sistema formativo e le competenze sono pienamente maturi, con ${c.bestId} al ${c.bestPct}%.`,
    good: (c) => `Lo sviluppo è ben strutturato (${c.buono} su ${c.total} in fascia Buono, media ${c.avgPct}%). Il sistema produce risultati, con ${c.worstId} (${c.worstPct}%) come area di crescita.`,
    mostly_good: (c) => `La formazione e le competenze funzionano nella maggior parte delle dimensioni: ${c.good} su ${c.total} adeguati. Da rafforzare ${c.worstId} (${c.worstPct}%).`,
    mixed_positive: (c) => `Lo sviluppo professionale è disomogeneo: ${c.good} indicatori adeguati su ${c.total}. L'investimento formativo su ${c.worstId} (${c.worstPct}%) e ${c.secondWorstId} (${c.secondWorstPct}%) necessita di rafforzamento.`,
    mixed_negative: (c) => `Il sistema formativo mostra più lacune che punti di forza: solo ${c.good} su ${c.total} in area sufficiente (media ${c.avgPct}%). Le competenze si stanno deteriorando.`,
    weak: (c) => `Lo sviluppo professionale presenta criticità importanti: ${c.bad} indicatori su ${c.total} in area critica. La copertura formativa (${c.worstId}, ${c.worstPct}%) è insufficiente.`,
    severe: (c) => `Il sistema di sviluppo è gravemente carente: ${c.critico} indicatori in stato critico. Il capitale umano (${c.worstId}, ${c.worstPct}%) rischia un deterioramento irreversibile.`,
    critical: (c) => `Lo sviluppo professionale è in stato di emergenza: media ${c.avgPct}% su ${c.total} indicatori. L'ente non investe nelle competenze e la formazione è quasi inesistente.`,
  },
  D5: {
    excellent: (c) => `Il rewarding è eccellente: tutti i ${c.total} indicatori positivi (media ${c.avgPct}%). Le carriere e la retribuzione crescono in modo strutturato, con ${c.bestId} al ${c.bestPct}%.`,
    good: (c) => `Il sistema di rewarding funziona bene (${c.buono} su ${c.total} in fascia Buono, media ${c.avgPct}%). Le progressioni sono attive, con ${c.worstId} (${c.worstPct}%) da potenziare.`,
    mostly_good: (c) => `Le politiche retributive e di carriera sono prevalentemente positive: ${c.good} su ${c.total} adeguati. Margini di miglioramento su ${c.worstId} (${c.worstPct}%).`,
    mixed_positive: (c) => `Il rewarding presenta luci e ombre: ${c.good} indicatori adeguati su ${c.total}. La dinamicità di carriera (${c.worstId}, ${c.worstPct}%) limita la capacità di trattenere talenti.`,
    mixed_negative: (c) => `Le politiche di rewarding sono insufficienti: solo ${c.good} su ${c.total} in area positiva (media ${c.avgPct}%). La motivazione del personale è a rischio.`,
    weak: (c) => `Il rewarding presenta criticità strutturali: ${c.bad} indicatori su ${c.total} in area critica. Le carriere (${c.worstId}, ${c.worstPct}%) sono sostanzialmente bloccate.`,
    severe: (c) => `Il sistema retributivo e di carriera è gravemente inadeguato: ${c.critico} indicatori critici. Le progressioni (${c.worstId}, ${c.worstPct}%) sono quasi inesistenti.`,
    critical: (c) => `Il rewarding è in stato di emergenza: media ${c.avgPct}% su ${c.total} indicatori. L'ente non offre alcuna prospettiva di crescita retributiva o professionale.`,
  },
  D6: {
    excellent: (c) => `La sostenibilità organizzativa è eccellente: tutti i ${c.total} indicatori positivi (media ${c.avgPct}%). Equilibrio generazionale, genere e flessibilità sono a livello ottimale.`,
    good: (c) => `La sostenibilità è solida (${c.buono} su ${c.total} in fascia Buono, media ${c.avgPct}%). L'ente è ben posizionato, con ${c.worstId} (${c.worstPct}%) come unico punto di attenzione.`,
    mostly_good: (c) => `La sostenibilità è prevalentemente positiva: ${c.good} su ${c.total} adeguati. Da monitorare ${c.worstId} (${c.worstPct}%) per consolidare il quadro.`,
    mixed_positive: (c) => `La sostenibilità mostra aspetti positivi e criticità: ${c.good} indicatori adeguati su ${c.total}. Le aree di attenzione sono ${c.worstId} (${c.worstPct}%) e ${c.secondWorstId} (${c.secondWorstPct}%).`,
    mixed_negative: (c) => `La sostenibilità organizzativa è fragile: solo ${c.good} su ${c.total} in area sufficiente (media ${c.avgPct}%). L'equilibrio generazionale e la flessibilità sono a rischio.`,
    weak: (c) => `La sostenibilità presenta rischi significativi: ${c.bad} indicatori su ${c.total} in area critica. Il dato peggiore è ${c.worstId} (${c.worstPct}%).`,
    severe: (c) => `La sostenibilità è gravemente compromessa: ${c.critico} indicatori in stato critico. Il bilancio generazionale (${c.worstId}, ${c.worstPct}%) minaccia la continuità operativa.`,
    critical: (c) => `La sostenibilità è in stato di emergenza: media ${c.avgPct}% su ${c.total} indicatori. L'ente rischia il collasso operativo senza interventi strutturali immediati.`,
  },
};

/** Seleziona la fascia di template (8 livelli) in base alla distribuzione */
function selectTemplateBand(d: Record<SeverityLevel, number>, total: number): string {
  if (total === 0) return "mixed_positive";
  const buonoRatio = d.Buono / total;
  const goodRatio = (d.Buono + d.Moderato) / total;
  const criticoRatio = d.Critico / total;
  const badRatio = (d.Basso + d.Critico) / total;

  // 8 bands from best to worst
  if (buonoRatio === 1) return "excellent";
  if (buonoRatio >= 0.6 && d.Critico === 0) return "good";
  if (goodRatio >= 0.7 && d.Critico === 0) return "mostly_good";
  if (goodRatio >= 0.5) return "mixed_positive";
  if (badRatio <= 0.6) return "mixed_negative";
  if (criticoRatio < 0.4) return "weak";
  if (criticoRatio < 0.7) return "severe";
  return "critical";
}

/** Mappa le 8 fasce ai 4 livelli di severità visuali */
function bandToLevel(band: string): SeverityLevel {
  if (band === "excellent" || band === "good") return "Buono";
  if (band === "mostly_good" || band === "mixed_positive") return "Moderato";
  if (band === "mixed_negative" || band === "weak") return "Basso";
  return "Critico";
}

/**
 * Genera l'executive summary aggregato per un pillar/journey.
 * Accetta valori opzionali overrideValues per simulazione.
 */
export function getPillarSummary(
  journeyId: string,
  journeySteps: { kpiIds: string[] }[],
  indicesLookup: { id: string; label: string; value: number }[],
  overrideValues?: Record<string, number>,
): PillarSummaryResult {
  const allKpiIds = [...new Set(journeySteps.flatMap((s) => s.kpiIds))];

  const distribution: Record<SeverityLevel, number> = { Buono: 0, Moderato: 0, Basso: 0, Critico: 0 };
  const kpiData: { id: string; label: string; value: number; level: SeverityLevel }[] = [];

  for (const kpiId of allKpiIds) {
    const idx = indicesLookup.find((i) => i.id === kpiId);
    if (!idx) continue;
    const value = overrideValues?.[kpiId] ?? idx.value;
    const level = getLevel(kpiId, value);
    distribution[level]++;
    const cleanLabel = idx.label.replace(/\n/g, " ");
    kpiData.push({ id: kpiId, label: cleanLabel, value, level });
  }

  // Sort by value to find best/worst/secondWorst
  const sorted = [...kpiData].sort((a, b) => a.value - b.value);
  const worst = sorted[0] ?? null;
  const secondWorst = sorted[1] ?? sorted[0] ?? null;
  const best = sorted[sorted.length - 1] ?? null;
  const totalKpis = kpiData.length;
  const avgPct = totalKpis > 0 ? Math.round(kpiData.reduce((s, k) => s + k.value, 0) / totalKpis * 100) : 0;

  const band = selectTemplateBand(distribution, totalKpis);
  const overallLevel = bandToLevel(band);

  // Build context
  const pillar = journeyId.replace(/^(d\d).*/, "$1").toUpperCase();
  const templates = pillarTemplates[pillar] ?? pillarTemplates["D1"];
  const templateFn = templates[band] ?? templates["mixed_positive"];

  const ctx: TemplateCtx = {
    good: distribution.Buono + distribution.Moderato,
    bad: distribution.Basso + distribution.Critico,
    total: totalKpis,
    buono: distribution.Buono,
    moderato: distribution.Moderato,
    basso: distribution.Basso,
    critico: distribution.Critico,
    bestId: best?.id ?? "–",
    bestPct: best ? Math.round(best.value * 100) : 0,
    worstId: worst?.id ?? "–",
    worstPct: worst ? Math.round(worst.value * 100) : 0,
    secondWorstId: secondWorst?.id ?? "–",
    secondWorstPct: secondWorst ? Math.round(secondWorst.value * 100) : 0,
    avgPct,
  };

  return {
    overallLevel,
    summaryText: templateFn(ctx),
    distribution,
    best,
    worst,
    totalKpis,
    avgPct,
  };
}
