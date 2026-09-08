-- =====================================================================
-- STUB VIEWS — viste VUOTE conformi al contratto app (types.ts)
-- Per tabelle SENZA sorgente reale nei dump forniti (dwh.sql / ca_52.sql):
--   dominio Competenze/SIPRO/PTFP + InPA + Syllabus.
-- Scopo: evitare errori a runtime quando l'app punta al Supabase reale;
--   le relative sezioni mostreranno "nessun dato" / fallback demo.
-- Da SOSTITUIRE con viste reali quando il committente fornira' i dump.
-- =====================================================================

-- STUB (vuota) — public.dw_competenza
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_competenza CASCADE;
CREATE VIEW public.dw_competenza AS
SELECT
  NULL::text AS area,
  NULL::text AS codice,
  NULL::text AS tipo,
  NULL::text AS titolo
WHERE false;
-- GRANT SELECT ON public.dw_competenza TO anon, authenticated;

-- STUB (vuota) — public.dw_bridge_profilo_competenza
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_bridge_profilo_competenza CASCADE;
CREATE VIEW public.dw_bridge_profilo_competenza AS
SELECT
  NULL::text AS cfiscale_ente,
  NULL::text AS cod_competenza,
  NULL::text AS cod_profilo_di_ruolo,
  NULL::numeric AS dipendenti_totali_profilo,
  NULL::numeric AS dipendenti_valutati,
  NULL::integer AS id,
  NULL::integer AS id_ente,
  NULL::numeric AS livello_target,
  NULL::numeric AS livello_valutato_medio
WHERE false;
-- GRANT SELECT ON public.dw_bridge_profilo_competenza TO anon, authenticated;

-- STUB (vuota) — public.dw_famiglia_professionale
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_famiglia_professionale CASCADE;
CREATE VIEW public.dw_famiglia_professionale AS
SELECT
  NULL::text AS codice,
  NULL::text AS comparto,
  NULL::text AS dimensione_professionale,
  NULL::text AS titolo
WHERE false;
-- GRANT SELECT ON public.dw_famiglia_professionale TO anon, authenticated;

-- STUB (vuota) — public.dw_profilo_di_ruolo
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_profilo_di_ruolo CASCADE;
CREATE VIEW public.dw_profilo_di_ruolo AS
SELECT
  NULL::text AS ambito_ruolo,
  NULL::text AS area_contrattuale,
  NULL::text AS codice,
  NULL::text AS famiglia_professionale,
  NULL::integer AS id_ente,
  NULL::text AS macrocategoria,
  NULL::text AS nome
WHERE false;
-- GRANT SELECT ON public.dw_profilo_di_ruolo TO anon, authenticated;

-- STUB (vuota) — public.dw_minerva_assessment
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_minerva_assessment CASCADE;
CREATE VIEW public.dw_minerva_assessment AS
SELECT
  NULL::integer AS anno,
  NULL::text AS ciclo,
  NULL::text AS created_at,
  NULL::text AS data_fine,
  NULL::text AS data_inizio,
  NULL::numeric AS gap_max,
  NULL::numeric AS gap_medio,
  NULL::integer AS id,
  NULL::integer AS id_ente,
  NULL::numeric AS nr_competenze_valutate,
  NULL::numeric AS nr_dipendenti_totali,
  NULL::numeric AS nr_dipendenti_valutati,
  NULL::numeric AS nr_profili_coinvolti,
  NULL::text AS stato
WHERE false;
-- GRANT SELECT ON public.dw_minerva_assessment TO anon, authenticated;

-- STUB (vuota) — public.dw_ptfp_dotazione
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_ptfp_dotazione CASCADE;
CREATE VIEW public.dw_ptfp_dotazione AS
SELECT
  NULL::text AS categoria_giuridica,
  NULL::text AS cfiscale_amm,
  NULL::integer AS id,
  NULL::numeric AS n_teste_dotazione,
  NULL::numeric AS spesa_massima,
  NULL::text AS triennio,
  NULL::numeric AS valore_economico
WHERE false;
-- GRANT SELECT ON public.dw_ptfp_dotazione TO anon, authenticated;

-- STUB (vuota) — public.dw_ptfp_reclutamento
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_ptfp_reclutamento CASCADE;
CREATE VIEW public.dw_ptfp_reclutamento AS
SELECT
  NULL::integer AS anno_piano,
  NULL::text AS area_giuridica,
  NULL::text AS cfiscale_amm,
  NULL::integer AS id,
  NULL::text AS procedura_selettiva,
  NULL::text AS profilo_di_ruolo,
  NULL::text AS tipologia,
  NULL::numeric AS totale_impegnato,
  NULL::text AS triennio,
  NULL::numeric AS ula_da_assumere,
  NULL::numeric AS valore_economico
WHERE false;
-- GRANT SELECT ON public.dw_ptfp_reclutamento TO anon, authenticated;

-- STUB (vuota) — public.dw_inpa_bandi
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_inpa_bandi CASCADE;
CREATE VIEW public.dw_inpa_bandi AS
SELECT
  NULL::integer AS anno,
  NULL::text AS categoria_ipa,
  NULL::text AS cfiscale_pa,
  NULL::text AS codice,
  NULL::text AS data_pubblicazione,
  NULL::text AS data_scadenza,
  NULL::text AS fascia_retributiva,
  NULL::text AS figura_ricercata,
  NULL::integer AS id,
  NULL::integer AS id_ente,
  NULL::numeric AS num_candidature_submitted,
  NULL::numeric AS num_posti,
  NULL::text AS provincia,
  NULL::text AS regione,
  NULL::text AS settore_pubblicazione,
  NULL::text AS stato_bando,
  NULL::text AS tipo_procedura,
  NULL::text AS tipologia_ipa
WHERE false;
-- GRANT SELECT ON public.dw_inpa_bandi TO anon, authenticated;

-- STUB (vuota) — public.dw_inpa_candidati
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_inpa_candidati CASCADE;
CREATE VIEW public.dw_inpa_candidati AS
SELECT
  NULL::integer AS anno,
  NULL::text AS area_geografica,
  NULL::text AS fascia_eta,
  NULL::text AS genere,
  NULL::integer AS id,
  NULL::integer AS id_bando,
  NULL::numeric AS num_candidature,
  NULL::text AS regione,
  NULL::text AS titolo_studio
WHERE false;
-- GRANT SELECT ON public.dw_inpa_candidati TO anon, authenticated;

-- STUB (vuota) — public.dw_lp_graduatorie
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_lp_graduatorie CASCADE;
CREATE VIEW public.dw_lp_graduatorie AS
SELECT
  NULL::integer AS anno,
  NULL::text AS categoria,
  NULL::text AS cfiscale_amm,
  NULL::text AS contratto,
  NULL::text AS data_approvazione_graduatoria,
  NULL::text AS data_pubblicazione_bando_gu,
  NULL::text AS denominazione,
  NULL::text AS famiglia_professionale,
  NULL::integer AS id,
  NULL::integer AS id_ente,
  NULL::numeric AS num_idonei,
  NULL::numeric AS num_idonei_assunti,
  NULL::numeric AS num_idonei_disponibili,
  NULL::numeric AS num_posti_banditi,
  NULL::numeric AS num_vincitori_assunti,
  NULL::numeric AS num_vincitori_da_assumere,
  NULL::text AS profilo,
  NULL::text AS qualifica,
  NULL::text AS stato_graduatoria,
  NULL::numeric AS tcp_giorni,
  NULL::text AS tipologia
WHERE false;
-- GRANT SELECT ON public.dw_lp_graduatorie TO anon, authenticated;

-- STUB (vuota) — public.dw_syllabus_pa
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_syllabus_pa CASCADE;
CREATE VIEW public.dw_syllabus_pa AS
SELECT
  NULL::integer AS anno_partecipazione,
  NULL::text AS categoria_ipa,
  NULL::text AS cfiscale,
  NULL::text AS comparto,
  NULL::text AS denominazione,
  NULL::integer AS id_pa_syllabus,
  NULL::text AS provincia,
  NULL::text AS regione,
  NULL::text AS tipologia,
  NULL::text AS tipologia_ipa
WHERE false;
-- GRANT SELECT ON public.dw_syllabus_pa TO anon, authenticated;

-- STUB (vuota) — public.dw_syllabus_catalogo
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_syllabus_catalogo CASCADE;
CREATE VIEW public.dw_syllabus_catalogo AS
SELECT
  NULL::text AS categoria_syllabus,
  NULL::text AS competenza,
  NULL::text AS denominazione_corso,
  NULL::numeric AS durata_ore,
  NULL::text AS famiglia_livelli,
  NULL::integer AS id,
  NULL::integer AS id_corso,
  NULL::integer AS id_programma,
  NULL::text AS livello,
  NULL::text AS programma,
  NULL::text AS tipologia
WHERE false;
-- GRANT SELECT ON public.dw_syllabus_catalogo TO anon, authenticated;

-- STUB (vuota) — public.dw_syllabus_partecipazioni
-- Nessuna sorgente reale nei dump: vista vuota conforme al contratto types.ts.
DROP VIEW IF EXISTS public.dw_syllabus_partecipazioni CASCADE;
CREATE VIEW public.dw_syllabus_partecipazioni AS
SELECT
  NULL::integer AS anno,
  NULL::numeric AS anzianita_pa,
  NULL::text AS attivita_svolte,
  NULL::numeric AS durata_ore,
  NULL::text AS esito_finale,
  NULL::numeric AS eta,
  NULL::text AS fascia_eta,
  NULL::text AS genere,
  NULL::integer AS id,
  NULL::text AS id_competenza,
  NULL::integer AS id_corso,
  NULL::integer AS id_discente,
  NULL::integer AS id_pa,
  NULL::numeric AS livello_a,
  NULL::numeric AS livello_da,
  NULL::text AS qualifica,
  NULL::text AS tipo_contratto,
  NULL::text AS titolo_studio
WHERE false;
-- GRANT SELECT ON public.dw_syllabus_partecipazioni TO anon, authenticated;
