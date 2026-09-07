# Studio DB reale (`dwh`) + Piano di allineamento

> Analisi del database **reale** (`dwh.sql`, dump custom PostgreSQL 17, schema `dwh`) e piano per
> allinearlo all'app **senza modificare React**, tramite viste di compatibilità in schema `public`.

---

## 1. Il modello reale è EAV (questionari), NON dimensionale
Il DB reale ha **22 tabelle** nello schema `dwh` ed è organizzato attorno ai **questionari**:

- **`ft_questionari_globale`** (+ varianti `ft_questionari`, `_2024`, `_tableau*`) = **tabella dei fatti EAV**:
  `progetto, ente, cf_ente, faseelaborazione, raw_element, valore, valore_num, elementid, rilevazione`
  → **una riga per ogni risposta/metrica** di un ente in una rilevazione.
- **`lk_questionari_elements`** (64) = dizionario degli element (`raw_element` → dimensione + descrizione).
- **`lk_anagrafica_indicatori`** (27) = indicatori con **query SQL di calcolo già pronta** (colonna `query`) + `dim_sigla` (D1–D6) + `ruolo_id`.
- **`lk_questionari_kpi`** = definizioni KPI.
- **`lk_questionari_enti`** = anagrafica enti reale (con `codice_ipa`, `codice_fiscale_ente`, `codice_istat`, `codice_comune_istat`, `tipologia`, `classe_di_popolazione`).
- **`lk_comuni`**, **`lk_shp_*`** = comuni e geografie.

Al contrario, il **Prototipo** usa ~150 tabelle **denormalizzate** (`dw_*`, `ca_*`, `ft_sipo_*`) che **non esistono** nel DB reale.

## 2. Conseguenza
Contro il DB reale, allo stato, **nessun grafico funziona** (mancano le tabelle `dw_*`).
Ma **tutti i dati ci sono**, in forma EAV. Vanno **trasformati**.

## 3. Chiave ente = CODICE FISCALE
Nel fatto reale l'ente è identificato da **`cf_ente`** (codice fiscale). `lk_questionari_enti` ha
`codice_fiscale_ente`, `codice_ipa`, `codice_istat`. → Conferma la scelta del cliente: **la chiave
canonica è il CF**. L'`id_ente` atteso dall'app sarà un surrogato derivato da `lk_questionari_enti.id`,
e le viste dei fatti mapperanno `cf_ente` → `id_ente`.

## 4. Gli indicatori hanno già la formula
`lk_anagrafica_indicatori.query` contiene, per ognuno dei 27 indicatori, la SELECT su
`ft_questionari_globale` con filtri su `raw_element`/`elementid` e `cf_ente`, e placeholder:
`#progetto#`, `#rilevazione#`, `#codicefiscale#`. Esempi:
- D1 id=2 (% adozione modello): `SUM(case when elementid='1.1' then valore_num else 0 end)/count(distinct ente)`
- D2 id=15 (assunti TI): `sum(valore_num) where raw_element like '2.1'`
- D3 id=17 (concorsi banditi): `... raw_element like '3.1'`

→ Ricostruire gli indicatori = eseguire queste query sostituendo i placeholder (progetto/rilevazione/CF).

---

## 5. Architettura di allineamento
```
[ dwh.* (EAV, dati reali) ]  ->  [ public.dw_* (VISTE/MV di compatibilità) ]  ->  PostgREST/Supabase  ->  React (invariato)
```
- Nuovo progetto Supabase (isolato dal progetto attuale)
- Restore del dump nello schema `dwh`
- Viste `public.dw_*` che pivotano/trasformano l'EAV nel contratto atteso dai grafici
- App puntata al nuovo progetto (solo variabili `.env`)

## 6. Piano a fasi
- **A. Ambiente**: nuovo progetto Supabase + `pg_restore` (v17) del dump nello schema `dwh`.
- **B. Mapping**: matrice `raw_element/elementid` → colonna `dw_*` (dai dizionari `lk_questionari_elements` e dalle query indicatori). Vedi `analisi_dwh/`.
- **C. Viste** (`public`):
  - C1 `dw_ente` (pronta — vedi `views/dw_ente.sql`)
  - C2 pilota indicatori/Executive da `lk_anagrafica_indicatori.query`
  - C3 estensione a tutte le `dw_*` usate dai grafici (vedi `MAPPATURA_TABELLE_GRAFICI §C`)
- **D. Switch & validazione** grafico per grafico; gap → `DemoDataBadge`.

## 7. Note operative
- Il dump è **custom PG17**: restore con `pg_restore` v17 (`--no-owner --no-privileges`).
- Le viste in `public` vanno esposte via PostgREST con GRANT/RLS corretti per `anon`/`authenticated`.
- I fatti reali sono per **rilevazione** (es. `2024-12`) e **progetto** (es. `GRU`, `RiVa`): le viste devono scegliere/parametrizzare rilevazione e progetto.

## 7-bis. VALIDAZIONE su dati reali (eseguita)\nDump ripristinato in un PostgreSQL 17 locale e viste costruite/testate sui **dati veri**:\n\n| Elemento | Esito |\n|---|---|\n| Restore `dwh` | OK (solo `lk_shp_*` geografiche saltate: richiedono PostGIS) |\n| Dati | `lk_questionari_enti` 23.594 · `lk_comuni` 8.093 · `ft_questionari_globale` 36.992 · indicatori 25 · elements 62 |\n| **`public.dw_ente`** | ✅ costruita e validata (23.594 enti) → `views/dw_ente.sql` |\n| **`public.v_kpi_ente_wide`** | ✅ pivot EAV→wide validato: 619 righe, **264 enti monitorati**, 78 metriche → `views/v_kpi_ente_wide.sql` |\n| Calcolo indicatore reale | ✅ es. assunti TI (raw_element 2.1, GRU, 2024-12) = 2359; Brescia 149, Padova 99... |\n\n**Nota**: solo **264 enti** hanno dati di questionario (su 23.594 in anagrafica) — è il set realmente monitorato.\n**Chiave di join dei fatti = `cf_ente` (codice fiscale)** → `id_ente` risolto via `lk_questionari_enti`.\n\n### Viste prodotte (in `views/`)\n- `dw_ente.sql` — anagrafica ente (validata)\n- `v_kpi_ente_wide.sql` — pivot base per-ente da cui derivare `dw_kpi_rilevazione` e i fatti (validata)\n\n### Prossimi passi\n- Da `v_kpi_ente_wide` derivare `public.dw_kpi_rilevazione` (rinominare `q_<dim>_<n>` → nomi attesi) e le `dw_*` dei fatti.\n- Ricostruire `dw_verifica_indicatori` dalle 25 query di `lk_anagrafica_indicatori` (per-ente).\n- Esporre le viste via PostgREST (GRANT SELECT a `anon`/`authenticated`).\n\n## 8. Allegati di analisi (in `analisi_dwh/`)
- `elements.txt` — dizionario dei 64 element
- `indicatori.txt` — i 27 indicatori con le query di calcolo
