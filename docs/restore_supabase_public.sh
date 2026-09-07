#!/usr/bin/env bash
# =====================================================================
#  restore_supabase_public.sh
#  Ricarica un dump dello schema `public` in un DB Postgres/Supabase di destinazione
#  (es. istanza locale della Supabase CLI, o Postgres di produzione).
#
#  USO (formato custom .dump, consigliato):
#    export TARGET_DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
#    ./restore_supabase_public.sh dump_public_YYYYMMDD_HHMMSS/public_full.dump
#
#  USO (file .sql):
#    ./restore_supabase_public.sh dump_public_YYYYMMDD_HHMMSS/public_full.sql
#
#  DB locale Supabase CLI: host 127.0.0.1  porta 54322  user/pass postgres/postgres
#  PREREQUISITI: pg_restore + psql (client PostgreSQL 16)
# =====================================================================
set -euo pipefail

FILE="${1:-}"
TARGET="${TARGET_DB_URL:-}"

if [[ -z "${FILE}" || -z "${TARGET}" ]]; then
  echo "USO: TARGET_DB_URL=... ./restore_supabase_public.sh <file .dump | .sql>" >&2
  exit 1
fi
[[ -f "${FILE}" ]] || { echo "ERRORE: file non trovato: ${FILE}" >&2; exit 1; }

case "${FILE}" in
  *.dump)
    command -v pg_restore >/dev/null 2>&1 || { echo "ERRORE: pg_restore non trovato." >&2; exit 1; }
    echo ">> Restore (custom) su ${TARGET} ..."
    # --clean --if-exists: sostituisce eventuali oggetti esistenti
    pg_restore --no-owner --no-privileges --clean --if-exists \
      --schema=public -d "${TARGET}" "${FILE}"
    ;;
  *.sql)
    command -v psql >/dev/null 2>&1 || { echo "ERRORE: psql non trovato." >&2; exit 1; }
    echo ">> Restore (SQL) su ${TARGET} ..."
    psql "${TARGET}" -v ON_ERROR_STOP=1 -f "${FILE}"
    ;;
  *)
    echo "ERRORE: estensione non riconosciuta (usa .dump o .sql)." >&2; exit 1;;
esac

echo ">> Restore completato."
echo "   Nota: se usi Supabase, ricordati di verificare RLS/policy e i GRANT per i ruoli anon/authenticated."
