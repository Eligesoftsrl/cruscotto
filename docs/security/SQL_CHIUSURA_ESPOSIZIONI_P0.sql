-- ============================================================================
-- Cruscotto HR · Chiusura delle esposizioni di dati (PRIORITÀ CRITICA)
-- Da eseguire sulla base dati di PRODUZIONE (api-cr.progetto-gru.it) a cura del sistemista,
-- con un utente amministratore (es. postgres). Script rieseguibile.
--
-- Esito della verifica (security by design): con la sola chiave PUBBLICA «anon», inclusa
-- per progetto nel codice del browser, chiunque può leggere via API:
--   • login            → 12 righe: username, PASSWORD (non cifrate), nome, cognome, email
--   • lh_utente        → 120 righe: codice fiscale, nome, cognome, data di nascita, …
--   • lh_cms_fornitore → 5 righe: email, telefono
--   • log_accessi / log_eventi / log_errori → username, ruolo, IP, user agent
-- Le tabelle login, lh_utente e lh_cms_fornitore NON sono usate dal Cruscotto: la chiusura
-- non ha alcun impatto sul funzionamento.
--
-- AZIONI COLLEGATE (non SQL):
--   1. Considerare compromesse le 12 password: cambiarle subito e, se riusate, anche
--      sugli altri sistemi. Valutare con il DPO l'obbligo di notifica (GDPR art. 33).
--   2. Non conservare mai password in chiaro: l'accesso avviene tramite Keycloak.
-- ============================================================================

begin;

-- 1) Tabelle con dati personali non usate dal Cruscotto: nessun accesso via API -------
do $$
declare t text;
begin
  foreach t in array array['login', 'lh_utente', 'lh_cms_fornitore'] loop
    if to_regclass('public.' || t) is not null then
      execute format('revoke all on table public.%I from anon, authenticated', t);
      execute format('alter table public.%I enable row level security', t);
      execute format('alter table public.%I force row level security', t);
      raise notice 'Chiusa: %', t;
    end if;
  end loop;
end $$;

-- 2) Registri amministrativi: lettura e scrittura solo tramite lo strato di protezione --
--    (il proxy usa una connessione dedicata al database, non le chiavi anon/authenticated).
--    ATTENZIONE: eseguire solo con lo strato di protezione attivo; senza proxy il pannello
--    di amministrazione non potrebbe più leggere i registri.
do $$
declare t text;
begin
  foreach t in array array['log_accessi', 'log_eventi', 'log_errori'] loop
    if to_regclass('public.' || t) is not null then
      execute format('revoke all on table public.%I from anon', t);
      execute format('revoke select, update, delete on table public.%I from authenticated', t);
      execute format('alter table public.%I enable row level security', t);
      raise notice 'Protetta: %', t;
    end if;
  end loop;
end $$;

-- 3) Nuove tabelle: per impostazione predefinita nessun privilegio alle chiavi pubbliche --
alter default privileges in schema public revoke all on tables from anon;

commit;

-- 4) Verifica (deve restituire 0 righe per le tabelle sopra) ---------------------------
select table_name, privilege_type, grantee
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
  and table_name in ('login', 'lh_utente', 'lh_cms_fornitore',
                     'log_accessi', 'log_eventi', 'log_errori')
order by 1, 3, 2;
