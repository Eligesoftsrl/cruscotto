# 2. Ruoli e accessi

[◀ Torna all'indice](Home)

La presente sezione descrive i profili di accesso e il relativo ambito di visibilità dei
dati.

## 2.1 Modalità di accesso

L'accesso avviene con le credenziali aziendali tramite il sistema di autenticazione
centralizzato (single sign-on). Non sono previste password dedicate al cruscotto: si
utilizza il medesimo accesso degli altri servizi interni.

## 2.2 Profili

| Profilo | Descrizione | Ambito di visibilità |
|--------|-------------|----------------------|
| **Amministratore** | Referente centrale | Tutti i dati; selezione di qualsiasi ente |
| **Responsabile di ente** | Utente di uno o più enti | Solo i dati degli enti abilitati |
| **Non abilitato** | Utente privo di autorizzazione | Nessun accesso: schermata dedicata |

## 2.3 Perimetro dei dati

Ciascun utente visualizza esclusivamente i dati di propria competenza. Tale perimetro
viene determinato automaticamente in fase di accesso, sulla base delle abilitazioni
associate all'utente, e non è modificabile dall'utente stesso.

- Il responsabile abilitato a un solo ente ne visualizza direttamente i dati.
- Il responsabile abilitato a più enti può alternarli mediante l'apposito selettore.
- L'amministratore non è soggetto a limitazioni di perimetro.

## 2.4 Sicurezza degli accessi

- La gestione delle autorizzazioni è centralizzata: l'abilitazione o la disabilitazione di
  un utente compete ai referenti degli accessi.
- L'isolamento tra enti è garantito su più livelli, in modo che ciascun utente resti nel
  proprio perimetro.
- Gli accessi e le attività principali sono registrati a fini di monitoraggio.

> Per il dettaglio delle soluzioni adottate si rimanda alla
> [Architettura tecnica](03-Architettura-Tecnica).

[▶ Pagina successiva: Architettura tecnica](03-Architettura-Tecnica)
