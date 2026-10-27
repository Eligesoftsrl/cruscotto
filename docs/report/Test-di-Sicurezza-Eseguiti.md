# Cruscotto HR — Test di sicurezza eseguiti

**Documento per il committente** · Versione 1.0 · Ottobre 2026

Questo documento elenca le verifiche di sicurezza eseguite sul Cruscotto HR secondo l'approccio
*Security by Design*: quali strumenti abbiamo usato, cosa controlla ogni test e con quale esito.
Il dettaglio dei problemi trovati e degli interventi è nel documento
*Verifica-Sicurezza-By-Design.md*.

---

## 1. Sintesi degli esiti

| Area | Esito |
|---|---|
| Librerie con vulnerabilità note | ✅ **0 vulnerabilità** su 566 librerie (prodotto e strumenti di sviluppo) |
| Analisi statica del codice, regole SonarQube | ✅ **0 problemi di sicurezza** · 15 segnalazioni di leggibilità non bloccanti nel codice dimostrativo |
| Analisi statica del codice, Semgrep (OWASP Top 10) | ✅ **0 risultati** |
| Segreti nel codice e nello storico | ✅ **0 segreti** trovati |
| Codice pubblicato sul browser | ✅ Nessun segreto presente |
| Test automatici di sicurezza | ✅ **29 test superati** su 29 (16 su accesso ed esportazioni, 11 sullo strato di protezione, 2 sulla configurazione) |
| Dati leggibili con la chiave pubblica della base dati | ⚠️ **6 tabelle ancora esposte**: si risolve con lo script SQL consegnato, da eseguire a cura del DBA (vedi § 5) |

---

## 2. Strumenti utilizzati

Tutti gli strumenti sono gratuiti e open source; non è stato necessario installare server
dedicati. Le versioni sono quelle dell'ultima esecuzione.

| Strumento | Versione | Tipo di verifica | Perché |
|---|---|---|---|
| **eslint-plugin-sonarjs** | 4.2.2 (su ESLint 9.39) | Analisi statica (SAST) | Applica le stesse regole JavaScript/TypeScript di **SonarQube** (vulnerabilità, punti critici di sicurezza, bug, manutenibilità) senza un server SonarQube |
| **Semgrep** | 1.182.1 | Analisi statica (SAST) | Regole **OWASP Top 10**, JavaScript, TypeScript, React, Python e ricerca di segreti: iniezioni, XSS, funzioni pericolose, configurazioni insicure |
| **yarn audit** | Yarn 1.22 | Analisi delle librerie (SCA) | Confronta tutte le librerie con il database pubblico delle vulnerabilità note (CVE / GitHub Advisory) |
| **Gitleaks** | 8.21.2 | Ricerca di segreti | Cerca chiavi, password e token in tutto lo **storico** del repository, non solo nella versione attuale |
| **Vitest** + Testing Library | 4.1.12 | Test automatici del frontend | Verificano le regole di accesso, il perimetro dell'ente e le esportazioni sicure |
| **pytest** | 9.1 | Test automatici dello strato di protezione | Verificano la validazione dei token e dei ruoli nel servizio Python che protegge i dati |
| **curl** (script dedicato) | — | Prova di esposizione dei dati | Interroga l'API della base dati con la sola chiave pubblica, come farebbe chiunque |
| Controllo del pacchetto pubblicato (script dedicato) | — | Verifica del rilascio | Cerca segreti nei file effettivamente scaricati dal browser |
| Metodo **STRIDE** e controlli **OWASP ASVS** | — | Revisione dell'architettura | Analisi delle minacce su accesso, token, ruoli, perimetro dei dati e registri |

Tutte le verifiche si avviano con **un solo comando** (`yarn security`) e si possono ripetere a
ogni rilascio.

---

## 3. Elenco dei test eseguiti

### 3.1 Accesso e ruoli (frontend)

| ID | Test | Esito atteso | Esito |
|---|---|---|---|
| T-01 | Utente non autenticato | Nessun profilo, nessun accesso ai dati | ✅ |
| T-02 | Ruolo non previsto per il Cruscotto | Accesso negato | ✅ |
| T-03 | Responsabile HR senza codice fiscale dell'ente | Accesso negato, nessun dato nazionale visibile | ✅ |
| T-04 | Responsabile HR | Vede solo gli enti indicati nel proprio token | ✅ |
| T-05 | Responsabile HR con più enti in un'unica stringa | Elenco degli enti letto correttamente | ✅ |
| T-06 | Ruolo DFP | Vista nazionale, ma **senza** pannello di amministrazione | ✅ |
| T-07 | Ruolo amministratore | Vista nazionale e pannello di amministrazione | ✅ |
| T-08 | Ruoli assegnati in **altre applicazioni** dello stesso sistema di accesso | Ignorati: contano solo i ruoli del Cruscotto | ✅ |
| T-09 | Codice ente non valido nel token | Ignorato, nessun ente arbitrario | ✅ |

### 3.2 Strato di protezione (servizio Python)

| ID | Test | Esito atteso | Esito |
|---|---|---|---|
| T-10 | Token valido emesso per il Cruscotto | Accettato | ✅ |
| T-11 | Token con firma non valida | Rifiutato (401), nessun dettaglio tecnico nel messaggio | ✅ |
| T-12 | Token emesso da un altro sistema di accesso | Rifiutato (401) | ✅ |
| T-13 | Token scaduto | Rifiutato (401) | ✅ |
| T-14 | Token emesso per un'altra applicazione | Rifiutato (401) | ✅ |
| T-15 | Token senza firma (algoritmo «none») | Rifiutato | ✅ |
| T-16 | Ruolo amministratore di un'altra applicazione | Non dà privilegi nel Cruscotto | ✅ |
| T-17 | Ruolo del Cruscotto | Riconosciuto | ✅ |
| T-18 | Ruolo DFP | Non è amministratore | ✅ |
| T-19 | Ente senza codice fiscale | Accesso negato | ✅ |
| T-20 | Token per la base dati | Contiene **solo** il perimetro dell'ente dell'utente | ✅ |

### 3.3 Esportazioni (Excel, CSV)

| ID | Test | Esito atteso | Esito |
|---|---|---|---|
| T-21 | Celle che iniziano con `=`, `+`, `-`, `@`, tabulazione (formule malevole, *CSV injection*) | Neutralizzate: aprendo il file non viene eseguito nulla | ✅ |
| T-22 | Numeri negativi e percentuali | Non alterati dalla protezione | ✅ |
| T-23 | Virgolette nei testi | Gestite correttamente | ✅ |

### 3.4 Configurazione e collegamenti

| ID | Test | Esito atteso | Esito |
|---|---|---|---|
| T-24 | Link alla Dichiarazione di accessibilità | Accettati solo link `https` (no `javascript:`) | ✅ |
| T-25 | Indirizzo per le segnalazioni | Accettati solo indirizzi email semplici (nessun destinatario aggiunto di nascosto) | ✅ |

### 3.5 Verifiche automatiche sull'intero progetto

| ID | Verifica | Esito |
|---|---|---|
| V-01 | Librerie con vulnerabilità note (prodotto) | ✅ 0 su 173 librerie |
| V-02 | Librerie con vulnerabilità note (tutte, inclusi strumenti di sviluppo) | ✅ 0 su 566 librerie |
| V-03 | Regole di sicurezza SonarQube su tutto il codice | ✅ 0 |
| V-04 | Semgrep: OWASP Top 10, JavaScript, TypeScript, React, Python, segreti | ✅ 0 risultati |
| V-05 | Segreti nello storico del repository | ✅ 0 |
| V-06 | Segreti nel pacchetto pubblicato | ✅ 0 |
| V-07 | Tabelle leggibili con la sola chiave pubblica | ⚠️ 6 (vedi § 5) |

---

## 4. Revisione dell'architettura

Oltre ai test automatici è stata svolta una revisione dell'architettura con il metodo **STRIDE**
(furto d'identità, manomissione, ripudio, divulgazione di informazioni, interruzione del
servizio, aumento dei privilegi) e i controlli **OWASP ASVS** su: verifica del token, ruoli,
perimetro dei dati per ente, registri delle attività, intestazioni di sicurezza del server web.
I problemi trovati e risolti sono descritti nel documento *Verifica-Sicurezza-By-Design.md*.

---

## 5. Punto aperto: tabelle ancora esposte sulla base dati Supabase

Con la sola chiave pubblica (che per come funziona Supabase è nel codice del browser) sono
ancora leggibili sulla base dati Supabase:

- `login` (utenti con **password non cifrate**), `lh_utente`, `lh_cms_fornitore`;
- le **vecchie copie** dei registri `log_accessi`, `log_eventi`, `log_errori`.

**Nota sui registri.** Con il servizio di protezione attivo il Cruscotto **non usa più** queste
tabelle: legge e scrive i registri nello schema `scruscotto` del database amministrativo, su
rete privata, solo tramite il servizio Python. Le tabelle segnalate sono le copie precedenti
rimaste su Supabase, che restano comunque leggibili da chiunque.

**Intervento:** eseguire lo script consegnato `SQL_CHIUSURA_ESPOSIZIONI_P0.sql` sulla base dati
Supabase. Lo script toglie l'accesso pubblico a queste tabelle. Dopo l'esecuzione basta
rilanciare `yarn security` per confermare la chiusura.

---

## 6. Come ripetere le verifiche

```
yarn security
```

Il comando esegue in sequenza tutte le verifiche dei § 3.5 e i test dei § 3.1–3.4, e termina con
esito negativo se una sola verifica non è superata. Si consiglia di eseguirlo prima di ogni
rilascio.
