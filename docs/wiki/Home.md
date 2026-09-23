# Cruscotto HR — Wiki tecnica

Benvenuti nella documentazione tecnica del **Cruscotto HR**, l'applicazione di analisi
dei dati del personale della Pubblica Amministrazione (Conto Annuale e sezioni
correlate).

Questa wiki descrive il progetto dalla A alla Z: il percorso di conversione, la
struttura del codice, la suddivisione in layer, il modello dati, l'autenticazione,
l'isolamento multi-ente e l'architettura di sicurezza (proxy + RLS).

## Indice

1. [Panoramica e obiettivi](01-Panoramica.md)
2. [Percorso di conversione](02-Percorso-di-Conversione.md)
3. [Architettura e layer applicativi](03-Architettura-e-Layer.md)
4. [Struttura delle cartelle](04-Struttura-delle-Cartelle.md)
5. [Autenticazione, ruoli e multi-ente](05-Autenticazione-Ruoli-e-Multitenant.md)
6. [Sicurezza: proxy e RLS](06-Sicurezza-Proxy-e-RLS.md)
7. [Modello dati, RPC e filtri a cascata](07-Modello-Dati-RPC-e-Filtri.md)
8. [Pannello Admin](08-Pannello-Admin.md)
9. [Build, deploy e cache](09-Build-Deploy-e-Cache.md)
10. [Convenzioni e sviluppo](10-Convenzioni-e-Sviluppo.md)

## In sintesi

- **Frontend**: Single Page Application in React + TypeScript, servita come file statici.
- **Dati**: letti da un backend PostgREST/Supabase tramite funzioni RPC dedicate.
- **Autenticazione**: SSO tramite Keycloak (OpenID Connect, flusso PKCE).
- **Multi-ente**: ogni utente vede solo i dati del proprio perimetro, derivato dal token.
- **Sicurezza dati**: un proxy applicativo scambia il token SSO con un token firmato per
  il database e le policy RLS applicano l'isolamento a livello di riga.

> Le pagine sono collegate tra loro con link relativi ai file `.md`, così la wiki è
> navigabile sia da repository sia da wiki Git.
