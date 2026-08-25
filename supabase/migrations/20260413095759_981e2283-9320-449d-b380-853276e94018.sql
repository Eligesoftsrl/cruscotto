-- Arricchire dw_profilo_di_ruolo
ALTER TABLE public.dw_profilo_di_ruolo
  ADD COLUMN IF NOT EXISTS ambito_ruolo TEXT,
  ADD COLUMN IF NOT EXISTS area_contrattuale TEXT,
  ADD COLUMN IF NOT EXISTS id_ente INTEGER;

-- Arricchire dw_famiglia_professionale
ALTER TABLE public.dw_famiglia_professionale
  ADD COLUMN IF NOT EXISTS dimensione_professionale TEXT;

-- Tabella cicli assessment Minerva
CREATE TABLE IF NOT EXISTS public.dw_minerva_assessment (
  id SERIAL PRIMARY KEY,
  id_ente INTEGER NOT NULL,
  anno INTEGER NOT NULL DEFAULT 2024,
  ciclo TEXT NOT NULL DEFAULT 'Ciclo 1',
  stato TEXT NOT NULL DEFAULT 'completato',
  data_inizio DATE,
  data_fine DATE,
  nr_profili_coinvolti INTEGER DEFAULT 0,
  nr_competenze_valutate INTEGER DEFAULT 0,
  nr_dipendenti_valutati INTEGER DEFAULT 0,
  nr_dipendenti_totali INTEGER DEFAULT 0,
  gap_medio NUMERIC(4,2) DEFAULT 0,
  gap_max NUMERIC(4,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dw_minerva_assessment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_dw_minerva_assessment"
  ON public.dw_minerva_assessment
  FOR SELECT TO authenticated, anon
  USING (true);