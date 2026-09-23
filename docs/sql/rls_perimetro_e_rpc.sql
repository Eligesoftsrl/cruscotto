-- =====================================================================
--  RLS + adeguamento RPC per il perimetro dati basato sul TOKEN
--  (claim `is_global` e `enti_cf` iniettati dal proxy /exchange)
--
--  Obiettivo: l'isolamento dei dati NON deve dipendere dal parametro
--  `p_codice_fiscale` inviato dal client, ma dai claim del token.
--
--  Prerequisito PostgREST: il JWT secret dell'istanza deve coincidere con
--  SUPABASE_JWT_SECRET usato dal proxy (stessa istanza degli RPC).
--  I claim del token sono leggibili con current_setting('request.jwt.claims').
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Helper: lettura claim dal token
-- ---------------------------------------------------------------------
create schema if not exists app;

create or replace function app.jwt() returns jsonb
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb,
    '{}'::jsonb
  );
$$;

-- True se l'utente e' DFP/admin (vista globale, nessun filtro ente).
create or replace function app.is_global() returns boolean
language sql stable as $$
  select coalesce((app.jwt() ->> 'is_global')::boolean, false);
$$;

-- Array dei codici fiscali abilitati per l'utente.
create or replace function app.enti_cf() returns text[]
language sql stable as $$
  select case
    when jsonb_typeof(app.jwt() -> 'enti_cf') = 'array'
      then array(select jsonb_array_elements_text(app.jwt() -> 'enti_cf'))
    else '{}'::text[]
  end;
$$;

-- Un CF e' consentito se l'utente e' globale oppure il CF e' fra i suoi.
create or replace function app.cf_consentito(p_cf text) returns boolean
language sql stable as $$
  select app.is_global() or (p_cf is not null and p_cf = any(app.enti_cf()));
$$;


-- ---------------------------------------------------------------------
-- 2) RLS sulle tabelle/viste dati con colonna `cfiscale`
--    (per gli accessi diretti via PostgREST: es. dw_ente, mv_filtri, fatti)
--    Ripetere il blocco per ogni tabella/vista che espone il CF.
-- ---------------------------------------------------------------------
-- alter table public.<TABELLA_CON_CF> enable row level security;
--
-- create policy p_perimetro_select on public.<TABELLA_CON_CF>
--   for select to authenticated
--   using ( app.is_global() or cfiscale = any(app.enti_cf()) );
--
-- NB: per le VISTE, applicare la RLS alle tabelle sottostanti (le viste
--     ereditano il filtro), oppure usare viste con security_invoker = true
--     (PostgreSQL 15+):  alter view public.<VISTA> set (security_invoker = true);


-- ---------------------------------------------------------------------
-- 3) Adeguamento delle RPC fa_ca_*  (SECURITY DEFINER)
--    Le funzioni SECURITY DEFINER BYPASSANO le RLS: il perimetro va
--    imposto DENTRO la funzione. Pattern da applicare in cima ad OGNI RPC
--    che accetta `p_codice_fiscale`.
--
--    Helper riutilizzabile: restituisce il CF EFFETTIVO da usare, validando
--    il parametro contro il token. Per il DFP lascia passare (anche NULL =
--    Totale PA); per l'ente forza il perimetro e blocca CF non consentiti.
-- ---------------------------------------------------------------------
create or replace function app.cf_effettivo(p_cf text)
returns text
language plpgsql stable as $$
declare v text;
begin
  if app.is_global() then
    return p_cf;                     -- DFP: sceglie l'ente o NULL = totale
  end if;
  -- utente ente: il CF deve appartenere al token
  if p_cf is not null and not (p_cf = any(app.enti_cf())) then
    raise exception 'CF non consentito per questo utente'
      using errcode = '42501';       -- insufficient_privilege
  end if;
  v := coalesce(p_cf, (app.enti_cf())[1]);   -- default: primo ente del token
  if v is null then
    raise exception 'Nessun ente abilitato per questo utente'
      using errcode = '42501';
  end if;
  return v;
end$$;

-- ESEMPIO di adeguamento di una RPC (schema indicativo):
--
-- create or replace function public.fa_ca_progressioni_kpi(
--   p_anno int,
--   p_codice_fiscale text default null,
--   p_istituzione text default null
-- ) returns table (...) language plpgsql security definer as $$
-- declare v_cf text;
-- begin
--   v_cf := app.cf_effettivo(p_codice_fiscale);   -- <<< UNICA riga da aggiungere
--   return query
--     select ...
--     from   ...
--     where  (v_cf is null or ente.cfiscale = v_cf)   -- usa v_cf, non p_codice_fiscale
--       and  anno = p_anno;
-- end$$;
--
-- Applicare lo stesso pattern (sostituire p_codice_fiscale con v_cf) a TUTTE
-- le fa_ca_* : *_kpi, *_evoluzione, *_fasce_genere, *_categorie, ecc.


-- ---------------------------------------------------------------------
-- 4) Tabelle ADMIN (schema `scruscotto`)
--    Sono servite dal PROXY (non da PostgREST): vanno rese NON pubbliche.
-- ---------------------------------------------------------------------
-- a) NON esporre lo schema via PostgREST:
--    nella config PostgREST/Supabase, `db-schemas` (PGRST_DB_SCHEMAS) deve
--    contenere solo `public` (e NON `scruscotto`).
-- b) Revocare i permessi ai ruoli PostgREST:
--    revoke all on all tables in schema scruscotto from anon, authenticated;
--    revoke usage on schema scruscotto from anon, authenticated;
-- c) Concedere i permessi SOLO all'utente del proxy:
--    grant usage on schema scruscotto to cruscapp;
--    grant select, insert, update on all tables in schema scruscotto to cruscapp;
--    grant select on all tables in schema scruscotto to cruscapp;  -- viste

-- Fine.
