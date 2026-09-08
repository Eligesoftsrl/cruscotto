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
