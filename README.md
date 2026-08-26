# Cruscotto HR

Sistema di monitoraggio HR della Pubblica Amministrazione: dashboard analitica su
personale, reclutamento (InPA), competenze (Minerva), formazione (Syllabus),
organizzazione (SIPRO) e indicatori sintetici.

## Stack tecnologico

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui + Recharts
- **Data fetching:** TanStack Query (React Query)
- **Routing:** React Router
- **Backend / DB:** Supabase (PostgreSQL) — cloud in produzione, self-hosted in locale

## Requisiti

- Node.js >= 18
- npm (o yarn)
- (Solo per lo sviluppo locale) un'istanza **Supabase self-hosted** in esecuzione,
  tipicamente su `http://localhost:8000` (via Docker)

## Avvio in locale

```bash
# 1. Installa le dipendenze
npm install

# 2. Crea il file .env.local (vedi sezione "Configurazione")

# 3. Avvia il server di sviluppo
npm run dev
```

L'app sarà disponibile su **http://localhost:8080**.

## Configurazione (variabili d'ambiente)

La connessione a Supabase usa **una sola** sorgente di verità: `VITE_SUPABASE_URL`.
Non ci sono URL o chiavi hardcoded nel codice (vedi `src/config/env.ts`).

Il comportamento è **env-aware** grazie ai file `.env` gestiti da Vite:

| Ambiente | File usato | `VITE_SUPABASE_URL` |
|----------|-----------|---------------------|
| **Online** (produzione/preview) | `.env` | Supabase cloud (`https://<project>.supabase.co`) |
| **Locale** (sviluppo) | `.env.local` | Supabase self-hosted (`http://localhost:8000`) |

Vite dà **sempre precedenza** a `.env.local` rispetto a `.env`, quindi lo stesso
codice punta al cloud online e a localhost in locale, senza modifiche.

### Creare il file `.env.local` (solo in locale, ignorato da git)

```bash
cat > .env.local <<'EOF'
VITE_SUPABASE_PROJECT_ID="local"
VITE_SUPABASE_URL="http://localhost:8000"
VITE_SUPABASE_PUBLISHABLE_KEY="<anon key del tuo Supabase locale>"
EOF
```

> La `anon key` di default per un Supabase self-hosted via Docker è quella indicata
> nel file `.env`/`docker-compose` della tua istanza Supabase. Fai riferimento a
> `.env.example` per un modello delle variabili.

## Script disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia il server di sviluppo (porta 8080) |
| `npm run build` | Build di produzione |
| `npm run preview` | Anteprima della build di produzione |
| `npm run lint` | Linting del codice |
| `npm run test` | Esegue i test (Vitest) |

## Struttura del progetto

```
src/
├── config/          # Configurazione centralizzata (env.ts): unica sorgente per le VITE_*
├── components/
│   ├── ui/          # Componenti shadcn/ui
│   └── dashboard/   # Sezioni, grafici e layout della dashboard
├── contexts/        # Context React (Auth, Filtri)
├── hooks/           # Hook "thin": orchestrano React Query e delegano ai service
├── services/        # Service layer: accesso dati Supabase + trasformazioni pure
│   └── dw/          # Un service per dominio (eta, genere, inpa, minerva, sipro, ...)
├── fixtures/        # Dati di fallback (ex mock), usati solo come fallback esplicito
├── data/            # Cataloghi statici e configurazioni di dominio
└── pages/           # Pagine/route dell'applicazione
```

### Architettura dati (service layer)

- I **componenti** non accedono mai direttamente al client Supabase.
- Gli **hook** (`src/hooks`) sono sottili: usano React Query e chiamano i **service**.
- I **service** (`src/services`) incapsulano le query verso Supabase e le
  trasformazioni dei dati in funzioni pure e testabili.
- L'unico punto che istanzia il client Supabase è `src/integrations/supabase/client.ts`,
  che legge la configurazione da `src/config/env.ts`.

## Build di produzione

```bash
npm run build     # genera la cartella dist/
npm run preview   # anteprima locale della build
```
