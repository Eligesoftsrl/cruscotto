/**
 * Interruttore centrale della modalità placeholder "N/D".
 *
 *  - true : le sezioni senza fonti dati (InPa, Minerva, Syllabus, Lavoro
 *           Pubblico e i pillar sintetici) mostrano "N/D" e grafici a 0.
 *  - false (default attuale): le stesse sezioni mostrano di nuovo i dati
 *           dimostrativi (mock/fixtures).
 *
 * NB: le 12 schede del CONTO ANNUALE NON sono coinvolte da questo flag: usano
 *     sempre i dati reali (RPC Supabase), indipendentemente dal valore qui.
 *
 * Come cambiarlo:
 *  a) al volo, senza toccare il codice: impostare in .env
 *        VITE_ND_PLACEHOLDER="true"    (poi riavviare il dev/build)
 *  b) oppure cambiare il valore di default qui sotto.
 */
const envFlag = import.meta.env.VITE_ND_PLACEHOLDER as string | undefined;

// Default: false -> dati mock riabilitati per le sezioni senza fonte dati.
export const ND_PLACEHOLDER_ENABLED = envFlag !== undefined ? envFlag === "true" : false;
