# 2. Percorso di conversione

[◀ Torna all'indice](Home.md)

Questa pagina riassume l'evoluzione del progetto dallo stato iniziale (prototipo con dati
simulati) allo stato attuale (applicazione modulare con dati reali e sicurezza sul layer
dati).

## Punto di partenza

- SPA funzionante ma con **dati simulati** (mock) diffusi nei componenti.
- Chiamate ai dati sparse nell'interfaccia, difficili da manutenere.
- Autenticazione dimostrativa, nessun perimetro dati.

## Tappe della conversione

### Tappa 1 — Introduzione di un service layer
Tutte le chiamate ai dati sono state spostate in moduli di servizio dedicati
(`src/services/**`), separando l'accesso ai dati dalla presentazione. I componenti non
conoscono più i dettagli di rete: chiedono dati a un servizio.

### Tappa 2 — Migrazione alle RPC reali (Conto Annuale)
Le 12 schede del Conto Annuale sono state collegate alle **funzioni RPC** del database
(`fa_ca_*`). I dati simulati sono stati rimossi dalle sezioni principali.

### Tappa 3 — Filtri a cascata dinamici
I menù dei filtri (comparto → macrocategoria → categoria, più anno e regione) sono
alimentati da un dizionario dati (`mv_filtri`), quindi si aggiornano dinamicamente senza
valori scritti a mano nel codice.

### Tappa 4 — Autenticazione SSO
È stato integrato l'accesso tramite Keycloak (OpenID Connect, PKCE). I ruoli utente
arrivano nei claim del token e determinano cosa l'utente può vedere.

### Tappa 5 — Isolamento multi-ente
Dal token si legge il claim con i codici fiscali degli enti abilitati e lo si applica
automaticamente a tutte le chiamate dati, così ogni utente resta nel proprio perimetro.

### Tappa 6 — Pannello Admin su dati reali
Gestione delle funzionalità (feature flag), statistiche d'uso e log sono collegati a
tabelle reali, non più a memoria locale.

### Tappa 7 — Blindatura del layer dati
Per impedire query arbitrarie e imporre l'isolamento **a livello di database**, è stato
predisposto un **proxy applicativo** che scambia il token SSO con un token firmato per il
database, insieme alle policy **RLS**. Vedi [Sicurezza: proxy e RLS](06-Sicurezza-Proxy-e-RLS.md).

## Rimozione dei segreti dal codice
Endpoint e chiavi sono stati esternalizzati in variabili d'ambiente e centralizzati in
`src/config/env.ts`: nessun URL o chiave è scritto direttamente nel codice.

[▶ Prossima pagina: Architettura e layer](03-Architettura-e-Layer.md)
