-- ============================================
-- MIGRAZIONE 2: login + Lookup con FK + Minerva
-- ============================================

-- login (dipende da lk_ruoli)
CREATE TABLE public.login (
  login_id int4 NOT NULL,
  username varchar(25) NULL,
  password varchar(64) NULL,
  nome varchar(50) NULL,
  cognome varchar(50) NULL,
  email varchar(50) NULL,
  ruolo_id int4 NULL,
  CONSTRAINT login_pkey PRIMARY KEY (login_id),
  CONSTRAINT login_lk_ruoli_fk FOREIGN KEY (ruolo_id) REFERENCES public.lk_ruoli(ruolo_id)
);
ALTER TABLE public.login ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on login" ON public.login FOR SELECT USING (true);

-- lk_minerva_area_contrattuale (dipende da lk_minerva_comparto)
CREATE TABLE public.lk_minerva_area_contrattuale (
  id int4 NOT NULL,
  id_comparto int4 NOT NULL,
  codice varchar(15) NOT NULL,
  descrizione varchar(50) NOT NULL,
  CONSTRAINT lk_minerva_area_contrattuale_pk PRIMARY KEY (id),
  CONSTRAINT lk_minerva_area_contrattuale_lk_minerva_comparto_fk FOREIGN KEY (id_comparto) REFERENCES public.lk_minerva_comparto(id)
);
ALTER TABLE public.lk_minerva_area_contrattuale ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lk_minerva_area_contrattuale" ON public.lk_minerva_area_contrattuale FOR SELECT USING (true);

-- lk_minerva_dimensione_professionale (dipende da lk_minerva_comparto)
CREATE TABLE public.lk_minerva_dimensione_professionale (
  id int4 NOT NULL,
  id_comparto int4 NOT NULL,
  codice varchar(20) NOT NULL,
  descrizione varchar(50) NOT NULL,
  CONSTRAINT lk_minerva_dimensione_professionale_pk PRIMARY KEY (id),
  CONSTRAINT lk_minerva_dimensione_professionale_lk_minerva_comparto_fk FOREIGN KEY (id_comparto) REFERENCES public.lk_minerva_comparto(id)
);
ALTER TABLE public.lk_minerva_dimensione_professionale ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lk_minerva_dimensione_professionale" ON public.lk_minerva_dimensione_professionale FOR SELECT USING (true);

-- lk_minerva_famiglia_professionale (dipende da lk_minerva_comparto)
CREATE TABLE public.lk_minerva_famiglia_professionale (
  id int4 NOT NULL,
  id_comparto int4 NOT NULL,
  codice varchar(20) NOT NULL,
  descrizione varchar(100) NOT NULL,
  CONSTRAINT lk_minerva_famiglia_professionale_pk PRIMARY KEY (id),
  CONSTRAINT lk_minerva_famiglia_professionale_lk_minerva_comparto_fk FOREIGN KEY (id_comparto) REFERENCES public.lk_minerva_comparto(id)
);
ALTER TABLE public.lk_minerva_famiglia_professionale ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lk_minerva_famiglia_professionale" ON public.lk_minerva_famiglia_professionale FOR SELECT USING (true);

-- lk_minerva_profilo_professionale (dipende da famiglia, area_contrattuale, dimensione)
CREATE TABLE public.lk_minerva_profilo_professionale (
  id int4 NOT NULL,
  id_famiglia_professionale int4 NOT NULL,
  id_area_contrattuale int4 NOT NULL,
  id_dimensione_professionale int4 NOT NULL,
  codice varchar(20) NOT NULL,
  descrizione varchar(100) NOT NULL,
  CONSTRAINT lk_minerva_profilo_professionale_pk PRIMARY KEY (id),
  CONSTRAINT lk_minerva_profilo_professionale_dimensione_fk FOREIGN KEY (id_dimensione_professionale) REFERENCES public.lk_minerva_dimensione_professionale(id),
  CONSTRAINT lk_minerva_profilo_professionale_famiglia_fk FOREIGN KEY (id_famiglia_professionale) REFERENCES public.lk_minerva_famiglia_professionale(id)
);
ALTER TABLE public.lk_minerva_profilo_professionale ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lk_minerva_profilo_professionale" ON public.lk_minerva_profilo_professionale FOR SELECT USING (true);

-- lk_minerva_ambito_ruolo (dipende da lk_minerva_famiglia_professionale)
CREATE TABLE public.lk_minerva_ambito_ruolo (
  id int4 NOT NULL,
  id_famiglia_professionale int4 NOT NULL,
  codice varchar(20) NOT NULL,
  descrizione varchar(100) NOT NULL,
  CONSTRAINT lk_minerva_ambito_ruolo_pk PRIMARY KEY (id),
  CONSTRAINT lk_minerva_ambito_ruolo_famiglia_fk FOREIGN KEY (id_famiglia_professionale) REFERENCES public.lk_minerva_famiglia_professionale(id)
);
ALTER TABLE public.lk_minerva_ambito_ruolo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lk_minerva_ambito_ruolo" ON public.lk_minerva_ambito_ruolo FOR SELECT USING (true);

-- lk_minerva_profilo_ruolo (dipende da ambito_ruolo e profilo_professionale)
CREATE TABLE public.lk_minerva_profilo_ruolo (
  id int4 NOT NULL,
  id_ambito_ruolo int4 NOT NULL,
  id_profilo_professionale int4 NOT NULL,
  codice varchar(20) NOT NULL,
  descrizione varchar(100) NOT NULL,
  CONSTRAINT lk_minerva_profilo_ruolo_pk PRIMARY KEY (id),
  CONSTRAINT lk_minerva_profilo_ruolo_ambito_fk FOREIGN KEY (id_ambito_ruolo) REFERENCES public.lk_minerva_ambito_ruolo(id),
  CONSTRAINT lk_minerva_profilo_ruolo_profilo_fk FOREIGN KEY (id_profilo_professionale) REFERENCES public.lk_minerva_profilo_professionale(id)
);
ALTER TABLE public.lk_minerva_profilo_ruolo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lk_minerva_profilo_ruolo" ON public.lk_minerva_profilo_ruolo FOR SELECT USING (true);

-- lk_sipo_profili_di_ruolo (dipende da lk_enti, login)
CREATE TABLE public.lk_sipo_profili_di_ruolo (
  profilo_ruolo_id int4 GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  codice_profilo varchar(20) NULL,
  profilo_ruolo varchar(50) NOT NULL,
  comparto varchar(50) NOT NULL,
  ente_id int4 NOT NULL,
  id_sipo_profilo_professionale int4 NULL,
  data_inserimento timestamp NOT NULL,
  user_inserimento_id int4 NOT NULL,
  data_modifica timestamp NULL,
  user_modifica_id int4 NULL,
  data_eliminazione timestamp NULL,
  user_eliminazione_id int4 NULL,
  id_comparto int4 NOT NULL,
  id_area_contrattuale int4 NOT NULL,
  id_famiglia_professionale int4 NOT NULL,
  id_minerva_profilo_professionale int4 NULL,
  id_ambito_ruolo int4 NOT NULL,
  CONSTRAINT lk_sipo_profili_di_ruolo_pk PRIMARY KEY (profilo_ruolo_id),
  CONSTRAINT lk_sipo_profili_di_ruolo_login_fk_1 FOREIGN KEY (user_modifica_id) REFERENCES public.login(login_id),
  CONSTRAINT lk_sipo_profili_di_ruolo_login_fk_2 FOREIGN KEY (user_eliminazione_id) REFERENCES public.login(login_id),
  CONSTRAINT lk_sipo_profili_di_ruolo_lk_enti_fk FOREIGN KEY (ente_id) REFERENCES public.lk_enti(ente_id),
  CONSTRAINT lk_sipo_profili_di_ruolo_login_fk FOREIGN KEY (user_inserimento_id) REFERENCES public.login(login_id)
);
ALTER TABLE public.lk_sipo_profili_di_ruolo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lk_sipo_profili_di_ruolo" ON public.lk_sipo_profili_di_ruolo FOR SELECT USING (true);

-- lk_sipo_profili_professionali (dipende da lk_enti, login)
CREATE TABLE public.lk_sipo_profili_professionali (
  profilo_professionale_id int4 GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  codice_profilo_professionale varchar(20) NOT NULL,
  profilo_professionale varchar(50) NOT NULL,
  ente_id int4 NOT NULL,
  data_inserimento timestamp NOT NULL,
  user_inserimento_id int4 NOT NULL,
  data_modifica timestamp NULL,
  user_modifica_id int4 NULL,
  data_eliminazione timestamp NULL,
  user_eliminazione_id int4 NULL,
  dimensione_professionale_id int4 NOT NULL,
  area_contrattuale_id int4 NOT NULL,
  famiglia_professionale_id int4 NOT NULL,
  CONSTRAINT lk_sipo_profili_professionali_pk PRIMARY KEY (profilo_professionale_id),
  CONSTRAINT lk_sipo_profili_professionali_login_fk_1 FOREIGN KEY (user_modifica_id) REFERENCES public.login(login_id),
  CONSTRAINT lk_sipo_profili_professionali_login_fk_2 FOREIGN KEY (user_eliminazione_id) REFERENCES public.login(login_id),
  CONSTRAINT lk_sipo_profili_professionali_lk_enti_fk FOREIGN KEY (ente_id) REFERENCES public.lk_enti(ente_id),
  CONSTRAINT lk_sipo_profili_professionali_login_fk FOREIGN KEY (user_inserimento_id) REFERENCES public.login(login_id)
);
ALTER TABLE public.lk_sipo_profili_professionali ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on lk_sipo_profili_professionali" ON public.lk_sipo_profili_professionali FOR SELECT USING (true);