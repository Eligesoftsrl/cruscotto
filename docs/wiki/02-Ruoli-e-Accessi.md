# 2. Ruoli e accessi

[◀ Torna all'indice](Home)

Questa pagina spiega, in modo semplice, chi può accedere al cruscotto e cosa può vedere.

## 2.1 Come si entra

L'accesso avviene con le **credenziali aziendali** tramite il sistema di autenticazione
centralizzato (single sign-on). Non esistono password dedicate al cruscotto: si usa lo
stesso accesso degli altri servizi interni.

## 2.2 I profili

| Profilo | Chi è | Cosa vede |
|--------|-------|-----------|
| **Amministratore** | Referente centrale | Tutti i dati; può scegliere qualsiasi ente |
| **Responsabile di ente** | Utente di uno o più enti | Solo i dati degli enti a cui è abilitato |
| **Non abilitato** | Utente senza autorizzazione | Nessun accesso: compare una schermata dedicata |

## 2.3 Il perimetro dei dati

Ogni utente vede **solo** i dati di propria competenza. Questo “perimetro” viene
determinato automaticamente al momento dell'accesso, in base alle abilitazioni associate
all'utente: non è qualcosa che l'utente possa modificare da sé.

- Un responsabile abilitato a un solo ente vede direttamente i dati di quell'ente.
- Un responsabile abilitato a più enti può passare dall'uno all'altro tramite l'apposito
  selettore.
- L'amministratore non ha limiti di perimetro e può selezionare qualsiasi ente.

## 2.4 Sicurezza degli accessi

- Le autorizzazioni sono gestite centralmente: abilitare o disabilitare un utente è
  compito dei referenti degli accessi.
- L'isolamento tra enti è garantito a più livelli, così che ciascuno resti nel proprio
  perimetro.
- Gli accessi e le attività principali vengono registrati per finalità di monitoraggio.

> Per una visione generale di come questi principi sono realizzati, vedi la
> [Panoramica dell'architettura](03-Panoramica-Architettura).

[▶ Prossima pagina: Panoramica dell'architettura](03-Panoramica-Architettura)
