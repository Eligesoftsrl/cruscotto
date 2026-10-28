# 6. Relazione sulla ristrutturazione del Cruscotto

**Cruscotto HR · Versione 1.0 · Ottobre 2026**

## Attività svolte (voce del SAL)

- Relazione sulla ristrutturazione (questo documento)
- Chiarimenti tecnici al committente
- Wiki tecnica e manuale d'uso (cartella «wiki»)

## 6.1 Obiettivo

Portare il Cruscotto da prototipo dimostrativo a **applicazione pronta per l'esercizio**:
collegata ai dati reali, sicura, configurabile e facile da evolvere.

## 6.2 Cosa abbiamo introdotto

| Intervento | Beneficio |
|---|---|
| **Dati reali** al posto dei dati dimostrativi | Le analisi riflettono la situazione effettiva degli enti |
| **Organizzazione modulare** per area (Conto Annuale, SIPrO, KPI, indici) | Ogni area evolve senza effetti sulle altre; nuove schede si aggiungono rapidamente |
| **Accesso aziendale unico** (Keycloak) con profili e ruoli | Nessuna password dedicata; ogni utente vede solo ciò che gli compete |
| **Perimetro per ente** tramite codice fiscale | Isolamento dei dati tra amministrazioni |
| **Strato di protezione dei dati** | Il perimetro è garantito anche lato server |
| **Pannello di gestione** | Attivazione delle schede, consultazione dei registri e statistiche d'uso senza interventi tecnici |
| **Filtri a cascata** e anno automatico | Selezioni sempre coerenti e aggiornate ai nuovi dati |
| **Esportazioni** CSV, Excel e PDF accessibile | Riutilizzo dei dati negli strumenti d'ufficio |
| **Accessibilità** secondo le Linee Guida AgID | Uso con tastiera e lettori di schermo; tabelle dei dati per ogni grafico |
| **Configurazione unica** per tutti gli ambienti | Stesso pacchetto per sviluppo, staging e produzione |
| **Test automatici** e verifiche di sicurezza ripetibili | Qualità controllata a ogni rilascio |
| **Avviso di nuova versione** | Gli utenti ricevono sempre l'ultima versione pubblicata |

## 6.3 Qualità del codice

- Analisi statica con le regole SonarQube: 0 problemi di sicurezza; le segnalazioni di
  leggibilità sono state ridotte del 94%.
- Test automatici su accesso, ruoli, perimetro dell'ente, esportazioni, accessibilità.

## 6.4 Chiarimenti tecnici

Nel corso del lavoro sono stati condivisi con il committente i punti tecnici da decidere
insieme: contenuto del token di accesso, disponibilità e tempi delle fonti, definizioni degli
indici, perimetro dei dati per ente, requisiti di accessibilità. Le decisioni prese sono
riflesse nei documenti di questa raccolta.

## 6.5 Prossimi passi

- Collegamento delle fonti ancora in arrivo (D1, D3, Minerva, Syllabus, InPA).
- Pubblicazione della Dichiarazione di accessibilità.
- Sintesi testuale automatica per ogni grafico.
