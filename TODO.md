# TODO / Debito tecnico — Cruscotto HR

Stato: l'applicazione e consegnabile e funzionante. Gli item seguenti sono
miglioramenti di qualita/manutenibilita NON bloccanti (nessun impatto a runtime),
da affrontare all'occorrenza o in sessioni dedicate.

## Tipizzazione (rimozione `any`)

- [ ] **Grafici SIPRO (13 file in `src/components/dashboard/charts/`)**: sostituire
      `sipoFrom` con funzioni `fetchX()` dedicate e tipizzate in `siproService`,
      rimuovendo gli `any` nelle trasformazioni (join multi-tabella).
- [ ] **Service di dominio**: tipizzare con i tipi generati `Database` i service
      `inpaService`, `minervaService`, `syllabusService`, `bussolaService`,
      `d1Service` (oggi ritornano `Promise<any[]>`); adeguare i componenti consumatori.
- [ ] `enteService`: 4 `any` sul query builder dinamico (giustificati, valutare tipi Supabase).

> Nota: i service core del Conto Annuale (eta, genere, cessati, assunti, formazione,
> modalitaLavoro, progressioni) sono GIA tipizzati e coperti da unit test.

## React Query (Fase 4 — completamento)

- [ ] Centralizzare le **query keys** in `src/services/queryKeys.ts` (oggi stringhe sparse nei ~20 hook).
- [x] Default sensati del `QueryClient` (staleTime/retry) — FATTO.
- [x] Gestione errori globale (toast su query fallita) — FATTO.

## UI / uniformita

- [ ] Applicare `KpiStat`/`ChartCard`/`SectionStates` anche alle sezioni non-Conto-Annuale
      (INPA, Minerva, Syllabus, SIPRO) per uniformita totale.

## Qualita / lint

- [x] Risolti i 7 errori ESLint pre-esistenti (`react-hooks/rules-of-hooks`, `no-empty`,
      `no-empty-object-type`, `no-unused-expressions`, `no-require-imports`) — 0 errori. FATTO.
- [ ] Riportare `@typescript-eslint/no-explicit-any` da `warn` a `error` a tipizzazione completata.
- [x] **Prettier + EditorConfig** configurati (`.prettierrc.json`, `.prettierignore`,
      `.editorconfig`); script `format`/`format:check`; codebase normalizzata. FATTO.

## Robustezza

- [x] **Error Boundary** globale + per-route (`src/components/ErrorBoundary.tsx`): niente piu
      "schermo bianco", fallback con "Riprova"; reset automatico al cambio pagina. FATTO.

## Test (Fase 7 — estensione)

- [ ] Unit test sulle trasformazioni di `assunti`, `formazione`, `modalitaLavoro` e sugli indicatori `IAC`/`D1`.
- [ ] Smoke test di render delle sezioni principali.

## Dati (dipende dal cliente — ETL)

- [ ] Popolare le tabelle `ca_*` (Conto Annuale normalizzato) e migrare le sezioni
      oggi "dato demo" (Anzianita, Titolo di studio, serie storiche) dai fixtures ai dati reali.

## Autenticazione

- [ ] Sostituire l'auth mock (sessionStorage) con **SSO/Keycloak** (sblocca anche i test E2E automatici).
