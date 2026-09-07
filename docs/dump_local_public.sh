#!/usr/bin/env bash
# =====================================================================
#  dump_local_public.sh
#  Dump dello schema `public` (schema + dati) dal Supabase LOCALE (Docker).
#
#  Perche' via 'docker exec': nello stack self-hosted la porta 5432 del
#  container 'supabase-db' NON e' pubblicata sull'host, quindi si esegue
#  pg_dump DENTRO il container (usa le env POSTGRES_* gia' presenti: non
#  serve conoscere la password).
#
#  USO (da qualsiasi cartella, basta che Docker sia attivo):
#    chmod +x dump_local_public.sh
#    ./dump_local_public.sh
#
#  Se il container ha un altro nome, cambiare CONTAINER (vedi 'docker ps').
# =====================================================================
set -euo pipefail

CONTAINER="${1:-supabase-db}"     # nome container (override: ./dump_local_public.sh <nome>)
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT="dump_public_${STAMP}"
mkdir -p "${OUT}"

# pg_dump ESEGUITO DENTRO il container: usa le env POSTGRES_* del container
BASE='PGPASSWORD="${POSTGRES_PASSWORD:-postgres}" pg_dump -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-postgres}" --schema=public --no-owner --no-privileges'

echo ">> test connessione (${CONTAINER})..."
docker exec "${CONTAINER}" sh -c 'PGPASSWORD="${POSTGRES_PASSWORD:-postgres}" psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-postgres}" -c "select version();"' >/dev/null

echo ">> [1/4] schema..."
docker exec "${CONTAINER}" sh -c "${BASE} --schema-only" > "${OUT}/public_schema.sql"
echo ">> [2/4] dati..."
docker exec "${CONTAINER}" sh -c "${BASE} --data-only"   > "${OUT}/public_data.sql"
echo ">> [3/4] completo (sql)..."
docker exec "${CONTAINER}" sh -c "${BASE}"               > "${OUT}/public_full.sql"
echo ">> [4/4] completo (custom)..."
docker exec "${CONTAINER}" sh -c "${BASE} -Fc -f /tmp/public_full.dump"
docker cp "${CONTAINER}:/tmp/public_full.dump" "${OUT}/public_full.dump"
docker exec "${CONTAINER}" rm -f /tmp/public_full.dump

( cd "${OUT}" && (shasum -a 256 * > SHA256SUMS.txt 2>/dev/null || sha256sum * > SHA256SUMS.txt) )

echo ""
echo "==================================================================="
echo " OK -> cartella ${OUT}/"
echo "   - public_schema.sql | public_data.sql | public_full.sql | public_full.dump"
echo "==================================================================="
ls -lh "${OUT}"
echo ""
echo " ATTENZIONE: 'login' (password) e 'lh_utente' (PII) sono nel dump -> file SENSIBILE."

# Se docker exec desse errore su utente/db, verifica i valori reali con:
#   docker exec supabase-db env | grep -i postgres
