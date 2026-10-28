# 3. Catalogo dei dati collegati

**Cruscotto HR · Versione 1.0 · Ottobre 2026**

## Attività svolte (voce del SAL)

- Mappatura di ogni grafico sulla corrispondente fonte dati (documentazione interna di progetto)
- Studio della base dati reale
- Script di esportazione della base dati (a disposizione del sistemista)
- Viste dell'anagrafica degli enti e degli indicatori KPI
- Viste dei dati del Conto Annuale
- Collegamento degli enti tramite codice fiscale e viste di decodifica
- Viste predisposte per i dati non ancora disponibili
- Documentazione delle viste prodotte (questo documento)

## 3.1 Descrizione dell'intervento

Il Cruscotto è stato collegato ai **dati reali** delle fonti disponibili, al posto dei dati
dimostrativi della versione iniziale. Le informazioni sono predisposte nella base dati in
forma già pronta per la consultazione, così che le schede siano rapide e coerenti tra loro.

- Analisi della base dati reale e delle fonti disponibili.
- Predisposizione dei dati per ciascuna area: anagrafica degli enti, Conto Annuale, SIPrO,
  KPI della Riforma PA, indici della Vista Sintetica.
- **Collegamento degli enti tramite codice fiscale**: ogni ente è identificato in modo univoco
  dal codice fiscale, che consente di incrociare correttamente le fonti e di limitare la vista
  di ciascun utente ai propri enti.
- Decodifiche leggibili (denominazioni, comparti, regioni, categorie) al posto dei codici.
- **Predisposizione per i dati non ancora disponibili**: le schede delle fonti in arrivo sono
  già pronte e mostrano dati dimostrativi, sempre segnalati come tali, finché la fonte non viene
  collegata.
- **Anno di riferimento automatico**: il Cruscotto propone sempre l'ultimo anno presente nei dati.

## 3.2 Stato delle fonti

| Fonte | Contenuto | Stato |
|---|---|---|
| **Anagrafica enti** | Denominazione, codice fiscale, comparto, regione | ✅ Dati reali |
| **Conto Annuale** | Personale, età, anzianità, assunzioni, cessazioni, turnover, formazione, progressioni, lavoro flessibile e agile, genere | ✅ Dati reali (12 schede) |
| **SIPrO** | Organizzazione, processi, profili e cataloghi, benchmark tra enti | ✅ Dati reali (23 schede) |
| **KPI Riforma PA** | KPI abilitanti e di successo | ✅ Dati reali |
| **Indici della Vista Sintetica** | Indici con score da 0 a 100 per le dimensioni D2, D4, D5, D6 | ✅ Dati reali |
| Indici D1 e D3 | — | 🟡 Dati dimostrativi, in attesa della fonte |
| Minerva e Syllabus (indici D4) | Competenze e formazione | 🟡 Dati dimostrativi, in attesa della fonte |
| InPA | Reclutamento e concorsi | 🟡 Scheda predisposta, in attesa della fonte |

## 3.3 Schede SIPrO su dati reali

| Gruppo | Schede |
|---|---|
| Benchmark | Benchmark DFP (confronto fino a 6 enti, limite configurabile) |
| Organizzazione | Organigramma UO · Stato Organizzazione · Provvedimenti Organizzativi · Dotazione Risorse UO · Criticità UO |
| Processi | Mappatura Processi · Fasi dei Processi · Criticità Processi · Digitalizzazione · Lavoro Agile Processi · Outsourcing Fasi · Semplificazione Processi · Tempi e Picchi |
| Profili e Cataloghi | FTE Programmati vs Assegnati · Copertura Profili di Ruolo · Catalogo Profili · Famiglie Professionali · Profili Professionali · Ambiti e Profili di Ruolo · Aree Contrattuali · Evoluzione Profili |

Ogni scheda può essere attivata o disattivata dal pannello di gestione.

## 3.4 Punti da confermare con il committente

- Disponibilità e tempi delle fonti per D1, D3, Minerva, Syllabus e InPA.
- Validazione dei valori degli indici D2, D4, D5 e D6 da parte degli esperti di dominio.
