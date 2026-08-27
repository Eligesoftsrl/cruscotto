/**
 * Chiavi centralizzate di React Query.
 *
 * Vantaggi:
 *  - Un unico posto in cui vedere/gestire tutte le cache key dell'app.
 *  - Coerenza garantita (niente typo tra un hook e un `invalidateQueries`).
 *  - Refactor sicuro: cambiare una chiave qui la aggiorna ovunque.
 *
 * Convenzione: ogni voce e una factory che restituisce una tuple `as const`,
 * cosi TypeScript ne infatti il tipo esatto.
 */
export const queryKeys = {
  // Conto Annuale / Data Warehouse
  eta: (anno?: number) => ["dw_eta", anno] as const,
  genere: (anno?: number) => ["dw_occupazione_genere", anno] as const,
  cessati: (anno?: number) => ["dw_cessati", anno] as const,
  assunti: (anno?: number) => ["dw_assunti", anno] as const,
  formazione: (anno?: number) => ["dw_formazione", anno] as const,
  modalitaLavoro: (anno?: number) => ["dw_modalita_lavoro", anno] as const,
  progressioni: () => ["dw_passaggi_qualifica"] as const,

  // Indicatori / calcoli
  iac: () => ["iac-indicator"] as const,
  d1Indicators: (filters: unknown) => ["d1-indicators", filters] as const,

  // Bussola
  bussola: (enteId?: number | null) => ["bussola-data", enteId] as const,

  // Filtri trasversali (lista enti filtrati)
  filteredEnteIds: (params: {
    comparto?: string;
    regione?: string;
    dimensionePa?: string;
    enteId?: number | null;
    role?: string;
  }) =>
    [
      "filtered-ente-ids",
      params.comparto,
      params.regione,
      params.dimensionePa,
      params.enteId,
      params.role,
    ] as const,
} as const;
