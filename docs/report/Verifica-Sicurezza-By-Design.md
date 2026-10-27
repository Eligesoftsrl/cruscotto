# Cruscotto HR — Verifica di sicurezza (Security by Design)

**Documento per il committente**

| | |
|---|---|
| **Prodotto** | Cruscotto HR — Sistema di Monitoraggio HR della Pubblica Amministrazione |
| **Riferimenti** | Linee guida AgID per lo sviluppo del software sicuro · Misure minime di sicurezza ICT per le PA · OWASP Top 10 · OWASP ASVS 4.0 (livello 2) · GDPR art. 25 e 32 |
| **Versione documento** | 1.0 |

> Il documento viene aggiornato a ogni nuova verifica. Lo storico delle versioni è in fondo.

---

## 1. Sintesi

| Ambito | Esito |
|---|---|
| Librerie di terze parti (produzione) | ✅ **0 vulnerabilità note** (erano 8: 1 critica, 4 alte, 2 medie, 1 bassa) |
| Analisi statica del codice, regole di sicurezza | ✅ **0 problemi** (2 trovati e corretti) |
| Analisi statica OWASP Top 10 (frontend e strato di protezione) | ✅ **0 problemi** |
| Segreti nel codice e nello storico | ✅ **Nessun segreto**; rimossa dalla documentazione una chiave pubblica |
| Codice pubblicato nel browser | ✅ **Nessun segreto**, nessuna mappa dei sorgenti |
| Strato di protezione dei dati | ✅ **3 debolezze corrette**, tra cui un rischio di aumento dei privilegi |
| Test automatici di sicurezza | ✅ **27 test** superati (autorizzazioni, perimetro ente, token, esportazioni) |
| **Configurazione della base dati di produzione** | 🔴 **CRITICO — intervento urgente del sistemista**: dati personali e password leggibili con la chiave pubblica (vedi SEC-01) |

---

## 2. Metodo e strumenti

| Verifica | Strumento | Cosa controlla |
|---|---|---|
| Analisi statica (SAST) | **Regole SonarJS**, le stesse regole JavaScript/TypeScript di **SonarQube**, eseguite senza server | Vulnerabilità, punti critici di sicurezza, bug e manutenibilità |
| Analisi statica (SAST) | **Semgrep**: regole OWASP Top 10, JavaScript, TypeScript, React, Python, segreti | Iniezioni, XSS, uso di funzioni pericolose, configurazioni insicure |
| Composizione software (SCA) | `yarn audit` (database delle vulnerabilità note) | Librerie con vulnerabilità pubblicate (CVE) |
| Segreti | **Gitleaks** su tutto lo storico | Chiavi, password e token finiti nel codice |
| Codice pubblicato | Controllo del pacchetto distribuito | Che il codice scaricato dal browser non contenga segreti |
| Esposizione dei dati | Prove dirette sull'API della base dati con la sola chiave pubblica | Tabelle leggibili da chiunque |
| Revisione dell'architettura | Analisi delle minacce (metodo STRIDE) e controlli OWASP ASVS | Accesso, token, ruoli, perimetro dei dati, registri |
| Test di sicurezza | Test automatici del frontend e dello strato di protezione | Che le regole di accesso funzionino e restino valide nel tempo |

---

## 3. Risultati

**Gravità**: 🔴 Critica · 🟠 Alta · 🟡 Media · 🔵 Bassa · ⚪ Informativa

| ID | Gravità | Ambito | Problema | Intervento | Stato |
|---|---|---|---|---|---|
| **SEC-01** | 🔴 Critica | Base dati di produzione | Con la sola chiave pubblica, che per progetto è nel codice del browser, chiunque può leggere: la tabella **login** (12 utenti con **password non cifrate**, nome, cognome, email), **lh_utente** (120 persone con codice fiscale, nome, cognome, data di nascita) e **lh_cms_fornitore** (email, telefono). Il Cruscotto non usa queste tabelle. | Consegnato lo script `SQL_CHIUSURA_ESPOSIZIONI_P0.sql`, che chiude l'accesso senza alcun impatto sul Cruscotto. Le 12 password vanno **considerate compromesse e cambiate**; va valutata con il DPO la notifica di violazione (GDPR art. 33). | ⏳ **Urgente** — a cura del sistemista e del DPO |
| **SEC-02** | 🟠 Alta | Strato di protezione | Un ruolo «admin» assegnato in **un'altra applicazione** dello stesso realm Keycloak dava privilegi di amministrazione anche nel Cruscotto (aumento dei privilegi). | I ruoli applicativi sono letti solo dal client del Cruscotto. Test automatico dedicato. | ✅ Risolto (richiede l'impostazione `KEYCLOAK_CLIENT_ID`) |
| **SEC-03** | 🟠 Alta | Strato di protezione | Senza audience configurata venivano accettati token emessi per **altre applicazioni** dello stesso realm. | Il token deve essere emesso per il Cruscotto (claim `azp`); sono obbligatori scadenza, emissione, emittente e soggetto. Test automatici: firma falsa, emittente diverso, token scaduto, altro client, algoritmo «none». | ✅ Risolto |
| **SEC-04** | 🔴 Critica / 🟠 Alta | Librerie | Vulnerabilità note: DOMPurify (1 critica, 1 alta, 1 bassa; usata dalla generazione PDF), SheetJS/xlsx (2 alte), Zod (1 alta), React Router (2 medie). | Aggiornate tutte le librerie: DOMPurify 3.4.17+, SheetJS 0.20.3 (distribuzione ufficiale), React Router 7.18+. Zod rimossa perché inutilizzata. | ✅ Risolto — 0 vulnerabilità |
| **SEC-05** | 🟡 Media | Base dati di produzione | I registri (accessi, eventi, errori) sono leggibili con la chiave pubblica e contengono nomi utente, ruoli e indirizzi IP. | Incluso nello stesso script SQL: lettura e scrittura solo tramite lo strato di protezione. | ⏳ A cura del sistemista, con lo strato di protezione attivo |
| **SEC-06** | 🟡 Media | Strato di protezione | I messaggi di errore della verifica del token riportavano dettagli tecnici. | Messaggio generico, nessun dettaglio esposto. | ✅ Risolto |
| **SEC-07** | 🟡 Media | Strato di protezione | Le registrazioni nei registri non avevano limiti di lunghezza né valori ammessi (rischio di abuso e di riempimento). | Limiti di lunghezza e valori ammessi su tutti i campi. | ✅ Risolto |
| **SEC-08** | 🔵 Bassa | Frontend | Un'espressione regolare con tempi potenzialmente elevati su input particolari (ReDoS). | Sostituita con un'elaborazione lineare. | ✅ Risolto |
| **SEC-09** | 🔵 Bassa | Frontend | Generatore di numeri casuali non crittografico per gli identificativi, usato solo come riserva. | Uso esclusivo del generatore crittografico del browser. | ✅ Risolto |
| **SEC-10** | 🔵 Bassa | Esportazioni | La protezione contro le formule malevole nei CSV alterava anche i numeri negativi. | Protezione mantenuta, numeri preservati; test automatici. | ✅ Risolto |
| **SEC-11** | 🔵 Bassa | Documentazione | La chiave pubblica della base dati era riportata in un documento interno. Non è un segreto, ma non va diffusa. | Rimossa; lo storico è registrato come eccezione nota. | ✅ Risolto |
| **SEC-12** | ⚪ Informativa | Server web | La configurazione del server web non prevedeva le intestazioni di sicurezza (CSP, HSTS, protezione dall'incorporamento in altri siti). | Consegnata la configurazione `apache-security-headers.conf`. Si consiglia di attivare la CSP prima in sola segnalazione. | ⏳ A cura del sistemista |
| **SEC-13** | ⚪ Informativa | Strumenti di sviluppo | Vulnerabilità negli strumenti usati solo in sviluppo (server di sviluppo e strumenti di test). Non sono presenti nel prodotto pubblicato. | Aggiornati Vite 7.3.7, Vitest 4.1.12 e il plugin React; versione sicura forzata di `postcss-selector-parser`. | ✅ Risolto — 0 vulnerabilità anche negli strumenti di sviluppo |

---

## 4. Qualità del codice (regole SonarQube)

| Indicatore | Esito |
|---|---|
| Problemi di sicurezza | **0** (2 corretti: SEC-08, SEC-09) |
| Bug potenziali | **0** (corretti: condizione con rami identici, calcolo senza valore iniziale, codice irraggiungibile, funzione duplicata) |
| Import inutilizzati | **183 rimossi** in 42 file |
| Segnalazioni di manutenibilità | **da 231 a 15** (−94%), tutte non bloccanti e concentrate nel codice dimostrativo |

### 4.1 Riduzione delle segnalazioni di leggibilità (versione 1.1)

| Tipo di segnalazione | Prima | Dopo | Come è stata risolta |
|---|---|---|---|
| Condizioni annidate (`a ? b : c ? d : e`) | 125 | 11 | Sostituite da piccole funzioni con nome chiaro (soglie, segno, semafori, scelta per chiave) e da un componente unico per gli stati «caricamento / errore / dati» delle 17 schede SIPrO |
| Variabili e assegnazioni inutilizzate | 66 | 0 | Rimosse (calcoli mai mostrati, stati mai letti, una lettura dati superflua nella Gap Analysis Minerva) |
| Funzioni troppo complesse | 17 | 2 | Suddivise in parti più piccole: scheda di score, card degli indici, instradamento delle schede, lettura dei ruoli dal token di accesso, passaggi di normalizzazione |
| Funzioni annidate troppo in profondità | 6 | 0 | Spostate fuori dal componente |
| Testi composti annidati | 9 | 1 | Sostituiti da una funzione per «prefisso + valore» |
| Assegnazioni dentro espressioni | 2 | 0 | Separate in due istruzioni |
| Commenti di esclusione non riconosciuti / tipi `any` | 6 | 0 | Configurazione dell'analisi allineata; tipo esplicito per le etichette dei grafici a torta |

**Le 15 segnalazioni residue** sono tutte in parti dimostrative o storiche, escluse per scelta:
calcolo D1 (`d1Service`, 9), metriche della Bussola (`bussolaService`, 1), pagina demo del
rapporto narrativo (2), home con dati mock (2), legenda del grafico score con dati mock (1).
Verranno chiuse quando queste parti saranno collegate ai dati reali.

**Nessuna modifica visibile per l'utente.** Verifiche eseguite dopo l'intervento:
compilazione TypeScript senza errori, build di produzione riuscita, tutti i test automatici
superati (31), più test di equivalenza «prima/dopo» su migliaia di combinazioni per i calcoli
dei KPI della Riforma, la normalizzazione degli score e i badge.

---

## 5. Misure di sicurezza dell'architettura

| Misura | Cosa garantisce |
|---|---|
| Accesso unico Keycloak (PKCE) | Nessun segreto nell'applicazione, sessione rinnovata in modo sicuro |
| Ruoli consentiti espliciti | Gli utenti senza un ruolo previsto vedono «Accesso non autorizzato» |
| Perimetro per ente | Il responsabile HR vede solo i dati dei codici fiscali presenti nel token; senza codice fiscale non vede nulla |
| Separazione dei privilegi | La vista su tutti gli enti (DFP) non dà accesso all'amministrazione |
| Strato di protezione | Verifica del token, ruoli solo del client del Cruscotto, token di accesso ai dati con durata limitata e con il solo perimetro dell'utente |
| Regole di accesso per riga (RLS) | Predisposte per filtrare i dati per ente direttamente nella base dati |
| Accesso ai dati centralizzato | Una regola automatica impedisce ai componenti di interrogare la base dati fuori dai servizi |
| Configurazione per ambiente | Nessun indirizzo o chiave scritti nel codice |
| Registri | Utente e ruolo presi dal token (non falsificabili), senza dettagli tecnici sensibili |
| Esportazioni | Protezione contro le formule malevole nei fogli di calcolo |
| Risorse interne | Font e risorse inclusi nell'applicazione, nessuna chiamata a servizi esterni |

### Analisi delle minacce (STRIDE)

| Minaccia | Esempio | Contromisura | Stato |
|---|---|---|---|
| **S**poofing (falsa identità) | Token falsificato o emesso per un'altra applicazione | Verifica della firma, dell'emittente e del client; test automatici | ✅ |
| **T**ampering (manomissione) | Modifica dei claim ente o ruolo | Claim firmati da Keycloak; ruoli e perimetro calcolati lato server | ✅ |
| **R**epudiation (non ripudio) | Azioni amministrative non tracciate | Registri con utente preso dal token | ✅ |
| **I**nformation disclosure (divulgazione) | Dati personali leggibili con la chiave pubblica | Script di chiusura (SEC-01, SEC-05); RLS per ente | ⏳ Sistemista |
| **D**enial of service | Registri riempiti ad arte, espressioni regolari lente | Limiti sui campi (SEC-07), ReDoS eliminato (SEC-08) | ✅ |
| **E**levation of privilege (aumento dei privilegi) | Ruolo «admin» di un'altra applicazione | Ruoli solo dal client del Cruscotto (SEC-02) | ✅ |

---

## 6. Controllo permanente

Le verifiche sono incluse nel progetto e si eseguono con un solo comando (`yarn security`)
prima di ogni rilascio. Se un passo fallisce, il rilascio viene segnalato come non conforme.

1. Librerie con vulnerabilità alte o critiche
2. Regole di sicurezza SonarJS (SonarQube)
3. Semgrep: OWASP Top 10, React, Python, segreti
4. Segreti nello storico (Gitleaks)
5. Codice pubblicato nel browser
6. Test di sicurezza del frontend e dello strato di protezione
7. Tabelle sensibili non leggibili con la chiave pubblica *(oggi fallisce finché non viene eseguito lo script SEC-01)*

---

## 7. Azioni richieste

| Priorità | Azione | Chi |
|---|---|---|
| 🔴 Immediata | Eseguire `SQL_CHIUSURA_ESPOSIZIONI_P0.sql` (punti 1 e 3) sulla base dati di produzione | Sistemista |
| 🔴 Immediata | Cambiare le 12 password della tabella `login` e valutare la notifica di violazione | Amministrazione e DPO |
| 🟠 Alta | Impostare `KEYCLOAK_CLIENT_ID` nello strato di protezione e riavviarlo | Sistemista |
| 🟠 Alta | Confermare la rigenerazione del segreto del client Keycloak già segnalato, e l'uso di un client pubblico | Gestore Keycloak |
| 🟡 Media | Eseguire il punto 2 dello script (registri) con lo strato di protezione attivo | Sistemista |
| 🟡 Media | Applicare le intestazioni di sicurezza del server web (`apache-security-headers.conf`) | Sistemista |
| 🔵 Consigliata | Inserire `yarn security` e `yarn a11y` nella pipeline di rilascio | Chi gestisce i rilasci |
| 🔵 Consigliata | Test di intrusione (penetration test) da parte di terzi prima dell'esercizio | Committente |

---

## 8. Storico delle versioni

| Versione | Contenuto |
|---|---|
| 1.0 | Prima verifica completa: SAST (regole SonarQube e Semgrep), librerie, segreti, codice pubblicato, esposizione dei dati, architettura, test di sicurezza. |
| 1.1 | Riduzione delle segnalazioni di leggibilità SonarQube da 231 a 15 (sezione 4.1), senza modifiche visibili. |
| 1.2 | Aggiornamento degli strumenti di sviluppo (SEC-13 risolto: 0 vulnerabilità su tutte le 566 librerie). Nuova esecuzione completa: SonarJS 0 problemi di sicurezza, Semgrep 0 risultati, Gitleaks 0 segreti, pacchetto pubblicato senza segreti, test di sicurezza superati. Restano solo gli interventi a cura del sistemista (SEC-01, SEC-05, SEC-12). |
