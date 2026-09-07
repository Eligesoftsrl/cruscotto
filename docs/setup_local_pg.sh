#!/usr/bin/env bash
# =====================================================================
# Setup PostgreSQL 17 locale + restore dump reali (dwh + ca) + viste dw_*
# Idempotente-ish. Utile perché i pod sono effimeri (possono resettarsi).
# =====================================================================
set -e
export DEBIAN_FRONTEND=noninteractive

DWH_URL="https://customer-assets-gfyr7b9c.emergentagent.net/job_cruscotto-refactor/artifacts/3rww4fix_dwh.sql"
CA_URL="https://customer-assets-gfyr7b9c.emergentagent.net/job_cruscotto-refactor/artifacts/cl7fsreq_ca_52.sql"

echo "== 1. Installazione PostgreSQL 17 (PGDG) =="
apt-get install -y curl ca-certificates gnupg lsb-release >/dev/null 2>&1 || true
install -d /usr/share/postgresql-common/pgdg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc
CODENAME=$(lsb_release -cs)
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] http://apt.postgresql.org/pub/repos/apt ${CODENAME}-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt-get update >/dev/null 2>&1
apt-get install -y postgresql-17 >/dev/null 2>&1
echo "   PG17 installato."

echo "== 2. Avvio cluster =="
pg_ctlcluster 17 main start || service postgresql start || true
sleep 3

echo "== 3. Download dump =="
cd /tmp
[ -f dwh.sql ]  || curl -fsSL "$DWH_URL" -o dwh.sql
[ -f ca_52.sql ] || curl -fsSL "$CA_URL" -o ca_52.sql
chown postgres:postgres /tmp/dwh.sql /tmp/ca_52.sql

echo "== 4. Ricreazione database realdb =="
sudo -u postgres psql -c "DROP DATABASE IF EXISTS realdb;" >/dev/null
sudo -u postgres psql -c "CREATE DATABASE realdb;" >/dev/null

echo "== 5. Restore schema dwh =="
sudo -u postgres pg_restore --no-owner --no-privileges -d realdb /tmp/dwh.sql 2>/tmp/r_dwh.log || \
  sudo -u postgres psql -d realdb -f /tmp/dwh.sql >/tmp/r_dwh.log 2>&1 || true

echo "== 6. Restore schema ca =="
sudo -u postgres psql -d realdb -c "CREATE SCHEMA IF NOT EXISTS ca;" >/dev/null
sudo -u postgres pg_restore --no-owner --no-privileges -d realdb -n ca /tmp/ca_52.sql 2>/tmp/r_ca.log || true

echo "== 7. Creazione viste dw_* (in ordine di dipendenza) =="
cd /app/docs/views
for f in dw_ente.sql v_kpi_ente_wide.sql dw_kpi_rilevazione.sql dw_verifica_indicatori.sql \
         dw_occupazione.sql dw_assunti.sql dw_cessati.sql dw_eta.sql dw_formazione.sql dw_modalita_lavoro.sql; do
  [ -f "$f" ] && sudo -u postgres psql -d realdb -f "$f" >/dev/null 2>>/tmp/r_views.log && echo "   ok $f" || echo "   (skip/err $f)"
done

echo "== FATTO =="
sudo -u postgres psql -d realdb -c "SELECT table_schema, count(*) FROM information_schema.tables WHERE table_schema IN ('dwh','ca','public') GROUP BY 1;"
