# 8. Pannello Admin

[◀ Torna all'indice](Home.md)

Il Pannello Admin (`/admin`) è riservato ai profili amministrativi e consente di
governare le funzionalità visibili agli utenti e di monitorare l'utilizzo.

## Funzionalità

### Feature flag (schede e sezioni)
- Attivazione/disattivazione delle **12 schede** del Conto Annuale e delle sezioni.
- Il toggle ha effetto reale: la sidebar nasconde la voce e la scheda mostra un avviso
  di funzionalità disattivata.
- Catalogo in `src/config/schedeCatalog.ts`; stato gestito in `src/services/admin`.

### Statistiche d'uso
- Grafici (ciambella e barre) sull'utilizzo delle funzionalità.
- Alimentate da viste di statistica lato database.

### Log
- **Accessi** (`log_accessi`): esito, utente, ruolo, orario.
- **Eventi** (`log_eventi`): azioni applicative significative.
- **Errori** (`log_errori`): messaggi ed errori (senza stack trace persistito).

## Architettura dei dati Admin

Lo store `src/services/admin/adminStore.ts` è la **sorgente dati unica** del pannello e
funziona in due modalità, in modo trasparente per la UI:

| Modalità | Quando | Come legge/scrive |
|----------|--------|-------------------|
| **Proxy** | proxy di sicurezza attivo | via endpoint `/admin/*` del proxy |
| **Diretta** | proxy non attivo | via client dati (accesso diretto) |

Caratteristiche:
- **Mutazioni ottimistiche**: l'interfaccia si aggiorna subito, poi persiste; in caso di
  errore effettua il rollback.
- **Cache in memoria** con pattern store esterno (subscribe/getState) per offrire ai
  componenti un'API sincrona.
- Un catalogo di default garantisce un fallback sincrono iniziale prima che il caricamento
  dei dati sia completato.

## Sicurezza del pannello

- La **lettura** delle statistiche e dei log è riservata ai profili amministrativi.
- La **scrittura** delle feature flag è riservata agli amministratori (verificati dal token
  lato proxy).
- In modalità proxy, i dati sensibili delle tabelle Admin non sono raggiungibili
  direttamente dal browser.

[▶ Prossima pagina: Build, deploy e cache](09-Build-Deploy-e-Cache.md)
