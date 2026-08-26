/** Helper di formattazione condivisi (locale it-IT). */
export const formatIT = (n: number | null | undefined): string => (n ?? 0).toLocaleString("it-IT");

export const formatPct = (n: number | null | undefined, decimals = 1): string =>
  `${(n ?? 0).toFixed(decimals)}%`;

export const withSign = (n: number, decimals = 1): string =>
  `${n >= 0 ? "+" : ""}${n.toFixed(decimals)}`;
