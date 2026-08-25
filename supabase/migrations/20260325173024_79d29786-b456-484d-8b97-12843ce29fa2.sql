
-- ============================================================
-- SEED: Lookup tables for Conto Annuale
-- ============================================================

-- Contratti
INSERT INTO ca_lk_contratti (codice, descrizione) VALUES
  ('CCNL_FL', 'Comparto Funzioni Locali'),
  ('CCNL_FC', 'Comparto Funzioni Centrali'),
  ('CCNL_SAN', 'Comparto Sanità'),
  ('CCNL_IST', 'Comparto Istruzione e Ricerca'),
  ('DIR_FL', 'Dirigenza Funzioni Locali'),
  ('DIR_FC', 'Dirigenza Funzioni Centrali');

-- Categorie  
INSERT INTO ca_lk_categorie (codice, descrizione, contratto_id) VALUES
  ('A', 'Area degli Operatori', 1),
  ('B', 'Area degli Operatori Esperti', 1),
  ('C', 'Area degli Istruttori', 1),
  ('D', 'Area dei Funzionari', 1),
  ('DIR', 'Dirigenti', 5),
  ('SEG', 'Segretari Comunali', 5);

-- Qualifiche
INSERT INTO ca_lk_qualifiche (codice, descrizione, categoria_id) VALUES
  ('OP', 'Operatore', 1),
  ('OPE', 'Operatore Esperto', 2),
  ('IST', 'Istruttore', 3),
  ('ISTA', 'Istruttore Amministrativo', 3),
  ('ISTT', 'Istruttore Tecnico', 3),
  ('FUN', 'Funzionario', 4),
  ('FUNA', 'Funzionario Amministrativo', 4),
  ('FUNT', 'Funzionario Tecnico', 4),
  ('FUNC', 'Funzionario Contabile', 4),
  ('DIR1', 'Dirigente', 5),
  ('SEG1', 'Segretario Generale', 6);

-- Causali assunzione
INSERT INTO ca_lk_causali_assunzione (codice, descrizione) VALUES
  ('CONC', 'Concorso pubblico'),
  ('MOB', 'Mobilità volontaria'),
  ('STAB', 'Stabilizzazione'),
  ('TD', 'Contratto a tempo determinato'),
  ('PROG', 'Progressione verticale'),
  ('SCOR', 'Scorrimento graduatoria'),
  ('REIN', 'Reintegro'),
  ('ALTRO', 'Altra causale');

-- Causali cessazione
INSERT INTO ca_lk_causali_cessazione (codice, descrizione) VALUES
  ('PENS', 'Pensionamento'),
  ('DIM', 'Dimissioni volontarie'),
  ('MOB_O', 'Mobilità in uscita'),
  ('SCAD', 'Scadenza contratto'),
  ('DEC', 'Decesso'),
  ('DEST', 'Destituzione/Licenziamento'),
  ('INV', 'Invalidità permanente'),
  ('ALTRO', 'Altra causale');

-- Fasce età (come da specifica: E0, E20, E25...)
INSERT INTO ca_lk_fasce_eta (codice, descrizione, eta_min, eta_max) VALUES
  ('E0', 'Fino a 19 anni', 0, 19),
  ('E20', '20-24 anni', 20, 24),
  ('E25', '25-29 anni', 25, 29),
  ('E30', '30-34 anni', 30, 34),
  ('E35', '35-39 anni', 35, 39),
  ('E40', '40-44 anni', 40, 44),
  ('E45', '45-49 anni', 45, 49),
  ('E50', '50-54 anni', 50, 54),
  ('E55', '55-59 anni', 55, 59),
  ('E60', '60-64 anni', 60, 64),
  ('E65', '65-67 anni', 65, 67),
  ('E68', '68 anni e oltre', 68, 99);

-- Fasce anzianità (come da specifica: A0, A6, A11...)
INSERT INTO ca_lk_fasce_anzianita (codice, descrizione, anni_min, anni_max) VALUES
  ('A0', '0-5 anni', 0, 5),
  ('A6', '6-10 anni', 6, 10),
  ('A11', '11-15 anni', 11, 15),
  ('A16', '16-20 anni', 16, 20),
  ('A21', '21-25 anni', 21, 25),
  ('A26', '26-30 anni', 26, 30),
  ('A31', '31-35 anni', 31, 35),
  ('A36', '36-40 anni', 36, 40),
  ('A41', '41-43 anni', 41, 43),
  ('A44', '44 anni e oltre', 44, 99);

-- Titoli di studio
INSERT INTO ca_lk_titoli_studio (codice, descrizione) VALUES
  ('LM', 'Laurea magistrale/specialistica'),
  ('LT', 'Laurea triennale'),
  ('DIP', 'Diploma di scuola superiore'),
  ('LIC', 'Licenza media'),
  ('ELEM', 'Licenza elementare'),
  ('POST', 'Dottorato/Master post-laurea');

-- Causali assenza
INSERT INTO ca_lk_causali_assenza (codice, descrizione) VALUES
  ('MAL', 'Malattia'),
  ('FORM', 'Formazione'),
  ('MAT', 'Maternità/Paternità'),
  ('PERM', 'Permessi retribuiti'),
  ('FERIE', 'Ferie'),
  ('INF', 'Infortunio'),
  ('ASP', 'Aspettativa'),
  ('SCIO', 'Sciopero'),
  ('ALTRO', 'Altre assenze');

-- Lavoro Pubblico lookups
INSERT INTO lp_lk_argomenti (codice, descrizione) VALUES
  ('CONTR', 'Contratti e relazioni sindacali'),
  ('PENS', 'Pensioni e previdenza'),
  ('DISC', 'Procedimenti disciplinari'),
  ('RETR', 'Retribuzioni e trattamento economico'),
  ('ORG', 'Organizzazione del lavoro'),
  ('ASS', 'Assunzioni e mobilità'),
  ('DIR', 'Dirigenza pubblica'),
  ('FORM', 'Formazione e aggiornamento');

INSERT INTO lp_lk_ambiti (codice, descrizione) VALUES
  ('LAV_PUB', 'Lavoro pubblico'),
  ('RIF_PA', 'Riforma PA'),
  ('SMART', 'Lavoro agile'),
  ('PERF', 'Performance e valutazione'),
  ('TRASP', 'Trasparenza e anticorruzione');

INSERT INTO lp_lk_tipologie_documento (gruppo, tipologia) VALUES
  ('Circolare', 'Circolare esplicativa'),
  ('Circolare', 'Circolare applicativa'),
  ('Direttiva', 'Direttiva ministeriale'),
  ('Parere', 'Parere su quesito'),
  ('Parere', 'Parere interpretativo'),
  ('Altri documenti', 'Nota orientativa'),
  ('Altri documenti', 'Linee guida');

INSERT INTO lp_lk_destinatari (codice, descrizione) VALUES
  ('TUTTI', 'Tutte le PA'),
  ('CCNL_FL', 'Comparto Funzioni Locali'),
  ('CCNL_FC', 'Comparto Funzioni Centrali'),
  ('SPEC', 'Amministrazione specifica'),
  ('REGIONI', 'Regioni e autonomie locali');

-- Minerva aree competenze
INSERT INTO minerva_area_competenze (codice, descrizione) VALUES
  ('CTP', 'Competenze Tecnico-Professionali'),
  ('CC', 'Competenze Comportamentali'),
  ('CDA', 'Competenze Digitali e di Analisi');

-- Minerva competenze catalogo (sample)
INSERT INTO minerva_competenze_catalogo (codice, tipo, titolo, area_id) VALUES
  ('CTP01', 'CTP', 'Gestione amministrativa e documentale', 1),
  ('CTP02', 'CTP', 'Programmazione e controllo di gestione', 1),
  ('CTP03', 'CTP', 'Gestione delle risorse umane', 1),
  ('CTP04', 'CTP', 'Gestione finanziaria e contabile', 1),
  ('CTP05', 'CTP', 'Gestione dei servizi al cittadino', 1),
  ('CTP06', 'CTP', 'Gestione appalti e contratti pubblici', 1),
  ('CTP07', 'CTP', 'Pianificazione territoriale e urbanistica', 1),
  ('CTP08', 'CTP', 'Gestione dei servizi sociali', 1),
  ('CC01', 'CC', 'Leadership e gestione dei team', 2),
  ('CC02', 'CC', 'Comunicazione efficace', 2),
  ('CC03', 'CC', 'Problem solving e pensiero critico', 2),
  ('CC04', 'CC', 'Orientamento al risultato', 2),
  ('CC05', 'CC', 'Collaborazione e lavoro di squadra', 2),
  ('CC06', 'CC', 'Gestione del cambiamento', 2),
  ('CDA01', 'CDA', 'Competenze digitali di base', 3),
  ('CDA02', 'CDA', 'Analisi dei dati e reportistica', 3),
  ('CDA03', 'CDA', 'Cybersecurity e protezione dei dati', 3),
  ('CDA04', 'CDA', 'Trasformazione digitale dei servizi', 3),
  ('CDA05', 'CDA', 'Gestione documentale digitale', 3);
