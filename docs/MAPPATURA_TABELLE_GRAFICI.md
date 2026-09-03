# Mappatura Tabelle ↔ Grafici / Sezioni

> **Scopo**: elenco di tutte le tabelle da cui l'applicativo React legge i dati, con l'indicazione
> del grafico/sezione che le usa e della **chiave ente**. Serve a ricreare in Postgres delle
> **materialized view** con **nome e colonne identici**, così il frontend continua a funzionare
> senza modifiche.
>
> Strategia validata: le MV fanno da "adapter" lato DB. Il contratto (nomi tabella + colonne)
> deve restare identico a quello attuale; cambia solo la sorgente dietro le MV.

---

## A. Chiave ente per tabella (fondamentale per le MV)

Il filtro "per ente" **non è uniforme**: ogni tabella referenzia l'ente in modo diverso.
La MV deve **esporre la stessa colonna** con lo stesso nome e semantica.

| Tabella | Colonna ente | Tipo | Note |
|---------|--------------|------|------|
| `dw_ente` | `id_ente` | int (PK) | anagrafica ente principale; ha anche `cfiscale`, `codice_ipa` |
| `lk_enti` | `ente_id` | int (PK) | anagrafica usata dal dominio **SIPRO**; ha `codice_ipa` |
| `dw_kpi_rilevazione` | `id_ente` | int | ha anche `cfiscale` |
| `dw_verifica_indicatori` | `id_ente` | int | indicatori pre-calcolati per ente |
| `dw_bridge_profilo_competenza` | `id_ente` | int | ha anche `cfiscale_ente` |
| `dw_minerva_assessment` | `id_ente` | int | |
| `dw_profilo_di_ruolo` | `id_ente` | int | |
| `dw_inpa_bandi` | `id_ente` | int | ha anche `cfiscale_pa` |
| `dw_lp_graduatorie` | `id_ente` | int | ha anche `cfiscale_amm` |
| `dw_occupazione` | `istituzione` | int | riferimento ente = colonna `istituzione` |
| `dw_assunti` | `istituzione` | int | |
| `dw_cessati` | `istituzione` | int | |
| `dw_eta` | `istituzione` | int | |
| `dw_formazione` | `istituzione` | int | |
| `dw_modalita_lavoro` | `istituzione` | int | |
| `dw_passaggi_qualifica` | `istituzione` | int | |
| `dw_ptfp_dotazione` | `cfiscale_amm` | text | ente identificato da CF |
| `dw_ptfp_reclutamento` | `cfiscale_amm` | text | |
| `dw_syllabus_pa` | `cfiscale` | text | ente identificato da CF |
| `dw_inpa_candidati` | *(via `id_bando`)* | — | collegato all'ente tramite `dw_inpa_bandi` |
| `dw_syllabus_partecipazioni` | *(via `id_pa`)* | — | collegato alla PA syllabus |
| `ft_sipo_*` (processi/UO/organizzazione) | `ente_id` | int | dominio SIPRO |
| Tabelle `dw_causali`, `dw_fascia_eta`, `dw_competenza`, `dw_famiglia_professionale`, `dw_syllabus_catalogo` | — | — | **lookup**, non filtrate per ente |
| Tabelle `lk_sipo_*`, `lk_minerva_*`, `lk_picchi_*` | — | — | **lookup** statiche SIPRO/Minerva |

---

## B. Grafici / Sezioni → Tabelle

### 1. Anagrafica & Selezione Ente
- **Login / selezione ente**, header, filtri → `dw_ente`
- (SIPRO usa `lk_enti` per denominazioni — vedi §7)

### 2. Occupazione / Genere / Modalità di lavoro
- Occupazione, distribuzione genere → `dw_occupazione`
- Modalità di lavoro (agile, telelavoro, ecc.) → `dw_modalita_lavoro`, `dw_occupazione`

### 3. Assunzioni / Cessazioni / Turnover / Sostituzione
- Assunti → `dw_assunti`, `dw_occupazione`, `dw_causali`
- Cessati / Cessazioni → `dw_cessati`, `dw_occupazione`, `dw_causali`
- Turnover, Tasso di sostituzione → `dw_assunti` + `dw_cessati` + `dw_occupazione`
- Passaggi di qualifica / progressioni → `dw_passaggi_qualifica`

### 4. Età / Demografia
- Distribuzione per fasce d'età → `dw_eta`, `dw_fascia_eta`

### 5. Formazione
- Copertura e intensità formativa → `dw_formazione`, `dw_occupazione`

### 6. KPI Riforma / Indicatori Executive
- KPI rilevazione (semestrale) → `dw_kpi_rilevazione`
- KPI abilitanti / IAC → `dw_kpi_rilevazione`
- Indicatori pre-calcolati per ente → `dw_verifica_indicatori`
- D1 (adesione catalogo, copertura profili) → `dw_kpi_rilevazione`, `dw_bridge_profilo_competenza`, `dw_ente`

### 7. Minerva (Competenze / Profili professionali)
- Assessment competenze → `dw_minerva_assessment`
- Profili / famiglie / competenze → `dw_profilo_di_ruolo`, `dw_famiglia_professionale`, `dw_competenza`, `dw_bridge_profilo_competenza`
- Reclutamento PTFP → `dw_ptfp_reclutamento`

### 8. InPA (Reclutamento / Bandi)
- Bandi → `dw_inpa_bandi`
- Candidati / candidature → `dw_inpa_candidati`
- Graduatorie → `dw_lp_graduatorie`

### 9. Lavoro Pubblico
- Dotazione organica → `dw_ptfp_dotazione`, `dw_occupazione`
- Graduatorie concorsuali → `dw_lp_graduatorie`

### 10. Syllabus (Formazione competenze digitali)
- Catalogo corsi → `dw_syllabus_catalogo`
- PA partecipanti → `dw_syllabus_pa`
- Partecipazioni / discenti → `dw_syllabus_partecipazioni`

### 11. SIPRO — Organizzazione & Processi (mappatura per singolo grafico)
| Grafico / Componente | Tabelle |
|---|---|
| `SiproFilters` | `lk_enti` |
| `SiproIndicatorSection` | `ft_sipo_organizzazione`, `ft_sipo_provvedimenti_organizzazione`, `lk_enti`, `lk_sipo_copertura_profili_di_ruolo`, `lk_sipo_profili_di_ruolo`, `lk_sipo_stato_organizzazione` |
| `FteDotazioneChart` | `ft_sipo_uo`, `lk_enti` |
| `UoDistributionChart` | `ft_sipo_uo`, `lk_enti` |
| `CriticitaUoChart` | `ft_sipo_criticita_uo`, `ft_sipo_uo`, `lk_sipo_criticita_uo`, `lk_enti` |
| `CriticitaProcessiChart` | `ft_sipo_criticita_processi`, `ft_sipo_fasi`, `ft_sipo_processi`, `lk_sipo_criticita_processi`, `lk_sipo_semplificazione_processi` |
| `ProcessiDettaglioTable` | `ft_sipo_criticita_processi`, `ft_sipo_processi`, `lk_sipo_criticita_processi`, `lk_sipo_grado_rilevanza_processi`, `lk_sipo_obiettivi_strategici_processi`, `lk_sipo_semplificazione_processi`, `lk_sipo_tipologia_funzione` |
| `ProcessiDistribuzioneChart` | `ft_sipo_processi`, `lk_enti`, `lk_sipo_tipologia_funzione` |
| `CoinvolgimentoUoChart` | `ft_sipo_fasi`, `ft_sipo_fasi_uo_partecipanti`, `ft_sipo_processi` |
| `DigitalizzazioneFasiChart` | `ft_sipo_fasi`, `ft_sipo_processi`, `lk_sipo_lavoro_agile_fasi`, `lk_sipo_livello_digitalizzazione_fasi`, `lk_sipo_outsourcing_fasi` |
| `TempiPicchiChart` | `ft_sipo_processi`, `lk_picchi_frequenza_annuale_processi`, `lk_picchi_intensita_processi` |
| `ProfiliRuoloProcessoChart` | `ft_sipo_processi`, `ft_sipo_fasi`, `ft_sipo_profili_di_ruolo_fasi`, `lk_sipo_profili_di_ruolo`, `lk_minerva_ambito_ruolo`, `lk_minerva_area_contrattuale` |
| `ProfiliRuoloCatalogoChart` | `ft_sipo_profili_di_ruolo_fasi`, `lk_sipo_profili_di_ruolo`, `lk_minerva_ambito_ruolo`, `lk_minerva_area_contrattuale`, `lk_minerva_famiglia_professionale` |

### 12. User Journeys (funzionalità narrativa/esplorativa)
- `user_journeys`, `user_journey_steps`, `user_journey_step_indicators`, `user_journey_likes`
- *(dati applicativi, non legati agli enti del DW)*

---

## C. Elenco completo tabelle da ricreare come Materialized View

### Dominio DW (dashboard principale)
`dw_ente`, `dw_kpi_rilevazione`, `dw_verifica_indicatori`, `dw_bridge_profilo_competenza`,
`dw_occupazione`, `dw_assunti`, `dw_cessati`, `dw_eta`, `dw_fascia_eta`, `dw_formazione`,
`dw_modalita_lavoro`, `dw_passaggi_qualifica`, `dw_causali`, `dw_minerva_assessment`,
`dw_profilo_di_ruolo`, `dw_famiglia_professionale`, `dw_competenza`, `dw_ptfp_dotazione`,
`dw_ptfp_reclutamento`, `dw_inpa_bandi`, `dw_inpa_candidati`, `dw_lp_graduatorie`,
`dw_syllabus_catalogo`, `dw_syllabus_pa`, `dw_syllabus_partecipazioni`

### Anagrafica SIPRO
`lk_enti`

### Dominio SIPRO — Fact
`ft_sipo_organizzazione`, `ft_sipo_provvedimenti_organizzazione`, `ft_sipo_uo`,
`ft_sipo_criticita_uo`, `ft_sipo_processi`, `ft_sipo_criticita_processi`, `ft_sipo_fasi`,
`ft_sipo_fasi_uo_partecipanti`, `ft_sipo_profili_di_ruolo_fasi`

### Dominio SIPRO / Minerva — Lookup
`lk_sipo_copertura_profili_di_ruolo`, `lk_sipo_profili_di_ruolo`, `lk_sipo_stato_organizzazione`,
`lk_sipo_criticita_uo`, `lk_sipo_criticita_processi`, `lk_sipo_semplificazione_processi`,
`lk_sipo_grado_rilevanza_processi`, `lk_sipo_obiettivi_strategici_processi`,
`lk_sipo_tipologia_funzione`, `lk_sipo_lavoro_agile_fasi`, `lk_sipo_livello_digitalizzazione_fasi`,
`lk_sipo_outsourcing_fasi`, `lk_minerva_ambito_ruolo`, `lk_minerva_area_contrattuale`,
`lk_minerva_famiglia_professionale`, `lk_picchi_frequenza_annuale_processi`,
`lk_picchi_intensita_processi`

### Funzionalità applicativa (non DW)
`user_journeys`, `user_journey_steps`, `user_journey_step_indicators`, `user_journey_likes`,
`profiles`

---

## D. Checklist per la creazione delle Materialized View

1. **Nome identico** alla tabella attuale (es. la MV si deve chiamare `dw_occupazione`).
2. **Stesse colonne** (nome + tipo compatibile) usate dai grafici — vedi §A/§B.
3. **Mantenere la colonna chiave ente** con lo **stesso nome** (`id_ente` / `istituzione` /
   `cfiscale` / `ente_id`), altrimenti il filtro per ente si rompe.
4. Esporre le MV via **PostgREST/Supabase** con i permessi/RLS corretti.
5. Popolare le **lookup** (nomi, descrizioni) coerenti con i codici usati nei fatti.
6. Verificare i **tipi** (nel DW attuale molte colonne `q*` di `dw_kpi_rilevazione` sono `text`:
   se nel DB reale sono numeriche, castarle a `text` nella MV per mantenere il contratto).
7. `REFRESH MATERIALIZED VIEW` schedulato (o `CONCURRENTLY`) secondo la frequenza dei dati.

> **Nota**: la mappa chiave-ente (§A) è cruciale. Se nel DB reale l'ente ha una chiave unica
> (es. codice fiscale), la MV può fare il join/lookup per **riprodurre** la colonna attesa
> (es. generare un `id_ente`/`istituzione` coerente con `dw_ente.id_ente`).


---

## E. Colonne usate per ogni tabella (per il `SELECT` delle MV)

> Estratte automaticamente dalle chiamate `.select()/.eq()/.order()` del codice.

> Dove compare `SELECT *`, la MV deve esporre **tutte** le colonne della tabella originale.


### `dw_assunti`

- **Colonne lette**: `anno`, `causale`, `donne`, `uomini`
- **Colonne per filtro/ordinamento** (devono esistere): `anno`, `istituzione`

### `dw_bridge_profilo_competenza`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)
- **Colonne lette**: `cod_competenza`, `cod_profilo_di_ruolo`, `dipendenti_totali_profilo`, `dipendenti_valutati`, `id_ente`, `livello_target`, `livello_valutato_medio`
- **Colonne per filtro/ordinamento** (devono esistere): `id_ente`

### `dw_causali`

- **Colonne lette**: `cod_alfa`, `descrizione`
- **Colonne per filtro/ordinamento** (devono esistere): `anno`

### `dw_cessati`

- **Colonne lette**: `anno`, `causale`, `donne`, `uomini`
- **Colonne per filtro/ordinamento** (devono esistere): `anno`, `istituzione`

### `dw_competenza`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `dw_ente`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)
- **Colonne lette**: `categoria_cruscotto`, `comparto`, `denominazione`, `id_ente`, `organico_2023`, `regione`
- **Colonne per filtro/ordinamento** (devono esistere): `categoria_cruscotto`, `comparto`, `denominazione`, `id_ente`, `regione`

### `dw_eta`

- **Colonne lette**: `anno`, `donne`, `fascia_eta`, `uomini`
- **Colonne per filtro/ordinamento** (devono esistere): `anno`, `istituzione`

### `dw_famiglia_professionale`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `dw_fascia_eta`

- **Colonne lette**: `classe`, `codice`, `eta_min`
- **Colonne per filtro/ordinamento** (devono esistere): `eta_min`

### `dw_formazione`

- **Colonne lette**: `anno`, `form_donne`, `form_uomini`, `ore_media_d`, `ore_media_u`

### `dw_inpa_bandi`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)
- **Colonne lette**: `anno`, `num_candidature_submitted`, `num_posti`, `regione`, `settore_pubblicazione`, `stato_bando`, `tipo_procedura`
- **Colonne per filtro/ordinamento** (devono esistere): `data_pubblicazione`, `id_ente`

### `dw_inpa_candidati`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `dw_kpi_rilevazione`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)
- **Colonne lette**: `denominazione`, `id_ente`, `q1_1_adozione_modello`, `q1_5_n_profili_definiti`, `q1_6_n_profili_competenze`, `q2_5_assessment`, `q6_tep_personale`
- **Colonne per filtro/ordinamento** (devono esistere): `id_ente`

### `dw_lp_graduatorie`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)
- **Colonne lette**: `num_posti_banditi`, `num_vincitori_assunti`, `tcp_giorni`
- **Colonne per filtro/ordinamento** (devono esistere): `id_ente`

### `dw_minerva_assessment`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `dw_modalita_lavoro`

- **Colonne lette**: `anno`, `lavoro_agile_d`, `lavoro_agile_u`, `reperibilita_d`, `reperibilita_u`, `telelavoro_d`, `telelavoro_u`, `turnazione_d`, `turnazione_u`

### `dw_occupazione`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)
- **Colonne lette**: `anno`, `pt_inf50_d`, `pt_inf50_u`, `pt_sup50_d`, `pt_sup50_u`, `qualifica`, `tp_donne`, `tp_uomini`
- **Colonne per filtro/ordinamento** (devono esistere): `anno`, `istituzione`

### `dw_passaggi_qualifica`

- **Colonne lette**: `anno`, `numero_passaggi`, `tipo_passaggio`

### `dw_profilo_di_ruolo`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `dw_ptfp_dotazione`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `dw_ptfp_reclutamento`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `dw_syllabus_catalogo`

- *(nessuna colonna esplicita rilevata — verificare nel service dedicato)*

### `dw_syllabus_pa`

- *(nessuna colonna esplicita rilevata — verificare nel service dedicato)*

### `dw_syllabus_partecipazioni`

- *(nessuna colonna esplicita rilevata — verificare nel service dedicato)*

### `ft_sipo_criticita_processi`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `ft_sipo_criticita_uo`

- **Colonne lette**: `criticita_id`, `uo_id`

### `ft_sipo_fasi`

- **Colonne lette**: `fase_id`, `in_outsourcing`, `lavoro_agile`, `lavoro_agile_id`, `livello_digitalizzazione_id`, `outsourcing_id`, `processo_id`

### `ft_sipo_fasi_uo_partecipanti`

- **Colonne lette**: `fase_id`, `uo_partecipante_id`

### `ft_sipo_organizzazione`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)
- **Colonne lette**: `ente_id`, `organizzazione_id`

### `ft_sipo_processi`

- **Colonne lette**: `coinvolgimento_amministrazioni`, `denominazione`, `ente_id`, `giorni_previsti`, `grado_rilevanza_id`, `obiettivo_strategico_id`, `picchi_frequenza_id`, `picchi_intensita_id`, `picchi_stagionali`, `presidio_continuativo`, `processo_id`, `processo_semplificazione_id`, `tempo_medio_effettivo`, `tipologia_id`
- **Colonne per filtro/ordinamento** (devono esistere): `data_fine`, `ente_id`

### `ft_sipo_profili_di_ruolo_fasi`

- **Colonne lette**: `fase_id`, `fte_assegnati`, `fte_programmati`, `profilo_fase_id`, `sipo_profilo_di_ruolo_id`

### `ft_sipo_provvedimenti_organizzazione`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `ft_sipo_uo`

- **Colonne lette**: `denominazione`, `ente_id`, `livello_gerarchico`, `livello_resp_id`, `lk_sipo_livelli_resp_uo`, `risorse_dotazione`, `risorse_servizio_tempo_ind`, `uo_id`
- **Colonne per filtro/ordinamento** (devono esistere): `data_fine_validita`, `denominazione`, `ente_id`

### `lk_enti`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)
- **Colonne lette**: `denominazione`, `ente_id`
- **Colonne per filtro/ordinamento** (devono esistere): `denominazione`

### `lk_minerva_ambito_ruolo`

- **Colonne lette**: `descrizione`, `id`

### `lk_minerva_area_contrattuale`

- **Colonne lette**: `descrizione`, `id`

### `lk_minerva_famiglia_professionale`

- **Colonne lette**: `descrizione`, `id`

### `lk_picchi_frequenza_annuale_processi`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `lk_picchi_intensita_processi`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `lk_sipo_copertura_profili_di_ruolo`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `lk_sipo_criticita_processi`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `lk_sipo_criticita_uo`

- **Colonne lette**: `categoria`, `criticita_id`, `descrizione`

### `lk_sipo_grado_rilevanza_processi`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `lk_sipo_lavoro_agile_fasi`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `lk_sipo_livello_digitalizzazione_fasi`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `lk_sipo_obiettivi_strategici_processi`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `lk_sipo_outsourcing_fasi`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `lk_sipo_profili_di_ruolo`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)
- **Colonne lette**: `ente_id`, `id_ambito_ruolo`, `id_area_contrattuale`, `id_famiglia_professionale`, `id_minerva_profilo_professionale`, `profilo_ruolo`, `profilo_ruolo_id`
- **Colonne per filtro/ordinamento** (devono esistere): `data_eliminazione`, `ente_id`

### `lk_sipo_semplificazione_processi`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `lk_sipo_stato_organizzazione`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `lk_sipo_tipologia_funzione`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)

### `user_journey_step_indicators`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)
- **Colonne per filtro/ordinamento** (devono esistere): `step_id`

### `user_journey_steps`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)
- **Colonne lette**: `id`
- **Colonne per filtro/ordinamento** (devono esistere): `journey_id`, `step_order`

### `user_journeys`

- **SELECT** `*` → includere **tutte le colonne** (vedi schema completo)
- **Colonne lette**: `id`
- **Colonne per filtro/ordinamento** (devono esistere): `created_at`, `id`
