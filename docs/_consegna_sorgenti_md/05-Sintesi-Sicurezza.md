# 5. Sicurezza e strato di protezione dei dati — Sintesi

**Cruscotto HR · Versione 1.0 · Ottobre 2026**

## Attività svolte (voce del SAL)

- Servizio intermedio di protezione e regole di accesso per riga
- Aggancio «a interruttore» dello strato di protezione e tolleranza sugli orologi
- Documento di installazione per il sistemista (consegnato direttamente al sistemista)
- Verifica Security by Design e chiusura di tutti i punti emersi

## 5.1 Descrizione dell'intervento

- **Strato di protezione dei dati**: un servizio intermedio verifica l'identità dell'utente e
  rilascia l'accesso ai soli dati del suo perimetro (enti del proprio profilo). La regola è
  applicata anche dalla base dati, riga per riga, così che il perimetro non possa essere
  aggirato.
- **Attivazione «a interruttore»**: lo strato di protezione si attiva da configurazione, senza
  modificare l'applicazione; è tollerante a piccole differenze di orario tra i server.
- **Registri delle attività** (accessi, eventi, errori) conservati nella base dati
  amministrativa su rete interna, consultabili solo dagli amministratori.
- **Nessuna credenziale nell'applicazione**: le informazioni riservate sono conservate solo
  sui server.
- **Documentazione di installazione** consegnata al sistemista, insieme alla configurazione
  di sicurezza del server web.

## 5.2 Verifica Security by Design

È stata eseguita una verifica completa secondo l'approccio Security by Design: analisi
statica del codice con le regole SonarQube e Semgrep (OWASP Top 10), controllo delle librerie,
ricerca di segreti, revisione dell'architettura (STRIDE, OWASP ASVS) e test automatici.

Tutti i punti emersi sono stati **risolti**, compresa la chiusura dell'accesso pubblico ad
alcune tabelle storiche della base dati, eseguita dal sistemista.

| Esito finale | |
|---|---|
| Vulnerabilità note nelle librerie | ✅ 0 |
| Problemi di sicurezza nel codice (SonarQube, Semgrep) | ✅ 0 |
| Segreti nel codice e nel pacchetto pubblicato | ✅ 0 |
| Dati leggibili senza autorizzazione | ✅ 0 |
| Test automatici di sicurezza | ✅ tutti superati |

Il dettaglio di strumenti e test è nel documento `05b-Test-di-Sicurezza-Eseguiti`.

## 5.3 Raccomandazioni

- Eseguire `yarn security` prima di ogni rilascio.
- Mantenere aggiornate le librerie (verifica periodica consigliata ogni 3 mesi).
- Rinnovare periodicamente le credenziali degli ambienti di test.
