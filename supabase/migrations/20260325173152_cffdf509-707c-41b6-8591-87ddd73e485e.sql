
-- ============================================================
-- SEED: Conto Annuale fact data for 6 municipalities (multi-year)
-- ============================================================

-- Helper: ente sizes (Padova=1400, Gubbio=180, Vibo=220, Brescia=1800, Avezzano=150, Tivoli=350)

-- CA_OCCUPAZIONE (per ente, per categoria, multi-year 2020-2023)
INSERT INTO ca_occupazione (istituzione_id, contratto_id, categoria_id, qualifica_id, anno, personale_tempo_pieno_uomini, personale_tempo_pieno_donne, part_time_inf50_uomini, part_time_inf50_donne, part_time_sup50_uomini, part_time_sup50_donne)
SELECT ente_id, 1, cat_id, qual_id, anno,
  CASE WHEN ente_id=1 THEN base*m WHEN ente_id=2 THEN base*m/8 WHEN ente_id=3 THEN base*m/6 WHEN ente_id=4 THEN base*m*13/10 WHEN ente_id=5 THEN base*m/9 ELSE base*m/4 END,
  CASE WHEN ente_id=1 THEN base*f WHEN ente_id=2 THEN base*f/8 WHEN ente_id=3 THEN base*f/6 WHEN ente_id=4 THEN base*f*13/10 WHEN ente_id=5 THEN base*f/9 ELSE base*f/4 END,
  CASE WHEN ente_id IN (1,4) THEN 2 ELSE 0 END,
  CASE WHEN ente_id IN (1,4) THEN 5 ELSE 1 END,
  CASE WHEN ente_id IN (1,4) THEN 8 ELSE 2 END,
  CASE WHEN ente_id IN (1,4) THEN 15 ELSE 4 END
FROM
  (SELECT unnest(ARRAY[1,2,3,4,5,6]) AS ente_id) e,
  (SELECT unnest(ARRAY[2020,2021,2022,2023]) AS anno) a,
  (VALUES (1,1,35,1,1),(2,2,45,1,1),(3,3,120,1,1),(3,4,60,1,1),(3,5,40,1,1),(4,6,80,1,1),(4,7,50,1,1),(4,8,30,1,1),(4,9,20,1,1),(5,10,12,1,0),(6,11,1,1,0)) v(cat_id, qual_id, base, m, f);

-- CA_ASSUNTI
INSERT INTO ca_assunti (istituzione_id, contratto_id, categoria_id, causale_id, anno, uomini, donne)
SELECT ente_id, 1, cat_id, causale_id, anno,
  GREATEST(1, CASE WHEN ente_id=1 THEN n WHEN ente_id=4 THEN n*13/10 ELSE GREATEST(1,n/5) END),
  GREATEST(1, CASE WHEN ente_id=1 THEN n+2 WHEN ente_id=4 THEN (n+2)*13/10 ELSE GREATEST(1,(n+2)/5) END)
FROM
  (SELECT unnest(ARRAY[1,2,3,4,5,6]) AS ente_id) e,
  (SELECT unnest(ARRAY[2020,2021,2022,2023]) AS anno) a,
  (VALUES (3,1,8),(4,1,5),(3,2,3),(4,5,4),(3,3,2),(4,6,1)) v(cat_id, causale_id, n);

-- CA_CESSATI
INSERT INTO ca_cessati (istituzione_id, contratto_id, categoria_id, causale_id, anno, uomini, donne)
SELECT ente_id, 1, cat_id, causale_id, anno,
  GREATEST(1, CASE WHEN ente_id=1 THEN n WHEN ente_id=4 THEN n*12/10 ELSE GREATEST(1,n/5) END),
  GREATEST(1, CASE WHEN ente_id=1 THEN n-1 WHEN ente_id=4 THEN (n-1)*12/10 ELSE GREATEST(1,(n-1)/5) END)
FROM
  (SELECT unnest(ARRAY[1,2,3,4,5,6]) AS ente_id) e,
  (SELECT unnest(ARRAY[2020,2021,2022,2023]) AS anno) a,
  (VALUES (3,1,6),(4,1,4),(3,2,2),(4,2,1),(5,1,3)) v(cat_id, causale_id, n);

-- CA_ETA (per fascia, per ente, 2023)
INSERT INTO ca_eta (istituzione_id, contratto_id, categoria_id, fascia_id, anno, uomini, donne)
SELECT ente_id, 1, 3, fascia_id, 2023,
  GREATEST(1, CASE WHEN ente_id=1 THEN n_m WHEN ente_id=4 THEN n_m*13/10 ELSE GREATEST(1,n_m/6) END),
  GREATEST(1, CASE WHEN ente_id=1 THEN n_f WHEN ente_id=4 THEN n_f*13/10 ELSE GREATEST(1,n_f/6) END)
FROM
  (SELECT unnest(ARRAY[1,2,3,4,5,6]) AS ente_id) e,
  (VALUES (1,2,3),(2,5,6),(3,12,15),(4,18,20),(5,25,28),(6,35,40),(7,45,50),(8,55,60),(9,50,45),(10,30,25),(11,10,8),(12,3,2)) v(fascia_id, n_m, n_f);

-- CA_ETA_MEDIA (per ente, 2023)
INSERT INTO ca_eta_media (istituzione_id, contratto_id, anno, uomini, donne, media_uomini, media_donne, media)
SELECT ente_id, 1, 2023,
  CASE WHEN ente_id=1 THEN 650 WHEN ente_id=4 THEN 850 ELSE 80+ente_id*10 END,
  CASE WHEN ente_id=1 THEN 750 WHEN ente_id=4 THEN 950 ELSE 90+ente_id*10 END,
  48.5+ente_id*0.3, 47.2+ente_id*0.4, 47.8+ente_id*0.35
FROM (SELECT unnest(ARRAY[1,2,3,4,5,6]) AS ente_id) e;

-- CA_ANZIANITA (per fascia, per ente, 2023)
INSERT INTO ca_anzianita (istituzione_id, contratto_id, categoria_id, fascia_id, anno, uomini, donne)
SELECT ente_id, 1, 3, fascia_id, 2023,
  GREATEST(1, CASE WHEN ente_id=1 THEN n_m WHEN ente_id=4 THEN n_m*13/10 ELSE GREATEST(1,n_m/6) END),
  GREATEST(1, CASE WHEN ente_id=1 THEN n_f WHEN ente_id=4 THEN n_f*13/10 ELSE GREATEST(1,n_f/6) END)
FROM
  (SELECT unnest(ARRAY[1,2,3,4,5,6]) AS ente_id) e,
  (VALUES (1,30,35),(2,25,28),(3,20,22),(4,35,40),(5,40,45),(6,50,55),(7,35,30),(8,20,18),(9,8,6),(10,3,2)) v(fascia_id, n_m, n_f);

-- CA_ANZIANITA_MEDIA
INSERT INTO ca_anzianita_media (istituzione_id, contratto_id, anno, uomini, donne, media_uomini, media_donne, media)
SELECT ente_id, 1, 2023,
  CASE WHEN ente_id=1 THEN 650 WHEN ente_id=4 THEN 850 ELSE 80+ente_id*10 END,
  CASE WHEN ente_id=1 THEN 750 WHEN ente_id=4 THEN 950 ELSE 90+ente_id*10 END,
  18.2+ente_id*0.5, 16.8+ente_id*0.4, 17.5+ente_id*0.45
FROM (SELECT unnest(ARRAY[1,2,3,4,5,6]) AS ente_id) e;

-- CA_FORMAZIONE (per ente, 2020-2023)
INSERT INTO ca_formazione (istituzione_id, contratto_id, categoria_id, anno, formati_uomini, formati_donne, giornate_medie_uomini, giornate_medie_donne)
SELECT ente_id, 1, cat_id, anno,
  GREATEST(5, CASE WHEN ente_id=1 THEN base_m WHEN ente_id=4 THEN base_m*13/10 ELSE GREATEST(5,base_m/6) END),
  GREATEST(5, CASE WHEN ente_id=1 THEN base_f WHEN ente_id=4 THEN base_f*13/10 ELSE GREATEST(5,base_f/6) END),
  3.5+anno*0.001, 4.0+anno*0.001
FROM
  (SELECT unnest(ARRAY[1,2,3,4,5,6]) AS ente_id) e,
  (SELECT unnest(ARRAY[2020,2021,2022,2023]) AS anno) a,
  (VALUES (3,80,95),(4,50,60)) v(cat_id, base_m, base_f);

-- CA_MODALITA_LAVORO (lavoro agile etc per ente, 2020-2023)
INSERT INTO ca_modalita_lavoro (istituzione_id, contratto_id, categoria_id, anno, telelavoro_uomini, telelavoro_donne, lavoro_agile_uomini, lavoro_agile_donne, turnazione_uomini, turnazione_donne)
SELECT ente_id, 1, 3, anno,
  GREATEST(1, CASE WHEN ente_id=1 THEN 15 WHEN ente_id=4 THEN 20 ELSE 3 END * CASE WHEN anno=2020 THEN 3 WHEN anno>=2021 THEN 2 ELSE 1 END),
  GREATEST(1, CASE WHEN ente_id=1 THEN 25 WHEN ente_id=4 THEN 35 ELSE 5 END * CASE WHEN anno=2020 THEN 3 WHEN anno>=2021 THEN 2 ELSE 1 END),
  GREATEST(2, CASE WHEN ente_id=1 THEN 80 WHEN ente_id=4 THEN 110 ELSE 12 END * CASE WHEN anno=2020 THEN 5 WHEN anno=2021 THEN 3 WHEN anno=2022 THEN 2 ELSE 2 END),
  GREATEST(3, CASE WHEN ente_id=1 THEN 120 WHEN ente_id=4 THEN 160 ELSE 18 END * CASE WHEN anno=2020 THEN 5 WHEN anno=2021 THEN 3 WHEN anno=2022 THEN 2 ELSE 2 END),
  CASE WHEN ente_id IN (1,4) THEN 30 ELSE 5 END,
  CASE WHEN ente_id IN (1,4) THEN 20 ELSE 3 END
FROM
  (SELECT unnest(ARRAY[1,2,3,4,5,6]) AS ente_id) e,
  (SELECT unnest(ARRAY[2020,2021,2022,2023]) AS anno) a;

-- CA_TITOLO_STUDIO (per ente, 2023)
INSERT INTO ca_titolo_studio (istituzione_id, contratto_id, categoria_id, titolo_id, anno, uomini, donne)
SELECT ente_id, 1, 3, titolo_id, 2023,
  GREATEST(2, CASE WHEN ente_id=1 THEN n WHEN ente_id=4 THEN n*13/10 ELSE GREATEST(2,n/6) END),
  GREATEST(2, CASE WHEN ente_id=1 THEN n+5 WHEN ente_id=4 THEN (n+5)*13/10 ELSE GREATEST(2,(n+5)/6) END)
FROM
  (SELECT unnest(ARRAY[1,2,3,4,5,6]) AS ente_id) e,
  (VALUES (1,45),(2,30),(3,80),(4,25),(5,5),(6,15)) v(titolo_id, n);

-- CA_COMANDATI (per ente, 2023)
INSERT INTO ca_comandati (istituzione_id, contratto_id, anno, comandati_distaccati_uomini, comandati_distaccati_donne, fuori_ruolo_uomini, fuori_ruolo_donne, aspettative_uomini, aspettative_donne)
SELECT ente_id, 1, 2023,
  CASE WHEN ente_id IN (1,4) THEN 8 ELSE 2 END,
  CASE WHEN ente_id IN (1,4) THEN 5 ELSE 1 END,
  CASE WHEN ente_id IN (1,4) THEN 3 ELSE 0 END,
  CASE WHEN ente_id IN (1,4) THEN 2 ELSE 0 END,
  CASE WHEN ente_id IN (1,4) THEN 5 ELSE 1 END,
  CASE WHEN ente_id IN (1,4) THEN 8 ELSE 2 END
FROM (SELECT unnest(ARRAY[1,2,3,4,5,6]) AS ente_id) e;

-- CA_LAVORO_FLESSIBILE (per ente, 2023)
INSERT INTO ca_lavoro_flessibile (istituzione_id, contratto_id, categoria_id, anno, tempo_determinato_uomini, tempo_determinato_donne, interinale_uomini, interinale_donne)
SELECT ente_id, 1, 3, 2023,
  CASE WHEN ente_id IN (1,4) THEN 25 ELSE 5 END,
  CASE WHEN ente_id IN (1,4) THEN 35 ELSE 8 END,
  CASE WHEN ente_id IN (1,4) THEN 5 ELSE 0 END,
  CASE WHEN ente_id IN (1,4) THEN 8 ELSE 1 END
FROM (SELECT unnest(ARRAY[1,2,3,4,5,6]) AS ente_id) e;

-- ============================================================
-- SEED: Minerva PTFP data
-- ============================================================

INSERT INTO minerva_ptfp_piani (ente_id, cf_amministrazione, denominazione_amministrazione, triennio, stato, data_trasmissione)
SELECT ente_id, '0000000000' || ente_id, denominazione, '2026-2028', 
  CASE WHEN ente_id IN (1,4) THEN 'Trasmesso' WHEN ente_id IN (2,6) THEN 'In lavorazione' ELSE 'Bozza' END,
  CASE WHEN ente_id IN (1,4) THEN '2025-12-15'::date ELSE NULL END
FROM lk_enti;

INSERT INTO minerva_ptfp_dotazione (piano_id, categoria_giuridica, teste_dotazione, valore_economico, spesa_massima_potenziale)
SELECT p.piano_id, cat, 
  CASE WHEN p.ente_id=1 THEN n WHEN p.ente_id=4 THEN n*13/10 ELSE GREATEST(10,n/6) END,
  CASE WHEN p.ente_id=1 THEN n*35000 WHEN p.ente_id=4 THEN n*35000*13/10 ELSE GREATEST(10,n/6)*35000 END,
  CASE WHEN p.ente_id=1 THEN n*38000 WHEN p.ente_id=4 THEN n*38000*13/10 ELSE GREATEST(10,n/6)*38000 END
FROM minerva_ptfp_piani p,
  (VALUES ('Area Operatori',80),('Area Operatori Esperti',120),('Area Istruttori',350),('Area Funzionari',250),('Dirigenti',25)) v(cat, n);

INSERT INTO minerva_ptfp_personale (piano_id, tipo, categoria_giuridica, ula, valore_economico)
SELECT p.piano_id, 'tempo_indeterminato', cat,
  CASE WHEN p.ente_id=1 THEN n*0.92 WHEN p.ente_id=4 THEN n*0.92*13/10 ELSE GREATEST(8,n*0.92/6) END,
  CASE WHEN p.ente_id=1 THEN n*32000 ELSE GREATEST(8,n/6)*32000 END
FROM minerva_ptfp_piani p,
  (VALUES ('Area Operatori',75),('Area Istruttori',320),('Area Funzionari',230),('Dirigenti',22)) v(cat, n);

INSERT INTO minerva_ptfp_cessazioni (piano_id, anno_riferimento, categoria_giuridica, causale, numero_cessazioni, valore_economico)
SELECT p.piano_id, anno, 'Area Istruttori', 'Pensionamento',
  CASE WHEN p.ente_id=1 THEN 15+anno-2025 WHEN p.ente_id=4 THEN 20+anno-2025 ELSE 3 END,
  CASE WHEN p.ente_id=1 THEN (15+anno-2025)*35000 ELSE 3*35000 END
FROM minerva_ptfp_piani p, (SELECT unnest(ARRAY[2025,2026,2027]) AS anno) a;

INSERT INTO minerva_ptfp_vacanze (piano_id, categoria_giuridica, vacanze_organico, eccedenze, facolta_assunzionale)
SELECT p.piano_id, cat,
  CASE WHEN p.ente_id IN (1,4) THEN vac ELSE GREATEST(1,vac/6) END,
  0,
  CASE WHEN p.ente_id IN (1,4) THEN vac*35000 ELSE GREATEST(1,vac/6)*35000 END
FROM minerva_ptfp_piani p,
  (VALUES ('Area Operatori',5),('Area Istruttori',30),('Area Funzionari',20),('Dirigenti',3)) v(cat, vac);

INSERT INTO minerva_ptfp_reclutamento (piano_id, anno_riferimento, tipo, categoria_giuridica, numero_posti, modalita_reclutamento)
SELECT p.piano_id, 2026, 'autorizzato', 'Area Istruttori',
  CASE WHEN p.ente_id IN (1,4) THEN 12 ELSE 2 END,
  'Concorso pubblico'
FROM minerva_ptfp_piani p;

-- ============================================================
-- SEED: Minerva adozione profili
-- ============================================================
INSERT INTO minerva_adozione_profili (ente_id, totale_dipendenti, dipendenti_con_profilo)
SELECT ente_id,
  CASE WHEN ente_id=1 THEN 1400 WHEN ente_id=2 THEN 180 WHEN ente_id=3 THEN 220 WHEN ente_id=4 THEN 1800 WHEN ente_id=5 THEN 150 ELSE 350 END,
  CASE WHEN ente_id=1 THEN 1010 WHEN ente_id=2 THEN 85 WHEN ente_id=3 THEN 70 WHEN ente_id=4 THEN 1450 WHEN ente_id=5 THEN 45 ELSE 180 END
FROM lk_enti;

-- ============================================================
-- SEED: Lavoro Pubblico operational data
-- ============================================================

INSERT INTO lp_pareri (id_documento, gruppo_tipologia, tipologia_documento, data_pubblicazione, oggetto, argomento, ambito)
VALUES
  ('PAR-2024-001', 'Parere', 'Parere su quesito', '2024-03-15', 'Applicazione art. 35-ter D.Lgs. 165/2001 - progressioni verticali', 'Assunzioni e mobilità', 'Lavoro pubblico'),
  ('PAR-2024-002', 'Circolare', 'Circolare esplicativa', '2024-06-20', 'Indicazioni operative lavoro agile nella PA', 'Organizzazione del lavoro', 'Lavoro agile'),
  ('PAR-2024-003', 'Parere', 'Parere interpretativo', '2024-09-10', 'Limiti assunzionali enti in dissesto', 'Pensioni e previdenza', 'Lavoro pubblico'),
  ('PAR-2025-001', 'Direttiva', 'Direttiva ministeriale', '2025-01-22', 'Direttiva per la programmazione del fabbisogno 2025-2027', 'Assunzioni e mobilità', 'Riforma PA'),
  ('PAR-2025-002', 'Circolare', 'Circolare applicativa', '2025-04-08', 'Applicazione CCNL Funzioni Locali 2022-2024', 'Contratti e relazioni sindacali', 'Lavoro pubblico');

INSERT INTO lp_graduatorie_concorsuali (ente_id, denominazione, profilo, area_contrattuale, data_approvazione, idonei_totali, assunti, idonei_disponibili, stato)
SELECT ente_id, denominazione, prof, 'Funzioni Locali', data_app, idonei, assunti_n, idonei-assunti_n, 
  CASE WHEN ente_id IN (1,4) THEN 'Vigente' ELSE 'In utilizzo' END
FROM lk_enti,
  (VALUES ('Istruttore Amministrativo','2023-06-15'::date, 45, 18),('Funzionario Tecnico','2024-02-20'::date, 30, 12)) v(prof, data_app, idonei, assunti_n)
WHERE ente_id IN (1,2,4,6);

INSERT INTO lp_segretari_comunali (ente_id, ordine_graduatoria, denominazione, provincia, regione, tipo_comune, contributo_richiesto, contributo_assegnato)
SELECT ente_id, ente_id*10, denominazione,
  CASE WHEN ente_id=1 THEN 'Padova' WHEN ente_id=2 THEN 'Perugia' WHEN ente_id=3 THEN 'Vibo Valentia' WHEN ente_id=5 THEN 'L''Aquila' ELSE 'Roma' END,
  CASE WHEN ente_id=1 THEN 'Veneto' WHEN ente_id=2 THEN 'Umbria' WHEN ente_id=3 THEN 'Calabria' WHEN ente_id=5 THEN 'Abruzzo' ELSE 'Lazio' END,
  'singolo', 25000, 20000
FROM lk_enti WHERE ente_id IN (2,3,5,6);

INSERT INTO lp_tfr_tfs (ente_id, tipologia_ente, regime, numero_dipendenti, importo_accantonato)
SELECT ente_id, 'Comune', regime,
  CASE WHEN ente_id=1 THEN n WHEN ente_id=4 THEN n*13/10 ELSE GREATEST(20,n/6) END,
  CASE WHEN ente_id=1 THEN n*8500 ELSE GREATEST(20,n/6)*8500 END
FROM lk_enti,
  (VALUES ('TFR', 800),('TFS', 600)) v(regime, n);
