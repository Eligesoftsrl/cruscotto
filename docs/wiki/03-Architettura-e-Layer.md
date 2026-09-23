# 3. Architettura e layer applicativi

[◀ Torna all'indice](Home.md)

## Stack tecnologico

| Ambito | Tecnologie |
|-------|-----------|
| Linguaggio | TypeScript |
| UI | React 18, Vite, Tailwind CSS, componenti Radix UI (shadcn/ui) |
| Stato server / cache | TanStack React Query |
| Routing | React Router |
| Grafici | Recharts |
| Form e validazione | React Hook Form, Zod |
| Autenticazione | keycloak-js (OpenID Connect / PKCE) |
| Accesso dati | client PostgREST/Supabase (funzioni RPC) |
| Proxy di sicurezza | FastAPI (Python) |

## I layer dell'applicazione

L'architettura segue una separazione a livelli. Il flusso di una richiesta dati è:

```
 Componenti (UI)
      │  usano
      ▼
 Hooks (React Query)          <- orchestrano fetch, cache, stato di caricamento
      │  chiamano
      ▼
 Service layer (src/services) <- unico punto che conosce le RPC / le query
      │  usano
      ▼
 Integrazione dati (client)   <- client PostgREST/Supabase, gestione token
      │
      ▼
 Database (RPC + viste, con RLS)
```

### 1. Presentazione (`src/components`, `src/pages`)
Componenti React puramente presentazionali e pagine. Non contengono logica di rete:
ricevono dati dagli hook e renderizzano grafici/tabelle. Le UI di base sono componenti
riutilizzabili (`src/components/ui`).

### 2. Hooks (`src/hooks`)
Incapsulano l'uso di React Query per ogni scheda (es. `useSchedaProgressioni`,
`useSchedaGenere`, ...). Gestiscono chiavi di cache, `staleTime`, stati di
caricamento/errore e combinano i filtri correnti con il perimetro ente.

### 3. Service layer (`src/services`)
Unico punto che conosce **come** si recuperano i dati. È diviso in sotto-cartelle:
- `ca/` — servizi delle schede del **Conto Annuale** (RPC reali `fa_ca_*`).
- `dw/` — servizi delle sezioni accessorie/datawarehouse (alcune in modalità demo).
- `admin/` — store e client del **Pannello Admin** (feature flag, log, statistiche).

### 4. Integrazione dati (`src/integrations/supabase`)
Crea e configura il client verso il backend dati, gestisce il token da usare per le
chiamate e centralizza l'attivazione del proxy di sicurezza.

### 5. Configurazione (`src/config`)
Lettura centralizzata delle variabili d'ambiente (`env.ts`), cataloghi delle schede,
modalità dati e opzioni statiche. Nessun segreto hardcoded altrove.

### 6. Contesti (`src/contexts`)
- `AuthContext` — risolve l'utente autenticato in un profilo applicativo (ruolo, enti).
- `FilterContext` — stato condiviso dei filtri attivi tra le schede.

## Principi di design

- **Separazione delle responsabilità**: la UI non fa query; i servizi non renderizzano.
- **Una sola fonte di verità per la configurazione**: `src/config/env.ts`.
- **Cache e refetch dichiarativi**: gestiti da React Query tramite chiavi coerenti.
- **Type-safety**: tipi TypeScript sugli input/output dei servizi.

[▶ Prossima pagina: Struttura delle cartelle](04-Struttura-delle-Cartelle.md)
