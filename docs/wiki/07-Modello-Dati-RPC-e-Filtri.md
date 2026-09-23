# 7. Modello dati, RPC e filtri a cascata

[◀ Torna all'indice](Home.md)

## Accesso ai dati tramite RPC

Le schede del Conto Annuale non interrogano direttamente le tabelle: chiamano **funzioni
RPC** dedicate (prefisso `fa_ca_*`) che restituiscono già gli aggregati necessari a KPI,
grafici e tabelle. Questo mantiene la logica di calcolo nel database e alleggerisce il
frontend.

Ogni servizio in `src/services/ca/` espone le chiamate della propria scheda. Esempio
(scheda Progressioni):

- `fa_ca_progressioni_kpi` → card sintetiche (progressioni verticali/orizzontali/totale);
- `fa_ca_progressioni_evoluzione` → serie storica per grafico a barre/linea.

Ogni RPC accetta un insieme coerente di parametri di filtro, ad esempio:

| Parametro | Significato |
|-----------|-------------|
| `p_anno` | anno di rilevazione |
| `p_codice_fiscale` | perimetro ente (iniettato dal contesto di autenticazione) |
| `p_istituzione` | ente selezionato (ricerca DFP) |
| `p_comparto` / `p_macrocategoria` / `p_categoria` | livelli della cascata |
| `p_regione` | filtro geografico |

> I parametri non pertinenti a una specifica RPC vengono omessi dal servizio.

## Le 12 schede del Conto Annuale

Catalogo in `src/config/schedeCatalog.ts`:

1. Analisi per età
2. Anzianità di servizio
3. Cessazioni dal servizio
4. Assunti per causale
5. Tasso di turnover
6. Tasso di sostituzione
7. Formazione
8. Progressioni
9. Analisi del personale
10. Lavoro flessibile
11. Lavoro agile
12. Analisi per genere

Ogni scheda è associata a un identificativo usato dalla sidebar e a una **feature flag**
che ne consente l'attivazione/disattivazione dal Pannello Admin.

## Filtri dinamici a cascata

I menù dei filtri non sono scritti a mano: sono alimentati da un **dizionario dati**
(vista `mv_filtri`), partizionato per anno. La logica è in `src/services/ca/filtriService.ts`.

Relazioni della cascata:

```
Comparto ─► Macrocategoria ─► Categoria
Anno         (indipendente)
Regione      (indipendente)
Ente         (ricerca testuale, per il profilo DFP)
```

- Selezionando un comparto si popolano le macrocategorie corrispondenti, e così via.
- La ricerca ente è un autocomplete (ricerca testuale sulla descrizione).

## Viste dati

Oltre alle RPC, il progetto documenta un insieme di viste (`docs/views/`, prefisso `dw_`)
che modellano le entità del personale (enti, età, cessati, formazione, ecc.). Sono la base
su cui poggiano gli aggregati esposti dalle RPC.

## Convenzione sugli identificativi

Gli identificativi applicativi usano UUID/stringhe: si evita di esporre identificativi
tecnici del database non serializzabili. I servizi restituiscono strutture già pronte
per la UI.

[▶ Prossima pagina: Pannello Admin](08-Pannello-Admin.md)
