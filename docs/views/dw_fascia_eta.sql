-- =====================================================================
--  public.dw_fascia_eta — lookup fasce d'eta per dw_eta
--  Contratto (types.ts): classe, codice, eta_max, eta_min
--  Usata live da etaService: .select("codice, classe, eta_min").order(eta_min)
--    join: dw_eta.fascia_eta = dw_fascia_eta.codice
--  Derivata dai 12 codici reali presenti in ca.ft_eta (E0..E68).
-- =====================================================================
DROP MATERIALIZED VIEW IF EXISTS public.dw_fascia_eta CASCADE;
CREATE MATERIALIZED VIEW public.dw_fascia_eta AS
SELECT * FROM (
  VALUES
    ('E0',  'Fino a 19 anni', 0,   19),
    ('E20', '20-24 anni',     20,  24),
    ('E25', '25-29 anni',     25,  29),
    ('E30', '30-34 anni',     30,  34),
    ('E35', '35-39 anni',     35,  39),
    ('E40', '40-44 anni',     40,  44),
    ('E45', '45-49 anni',     45,  49),
    ('E50', '50-54 anni',     50,  54),
    ('E55', '55-59 anni',     55,  59),
    ('E60', '60-64 anni',     60,  64),
    ('E65', '65-67 anni',     65,  67),
    ('E68', '68 anni e oltre',68,  NULL)
) AS t(codice, classe, eta_min, eta_max);
CREATE UNIQUE INDEX IF NOT EXISTS dw_fascia_eta_codice_idx ON public.dw_fascia_eta (codice);
-- GRANT SELECT ON public.dw_fascia_eta TO anon, authenticated;
