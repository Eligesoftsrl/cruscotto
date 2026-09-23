# 1. Panoramica e obiettivi

[◀ Torna all'indice](Home.md)

## Cos'è il Cruscotto HR

Il Cruscotto HR è un cruscotto direzionale che rende leggibili e navigabili i dati del
personale della Pubblica Amministrazione. Il cuore applicativo sono le **12 schede del
Conto Annuale**, ciascuna con indicatori, grafici e tabelle, filtrabili per anno,
comparto, categoria, regione ed ente.

## Obiettivi del progetto

1. **Dati reali, non simulati** — le schede del Conto Annuale leggono dati reali dal
   database tramite RPC dedicate (niente dati finti nelle sezioni principali).
2. **Architettura scalabile e modulare** — separazione netta tra presentazione, logica
   di stato e accesso ai dati (service layer).
3. **Autenticazione centralizzata** — accesso tramite SSO aziendale (Keycloak) con
   controllo dei ruoli.
4. **Isolamento multi-ente** — ogni responsabile HR vede esclusivamente i dati degli enti
   di propria competenza; il profilo amministrativo (DFP) vede tutto.
5. **Sicurezza del layer dati** — impedire query arbitrarie e imporre l'isolamento a
   livello di database (RLS), non solo lato interfaccia.
6. **Nessun segreto nel codice** — endpoint e chiavi provengono da variabili d'ambiente.

## Profili utente

| Profilo | Descrizione | Perimetro dati |
|--------|-------------|----------------|
| **DFP / Amministratore** | Vista globale, può scegliere qualsiasi ente | Tutta la PA |
| **Responsabile HR di ente** | Utente di uno o più enti | Solo i codici fiscali abilitati |
| **Ruolo non previsto** | Utente autenticato ma non autorizzato | Nessun accesso (schermata dedicata) |

## Stato delle sezioni

- **Conto Annuale (12 schede)**: dati reali via RPC.
- **Sezioni accessorie** (es. reclutamento, formazione avanzata, competenze): possono
  essere presentate in modalità dimostrativa quando le relative sorgenti dati non sono
  ancora disponibili; in tal caso l'interfaccia mostra un avviso esplicito.

[▶ Prossima pagina: Percorso di conversione](02-Percorso-di-Conversione.md)
