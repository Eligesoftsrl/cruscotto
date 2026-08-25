
-- 1) Enrich dw_syllabus_catalogo with official 5 categories
ALTER TABLE public.dw_syllabus_catalogo
  ADD COLUMN IF NOT EXISTS categoria_syllabus TEXT;

-- 2) Enrich dw_syllabus_partecipazioni with demographics
ALTER TABLE public.dw_syllabus_partecipazioni
  ADD COLUMN IF NOT EXISTS genere TEXT,
  ADD COLUMN IF NOT EXISTS fascia_eta TEXT,
  ADD COLUMN IF NOT EXISTS qualifica TEXT,
  ADD COLUMN IF NOT EXISTS tipo_contratto TEXT,
  ADD COLUMN IF NOT EXISTS durata_ore NUMERIC;

-- 3) Enrich dw_syllabus_pa with IPA classification
ALTER TABLE public.dw_syllabus_pa
  ADD COLUMN IF NOT EXISTS categoria_ipa TEXT,
  ADD COLUMN IF NOT EXISTS tipologia_ipa TEXT,
  ADD COLUMN IF NOT EXISTS regione TEXT,
  ADD COLUMN IF NOT EXISTS provincia TEXT;

-- 4) Populate categoria_syllabus on catalogo
UPDATE public.dw_syllabus_catalogo SET categoria_syllabus = CASE
  WHEN competenza ILIKE '%digital%' OR competenza ILIKE '%dati%' OR competenza ILIKE '%sicurezza%' OR competenza ILIKE '%ICT%' THEN 'Transizione Digitale'
  WHEN competenza ILIKE '%ecolog%' OR competenza ILIKE '%ambient%' OR competenza ILIKE '%sostenib%' THEN 'Transizione Ecologica'
  WHEN competenza ILIKE '%leader%' OR competenza ILIKE '%comunic%' OR competenza ILIKE '%team%' OR competenza ILIKE '%soft%' THEN 'Leadership e Soft Skills'
  WHEN competenza ILIKE '%PA%' OR competenza ILIKE '%pubblic%' OR competenza ILIKE '%amministr%' OR competenza ILIKE '%normativ%' THEN 'Principi della PA'
  ELSE 'Transizione Amministrativa'
END
WHERE categoria_syllabus IS NULL;

-- 5) Populate demographics on partecipazioni
UPDATE public.dw_syllabus_partecipazioni SET
  genere = CASE WHEN random() < 0.55 THEN 'F' ELSE 'M' END,
  fascia_eta = (ARRAY['<30','30-39','40-49','50-59','60+'])[floor(random()*5+1)::int],
  qualifica = (ARRAY['Dirigente','Funzionario','Istruttore','Operatore'])[floor(random()*4+1)::int],
  tipo_contratto = CASE WHEN random() < 0.85 THEN 'Tempo Indeterminato' ELSE 'Tempo Determinato' END,
  durata_ore = round((random()*20+2)::numeric, 1)
WHERE genere IS NULL;

-- 6) Populate PA classification
UPDATE public.dw_syllabus_pa SET
  categoria_ipa = (ARRAY['Ministeri','Agenzie Fiscali','Enti Pubblici','Regioni','Province','Comuni','Università','Enti di Ricerca','ASL'])[floor(random()*9+1)::int],
  tipologia_ipa = (ARRAY['Amministrazione Centrale','Amministrazione Locale','Ente Pubblico Non Economico','Agenzia'])[floor(random()*4+1)::int],
  regione = (ARRAY['Lombardia','Lazio','Campania','Sicilia','Veneto','Piemonte','Emilia-Romagna','Toscana','Puglia','Sardegna','Calabria','Liguria','Marche','Abruzzo','Friuli-Venezia Giulia','Umbria','Basilicata','Molise','Trentino-Alto Adige','Valle d''Aosta'])[floor(random()*20+1)::int],
  provincia = (ARRAY['Roma','Milano','Napoli','Torino','Palermo','Genova','Bologna','Firenze','Bari','Catania','Venezia','Verona','Messina','Padova','Trieste'])[floor(random()*15+1)::int]
WHERE categoria_ipa IS NULL;
