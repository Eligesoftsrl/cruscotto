# Viste `dw_*` prodotte — Catalogo per revisione (cliente / esperti di dominio)

> **Scopo del documento.** Presentare in modo organico tutte le viste SQL realizzate come
> **adapter** tra il database reale (schema `dwh` = questionari EAV, schema `ca` = Conti Annuali)
> e lo schema denormalizzato `public.dw_*` atteso dal frontend React (contratto in
> `src/integrations/supabase/types.ts`). L'obiettivo è consentire agli esperti di verificare la
> **correttezza delle mappature** senza dover leggere il codice.

## 1. Strategia (in breve)
- Il frontend NON viene modificato: interroga tabelle `public.dw_*`.
- Il DB reale ha struttura diversa (questionari EAV + Conti Annuali). Le viste `dw_*`
  **traducono** i dati reali nel formato atteso dall'app.
- Tutte le viste vivono nello schema `public`. Vanno eseguite sul progetto Supabase del
  committente; poi si punta l'app a quel Supabase (variabili `.env`).
- Ordine di creazione e ripristino ambiente di test: script `docs/setup_local_pg.sh`.
- Esposizione API (PostgREST): `GRANT SELECT ON <vista> TO anon, authenticated;` (righe già
  predisposte, commentate, in coda a ogni file).

## 2. Riepilogo viste REALI (validate su dati reali)

| # | Vista | Tipo | Sorgente reale | Righe | Uso live nel FE |
|---|---|---|---|---|---|
| 1 | `dw_ente` | MATERIALIZED | `dwh.lk_questionari_enti` (+ anagrafica) | 23.594 | Sì |
| — | `v_kpi_ente_wide` | MATERIALIZED (helper) | pivot `dwh.ft_questionari_globale` | 619 | No (base) |
| 2 | `dw_kpi_rilevazione` | MATERIALIZED | `v_kpi_ente_wide` (campagna `progetto_gru`/`2025-12`) | 115 | Sì |
| 3 | `dw_verifica_indicatori` | MATERIALIZED | `dw_ente` + `dw_kpi_rilevazione` (contratto) | 23.594 | No |
| 4 | `dw_occupazione` | MATERIALIZED | `ca.ft_occupazione` | 1.211.654 | Sì |
| 5 | `dw_assunti` | MATERIALIZED | `ca.ft_assunzioni` | 221.737 | Sì |
| 6 | `dw_cessati` | MATERIALIZED | `ca.ft_cessazioni` | 430.711 | Sì |
| 7 | `dw_eta` | MATERIALIZED | `ca.ft_eta` | 2.836.412 | Sì |
| 8 | `dw_formazione` | MATERIALIZED | `ca.ft_formazione` | 491.209 | Sì |
| 9 | `dw_modalita_lavoro` | MATERIALIZED | `ca.ft_modalita_lavoro_flessibile` | 95.896 | Sì |
| 10 | `dw_passaggi_qualifica` | MATERIALIZED | `ca.ft_passaggi_qualifica` | 199.608 | Sì |
| 11 | `dw_causali` | MATERIALIZED | `ca.vw_lk_causali_assunzione/_cessazione` | 18 | Sì |
| 12 | `dw_comparto_contratto` | MATERIALIZED | `ca.lk_mappa_comparti_contratti` | 49 | No |
| 13 | `dw_fascia_eta` | MATERIALIZED | derivata da codici `ca.ft_eta` | 12 | Sì |
| 14 | `dw_qualifiche` | MATERIALIZED | `ca.lk_comparti_categorie_contratti` | 3.110 | No (lookup) |

File in: `docs/views/*.sql`.

## 3. Chiave di collegamento ente (fondamentale)
La colonna app `istituzione` / `id_ente` è l'`id` di `dwh.lk_questionari_enti`. I fatti dei
Conti Annuali si collegano così:
```
ca.<fact>.ISTITUZIONE = ca.lk_istituzioni.istituzione_id
ca.lk_istituzioni.CODI_FISCALE = dwh.lk_questionari_enti.codice_fiscale_ente
dwh.lk_questionari_enti.id = dw_ente.id_ente ( = istituzione )
```
Overlap verificato: **12.274** codici fiscali CA combaciano con l'anagrafica enti `dwh`.

## 4. Dettaglio mappature (punti da validare dagli esperti)

### 4.1 `dw_kpi_rilevazione` (questionari → ~70 colonne `q*`)
- Sorgente: campagna **`progetto_gru` / `2025-12`** (l'unica allineata al dizionario
  `lk_questionari_elements` 2025-04). ⚠️ **Da confermare** che sia la campagna corretta da
  esporre (parametrizzabile nel CTE `w`).
- Binari: da `valore_num` (1 → `Sì`; per `q1_1_adozione_modello`: 1 → `Formalmente`).
- Numerici: `valore_num` → `text` (il contratto app è testuale).
- Totali/denominatori derivati per somma sotto-elementi (es. personale TI = 6.4.a+b+c+d).
- ⚠️ Colonne senza sorgente reale, esposte NULL: `q6_12_donne_agile_pct`,
  `q6_4_posti_vacanti_nondir`, `q6_5_posti_vacanti_dir`.
- Mappatura puntuale colonna→`raw_element`: commenti inline in `docs/views/dw_kpi_rilevazione.sql`.

### 4.2 `dw_verifica_indicatori`
- ⚠️ **Non interrogata da query live**; radar/indici Executive nel FE sono array demo statici,
  e l'IAC è ricalcolato lato client da `dw_kpi_rilevazione`.
- La vista mantiene il contratto: anagrafica + `organico_2023` popolati; gli indici compositi
  (`iac`, `iap`, `icec`, ...) sono **NULL** perché richiedono la **metodologia ufficiale di
  scoring** del committente (da fornire).

### 4.3 Viste Conti Annuali (occupazione, assunti, cessati, età, formazione, modalità)
- Nomi colonna reali in MAIUSCOLO/virgolette mappati sul contratto (es.
  `"PERSONALE_TEMPO_PIENO_DONNE"` → `tp_donne`).
- `dw_occupazione.macrocat`: non presente nella fonte → NULL.
- `dw_formazione.ore_media_*`: la fonte CA esprime la media in **giornate** (`FORM_MEDIA_*`),
  mappata su `ore_media_d/u` per rispettare il contratto. ⚠️ Da validare l'unità di misura attesa.
- `dw_passaggi_qualifica.tipo_passaggio`: `V`/`O` reale tradotto in `Verticale`/`Orizzontale`
  (il FE distingue i verticali con regex `/vert/i`).

### 4.4 Lookup descrizioni
- `dw_causali`: chiave `cod_alfa` = codice **prefissato** (`A23`, `C01`) identico ai fatti.
  Copertura join 9/11 (i codici `A26`/`A40` non hanno descrizione in tutto il dump → fallback al
  codice).
- `dw_fascia_eta`: join 12/12 con `dw_eta.fascia_eta` (E0..E68).
- `dw_qualifiche`: **ruoli per esteso**, join validato **100%** (2019/2019):
  `dw_occupazione.qualifica = dw_qualifiche.categoria` (= `CODI_QUALIFICA`) +
  `contratto = cod_contratto`. La colonna `categoria` contiene il codice qualifica (il contratto
  app non prevede una colonna dedicata), `descrizione` = ruolo esteso.

## 5. Viste STUB (VUOTE) — sorgente dati assente

Le seguenti tabelle sono interrogate dal frontend ma **non hanno alcuna sorgente** nei dump
forniti (`dwh.sql`, `ca_52.sql`) — sistemi esterni. Sono state create come **viste vuote
conformi al contratto** (`SELECT ... WHERE false`) per evitare errori a runtime; le relative
sezioni mostreranno "nessun dato" / fallback demo. **Da sostituire con viste reali quando il
committente fornirà i rispettivi dati.**

File in: `docs/views/stub/*.sql` (+ `_ALL_STUBS.sql` per esecuzione unica).

| Dominio | Viste stub |
|---|---|
| Competenze / SIPRO | `dw_competenza`, `dw_bridge_profilo_competenza`, `dw_famiglia_professionale`, `dw_profilo_di_ruolo` |
| Assessment | `dw_minerva_assessment` |
| PTFP (Piano Fabbisogni) | `dw_ptfp_dotazione`, `dw_ptfp_reclutamento` |
| InPA (reclutamento) | `dw_inpa_bandi`, `dw_inpa_candidati`, `dw_lp_graduatorie` |
| Syllabus (competenze) | `dw_syllabus_pa`, `dw_syllabus_catalogo`, `dw_syllabus_partecipazioni` |

**Dati necessari dal committente** per popolarle: estrazioni/dump di InPA, Syllabus e del
sistema competenze/profili (SIPRO) e del PTFP.

## 6. Punti aperti per la revisione degli esperti
1. Confermare la **campagna sorgente** per `dw_kpi_rilevazione` (`progetto_gru`/`2025-12`).
2. Fornire la **metodologia di calcolo** degli indici compositi di `dw_verifica_indicatori`.
3. Validare le **unità di misura** (es. formazione: giornate vs ore).
4. Validare le mappature semantiche colonna→`raw_element` per i KPI dei questionari.
5. Verificare la correttezza del **collegamento ente** (CF) per gli enti con codici fiscali
   multipli/variati nel tempo.

---
*Riferimenti tecnici: `docs/STUDIO_DB_REALE_E_PIANO.md` (dettaglio completo), `docs/MAPPATURA_TABELLE_GRAFICI.md`, `docs/views/` (SQL), `docs/views/stub/` (stub), `docs/setup_local_pg.sh` (ambiente di test).*
