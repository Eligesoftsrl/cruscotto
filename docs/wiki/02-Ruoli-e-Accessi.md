# 2. Ruoli e accessi

[◀ Torna all'indice](Home)

La presente sezione descrive i profili di accesso e il relativo ambito di visibilità dei
dati.

## 2.1 Modalità di accesso

L'accesso avviene con le credenziali aziendali tramite il sistema di autenticazione
centralizzato (single sign-on). Non sono previste password dedicate al cruscotto: si
utilizza il medesimo accesso degli altri servizi interni.

## 2.2 Profili

| Profilo | Descrizione | Vista di tutti gli enti | Accesso all'amministrazione |
|--------|-------------|:---:|:---:|
| **Amministratore** | Referente con privilegi di gestione | Sì | Sì |
| **Utente DFP** | Utente con vista globale, di sola consultazione | Sì | No |
| **Responsabile di ente** | Utente di uno o più enti | Solo gli enti abilitati | No |
| **Non abilitato** | Utente privo di autorizzazione | Nessun accesso: schermata dedicata | No |

L'**Amministratore** e l'**Utente DFP** condividono la medesima capacità di consultazione
su tutti gli enti; si distinguono unicamente per l'accesso al pannello di amministrazione,
riservato al solo Amministratore. In assenza dei privilegi di amministrazione, l'utente
DFP non visualizza né può raggiungere l'area di gestione.

## 2.3 Perimetro dei dati

Ciascun utente visualizza esclusivamente i dati di propria competenza. Tale perimetro
viene determinato automaticamente in fase di accesso, sulla base delle abilitazioni
associate all'utente, e non è modificabile dall'utente stesso.

- Il responsabile abilitato a un solo ente ne visualizza direttamente i dati.
- Il responsabile abilitato a più enti può alternarli mediante l'apposito selettore.
- L'utente DFP e l'amministratore non sono soggetti a limitazioni di perimetro e
  visualizzano i dati di tutti gli enti.

## 2.4 Sicurezza degli accessi

- La gestione delle autorizzazioni è centralizzata: l'abilitazione o la disabilitazione di
  un utente compete ai referenti degli accessi.
- L'isolamento tra enti è garantito su più livelli, in modo che ciascun utente resti nel
  proprio perimetro.
- I privilegi di amministrazione sono distinti dalla vista globale: la sola vista su tutti
  gli enti (profilo DFP) non abilita l'accesso all'area di gestione.
- Gli accessi e le attività principali sono registrati a fini di monitoraggio.

> Per il dettaglio delle soluzioni adottate si rimanda alla
> [Architettura tecnica](04-Architettura-Tecnica).

[▶ Pagina successiva: Pannello di gestione](03-Pannello-di-Gestione)
