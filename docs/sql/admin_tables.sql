-- =============================================================================
--  Cruscotto HR — Tabelle Pannello di Amministrazione
--  Schema: public (esposto via PostgREST/Supabase)
--  Da applicare sul progetto Supabase del cliente.
--
--  Copre le 5 funzioni Admin attive lato frontend:
--    1. feature_flags   -> gestione funzionalità (on/off)
--    2. log_accessi     -> lista accessi (login con orario)
--    3. log_eventi      -> log eventi / navigazione
--    4. log_errori      -> log errori applicativi
--    5. v_stat_*        -> statistiche di utilizzo (VISTE derivate dagli eventi)
--
--  NB: le chiavi di `feature_flags.key` DEVONO coincidere con quelle usate
--      dal frontend (vedi src/services/admin/featureRegistry.ts).
-- =============================================================================

create extension if not exists pgcrypto;   -- per gen_random_uuid()

-- -----------------------------------------------------------------------------
-- 1) FEATURE FLAGS (gestione funzionalità on/off)
-- -----------------------------------------------------------------------------
create table if not exists public.feature_flags (
  key         text primary key,
  label       text not null,
  description text,
  category    text,
  enabled     boolean not null default true,
  updated_at  timestamptz not null default now()
);

-- Seed iniziale allineato al frontend (featureRegistry.ts).
insert into public.feature_flags (key, label, description, category, enabled) values
  ('guided_navigation',  'Navigazione Guidata', 'Percorsi narrativi / Bussola',                'Navigazione',           true),
  ('technical_dashboard', 'Vista Tecnica',       'Cruscotto tecnico con indicatori e benchmark','Navigazione',           true),
  ('narrative_report',    'Rapporto Narrativo',  'Generazione del rapporto narrativo',          'Navigazione',           true),
  ('scheda_eta',          'Analisi Età',          'Scheda Conto Annuale — analisi per età',       'Schede Conto Annuale',  true),
  ('scheda_anzianita',    'Anzianità',            'Scheda Conto Annuale — anzianità di servizio',  'Schede Conto Annuale',  true),
  ('scheda_assunti',      'Assunti',             'Scheda Conto Annuale — assunzioni per causale', 'Schede Conto Annuale',  true),
  ('scheda_cessazioni',   'Cessazioni',          'Scheda Conto Annuale — cessazioni per causale', 'Schede Conto Annuale',  true),
  ('scheda_turnover',     'Turnover',            'Scheda Conto Annuale — tasso di turnover',      'Schede Conto Annuale',  true),
  ('scheda_sostituzione', 'Sostituzione',        'Scheda Conto Annuale — tasso di sostituzione',  'Schede Conto Annuale',  true),
  ('export_dati',         'Export Dati',         'Esportazione tabelle e grafici',              'Sistema',               true),
  ('admin_panel',         'Pannello Admin',      'Accesso al pannello di amministrazione',      'Sistema',               true)
on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- 2) LOG ACCESSI (login con orario)
-- -----------------------------------------------------------------------------
create table if not exists public.log_accessi (
  id         uuid primary key default gen_random_uuid(),
  ts         timestamptz not null default now(),
  username   text,
  ruolo      text,
  esito      text not null default 'success' check (esito in ('success','fail')),
  ip         inet,
  user_agent text
);
create index if not exists idx_log_accessi_ts on public.log_accessi (ts desc);

-- -----------------------------------------------------------------------------
-- 3) LOG EVENTI (navigazione / azioni utente)
-- -----------------------------------------------------------------------------
create table if not exists public.log_eventi (
  id       uuid primary key default gen_random_uuid(),
  ts       timestamptz not null default now(),
  username text,
  ruolo    text,
  azione   text not null,
  sezione  text,
  dettagli jsonb
);
create index if not exists idx_log_eventi_ts      on public.log_eventi (ts desc);
create index if not exists idx_log_eventi_sezione on public.log_eventi (sezione);

-- -----------------------------------------------------------------------------
-- 4) LOG ERRORI
-- -----------------------------------------------------------------------------
create table if not exists public.log_errori (
  id        uuid primary key default gen_random_uuid(),
  ts        timestamptz not null default now(),
  username  text,
  livello   text not null default 'error' check (livello in ('error','warn')),
  origine   text,        -- 'query' | 'boundary' | 'runtime'
  messaggio text not null,
  stack     text
);
create index if not exists idx_log_errori_ts on public.log_errori (ts desc);

-- -----------------------------------------------------------------------------
-- 5) STATISTICHE DI UTILIZZO (VISTE derivate: nessuna tabella da mantenere)
-- -----------------------------------------------------------------------------
-- Utilizzo per singola sezione/funzione (dai soli eventi).
create or replace view public.v_stat_utilizzo as
  select e.sezione        as funzione,
         count(*)::int    as utilizzi,
         max(e.ts)        as ultimo_utilizzo
  from   public.log_eventi e
  group  by e.sezione
  order  by utilizzi desc;

-- Utilizzo per funzionalità censita (mostra anche quelle MAI utilizzate).
create or replace view public.v_stat_funzionalita as
  select f.key,
         f.label,
         f.category,
         f.enabled,
         coalesce(s.utilizzi, 0) as utilizzi,
         s.ultimo_utilizzo
  from   public.feature_flags f
  left   join (
           select sezione, count(*)::int as utilizzi, max(ts) as ultimo_utilizzo
           from   public.log_eventi
           group  by sezione
         ) s on s.sezione = f.label
  order  by utilizzi desc;

-- =============================================================================
--  ESPOSIZIONE POSTGREST + RLS
--
--  NB IMPORTANTE: l'app NON usa Supabase Auth ma Keycloak; verso Supabase tutte
--  le richieste arrivano quindi con il ruolo `anon` (chiave publishable). Le
--  policy sotto sono perciò PERMISSIVE per `anon`/`authenticated`. In produzione,
--  per una sicurezza più fine (restringere la LETTURA dei log ai soli admin), si
--  consiglia di spostare la scrittura su funzioni RPC SECURITY DEFINER e/o un
--  piccolo proxy backend. La UI Admin è comunque già riservata al profilo DFP.
-- =============================================================================

-- Feature flags: lettura e aggiornamento
alter table public.feature_flags enable row level security;
create policy ff_select on public.feature_flags for select to anon, authenticated using (true);
create policy ff_update on public.feature_flags for update to anon, authenticated using (true) with check (true);

-- Log accessi: inserimento + lettura
alter table public.log_accessi enable row level security;
create policy la_insert on public.log_accessi for insert to anon, authenticated with check (true);
create policy la_select on public.log_accessi for select to anon, authenticated using (true);

-- Log eventi: inserimento + lettura
alter table public.log_eventi enable row level security;
create policy le_insert on public.log_eventi for insert to anon, authenticated with check (true);
create policy le_select on public.log_eventi for select to anon, authenticated using (true);

-- Log errori: inserimento + lettura
alter table public.log_errori enable row level security;
create policy lr_insert on public.log_errori for insert to anon, authenticated with check (true);
create policy lr_select on public.log_errori for select to anon, authenticated using (true);

-- GRANT per esposizione via PostgREST
grant select, update        on public.feature_flags to anon, authenticated;
grant select, insert        on public.log_accessi   to anon, authenticated;
grant select, insert        on public.log_eventi    to anon, authenticated;
grant select, insert        on public.log_errori    to anon, authenticated;
grant select                on public.v_stat_utilizzo    to anon, authenticated;
grant select                on public.v_stat_funzionalita to anon, authenticated;

-- Fine.
