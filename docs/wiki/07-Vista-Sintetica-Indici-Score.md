# 7. Vista Sintetica · Indici con score [0-100] — Rapporto di realizzazione

> Documento di verifica da inoltrare a chi controlla gli indici.
> Si aggiorna **a ogni rilascio** (vedi il [registro delle realizzazioni](#registro-delle-realizzazioni)).
> Riferimenti: le mappature Excel `docs/mappature/executive/mappatura-executive-d2|d4|d5|d6-Filippo.xlsx`.

---

## 1. Che cosa è stato fatto (in breve)

| Pillar | Stato | Chiamata (RPC Supabase) | Indici reali | Indici mock-up |
|---|---|---|---|---|
| **D2** · Programmazione fabbisogno | ✅ Completato | `fa_ca_exec_d2_indicatori_score` | IGF, IRS, IDP_Norm, PTI, IRG_Norm | — |
| **D5** · Rewarding e carriera | ✅ Completato | `fa_ca_exec_d5_indicatori_score` | IDC, DPI_Norm, ICS_Norm | — |
| **D4** · Sviluppo professionale | ✅ Completato | `fa_ca_exec_d4_indicatori_score` | CGC, ICF_Norm, DPI_Norm, CQT | ISCP, IESF, ISTP_Norm, IDFP, ICRP, IEF_Norm, ICQ, ICEC |
| **D6** · Capacity building e performance | ✅ Completato | `fa_ca_exec_d6_indicatori_score` | TVO, ISG, TEP, IQP, IEQ, IPD, TEPD, VQF, IRG, **RTG**, **RRG**, **IRIC** | — |
| D1 · Rilevazione e classificazione | ⏳ Da fare | — | — | tutti (dati mock-up) |
| D3 · Recruiting | ⏳ Da fare | — | — | tutti (dati mock-up) |

**Note:**
- **RTG**, **RRG** e **IRIC** sono indici nuovi della D6, prima assenti dalla piattaforma. Ora compaiono nella Vista Sintetica, nella Vista Executive e nel menu laterale.
- **IFM_Norm** (D4) è stato **ritirato**: la RPC non lo restituisce più. È stato rimosso dalla pagina D4, dalla Vista Executive e dal menu.

---

## 2. Regole comuni a tutte le pagine

1. **Score in scala [0-100]**, senza il simbolo "%". La variazione rispetto all'anno precedente è espressa **in punti**, per esempio "+3 punti vs 2023".
2. **Badge** restituito dall'API, calcolato su `lk_intervalli_badge`:

   | Badge | Score da | Score fino a (escluso) |
   |---|---|---|
   | Basso | 0 | 25 |
   | Moderato | 25 | 50 |
   | Buono | 50 | 75 |
   | Eccellente | 75 | 101 |

   Per i soli indici mock-up il badge è calcolato dal frontend con le stesse soglie.
3. **Layout:**
   - indici di **sintesi** → **2 card per riga**;
   - indici **intermedi** → **3 card per riga**.

   Le card della stessa riga hanno le sezioni allineate (CSS *subgrid*: intestazione, badge, formula, componenti, pannelli, interconnessioni).
4. **Contenuto di ogni card:**
   - codice, pillar, nome, riga "Fonte" (testo statico);
   - score con arco, variazione, badge, valore dell'indice e dominio;
   - riquadro con la formula;
   - per i compositi, le barre dei componenti;
   - **pannelli che si aprono dentro la card**: *Scomposizione formula*, *Scheda metodologica* (Definizione · Calcolo · Lettura) e *Trend storico*;
   - interconnessioni con gli altri pillar (dall'API, escluso il pillar corrente).
5. **Scomposizione formula**, in due parti:
   - **Parte 1 · Calcolo dell'indice:** `componente_1`/`valore_1` (anno), `componente_2`/`valore_2` (anno), `dettagli` (se presenti), `formula_con_numeri`, poi → **Indice = `valore`**.
   - **Parte 2 · Normalizzazione dello score:** famiglia di scala (`descrizione_score`), passaggi intermedi calcolati nel frontend secondo la famiglia (vedi §4), `formula_score`, poi → **Score = `score`**.
6. **Lo score mostrato è sempre quello restituito dall'API.** I passaggi intermedi servono solo a rendere leggibile il calcolo e non sostituiscono il valore del backend.
7. **Filtri:**
   - Anno, Regione e Comparto (dalla barra filtri, valori da `mv_filtri`);
   - perimetro ente da Keycloak (`p_codice_fiscale`) o selettore multi-ente.

   I parametri vuoti non vengono inviati.
8. **Trend storico:** una chiamata per ogni anno disponibile in `mv_filtri`, fino all'anno selezionato, con gli stessi filtri.
9. **Dati mock-up:** badge "Dati mock-up" e riga "fonte non ancora collegata" in ogni card. Nella panoramica le barre sono tratteggiate e marcate con un asterisco. Non c'è trend storico. Il badge compare anche nella Vista Executive.
10. **Vista Executive:** le card dei pillar collegati mostrano lo score reale. La frase di lettura riporta valore dell'indice, dominio, score e famiglia di scala.

---

## 3. Parametri della chiamata

```
POST /rest/v1/rpc/fa_ca_exec_<dx>_indicatori_score
{
  "p_anno": 2024,                 // obbligatorio
  "p_istituzione": "C6144",       // opzionale (codice istituzione)
  "p_codice_fiscale": "...",      // opzionale (perimetro ente Keycloak)
  "p_comparto": "FC",             // opzionale (codice comparto mv_filtri)
  "p_regione": "LAZIO",           // opzionale (codice regione mv_filtri)
  "p_codici": ["IGF","IRS"]       // opzionale: senza, restituisce tutte le righe del pillar
}
```

Campi letti dalla risposta: `id, nome, descrizione, formula, interpretazione, dominio, unita, valore, componente_1, valore_1, anno_1, componente_2, valore_2, anno_2, formula_con_numeri, interconnessioni, dettagli, score, var_score, stato_score, famiglia_score, soglia_score, unita_soglia, descrizione_score, formula_score, badge`.

---

## 4. Passaggi di normalizzazione mostrati per famiglia (Parte 2)

| Famiglia (`famiglia_score`) | Indici | Passaggi mostrati dal frontend |
|---|---|---|
| Diretto [0;1] / Diretto centrato | IRS, IDP_Norm, PTI, ICS_Norm, CQT | "Non necessaria: score = indice × 100" |
| Target sul valore grezzo / Target su quota / Regola condivisa con D4 | IRG_Norm, ICF_Norm, DPI_Norm, IQP, IDLA | Valore (componente 1 / componente 2) · Target (`soglia_score` + `unita_soglia`) |
| Composito orientato | IGF, IDC, CGC | Score di ogni componente (+ per IGF: blocco strutturale = (score IRS + score IDP_Norm) / 2) |
| Variazione centrata (equivalente annuo) | TVO | Variazione triennale · r = ((2+TVO)/(2−TVO))^(1/3) · variazione annua equivalente 2(r−1)/(r+1) · Ampiezza |
| Variazione centrata (media annua) | TDLA | Variazione triennale · media annua = variazione / 3 · Ampiezza |
| Variazione centrata | IEQ, VQF | Variazione · Ampiezza |
| Variazione centrata inversa | TFL | Variazione triennale · media annua = variazione / 3 · Ampiezza |
| Progresso verso l'ottimo | TEPD | Variazione triennale · media annua = variazione / 3 · Ampiezza |
| Inverso [0;1] / Inverso non limitato | TEP, ISG | Valore (componente 1 / componente 2) |
| Inverso con soglia | IFL | Valore (componente 1 / componente 2) · Soglia |
| Ottimo centrale a 1 | IPD, RTG, RRG | Valore · Reciproco 1 / valore |
| Rapporto centrato a 1 | IRG | Valore · Scarto dalla parità (valore − 1) · Ampiezza |
| Ottimo a 0 | IRIC | Valore · Distanza dalla neutralità \|valore\| |

Tutte le famiglie chiudono con **"Calcolo score" = `formula_score`** e con **Score [0-100] = `score`**.

---

## 5. Valori di controllo (Italia, anno 2024, nessun filtro)

> Servono come riferimento per la verifica a video: aprire la pagina del pillar con anno 2024 e senza filtri.

### D2 · Programmazione fabbisogno
| Indice | Nome | Famiglia | Valore | Score | Var. (punti) | Badge |
|---|---|---|---|---|---|---|
| IGF *(sintesi)* | Indice di Governo strategico del Fabbisogno | Composito orientato | 0,57 | 54 | −2 | Buono |
| IRS | Indice di Replica Strutturale | Diretto [0;1] | 0,71 | 71 | +21 | Buono |
| IDP_Norm | Indice di Direzione della Progressività | Diretto centrato | 0,65 | 65 | −10 | Buono |
| PTI | Peso del Tempo Indeterminato sul reclutamento | Diretto [0;1] | 0,65 | 65 | −4 | Buono |
| IRG_Norm | Indice di Ricambio Generazionale | Target sul valore grezzo | 0,26 | 17 | −5 | Basso |

### D5 · Rewarding e carriera
| Indice | Nome | Famiglia | Valore | Score | Var. (punti) | Badge |
|---|---|---|---|---|---|---|
| IDC *(sintesi)* | Indice di Dinamicità della Carriera interna | Composito orientato | 0,29 | 46 | −1 | Moderato |
| DPI_Norm | Dinamicità del Personale Interna | Regola condivisa con D4 | 0,08 | 41 | +5 | Moderato |
| ICS_Norm | Indice di Crescita Strutturale | Diretto centrato | 0,50 | 50 | −9 | Buono |

### D4 · Sviluppo professionale
| Indice | Nome | Famiglia | Valore | Score | Var. (punti) | Badge |
|---|---|---|---|---|---|---|
| CGC *(sintesi)* | Capacità di Gestione delle Competenze | Composito orientato | 0,55 | 51 | +2 | Buono |
| ICF_Norm | Indice di intensità formativa normalizzato | Target sul valore grezzo | 0,57 | 13 | +1 | Basso |
| DPI_Norm | Dinamicità del Personale Interna | Target sul valore grezzo | 0,08 | 41 | +5 | Moderato |
| CQT | Coerenza Qualifiche e Titoli di studio | Diretto [0;1] | 0,99 | 99 | +1 | Eccellente |
| ISCP, IESF *(sintesi)* · ISTP_Norm, IDFP, ICRP, IEF_Norm, ICQ, ICEC | — | **Dati mock-up** | — | — | — | — |

### D6 · Capacity building e performance (nessun indice di sintesi, 4 gruppi)
| Gruppo | Indice | Nome | Famiglia | Valore | Score | Var. (punti) | Badge |
|---|---|---|---|---|---|---|---|
| Organico e ricambio | TVO | Tasso di Variazione dell'Organico | Variazione centrata | 0,04 | 57 | +3 | Buono |
| | ISG | Indice di Squilibrio Generazionale | Inverso non limitato | 0,86 | 54 | −4 | Buono |
| | TEP | Tasso di Esposizione al Pensionamento | Inverso [0;1] | 0,15 | 85 | −1 | Eccellente |
| Qualificazione | IQP | Indice Qualificazione Personale | Target su quota | 0,59 | 84 | +4 | Eccellente |
| | IEQ | Indice di Evoluzione della Qualificazione | Variazione centrata | 0,34 | 100 | 0 | Eccellente |
| Parità di genere | IPD | Indice di Parità Dirigenziale | Ottimo centrale a 1 | 0,83 | 83 | +1 | Eccellente |
| | TEPD | Variazione equilibrio di genere nella dirigenza (VEGD) | Progresso verso l'ottimo | 0,04 | 51 | 0 | Buono |
| | VQF | Variazione della Quota Femminile | Variazione centrata | 0,00 | 52 | 0 | Buono |
| | IRG | Indice di Riequilibrio di Genere nel ricambio | Rapporto centrato a 1 | 0,99 | 49 | −1 | Moderato |
| | **RTG** | Rapporto tassi di cessazione F/M | Ottimo centrale a 1 | 0,73 | 73 | −9 | Buono |
| | **RRG** | Rapporto di Ricambio complessivo per Genere | Ottimo centrale a 1 | 0,86 | 86 | −7 | Eccellente |
| | **IRIC** | Dinamica di genere del ricambio | Ottimo a 0 | 0,02 | 98 | −1 | Eccellente |
| Flessibilità | IFL | Indice di Flessibilità del Lavoro | Inverso con soglia | 0,03 | 89 | 0 | Eccellente |
| | TFL | Variazione incidenza lavoro flessibile (VILF) | Variazione centrata inversa | 0,00 | 51 | +1 | Buono |
| | IDLA | Indice di Diffusione del Lavoro Agile | Target su quota | 0,08 | 16 | +3 | Basso |
| | TDLA | Tasso di evoluzione del Lavoro Agile | Variazione centrata | 0,08 | 63 | n.d. | Buono |

---

## 6. Corrispondenze di codice (menu laterale / Vista Executive → RPC)

| Codice usato nel menu / Executive | Codice RPC | Motivo |
|---|---|---|
| `TCF` (D4) | `ICF_Norm` | L'indice è stato rinominato nella RPC. In menu ora si chiama "Intensità formativa normalizzata". |
| `DPI_Norm_D5` (D5) | `DPI_Norm` | Evita la collisione con il DPI_Norm della D4. |
| `IRG_genere` (D6) | `IRG` | Evita la collisione con l'IRG_Norm della D2. |

---

## 7. Punti aperti da verificare con il backend

1. **D5.DPI_Norm e D4.DPI_Norm**: stesso valore, con famiglie diverse ("Regola condivisa con D4" e "Target sul valore grezzo"). Va confermato che sia voluto (punto aperto 4 della mappatura D5).
2. **Precisione dei componenti (D6)**: `valore_1`/`valore_2` arrivano arrotondati a 2 decimali. Per variazioni piccole o tassi bassi, ricalcolare lo score a mano può dare uno scarto superiore a 0,01. Si chiede più precisione dal backend (vedi mappatura D6).
3. **TDLA**: `var_score` è nullo per il 2024. La card mostra "n.d. vs 2023".
4. **D6 senza indice di sintesi**: la RPC non restituisce un composito D6, quindi la pagina mostra solo i 4 gruppi di indici intermedi.
5. **Indici mock-up D4** (Minerva / Syllabus): resteranno dimostrativi finché le fonti non saranno collegate.

---

## 8. Come verificare (checklist per il controllore)

1. Entrare con un utente amministratore (DFP) e aprire **Vista Sintetica → D2 / D4 / D5 / D6**, anno 2024, senza filtri.
2. Confrontare score, variazione e badge di ogni card con le tabelle del §5.
3. Aprire **Scomposizione formula** in una card per famiglia (§4) e verificare che:
   - la **Parte 1** riporti i componenti e la `formula_con_numeri` della RPC;
   - la **Parte 2** chiuda con lo stesso score della card.
4. Cambiare **Regione** o **Comparto** e verificare che i valori cambino.
5. Aprire il **Trend storico** e verificare che compaiano gli anni disponibili fino all'anno selezionato.
6. Nella D4, verificare che gli 8 indici mock-up abbiano il badge "Dati mock-up" e la nota in panoramica.
7. Nella **Vista Executive**, verificare che:
   - IGF, IDC, CGC e gli indici D6 riportino lo stesso score della Vista Sintetica;
   - ISCP e IESF siano segnalati come mock-up;
   - IFM_Norm non compaia.
8. Entrare con un utente **ente** (Keycloak) e verificare che i valori riguardino solo l'ente o gli enti del proprio perimetro.
9. **Pannello Admin → Schede → Indici D2**: disattivare un indice, per esempio PTI, e verificare che:
   - sparisca dal menu e dalla pagina D2;
   - con il link diretto compaia l'avviso «indice disattivato».

   Disattivare IGF e verificare che sparisca dalla Vista Executive. Ricaricare la pagina e
   verificare che lo stato resti salvato: serve lo script SQL del §9.
10. Aprire alcuni pannelli delle card e verificare che gli indici compaiano in «Schede più consultate».

## 9. Prerequisito database per il Pannello Admin

Lo script `docs/sql/feature_flags_sipro_indici.sql` va eseguito una volta sul database. Inserisce:
- le 22 chiavi delle schede **SIPrO**;
- le 36 chiavi degli **indici**.

Sullo staging queste chiavi oggi non esistono, quindi attivazioni e disattivazioni non restano
salvate dopo il ricaricamento della pagina. Lo script è idempotente
(`on conflict do nothing`).

---

## Registro delle realizzazioni

| Rilascio | Contenuto |
|---|---|
| **R1 · D2** | Nuova pagina sintetica alimentata dalla RPC con score [0-100]: panoramica, sintesi a 2 colonne, intermedi a 3 colonne, Scomposizione formula (Parte 1 e Parte 2), Scheda metodologica, Trend storico. Tolta la tacca verticale, disattivato il "Quadro Sinottico". IGF reale in Vista Executive. Card Executive passate a "Score [0-100]". |
| **R1.1 · Allineamento** | Card della stessa riga allineate con CSS subgrid, così box di lunghezza diversa non si sfalsano più. |
| **R2 · D5** | IDC, DPI_Norm, ICS_Norm reali. Alias `DPI_Norm_D5`. IDC reale in Vista Executive. Frase di lettura coerente con lo score. |
| **R3 · D4** | CGC, ICF_Norm, DPI_Norm, CQT reali. 8 indici mantenuti come **mock-up** con disclaimer. IFM_Norm ritirato. Intermedi raggruppati per composito (CGC · ISCP · IESF). Alias `TCF` → `ICF_Norm`. |
| **R5 · Pannello Admin** | Nuove sezioni «Indici D2/D4/D5/D6» in Pannello → Schede, per attivare o disattivare ognuno dei 36 indici (singolarmente o tutti insieme). Un indice disattivato sparisce da menu, pagina del pillar e Vista Executive. Gli indici entrano in «Schede più consultate» (apertura da menu/Executive, apertura dei pannelli della card, click in panoramica). Script `docs/sql/feature_flags_sipro_indici.sql` con le 58 chiavi mancanti (SIPrO + indici). |
| **R4 · D6** | 16 indici reali in 4 gruppi tematici, compresi i **nuovi RTG, RRG e IRIC** (aggiunti anche al menu e alla Vista Executive). Passaggi di normalizzazione per tutte le famiglie di scala (§4). Alias `IRG_genere` → `IRG`. Risolti i valori fuori scala della D6 in Executive (per esempio ISG = 151). |

### Dove si trova il codice
- `src/services/exec/execScoreService.ts`: chiamata RPC e tipi.
- `src/hooks/useExecScore.ts`: hook React Query (anno corrente, trend, più pillar insieme, filtri).
- `src/components/dashboard/executive/score/execScoreConfig.ts`: configurazione dei pillar (sintesi, intermedi, gruppi, componenti, alias, mock-up, ritirati, fonti).
- `src/components/dashboard/executive/score/execScoreNormalization.ts`: passaggi della Parte 2 per famiglia.
- `src/components/dashboard/executive/score/execScoreMock.ts`: adattatore dei dati mock-up.
- `src/components/dashboard/executive/score/ExecScoreCard.tsx` e `ExecScorePillarView.tsx`: interfaccia.
