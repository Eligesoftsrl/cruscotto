# 2. Ruoli e accessi

[◀ Torna all'indice](Home)

La presente sezione descrive i profili di accesso e il relativo ambito di visibilità dei
dati.

## 2.1 Modalità di accesso

L'accesso avviene con le credenziali aziendali tramite il sistema di autenticazione
centralizzato (single sign-on). Non sono previste password dedicate al cruscotto: si
utilizza il medesimo accesso degli altri servizi interni.

## 2.2 Profili

| Profilo | Vista di tutti gli enti | Accesso all'amministrazione |
|--------|:---:|:---:|
| **Utente DFP** | Sì | No |
| **Utente DFP con privilegi di amministrazione** | Sì | Sì |
| **Responsabile di ente** | Solo gli enti abilitati | No |
| **Non abilitato** | Nessun accesso: schermata dedicata | No |

L'**Utente DFP** dispone della vista globale su tutti gli enti in sola consultazione.
L'accesso al pannello di amministrazione richiede, in aggiunta, i **privilegi di
amministrazione**: l'utente DFP che ne è privo non visualizza né può raggiungere l'area di
gestione.

## 2.3 Perimetro dei dati

Ciascun utente visualizza esclusivamente i dati di propria competenza. Tale perimetro
viene determinato automaticamente in fase di accesso, sulla base delle abilitazioni
associate all'utente, e non è modificabile dall'utente stesso.

- Il responsabile abilitato a **un solo ente** ne visualizza direttamente i dati; il nome
  dell'ente è sempre indicato a destra nella barra dei filtri («Ente»).
- Il responsabile abilitato a **più enti** li alterna con il menu «Ente», sempre a destra
  nella barra dei filtri di ogni area attiva: Conto Annuale, Vista Sintetica, Vista
  Executive e SIPrO.
- L'utente DFP, con o senza privilegi di amministrazione, non è soggetto a limitazioni di
  perimetro e visualizza i dati di tutti gli enti.

## 2.4 Regole particolari per il SIPrO

Per i responsabili di ente valgono regole aggiuntive:

- se l'ente selezionato **non è accreditato in SIPrO**, nessun dato SIPrO è visibile e
  compare l'avviso «Ente non accreditato in SIPrO»;
- se l'ente è accreditato, i filtri **Ente** e **Regione** sono applicati direttamente e
  bloccati: la regione dell'ente compare con il simbolo del lucchetto e le altre regioni
  non sono consultabili;
- nel **Benchmark** la regione è fissata a quella dell'ente e il confronto è possibile solo
  tra enti della stessa regione.

Per gli utenti DFP il Benchmark propone all'avvio tre enti; quando si sceglie una regione,
vengono tolti dal confronto gli enti che non vi appartengono.

## 2.5 Regole particolari per i KPI Riforma PA

I KPI sono dati aggregati, ma sono riservati agli enti che partecipano alla rilevazione:

- il controllo usa l'elenco degli enti partecipanti alla rilevazione 2024, che vale come
  riferimento per tutti gli anni (alcuni dati sono disponibili solo come totale degli enti);
- il responsabile di un ente **non partecipante** non vede i KPI e compare l'avviso
  «Ente non partecipante alla rilevazione KPI»;
- se è abilitato anche ad altri enti partecipanti, può selezionarne uno dal menu «Ente»;
- se la verifica non è momentaneamente disponibile, i dati restano visibili;
- gli utenti DFP non sono soggetti a questa regola.

## 2.6 Sicurezza degli accessi

- La gestione delle autorizzazioni è centralizzata: l'abilitazione o la disabilitazione di
  un utente compete ai referenti degli accessi.
- L'isolamento tra enti è garantito su più livelli, in modo che ciascun utente resti nel
  proprio perimetro.
- I privilegi di amministrazione sono distinti dalla vista globale: la sola vista su tutti
  gli enti (profilo DFP) non abilita l'accesso all'area di gestione.
- Gli accessi e le attività principali sono registrati a fini di monitoraggio.

> Per un quadro d'insieme si rimanda a [Funzionamento e sicurezza](04-Funzionamento-e-Sicurezza).

[▶ Pagina successiva: Pannello di gestione](03-Pannello-di-Gestione)
