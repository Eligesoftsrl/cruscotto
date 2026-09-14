# Mappature schede — file sorgente (Excel)

Excel di mappatura RPC↔UI usati per costruire le schede del Conto Annuale.
Fonte ufficiale del contratto dati (RPC `fa_ca_*`, parametri, campi di output e note).

## Presenti
- `mappatura-scheda-analisi-eta.xlsx`
- `mappatura-scheda-anzianita.xlsx`
- `mappatura-scheda-turnover.xlsx`
- `mappatura-scheda-sostituzione.xlsx`

## Da aggiungere (in arrivo)
- `mappatura-scheda-assunti.xlsx`
- `mappatura-scheda-cessazioni.xlsx`

## Divergenze note mappatura ↔ backend (da riallineare col team backend)
- Le RPC `*_evoluzione` **non accettano più `p_anno`** (la mappatura lo indica come
  "limite superiore"). Workaround lato app: `p_anno` non viene inviato all'evoluzione.
- `fa_ca_assunti_causali` è stata **rimossa**; le causali di assunzione si ottengono da
  `fa_ca_cessazioni_causali` con `p_movimento='A'` (già previsto come alternativa in mappatura).
