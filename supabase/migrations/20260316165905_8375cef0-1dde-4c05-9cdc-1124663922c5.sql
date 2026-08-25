
ALTER TABLE lk_sipo_tipologia_funzione ALTER COLUMN funzione TYPE varchar(200);
ALTER TABLE lk_sipo_obiettivi_strategici_processi ALTER COLUMN descrizione TYPE varchar(200);
ALTER TABLE lk_sipo_grado_rilevanza_processi ALTER COLUMN descrizione TYPE varchar(200);
ALTER TABLE lk_sipo_grado_rilevanza_processi ALTER COLUMN dettaglio TYPE varchar(500);
ALTER TABLE lk_sipo_criticita_processi ALTER COLUMN descrizione TYPE varchar(500);
ALTER TABLE lk_sipo_criticita_processi ALTER COLUMN categoria TYPE varchar(200);
ALTER TABLE lk_sipo_criticita_uo ALTER COLUMN descrizione TYPE varchar(500);
ALTER TABLE lk_sipo_criticita_uo ALTER COLUMN categoria TYPE varchar(200);
ALTER TABLE lk_sipo_lavoro_agile_fasi ALTER COLUMN descrizione TYPE varchar(200);
ALTER TABLE lk_sipo_outsourcing_fasi ALTER COLUMN descrizione TYPE varchar(200);
ALTER TABLE lk_sipo_livello_digitalizzazione_fasi ALTER COLUMN descrizione TYPE varchar(200);
ALTER TABLE lk_sipo_copertura_profili_di_ruolo ALTER COLUMN descrizione TYPE varchar(200);
ALTER TABLE lk_sipo_vincoli_semplificazione_processi ALTER COLUMN descrizione TYPE varchar(500);
ALTER TABLE lk_picchi_frequenza_annuale_processi ALTER COLUMN frequenza TYPE varchar(200);
ALTER TABLE lk_picchi_intensita_processi ALTER COLUMN intensita TYPE varchar(200);
ALTER TABLE lk_sipo_opzionale_fasi ALTER COLUMN descrizione TYPE varchar(200);
