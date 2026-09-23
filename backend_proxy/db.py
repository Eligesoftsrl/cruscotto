"""
Accesso diretto al Postgres (rete privata) per le tabelle Admin.

Le tabelle admin (feature_flags, log_*, viste statistiche) vivono nello schema
dedicato `scruscotto` e NON devono essere raggiungibili dall'anon di PostgREST.
Il proxy si connette con un utente Postgres dedicato (`cruscapp`) e applica lui
i controlli di ruolo (require_admin).

Lo schema di default (search_path) e impostato a livello di connessione tramite
la variabile d'ambiente DB_SCHEMA, cosi' le query restano non qualificate.
"""

import os
from contextlib import contextmanager

from psycopg_pool import ConnectionPool
from psycopg.rows import dict_row

# Es: postgresql://cruscapp:PASSWORD@172.16.0.15:5432/cruscotto
DATABASE_URL = os.environ["DATABASE_URL"]
DB_SCHEMA = os.environ.get("DB_SCHEMA", "public")

# search_path impostato sulla connessione: prima lo schema dedicato, poi public.
_pool = ConnectionPool(
    DATABASE_URL,
    min_size=1,
    max_size=5,
    open=True,
    kwargs={"options": f"-c search_path={DB_SCHEMA},public"},
)


@contextmanager
def get_cursor():
    """Cursore con righe come dict; commit/rollback automatici."""
    with _pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            yield cur
