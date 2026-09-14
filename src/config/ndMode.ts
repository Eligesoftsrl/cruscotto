/**
 * Interruttore centrale della modalità placeholder "N/D".
 *
 *  - true  (default): le sezioni senza fonti dati (D1, D3, InPa, Minerva,
 *           Syllabus, Lavoro Pubblico) mostrano "N/D" e grafici a 0.
 *  - false: le stesse sezioni mostrano normalmente i dati (mock/reali).
 *
 * Come cambiarlo:
 *  a) al volo, senza toccare il codice: impostare in .env
 *        VITE_ND_PLACEHOLDER="false"   (poi riavviare il dev/build)
 *  b) oppure cambiare il valore di default qui sotto.
 */
const envFlag = import.meta.env.VITE_ND_PLACEHOLDER as string | undefined;

export const ND_PLACEHOLDER_ENABLED = envFlag !== undefined ? envFlag !== "false" : true;
