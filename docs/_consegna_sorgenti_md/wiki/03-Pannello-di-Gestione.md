# 3. Pannello di gestione

[◀ Torna all'indice](Home)

Il pannello di gestione è l'area riservata ai profili amministrativi, dedicata al governo
delle funzionalità del cruscotto e al monitoraggio dell'utilizzo. Non è accessibile agli
utenti privi delle relative autorizzazioni.

## 3.1 Accesso al pannello

L'accesso è consentito ai soli profili con privilegi di amministrazione ed è raggiungibile
dall'apposita voce, disponibile unicamente per gli utenti abilitati. La sola vista globale
su tutti gli enti (profilo DFP) non è sufficiente: in assenza dei privilegi di
amministrazione la voce non viene mostrata e l'area non è raggiungibile.

## 3.2 Gestione delle schede

Il pannello consente di **attivare o disattivare** le schede e gli indici del cruscotto.
Per evitare di scorrere a lungo la pagina, l'area è organizzata su tre livelli:

1. **Gruppi**, chiusi all'apertura: **Conto Annuale**, **SIPrO**, **Indici Vista
   Sintetica**, **KPI Riforma PA** e «Altre fonti» (sezioni in arrivo). Ogni gruppo
   indica quante schede sono attive, ad esempio «14/22 attive · parziale», e ha un
   **interruttore generale** che attiva o disattiva in un colpo tutte le sue schede.
2. **Sezioni** del gruppo: per il SIPrO Benchmark, Organizzazione, Processi, Profili e
   Cataloghi; per gli indici le dimensioni D2, D4, D5 e D6. Anche ogni sezione ha il
   proprio interruttore generale. Conto Annuale e KPI Riforma PA hanno una sola sezione e
   mostrano subito le schede.
3. **Schede**: i singoli interruttori, con i comandi «Attiva tutte» e «Disattiva tutte».

Una scheda o un indice disattivato:

- non compare nel menù di navigazione;
- per gli indici, scompare anche dalla pagina della dimensione e dalla Vista Executive;
- se raggiunto con un collegamento diretto, mostra un avviso che ne segnala la temporanea
  indisponibilità.

Questa funzione permette di rendere disponibili le schede in modo graduale, ad esempio
durante le fasi di lavorazione o di verifica dei dati.

> **Nota.** Perché lo stato di attivazione resti memorizzato in modo permanente per tutte le
> schede, è necessaria una predisposizione iniziale della base dati a cura del sistemista.
> Finché non è stata eseguita, le modifiche a SIPrO, indici e KPI valgono solo fino al
> ricaricamento della pagina.

## 3.3 Statistiche d'uso

È disponibile una sezione con statistiche sull'utilizzo delle funzionalità, presentate in
forma grafica, che offre un quadro sintetico dell'adozione delle diverse schede.

Il grafico **«Schede più consultate»** conta le consultazioni di ogni scheda: Conto
Annuale, SIPrO, KPI Riforma PA e indici della Vista Sintetica. Per gli indici si conta una
consultazione quando l'indice viene aperto dal menu o dalla Vista Executive, oppure quando
si apre uno dei pannelli della card o si clicca la sua barra in panoramica; ogni indice è
conteggiato una sola volta per visita.

Il conteggio parte dalle consultazioni successive all'attivazione del tracciamento: nei
primi giorni il grafico potrà risultare poco popolato.

## 3.4 Protezione della funzionalità «Pannello Admin»

Tra le funzionalità di sistema è presente la voce **«Pannello Admin»**. Per prevenire il
rischio di perdere l'accesso all'area di amministrazione, questa voce è **protetta** e non
può essere disattivata dall'interfaccia (l'interruttore è mostrato come bloccato, con
apposita segnalazione). Un'eventuale disattivazione è riservata al sistemista.

## 3.5 Numero di enti confrontabili nel Benchmark

Il numero massimo di enti confrontabili contemporaneamente nel Benchmark SIPrO è un
parametro di configurazione (valore predefinito: 6) che il sistemista può modificare senza
nuovi rilasci dell'applicazione.

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

[▶ Pagina successiva: Funzionamento e sicurezza](04-Funzionamento-e-Sicurezza)
