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
