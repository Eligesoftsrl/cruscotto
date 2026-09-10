# Mappatura scheda "Conto Annuale — Analisi per età" (RPC reali)

> Documento di mappatura **componente → chiamata (RPC) → campi**. Verificato dal vivo sul
> Supabase reale (`https://api-cr.progetto-gru.it`). Il backend espone **funzioni RPC**
> (`/rest/v1/rpc/...`) e il **dizionario filtri** `mv_filtri`. Non esistono tabelle `dw_*`.

## 1. Chiamate → componenti → campi di output (reali)

| Componente scheda | RPC | Campi output reali |
|---|---|---|
| KPI **Personale in servizio** | `fa_ca_personale_servizio` | `personale`, `var_pct_prec`, `min_storico`, `max_storico` |
| KPI **Età media**, **Quota over 55**, **Quota under 35** (una sola chiamata) | `fa_ca_eta` | `eta_media`, `eta_var_prec`, `eta_cluster`, `eta_pa`, `over_55`, `over_55_var_prec_pp`, `over_55_cluster`, `over_55_gap_pp`, `under_35`, `under_35_var_prec_pp`, `under_35_cluster`, `under_35_gap_pp` |
| KPI **Anzianità media** | `fa_ca_anzianita_media` | `anzianita_media`, `anzianita_var_prec`, `anzianita_cluster`, `anzianita_pa` |
| **Piramide per età e genere** + **Tabella genere/fascia** (una sola chiamata) | `fa_ca_eta_fasce_genere` | `ordine`, `fascia_eta`, `uomini`, `uomini_grafico` (negativo, per piramide), `donne`, `tutti`, `donne_pct`, `donne_pa_pct`, `delta_pa_pp` |
| **Evoluzione età media (2012→)** | `fa_ca_eta_evoluzione` | `anno`, `valore_amm`, `valore_cluster`, `valore_pa` |
| **Benchmark età media** | `fa_ca_eta_benchmark` | `etichetta`, `valore_gruppo`, `valore_amm` |

Esempi reali verificati (2023):
- PA totale — `fa_ca_eta`: età media **48,9**, over55 **36,0%**, under35 **15,3%**.
- Roma Capitale (`C6144`) — `fa_ca_eta`: età **53,1**; cluster **51,8**; PA **48,9**; gap over55 **+1,8pp**.

## 2. Parametri delle RPC

| Parametro | Origine UI | Valori | Se omesso |
|---|---|---|---|
| `p_anno` | tendina Anno | intero (es. 2023) | default funzione |
| `p_istituzione` | selettore ente | codice istituzione (es. `C6144`) | tutte le PA |
| `p_codice_fiscale` | selettore ente (alternativo) | CF ente | tutte le PA |
| `p_comparto` | pillola Comparto | codice (es. `FL`) | tutti |
| `p_macrocategoria` | pillola Macrocategoria | codice | tutte |
| `p_categoria` | pillola Categoria | codice | tutte |
| `p_regione` | pillola Regione | nome (es. `LAZIO`) | tutte |
| `p_genere` | pillola/toggle Genere | `T` / `U` / `D` | = `T` |
| `p_dimensione` | toggle Benchmark | `comparto` / `regione` | sempre esplicito |

**Regole d'oro:**
- La chiave del parametro si **OMETTE** se il valore è null/undefined/"" (mai stringa vuota: PostgREST la interpreta come `''`, non `NULL`, azzerando il risultato).
- `p_genere` **non** si invia a **piramide** e **tabella** (mostrano entrambi i generi).
- Nell'**evoluzione** il toggle U/D/T locale scrive su `p_genere` e ha **precedenza** sulla pillola globale Genere.
- `p_dimensione` è l'unico parametro sempre esplicito (non ha valore "Tutti").

## 3. Filtri a cascata (da `mv_filtri`)
Cascata **Comparto → Macrocategoria → Categoria**; `Anno`, `Regione`, `Genere` indipendenti.
`mv_filtri` è **partizionata per anno**: cambiare `p_anno` invalida i menu a cascata.

```
# Menu comparti
/rest/v1/mv_filtri?select=chiave,codice,descrizione&tipo=eq.comparto&anno=eq.2023&order=ordine,descrizione

# Menu macrocategorie del comparto scelto (es. FL)
/rest/v1/mv_filtri?select=chiave,codice,descrizione,chiave_padre&tipo=eq.macrocategoria&anno=eq.2023&chiave_padre=eq.comparto:FL&order=ordine,descrizione

# Menu categorie della macrocategoria scelta
/rest/v1/mv_filtri?select=chiave,codice,descrizione,chiave_padre&tipo=eq.categoria&anno=eq.2023&chiave_padre=eq.<CHIAVE_MACRO>&order=ordine,descrizione

# CF ente da codice istituzione
/rest/v1/mv_filtri?select=codice,descrizione&tipo=eq.codice_fiscale&anno=eq.2023&codice_padre=eq.C6144
```
Esempi reali comparti: `FC` Funzioni Centrali, `FL` Funzioni Locali, `SA` Sanità, `IR` Istruzione e Ricerca, `AF` Autonomo/Fuori comparto, `DP` Diritto pubblico.
Macrocategorie di `FL`: `NF` Dirigenti, `CO` Personale del comparto, `DV` Personale direttivo, `AP` Altro personale, `AT` Docente/Tecnico-amm.

## 4. Chiamate REST pronte (stato schermata: 2023, Roma Capitale `C6144`)
```
/rest/v1/rpc/fa_ca_personale_servizio?p_anno=2023&p_istituzione=C6144
/rest/v1/rpc/fa_ca_eta?p_anno=2023&p_istituzione=C6144
/rest/v1/rpc/fa_ca_anzianita_media?p_anno=2023&p_istituzione=C6144
/rest/v1/rpc/fa_ca_eta_fasce_genere?p_anno=2023&p_istituzione=C6144
/rest/v1/rpc/fa_ca_eta_evoluzione?p_anno=2023&p_istituzione=C6144
/rest/v1/rpc/fa_ca_eta_benchmark?p_anno=2023&p_istituzione=C6144&p_dimensione=comparto
/rest/v1/rpc/fa_ca_eta_benchmark?p_anno=2023&p_istituzione=C6144&p_dimensione=regione
```
Da `@supabase/supabase-js`: `supabase.rpc("fa_ca_eta", { p_anno: 2023, p_istituzione: "C6144" })`.

## 5. Elementi UI da disattivare (indicazione committente)
- Sezioni intere: **InPA**, **Minerva**, **Syllabus**, **Lavoro Pubblico**.
- **Vista Sintetica**: pillar **D1** e **D3** spenti.
- **Benchmark**: rimuovere il toggle **"Tipo amm."** (restano solo `Comparto`/`Regione`).

## 6. Note di calcolo
- `fa_ca_personale_servizio.min/max_storico`: se non presenti, derivarli dalla serie storica.
- `over_55_gap_pp`/`under_35_gap_pp`: già forniti dal server (differenza vs cluster).
- `delta_pa_pp` (tabella/piramide): già fornito; in mancanza, seconda chiamata senza `p_istituzione` e differenza lato client.
