/**
 * Piccoli helper per sostituire i ternari annidati (regola SonarJS
 * "no-nested-conditional") con funzioni leggibili e testate.
 * Nessuna dipendenza dal DOM: usabili sia nei componenti sia nei servizi.
 */

/** Restituisce il primo risultato la cui soglia è <= value (soglie in ordine decrescente). */
export function byMinThreshold<T>(
  value: number,
  steps: ReadonlyArray<readonly [number, T]>,
  fallback: T,
): T {
  for (const [min, result] of steps) {
    if (value >= min) return result;
  }
  return fallback;
}

/** Restituisce il primo risultato la cui soglia è > value (soglie in ordine crescente). */
export function byMaxThreshold<T>(
  value: number,
  steps: ReadonlyArray<readonly [number, T]>,
  fallback: T,
): T {
  for (const [max, result] of steps) {
    if (value < max) return result;
  }
  return fallback;
}

/** Sceglie un valore in base al segno del numero. */
export function bySign<T>(value: number, positive: T, negative: T, zero: T): T {
  if (value > 0) return positive;
  if (value < 0) return negative;
  return zero;
}

/**
 * Restituisce il valore del primo caso la cui condizione è vera, altrimenti fallback.
 * Sostituisce le catene `a ? x : b ? y : z`.
 */
export function pickFirst<T>(cases: ReadonlyArray<readonly [unknown, T]>, fallback: T): T {
  for (const [condition, result] of cases) {
    if (condition) return result;
  }
  return fallback;
}

/** Sceglie un valore da una mappa per chiave, con valore di riserva. */
export function pickByKey<V, F = V>(
  key: string | null | undefined,
  map: Readonly<Record<string, V>>,
  fallback: F,
): V | F {
  if (key != null && Object.prototype.hasOwnProperty.call(map, key)) return map[key];
  return fallback;
}

/** `before + value + after` se value è valorizzato, altrimenti stringa vuota. */
export const affix = (value: string | number | null | undefined, before: string, after = ""): string =>
  value ? `${before}${value}${after}` : "";

/** Valore del filtro, oppure null se corrisponde all'opzione "tutti" (nessun filtro). */
export const unlessAll = (value: string, all: string): string | null => (value === all ? null : value);

/** Prefisso "+" per i numeri positivi (i negativi hanno già il segno "-"). */
export const plusSign = (value: number): string => (value > 0 ? "+" : "");

/** Numero formattato con il segno "+" davanti se positivo. */
export const fmtSigned = (value: number, fmt: (v: number) => string): string =>
  `${plusSign(value)}${fmt(value)}`;

/** Freccia di tendenza (▲ +, ▼, →) per una variazione. */
export const trendArrow = (value: number): string => bySign(value, "▲ +", "▼ ", "→ ");

/** Semaforo verde/giallo/rosso → valore corrispondente. */
export type TrafficLight = "green" | "yellow" | "red";

export function byTrafficLight<T>(
  status: string | null | undefined,
  values: { green: T; yellow: T; red: T },
  fallback: T,
): T {
  if (status === "green" || status === "yellow" || status === "red") return values[status];
  return fallback;
}

/** Testo per un valore che può essere in caricamento o assente. */
export function loadingOr<T>(
  loading: boolean,
  value: T | null | undefined,
  fmt: (v: T) => string,
  missing = "N/D",
  placeholder = "…",
): string {
  if (loading) return placeholder;
  if (value == null) return missing;
  return fmt(value);
}
