
-- Add dipendenti_valutati column for ICVC indicator
ALTER TABLE minerva_adozione_profili 
  ADD COLUMN IF NOT EXISTS dipendenti_valutati int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS n_profili_professionali int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS n_profili_ruolo int DEFAULT 0;
