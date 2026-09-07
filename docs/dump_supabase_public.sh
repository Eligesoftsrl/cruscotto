#!/usr/bin/env bash
# =====================================================================
#  dump_supabase_public.sh
#  Esporta lo schema `public` (schema + dati) di un progetto Supabase/Postgres.
#  Pensato per: consegna al team di produzione (migrazione / MV / backup).
#
#  USO:
#    export SUPABASE_DB_URL="postgresql://postgres.<ref>:<PASSWORD>@<host-pooler>:5432/postgres"
#    ./dump_supabase_public.sh
#
#  In alternativa passare l'URI come primo argomento:
#    ./dump_supabase_public.sh "postgresql://...:5432/postgres"
#
#  DOVE TROVARE L'URI:
#    Supabase Dashboard -> Project Settings -> Database -> Connection string (URI, pooler)
#
#  PREREQUISITI: pg_dump (client PostgreSQL 16).  macOS: brew install libpq
# =====================================================================
set -euo pipefail

DB_URL="${1:-${SUPABASE_DB_URL:-}}"
if [[ -z "${DB_URL}" ]]; then
  echo "ERRORE: fornire la connection string via \$SUPABASE_DB_URL o come primo argomento." >&2
  exit 1
fi

command -v pg_dump >/dev/null 2>&1 || { echo "ERRORE: pg_dump non trovato. Installa i client PostgreSQL 16." >&2; exit 1; }

STAMP="$(date +%Y%m%d_%H%M%S)"
OUT="dump_public_${STAMP}"
mkdir -p "${OUT}"

COMMON=( --schema=public --no-owner --no-privileges )

echo ">> [1/4] Schema (solo struttura) ..."
pg_dump "${DB_URL}" "${COMMON[@]}" --schema-only -f "${OUT}/public_schema.sql"

echo ">> [2/4] Dati (solo dati) ..."
pg_dump "${DB_URL}" "${COMMON[@]}" --data-only -f "${OUT}/public_data.sql"

echo ">> [3/4] Completo schema+dati (SQL) ..."
pg_dump "${DB_URL}" "${COMMON[@]}" -f "${OUT}/public_full.sql"

echo ">> [4/4] Completo formato custom (per restore selettivo con pg_restore) ..."
pg_dump "${DB_URL}" "${COMMON[@]}" -Fc -f "${OUT}/public_full.dump"

# checksum + riepilogo
( cd "${OUT}" && shasum -a 256 * > SHA256SUMS.txt 2>/dev/null || sha256sum * > SHA256SUMS.txt )

echo ""
echo "==================================================================="
echo " Dump completato in: ${OUT}/"
echo "   - public_schema.sql   (solo schema)"
echo "   - public_data.sql     (solo dati)"
echo "   - public_full.sql     (schema + dati, testo)"
echo "   - public_full.dump    (schema + dati, formato custom)"
echo "   - SHA256SUMS.txt      (integrità)"
echo "==================================================================="
echo ""
echo " ATTENZIONE SICUREZZA:"
echo "   Lo schema public include le tabelle 'login' (password) e 'lh_utente' (PII)."
echo "   Trattare i file come DATI SENSIBILI: non caricarli su repo/URL pubblici."
