-- =====================================================================
--  public.dw_verifica_indicatori — vista di compatibilità (contratto)
-- ---------------------------------------------------------------------
--  Riproduce il contratto atteso dal frontend (types.ts -> dw_verifica_indicatori).
--
--  NOTA IMPORTANTE (analisi codice):
--  Questa tabella NON è interrogata da alcuna query live del frontend
--  (nessun `.from("dw_verifica_indicatori")` nel codice). I valori "radar"
--  e gli indici Executive sono attualmente array demo statici in
--  src/components/dashboard/executive/executiveData.ts.
--  L'indice IAC usato dall'app è ricalcolato lato client da dw_kpi_rilevazione
--  (vedi src/services/dw/iacService.ts).
--
--  Questa vista serve quindi solo a MANTENERE IL CONTRATTO (nomi + colonne)
--  in modo che eventuali riferimenti futuri non falliscano.
--
--  Gli indici compositi normalizzati (iac, iap, icec, icpr, icq, ics_norm,
--  idc, idla, idp_norm, ief_norm, iesf, ifm_norm, igf, ipd, irg_norm, irs,
--  isg, pti, tcf, tcp_gg, tcpb, tep, tsc, cgc, cqt, dpi_norm, ...) NON hanno
--  una formula sorgente nel DB reale EAV: la loro definizione ufficiale
--  (metodologia di scoring 0-4 / normalizzazioni) va fornita dal committente.
--  Sono quindi esposti come NULL (TODO). Sono invece popolati i campi
--  anagrafici e `organico_2023` (derivato dal personale a tempo indeterminato).
--
--  DIPENDENZE: public.dw_ente, public.dw_kpi_rilevazione
--  Eseguire nel NUOVO progetto Supabase, schema public.
-- =====================================================================
DROP MATERIALIZED VIEW IF EXISTS public.dw_verifica_indicatori CASCADE;

CREATE MATERIALIZED VIEW public.dw_verifica_indicatori AS
SELECT
    de.id_ente                                  AS id_ente,
    de.denominazione                            AS denominazione,
    de.tipo_istituzione                         AS tipologia,
    NULL::text                                  AS profilo,          -- TODO: profilo/cluster ente (metodologia committente)
    COALESCE(k.q6_tep_personale::numeric, de.organico_2023)::numeric AS organico_2023, -- personale TI corrente

    -- ---- indici compositi (0-4) e normalizzati: TODO metodologia ufficiale ----
    NULL::numeric AS cgc,
    NULL::numeric AS cqt,
    NULL::numeric AS iac,
    NULL::numeric AS iap,
    NULL::numeric AS icec,
    NULL::numeric AS icpr,
    NULL::numeric AS icq,
    NULL::numeric AS ics_norm,
    NULL::numeric AS idc,
    NULL::numeric AS idla,
    NULL::numeric AS idp_norm,
    NULL::numeric AS ief_norm,
    NULL::numeric AS iesf,
    NULL::numeric AS ifm_norm,
    NULL::numeric AS igf,
    NULL::numeric AS ipd,
    NULL::numeric AS irg_norm,
    NULL::numeric AS irs,
    NULL::numeric AS isg,
    NULL::numeric AS pti,
    NULL::numeric AS tcf,
    NULL::numeric AS tcp_gg,
    NULL::numeric AS tcpb,
    NULL::numeric AS tep,
    NULL::numeric AS tsc,
    NULL::numeric AS dpi_norm,

    -- ---- cluster testuali: TODO metodologia ----
    NULL::text AS cluster_iap,
    NULL::text AS cluster_isg,
    NULL::text AS cluster_tep
FROM public.dw_ente de
LEFT JOIN public.dw_kpi_rilevazione k ON k.id_ente = de.id_ente;

CREATE UNIQUE INDEX IF NOT EXISTS dw_verifica_indicatori_id_ente_idx
    ON public.dw_verifica_indicatori (id_ente);

-- Esposizione PostgREST/Supabase:
-- GRANT SELECT ON public.dw_verifica_indicatori TO anon, authenticated;
