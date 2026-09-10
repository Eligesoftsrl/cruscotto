# Riepilogo tecnico — Integrazione scheda "Analisi per età" (Conto Annuale)

## 1. Cosa è stato fatto (in breve)
Collegata la scheda **Conto Annuale → Analisi per età** al DB reale `progetto-gru`,
**sostituendo i dati demo con le chiamate RPC reali** e **unificando i filtri** in un'unica
barra a "pill" in alto, a cascata. Sezioni non richieste disattivate.

## 2. Architettura d'integrazione
- Il backend espone **funzioni RPC** `fa_ca_*` (dati già calcolati) + il dizionario filtri
  `mv_filtri`. **Nessuna tabella `dw_*`** (le viste `dw_*` create in precedenza NON servono a
  questo DB; restano come documentazione).
- Nuovo **service layer** dedicato:
  - `src/services/ca/analisiEtaService.ts` — 6 RPC + builder che **omette i parametri vuoti**
    (una stringa vuota su PostgREST azzererebbe il risultato) e gestisce la regola `p_genere`.
  - `src/services/ca/filtriService.ts` — legge `mv_filtri` (cascata Comparto→Macro→Categoria).
  - `src/integrations/supabase/untyped.ts` — client isolato per RPC/`mv_filtri` (fuori dai tipi generati).
  - `src/hooks/useAnalisiEta.ts` — hook React Query per le 6 chiamate.
- **Filtri unificati**: riscritto `src/components/dashboard/FilterPills.tsx` per essere
  **data-driven da `mv_filtri`** con cascata; rimossa la barra `GlobalFilterBar` (riga "FILTRI"
  duplicata) da `src/pages/Index.tsx` e la filter-bar interna alla scheda. Resta **una sola riga
  di pill**: Macrocategoria · Categoria · Genere · Anno · Comparto · Regione.
- Scheda ricablata: `src/components/dashboard/AnalisiEtaContent.tsx` legge i filtri globali
  (`FilterContext`) e alimenta 5 KPI, piramide, evoluzione (toggle U/D/T), benchmark
  (Comparto/Regione), tabella genere/fascia.

## 3. Mappatura chiamata → dati (campi REALI, verificati live)
| Componente | RPC | Campi output reali |
|---|---|---|
| Personale in servizio | `fa_ca_personale_servizio` | `personale`, `personale_var_prec_pct`, `personale_min_storico`, `personale_max_storico` |
| Età media / Over55 / Under35 | `fa_ca_eta` | `eta_media`, `eta_var_prec`, `eta_cluster`, `eta_pa`, `over_55(+_var_prec_pp,_cluster,_gap_pp)`, `under_35(...)` |
| Anzianità media | `fa_ca_anzianita_media` | `anzianita_media`, `anzianita_var_prec`, `anzianita_cluster`, `anzianita_pa` |
| Piramide + Tabella | `fa_ca_eta_fasce_genere` | `ordine`, `fascia_eta`, `uomini`, `uomini_grafico`, `donne`, `tutti`, `donne_pct`, `donne_pa_pct`, `delta_pa_pp` |
| Evoluzione | `fa_ca_eta_evoluzione` | `anno`, `eta_selezione`, `eta_cluster`, `eta_pa` |
| Benchmark | `fa_ca_eta_benchmark` | `gruppo_codice`, `gruppo_descrizione`, `personale`, `eta_gruppo`, `eta_selezione` |

Parametri (omessi se vuoti): `p_anno, p_istituzione, p_codice_fiscale, p_comparto,
p_macrocategoria, p_categoria, p_regione, p_genere(T→omesso), p_dimensione(comparto/regione)`.
Cascata via `mv_filtri`: comparto→ `chiave_padre='comparto:<cod>'`; categoria→ `chiave` della macro.
Regione: `codice` = nome (es. `LAZIO`).

## 4. Test eseguiti sulle query fornite (esiti reali 2023)
| Chiamata | Esito |
|---|---|
| `fa_ca_personale_servizio` (PA) | 200 · **3.327.854** (+1,7%; min 3.180.719 / max 3.388.794) |
| `fa_ca_eta` (PA) | 200 · età **48,9** · over55 **36,0%** · under35 **15,3%** |
| `fa_ca_anzianita_media` (PA) | 200 · **16,3** aa |
| `fa_ca_eta_fasce_genere` (PA) | 200 · 7 fasce (≤25…>60 + Tutti) |
| `fa_ca_eta_evoluzione` (PA) | 200 · serie 2012–2023 |
| `fa_ca_eta_benchmark` comparto/regione | 200 · 6 comparti / regioni |
| `fa_ca_eta` `p_comparto=FL` | 200 · età **51,8** · over55 **45,6%** |
| `fa_ca_eta` `FL` + `p_macrocategoria=NF` (dirigenti) | 200 · età **56,3** · over55 **62,6%** |
| `fa_ca_eta` `p_regione=LAZIO` | 200 · età **48,9** (over55 36,6%) |
| `fa_ca_eta_evoluzione` `p_genere=D` | 200 · serie donne |
| `fa_ca_eta` `p_istituzione=C6144` (Roma) | 200 · età **53,1** · over55 **47,4%** |

## 5. Bug trovati grazie ai test (e corretti)
I nomi dei campi di 3 RPC differivano dall'ipotesi iniziale (Excel), causando **grafici vuoti**:
- `fa_ca_personale_servizio`: `personale_var_prec_pct/_min_storico/_max_storico` (non `var_pct_prec/min/max`) → card Personale mostrava "Min/Max 0".
- `fa_ca_eta_evoluzione`: `eta_selezione/eta_cluster/eta_pa` (non `valore_*`) → grafico Evoluzione **vuoto**.
- `fa_ca_eta_benchmark`: `gruppo_descrizione/eta_gruppo/eta_selezione` (non `etichetta/valore_*`) → Benchmark **vuoto**.
Tutti allineati ai nomi reali e verificati a schermo.

## 6. Sezioni disattivate (indicazione committente)
- Menu: **InPA, Minerva, Syllabus, Lavoro Pubblico** rimossi.
- **Vista Sintetica**: pillar **D1** e **D3** nascosti.
- Benchmark: toggle **"Tipo amm."** eliminato.

## 7. Ambiente
- `.env`: credenziali reali (Supabase `api-cr.progetto-gru.it` + Keycloak realm `gru`).
- `.env.local` (gitignored): disabilita Keycloak in locale per demo con login mock. In produzione
  Keycloak resta attivo. Nessuna scrittura sul Supabase (solo letture).

## 8. Prossimi passi
- Selettore **ente** (`p_istituzione`/`p_codice_fiscale` da `mv_filtri`) o da profilo Keycloak (CF).
- Migrazione stesse modalità per le prossime schede (Assunzioni, Cessazioni, …).
- Rimozione componenti demo non più usati (KpiStrip/PyramidChart/EtaLineChart/BenchmarkDotPlot/GenereTable).
