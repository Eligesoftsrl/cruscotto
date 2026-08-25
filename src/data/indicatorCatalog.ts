/**
 * Catalogo indicatori selezionabili per la creazione di percorsi personalizzati.
 * Derivato dagli indicatori executive (executiveData.ts).
 */

export interface CatalogIndicator {
  id: string;
  label: string;
  pillar: string;
  source: string;
  description: string;
  value: number;
  status: "green" | "yellow" | "red";
}

import data from "./json/indicatorCatalog.json";

export const indicatorCatalog: CatalogIndicator[] = data.indicatorCatalog as CatalogIndicator[];
export const pillars = ["D1", "D2", "D3", "D4", "D5", "D6"] as const;
export const sources = [...new Set(indicatorCatalog.map(i => i.source))];
