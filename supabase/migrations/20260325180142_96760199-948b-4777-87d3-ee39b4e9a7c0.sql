
-- Add Minerva accreditation fields to lk_enti for IAC calculation
ALTER TABLE public.lk_enti 
  ADD COLUMN IF NOT EXISTS accreditata_minerva boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ha_profili_attivati boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS data_accreditamento_minerva date,
  ADD COLUMN IF NOT EXISTS data_attivazione_profili date;

-- Update the 6 pilot entities with realistic IAC data
-- 5 out of 6 accredited, 4 out of 5 with active profiles
UPDATE public.lk_enti SET accreditata_minerva = true, ha_profili_attivati = true, 
  data_accreditamento_minerva = '2022-03-15', data_attivazione_profili = '2022-09-01'
WHERE codice_ente IN ('pdv', 'brs');

UPDATE public.lk_enti SET accreditata_minerva = true, ha_profili_attivati = true,
  data_accreditamento_minerva = '2023-01-10', data_attivazione_profili = '2023-06-20'
WHERE codice_ente IN ('gbb', 'avz');

UPDATE public.lk_enti SET accreditata_minerva = true, ha_profili_attivati = false,
  data_accreditamento_minerva = '2023-05-01'
WHERE codice_ente = 'vbv';

UPDATE public.lk_enti SET accreditata_minerva = false, ha_profili_attivati = false
WHERE codice_ente = 'tvl';
