-- =============================================================================
--  Cruscotto HR — Tabella di CONFIGURAZIONE applicativa (app_config)
--  Schema: public (esposto via PostgREST/Supabase)
--  Da applicare sul progetto Supabase del cliente (eseguire come sistemista).
--
--  SCOPO
--  -----
--  Tabella chiave/valore per i parametri configurabili dell'applicazione.
--  Al momento contiene un solo parametro usato dal frontend:
--
--    key = 'benchmark_max_enti'
--      -> Numero MASSIMO di enti confrontabili contemporaneamente nella
--         scheda SIPrO «Benchmark» (selettore multi-ente).
--      -> Letto da: src/services/sipro/benchmarkService.ts
--         (SELECT value FROM app_config WHERE key = 'benchmark_max_enti').
--      -> Se la tabella o la chiave non esistono, il frontend usa il
--         DEFAULT = 6 (nessun errore). Quindi questo script è OPZIONALE ma
--         consigliato per poter pilotare il limite senza rilasci.
--
--  NOTE
--  ----
--  * `value` è memorizzato come TEXT e interpretato numericamente lato app
--    (Number(value)). Per 'benchmark_max_enti' inserire un intero positivo.
--  * IDEMPOTENTE: può essere rieseguito senza errori. Il seed usa
--    `on conflict do nothing`, quindi NON sovrascrive un valore già impostato.
--  * L'app NON usa Supabase Auth ma Keycloak: verso Supabase le richieste
--    arrivano con ruolo `anon`. La policy di SELECT è perciò permissiva per
--    anon/authenticated (sola lettura), coerente con le altre tabelle admin.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) TABELLA
-- -----------------------------------------------------------------------------
create table if not exists public.app_config (
  key         text primary key,
  value       text not null,
  description text,
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 2) SEED (valore di default = 6). Non sovrascrive un valore già presente.
-- -----------------------------------------------------------------------------
insert into public.app_config (key, value, description) values
  ('benchmark_max_enti', '6', 'Numero massimo di enti confrontabili nella scheda SIPrO Benchmark')
on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- 3) RLS + ESPOSIZIONE POSTGREST
--    Lettura aperta (anon/authenticated); l'aggiornamento è consentito ma,
--    di norma, lo modifica il sistemista con la UPDATE del punto 4.
-- -----------------------------------------------------------------------------
alter table public.app_config enable row level security;
create policy ac_select on public.app_config for select to anon, authenticated using (true);
create policy ac_update on public.app_config for update to anon, authenticated using (true) with check (true);

grant select, update on public.app_config to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 4) COME CAMBIARE IL LIMITE (esempio: portarlo a 8)
--    Eseguire quando serve modificare il numero massimo di enti a confronto.
-- -----------------------------------------------------------------------------
-- update public.app_config
--    set value = '8', updated_at = now()
--  where key = 'benchmark_max_enti';

-- Fine.
