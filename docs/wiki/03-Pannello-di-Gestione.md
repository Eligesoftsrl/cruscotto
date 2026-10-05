# 3. Pannello di gestione

[◀ Torna all'indice](Home)

Il pannello di gestione è l'area riservata ai profili amministrativi, dedicata al governo
delle funzionalità del cruscotto e al monitoraggio dell'utilizzo. Non è accessibile agli
utenti privi delle relative autorizzazioni.

## 3.1 Accesso al pannello

L'accesso è consentito ai soli profili con privilegi di amministrazione ed è raggiungibile
dall'apposita voce, disponibile unicamente per gli utenti abilitati. La sola vista globale
su tutti gli enti (profilo DFP) non è sufficiente: in assenza dei privilegi di
amministrazione la voce non viene mostrata e l'area non è raggiungibile. Le altre tipologie
di utente non visualizzano né possono raggiungere questa area.

## 3.2 Gestione delle schede

Il pannello consente di **attivare o disattivare le singole schede** dell'applicazione.
L'operazione ha effetto immediato sull'esperienza degli utenti:

- una scheda disattivata non compare nel menù di navigazione;
- qualora vi si acceda tramite un collegamento diretto, viene mostrato un avviso che ne
  segnala la temporanea indisponibilità.

Questa funzione permette di rendere disponibili le schede in modo graduale, ad esempio
durante le fasi di lavorazione o di verifica dei dati.

## 3.3 Statistiche d'uso

È disponibile una sezione con statistiche sull'utilizzo delle funzionalità, presentate in
forma grafica (ad esempio grafici a barre e a torta). Le statistiche offrono un quadro
sintetico dell'adozione delle diverse schede.

Il grafico **«Schede più consultate»** si basa sul tracciamento delle consultazioni: a ogni
apertura di una scheda (sia del Conto Annuale sia del SIPrO) viene registrato un evento con
l'etichetta della scheda stessa. Il grafico mostra quindi le schede effettivamente più
utilizzate. Nota: il conteggio parte dalle consultazioni successive all'attivazione del
tracciamento; una base dati appena popolata potrà risultare inizialmente vuota e si
riempirà con l'uso dell'applicazione.

## 3.4 Protezione della funzionalità «Pannello Admin»

Tra le funzionalità di sistema è presente la voce **«Pannello Admin»**. Per prevenire il
rischio di perdere l'accesso all'area di amministrazione, questa voce è **protetta** e non
può essere disattivata dall'interfaccia (l'interruttore è mostrato come bloccato, con
apposita segnalazione). Un'eventuale disattivazione è riservata al sistemista, da eseguire
esclusivamente sulla base dati.

## 3.5 Configurazione del confronto tra enti (Benchmark)

Il numero massimo di enti confrontabili contemporaneamente nella scheda SIPrO
«Benchmark» è un parametro di configurazione memorizzato nella base dati
(tabella di configurazione applicativa, chiave `benchmark_max_enti`; valore predefinito
6). Il sistemista può modificarlo senza rilasci applicativi. In assenza del parametro
l'applicazione adotta automaticamente il valore predefinito.

## 3.6 Registri di attività

Il pannello espone i registri utili al monitoraggio:

- **Accessi** — esito degli accessi, utente, profilo e orario.
- **Eventi** — azioni applicative significative.
- **Errori** — segnalazioni ed eventuali anomalie riscontrate.

I registri supportano le attività di controllo e l'individuazione tempestiva di eventuali
problemi.

## 3.7 Riservatezza

- La consultazione di statistiche e registri è riservata ai profili amministrativi.
- Le modifiche allo stato delle schede sono anch'esse riservate agli amministratori.
- Le informazioni gestite dal pannello non sono raggiungibili dagli utenti ordinari.

[▶ Pagina successiva: Architettura tecnica](04-Architettura-Tecnica)
