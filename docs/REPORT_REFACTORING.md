# Cruscotto HR — Report di Refactoring e Migrazione

**Preparato da:** Perfexia Srl
**Progetto:** Cruscotto HR — Sistema di monitoraggio HR della Pubblica Amministrazione
**Oggetto:** Sintesi completa degli interventi effettuati sul codice, dallo stato
iniziale (repository importata da Lovable) allo stato attuale.

---

## 1. Sintesi esecutiva

Il progetto e stato importato da una repository generata con Lovable e
completamente **ristrutturato** per renderlo pulito, manutenibile e scalabile,
senza modificarne le funzionalita per l'utente finale. In sintesi:

- Introdotta un'**architettura a livelli** (Service Layer) che separa nettamente
  l'accesso ai dati (Supabase) dalla logica di presentazione (componenti).
- **Rimossi i dati mock** dalle sezioni operative, collegandole ai **dati reali**
  del data warehouse; i pochi indicatori senza tabella sorgente sono chiaramente
  segnalati con un badge "dato dimostrativo".
- **Configurazione Supabase resa "environment-aware"**: stesso codice, cloud in
  produzione e Supabase locale in sviluppo, senza modifiche manuali.
- **Corretti** i bug/warning di console segnalati.
- **Ottimizzate** le performance (code-splitting: pagina iniziale molto piu leggera).
- Aggiunti **guardrail di qualita** (regole di lint, test automatici) e rimosso il
  codice morto.
- Repository ripulita da ogni artefatto della piattaforma di sviluppo.

**Stato attuale:** applicazione funzionante, build di produzione OK, console pulita,
test verdi, pronta alla consegna.

---

## 2. Stack tecnologico

React 18 + TypeScript + Vite · Tailwind CSS + shadcn/ui + Recharts ·
TanStack Query (React Query) · React Router · Supabase (PostgreSQL).

---

## 3. Confronto Prima / Dopo

| Aspetto | Prima (Lovable) | Dopo (refactoring) |
|--------|------------------|--------------------|
| Accesso ai dati | Client Supabase importato e usato **direttamente in ~46 componenti** | Centralizzato in un **Service Layer** (`src/services`); i componenti non toccano piu Supabase |
| Dati delle sezioni | Molte sezioni su **dati mock** (JSON) | Sezioni collegate ai **dati reali** `dw_*`; demo residui segnalati |
| Config Supabase | URL/chiavi potenzialmente incoerenti; `VITE_SUPABASE_URL` su `localhost:8000` non raggiungibile | **Unica sorgente** `VITE_SUPABASE_URL`; cloud online, localhost in locale via `.env.local` |
| Hook dati | Query Supabase inline + trasformazioni nei componenti/hook | **Hook "thin"** che delegano ai service; trasformazioni in funzioni pure |
| Duplicazione UI | Griglie KPI, stati di caricamento e stili tooltip **duplicati** in ogni sezione | Componenti riutilizzabili: `KpiStat`, `ChartCard`, `SectionStates`, tema condiviso |
| Bundle | Unico chunk **~1.9 MB** | **Code-splitting**: vendor separati e pagine caricate on-demand |
| Gestione errori | Assente/silenziata | **Toast globale** su ogni query fallita |
| Qualita | Nessun guardrail | Regola ESLint anti-import diretto di Supabase + **unit test** |
| Tipizzazione | `any` diffuso | Service core del Conto Annuale **tipizzati** (tipi generati `Database`), 0 `any` |
| Codice morto | Componenti orfani duplicati | Rimossi |

---

## 4. Architettura introdotta (Service Layer)

```
src/
  config/        env.ts (variabili VITE_*), constants.ts (CURRENT_YEAR, ...)
  services/      Accesso dati + trasformazioni pure
    dw/          Un service per dominio (eta, genere, cessati, assunti, formazione,
                 modalita lavoro, progressioni, ente, iac, d1, inpa, kpiRilevazione,
                 lavoroPubblico, minerva, syllabus, sipro, bussola)
    journeysService.ts
  hooks/         Hook "thin": orchestrano React Query e chiamano i service
  fixtures/      Dati dimostrativi (ex-mock) usati SOLO come fallback esplicito
  components/
    dashboard/   Sezioni, grafici, primitive UI condivise
    ui/          Componenti shadcn/ui
  integrations/supabase/  client.ts (unico punto che istanzia il client)
  pages/         Route dell'app
```

**Principio chiave:** i componenti NON accedono mai direttamente a Supabase. Il
flusso e: *Componente -> Hook (React Query) -> Service -> Supabase*. Una regola
ESLint impedisce di violare questa architettura.

---

## 5. Dettaglio degli interventi

### 5.1 Import e configurazione ambiente
- Importato il progetto e configurato per l'ambiente di sviluppo.
- `vite.config.ts` reso **environment-aware**: in locale porta **8080** (con
  fallback automatico su porta libera); in ambiente gestito porta imposta da `PORT`,
  `allowedHosts` e HMR dedicati.

### 5.2 Configurazione Supabase (env-aware)
- Creato `src/config/env.ts`: **unica sorgente di verita** per le variabili
  `VITE_SUPABASE_*`, con validazione e messaggi d'errore chiari.
- `client.ts` legge la configurazione da `env.ts` (nessun valore hardcoded).
- Corretta l'incoerenza del `.env` (puntava a `localhost:8000` irraggiungibile online).
- Aggiunti `.env.example` e la logica `.env.local` (precedenza in locale, ignorato da git):
  **online = Supabase cloud, locale = Supabase su `localhost:8000`**, stesso codice.

### 5.3 Migrazione al Service Layer
- Estratte tutte le query Supabase dai **~46 componenti** (INPA, KPI, Lavoro
  Pubblico, Minerva, Syllabus, filtri globali, grafici SIPRO) verso service dedicati.
- **12 hook dati** resi "thin" e collegati ai service (eta, genere, bussola,
  cessati, assunti, formazione, progressioni, modalita lavoro, ente filtrati,
  IAC, D1, custom journeys).

### 5.4 Conto Annuale: da mock a dati reali
- Verificato che le tabelle **`ca_*`** (Conto Annuale) erano **vuote** e le **`dw_*`**
  popolate (conteggi reali: dw_eta 4.680, dw_occupazione 1.950, dw_cessati 1.560,
  dw_assunti 1.894, dw_formazione/modalita 390). Per questo le sezioni cadevano sui mock.
- **Collegate ai dati reali `dw_*`**: Analisi Genere, Cessazioni, Progressioni,
  Lavoro Agile, Lavoro Flessibile, Tasso Turnover, Tasso Sostituzione, Formati
  Personale (oltre a Eta e Assunti gia reali), Analisi Eta e Benchmark.
- **Badge "dato dimostrativo"** sulle sezioni prive di tabella sorgente in `dw_*`:
  Anzianita, Analisi Personale (titolo studio/serie storica), Previsione Cessazioni
  (proiezione simulata).
- **Rimosso codice morto**: componenti orfani `FlessibileSection`,
  `FormazioneSection`, `OverviewSection`.

### 5.5 Correzione bug / warning di console
- **Chiavi React duplicate** in `KpiAbilitantiSection` (con piu enti): risolto
  aggregando i KPI per codice (media tra enti). Verificato: zero warning.
- **Errore SVG `<path d="Z">`**: guard sul RadarChart di `KpiSuccessRateSection`
  quando i dati sono vuoti.
- **Warning React Router**: abilitati i future flag v7 (`startTransition`,
  `relativeSplatPath`).
- Chiarito che gli errori residui (`content.js`, `polyfill.js`) provengono da
  **estensioni del browser**, non dall'app.

### 5.6 Riduzione verbosita e primitive riutilizzabili
- Create: `KpiStat` + `KpiGrid`, `ChartCard`, `SectionStates` (loading/errore/vuoto),
  `chartTheme` (tooltip condiviso), `lib/format` (formattazioni it-IT),
  `config/constants`, **barrel export** per `hooks` e `services/dw`.
- Applicate alle sezioni del Conto Annuale (UI uniforme, meno righe duplicate).

### 5.7 Tipizzazione (type-safety)
- I **7 service core** del Conto Annuale tipizzati con i **tipi generati** di
  Supabase (`Database[...]["Row"]`), **zero `any`**.

### 5.8 Qualita e guardrail
- Regola ESLint **`no-restricted-imports`**: vietato importare il client Supabase
  fuori dai service (0 violazioni). `no-explicit-any` a warning (rimozione progressiva).
- **Unit test (Vitest)** sulle funzioni pure di trasformazione (eta, genere,
  cessati): 4/4 verdi. Riparato il test harness.

### 5.9 Performance
- **Code-splitting**: route in `React.lazy` + `Suspense`; `manualChunks` per i
  vendor (React, Recharts, Supabase, React Query). Il bundle monolitico da ~1.9 MB
  e stato spezzato: la pagina di login NON carica piu Recharts (446 KB), Supabase
  (220 KB) e la dashboard (454 KB), caricati solo all'ingresso nelle relative pagine.
- **Gestione errori globale** React Query (toast su query fallita).

### 5.10 Pulizia repository
- Rimossi dal repo (senza rompere l'ambiente) gli artefatti della piattaforma di
  sviluppo (`.emergent/`, `.gitconfig`, `memory/`, `test_reports/`, `test_result.md`)
  e aggiunti al `.gitignore`.
- `package.json`: `name` -> `cruscotto-hr`. **README** riscritto con istruzioni di
  avvio locale, configurazione env-aware e architettura.
- Nessun riferimento alla piattaforma di sviluppo nel codice consegnato.

---

## 6. Configurazione ambienti

| Ambiente | File | `VITE_SUPABASE_URL` |
|----------|------|----------------------|
| Online (produzione) | `.env` | Supabase cloud |
| Locale (sviluppo) | `.env.local` (ignorato da git) | `http://localhost:8000` |

Avvio locale: `npm install` -> creare `.env.local` -> `npm run dev` (porta 8080).

---

## 7. Verifiche di qualita effettuate

- `tsc --noEmit` (type-check) **pulito** dopo ogni intervento.
- **Build di produzione** completata senza errori.
- **Console del browser pulita** (0 errori applicativi) verificata da test automatico.
- **Unit test** delle trasformazioni core verdi (4/4).

---

## 8. Cosa resta (debito tecnico, non bloccante)

Vedi `TODO.md`. In sintesi: tipizzazione dei grafici SIPRO e dei restanti service
di dominio, centralizzazione delle query keys, estensione dei test, e — lato
cliente — popolamento delle tabelle `ca_*` (ETL) e introduzione dell'autenticazione
SSO/Keycloak. Nessuno di questi item impatta il funzionamento attuale.

---

*Documento generato a corredo del lavoro di refactoring. Per il dettaglio puntuale
delle modifiche fare riferimento allo storico dei commit del repository.*
