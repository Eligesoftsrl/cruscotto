
-- Arricchimento dw_inpa_bandi con colonne previste dal documento metodologico
ALTER TABLE public.dw_inpa_bandi
  ADD COLUMN IF NOT EXISTS settore_pubblicazione TEXT,
  ADD COLUMN IF NOT EXISTS categoria_ipa TEXT,
  ADD COLUMN IF NOT EXISTS tipologia_ipa TEXT,
  ADD COLUMN IF NOT EXISTS fascia_retributiva TEXT,
  ADD COLUMN IF NOT EXISTS stato_bando TEXT,
  ADD COLUMN IF NOT EXISTS provincia TEXT;

-- Creazione tabella candidati per analisi lato offerta
CREATE TABLE IF NOT EXISTS public.dw_inpa_candidati (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_bando BIGINT REFERENCES public.dw_inpa_bandi(id),
  anno INTEGER,
  genere TEXT,
  fascia_eta TEXT,
  titolo_studio TEXT,
  area_geografica TEXT,
  regione TEXT,
  num_candidature INTEGER DEFAULT 0
);

-- RLS
ALTER TABLE public.dw_inpa_candidati ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read dw_inpa_candidati"
  ON public.dw_inpa_candidati
  FOR SELECT
  TO authenticated
  USING (true);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_inpa_bandi_settore ON public.dw_inpa_bandi(settore_pubblicazione);
CREATE INDEX IF NOT EXISTS idx_inpa_bandi_categoria_ipa ON public.dw_inpa_bandi(categoria_ipa);
CREATE INDEX IF NOT EXISTS idx_inpa_bandi_stato ON public.dw_inpa_bandi(stato_bando);
CREATE INDEX IF NOT EXISTS idx_inpa_candidati_bando ON public.dw_inpa_candidati(id_bando);
CREATE INDEX IF NOT EXISTS idx_inpa_candidati_anno ON public.dw_inpa_candidati(anno);
