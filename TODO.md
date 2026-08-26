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
- [ ] Risolvere i 6 errori ESLint minori pre-esistenti: `react-hooks/rules-of-hooks` (x2),
      `no-empty` (x1), `@typescript-eslint/no-empty-object-type` (x2).
- [ ] Riportare `@typescript-eslint/no-explicit-any` da `warn` a `error` a tipizzazione completata.

## Test (Fase 7 — estensione)
- [ ] Unit test sulle trasformazioni di `assunti`, `formazione`, `modalitaLavoro` e sugli indicatori `IAC`/`D1`.
- [ ] Smoke test di render delle sezioni principali.

## Dati (dipende dal cliente — ETL)
- [ ] Popolare le tabelle `ca_*` (Conto Annuale normalizzato) e migrare le sezioni
      oggi "dato demo" (Anzianita, Titolo di studio, serie storiche) dai fixtures ai dati reali.

## Autenticazione
- [ ] Sostituire l'auth mock (sessionStorage) con **SSO/Keycloak** (sblocca anche i test E2E automatici).
