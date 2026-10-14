# Specifica RPC `kpi_enti` — enti censiti nella rilevazione KPI Riforma PA

Documento interno per il backend. Il frontend è già pronto: il controllo si attiva
**da solo** appena la funzione è disponibile, senza nuovi rilasci dell'applicazione.

## Firma attesa

```sql
-- Restituisce i codici fiscali degli enti che hanno partecipato alla rilevazione KPI dell'anno.
create or replace function public.kpi_enti(p_anno integer)
returns table (codice_fiscale text)
language sql stable security definer
as $$
  select distinct e.codice_fiscale
  from   <tabella/vista della rilevazione KPI> e
  where  e.anno = p_anno;
$$;

grant execute on function public.kpi_enti(integer) to anon, authenticated;
```

Formati di risposta accettati dal frontend (uno qualsiasi):
- `setof { codice_fiscale text }`, quello consigliato; sono accettati anche `cfiscale` e `cf`;
- `setof text`;
- `text[]`.

## Comportamento nel cruscotto

| Situazione | Effetto per l'utente di ente |
|---|---|
| Funzione non ancora creata (PostgREST `PGRST202`) | Nessun blocco: la scheda funziona come oggi |
| Ente attivo presente nell'elenco dell'anno | La scheda KPI viene mostrata (dati aggregati) |
| Ente attivo assente dall'elenco dell'anno | Avviso «Ente non censito nella rilevazione KPI», nessun dato e nessuna chiamata a `kpi_scheda` |
| Altro errore della funzione | Avviso «Verifica dell'ente non riuscita», nessun dato |

- Il controllo si ripete a ogni cambio di **anno** e di **ente**.
- Gli utenti DFP e gli amministratori non sono soggetti al controllo.
- Il controllo si può spegnere senza rilasci dal Pannello di gestione → Funzionalità →
  «KPI Riforma · verifica enti censiti», chiave `kpi_verifica_enti`. La chiave è inclusa in
  `feature_flags_sipro_indici.sql`.
