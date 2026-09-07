# Dump & Restore dello schema `public` (Supabase) — Guida per la produzione

Pacchetto per esportare lo schema `public` (schema + dati) del progetto Supabase e
ricaricarlo su un altro Postgres/Supabase (produzione, locale, migrazione, backup).

## Contenuto
- `dump_supabase_public.sh` — esporta lo schema `public` (schema, dati, completo, custom)
- `restore_supabase_public.sh` — ricarica un dump su un DB di destinazione
- (contesto) `MAPPATURA_TABELLE_GRAFICI.md/.pdf` — quali tabelle usa l'app e con quali colonne
- (contesto) `MATERIALIZED_VIEWS_SKELETON.sql` — scheletro MV con stesso "contratto" tabelle

## Prerequisiti
- Client PostgreSQL **16** (`pg_dump`, `pg_restore`, `psql`)
  - macOS: `brew install libpq` (poi aggiungi al PATH `.../libpq/bin`)
  - Debian/Ubuntu: `apt-get install postgresql-client-16`

## 1) Recuperare la connection string
Supabase Dashboard → **Project Settings → Database → Connection string** (URI, usa il **pooler**).
Formato:
```
postgresql://postgres.<project_ref>:<PASSWORD>@<host-pooler>.supabase.com:5432/postgres
```

## 2) Eseguire il dump
```bash
chmod +x dump_supabase_public.sh restore_supabase_public.sh
export SUPABASE_DB_URL="postgresql://postgres.<ref>:<PASSWORD>@<host-pooler>:5432/postgres"
./dump_supabase_public.sh
```
Output in `dump_public_<timestamp>/`:
| File | Contenuto |
|------|-----------|
| `public_schema.sql` | solo struttura |
| `public_data.sql` | solo dati |
| `public_full.sql` | schema + dati (testo) |
| `public_full.dump` | schema + dati (formato custom, per restore selettivo) |
| `SHA256SUMS.txt` | integrità dei file |

## 3) Restore sul DB di destinazione
### Su Supabase locale (CLI) — porta 54322
```bash
export TARGET_DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
./restore_supabase_public.sh dump_public_<timestamp>/public_full.dump
```
### Su un Postgres di produzione
```bash
export TARGET_DB_URL="postgresql://<user>:<pwd>@<host>:5432/<db>"
./restore_supabase_public.sh dump_public_<timestamp>/public_full.dump
```

## Solo alcune tabelle (opzionale)
Per esportare solo le tabelle usate dall'app (vedi `MAPPATURA_TABELLE_GRAFICI.md §C`),
aggiungere a `pg_dump` opzioni `--table`:
```bash
pg_dump "$SUPABASE_DB_URL" --schema=public --no-owner --no-privileges \
  --table=public.dw_ente --table=public.dw_occupazione --table='public.dw_*' \
  -Fc -f solo_app.dump
```

## ⚠️ Sicurezza (IMPORTANTE)
Lo schema `public` include:
- `login` → colonna **password in chiaro**
- `lh_utente` → **PII** (codice fiscale, nome, cognome, data di nascita)

I file di dump vanno trattati come **dati sensibili**:
- non caricarli su repository o URL pubblici;
- trasferirli su canali cifrati;
- in produzione, applicare **RLS/deny-by-default** su `login`/`lh_utente` e revocare l'accesso `anon`.

## Note operative
- `--no-owner --no-privileges`: evita errori di ruoli in restore su un'altra istanza.
- Il dump è limitato a `--schema=public` (esclude `auth`, `storage`, `realtime`).
- Se in produzione i **tipi** differiscono (es. colonne `q*` di `dw_kpi_rilevazione` numeriche vs `text`),
  allinearli o gestire il cast nelle Materialized View (vedi `MATERIALIZED_VIEWS_SKELETON.sql`).
