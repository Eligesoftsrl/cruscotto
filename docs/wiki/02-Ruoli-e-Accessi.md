# 2. Ruoli e accessi

[◀ Torna all'indice](Home)

La presente sezione descrive i profili di accesso e il relativo ambito di visibilità dei
dati.

## 2.1 Modalità di accesso

L'accesso avviene con le credenziali aziendali tramite il sistema di autenticazione
centralizzato (single sign-on). Non sono previste password dedicate al cruscotto: si
utilizza il medesimo accesso degli altri servizi interni.

## 2.2 Profili

| Profilo (ruoli assegnati) | Vista di tutti gli enti | Accesso all'amministrazione |
|--------|:---:|:---:|
| **Utente DFP** (ruolo `dfp`) | Sì | No |
| **Utente DFP + Amministratore** (ruolo `dfp` + ruolo amministrativo) | Sì | Sì |
| **Responsabile di ente** (ruolo di ente) | Solo gli enti abilitati | No |
| **Non abilitato** (nessun ruolo previsto) | Nessun accesso: schermata dedicata | No |

L'**Utente DFP** dispone della vista globale su tutti gli enti in sola consultazione.
L'accesso al pannello di amministrazione richiede, in aggiunta, un **ruolo amministrativo**:
l'utente DFP che ne è privo non visualizza né può raggiungere l'area di gestione.

## 2.3 Perimetro dei dati

Ciascun utente visualizza esclusivamente i dati di propria competenza. Tale perimetro
viene determinato automaticamente in fase di accesso, sulla base delle abilitazioni
associate all'utente, e non è modificabile dall'utente stesso.

- Il responsabile abilitato a un solo ente ne visualizza direttamente i dati.
- Il responsabile abilitato a più enti può alternarli mediante l'apposito selettore.
- L'utente DFP (con o senza privilegi di amministrazione) non è soggetto a limitazioni di
  perimetro e visualizza i dati di tutti gli enti.

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
