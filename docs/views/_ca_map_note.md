# Nota: mapping istituzione (Conti Annuali `ca`) -> id_ente app

Le viste occupazionali (`dw_occupazione`, `dw_assunti`, `dw_cessati`, `dw_eta`,
`dw_formazione`, `dw_modalita_lavoro`) derivano dallo schema reale **`ca`** (Conti Annuali).

La colonna app `istituzione` (int) e' l'`id_ente` di `dw_ente`. Il collegamento:

```
ca.<fact>.ISTITUZIONE  =  ca.lk_istituzioni.istituzione_id
ca.lk_istituzioni.CODI_FISCALE  =  dwh.lk_questionari_enti.codice_fiscale_ente
dwh.lk_questionari_enti.id  =  dw_ente.id_ente  ( = istituzione )
```

Overlap verificato: **12.274** codici fiscali CA combaciano con l'anagrafica enti dwh.
Le righe CA di enti non presenti in `lk_questionari_enti` restano senza `istituzione`
(escluse dall'INNER JOIN): l'app conosce solo gli enti di `dw_ente`.

Mappa condivisa (CTE `map` in ogni file), deterministica via `DISTINCT ON`:
```sql
SELECT DISTINCT ON (i."istituzione_id") i."istituzione_id" AS ist_code, qe.id AS id_ente
FROM ca.lk_istituzioni i
JOIN dwh.lk_questionari_enti qe ON qe.codice_fiscale_ente = i."CODI_FISCALE"
ORDER BY i."istituzione_id", qe.id;
```

Dati Conti Annuali disponibili per **anni 2012-2024** (occupazione).
