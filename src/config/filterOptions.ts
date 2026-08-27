/**
 * Opzioni dei filtri del cruscotto.
 *
 * NB: NON sono "dati mock": sono tassonomie di riferimento statiche della PA
 * (categorie contrattuali, comparti, regioni, fasce dimensionali). Vivono qui in
 * configurazione perche non provengono dal data warehouse ma dalla classificazione
 * ufficiale. Se in futuro alcune liste (es. regioni/enti effettivamente presenti)
 * dovranno derivare dal DB, si potra creare un service dedicato che le popola.
 */

export interface FilterOptions {
  macrocategorie: string[];
  categorie: string[];
  comparti: string[];
  tipologie: string[];
  regioni: string[];
  dimensioni: string[];
}

export const filterOptions: FilterOptions = {
  macrocategorie: ["Tutte", "Dirigenti", "Area Funzionari", "Area Assistenti", "Area Operatori"],
  categorie: ["Tutte", "Categoria A", "Categoria B", "Categoria C", "Categoria D"],
  comparti: [
    "Tutti",
    "Ministeri",
    "Enti pubblici non economici",
    "Agenzie fiscali",
    "Università",
    "SSN",
    "Regioni ed Autonomie locali",
  ],
  tipologie: ["Tutte", "Ministero", "Agenzia", "Ente pubblico", "Università statale"],
  regioni: [
    "Tutte",
    "Lazio",
    "Lombardia",
    "Campania",
    "Sicilia",
    "Piemonte",
    "Veneto",
    "Emilia-Romagna",
    "Toscana",
    "Puglia",
  ],
  dimensioni: ["Tutte", "< 100 dipendenti", "100-500", "500-2000", "2000-10000", "> 10000"],
};
