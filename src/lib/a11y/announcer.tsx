/**
 * Accessibilità · annunci per lettori di schermo (WCAG 4.1.3 «Messaggi di stato»).
 *
 *  - <LiveRegion />      regione aria-live (invisibile) montata una sola volta in App.
 *  - announce(msg)       pubblica un messaggio (es. cambio pagina).
 *  - <LoadingAnnouncer/> annuncia automaticamente «Caricamento dati in corso» e
 *                        «Dati caricati» in base alle richieste in corso (react-query).
 *  - useDocumentTitle()  imposta il titolo della scheda del browser: «<sezione> · Cruscotto HR».
 */
import { useEffect, useRef, useState } from "react";
import { useIsFetching } from "@tanstack/react-query";

export const APP_NAME = "Cruscotto HR";

type Listener = (msg: string) => void;
const listeners = new Set<Listener>();

/** Pubblica un messaggio nella regione aria-live (letto dagli screen reader, non visibile). */
export function announce(msg: string) {
  listeners.forEach((l) => l(msg));
}

export const LiveRegion = () => {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    const l: Listener = (m) => {
      // Svuota e reimposta: così lo stesso testo viene riletto se ripetuto.
      setMsg("");
      window.setTimeout(() => setMsg(m), 60);
    };
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true" data-testid="a11y-live-region">
      {msg}
    </div>
  );
};

/**
 * Annuncia i caricamenti solo se durano più di 700 ms (evita annunci a raffica
 * per le richieste rapide o servite dalla cache).
 */
export const LoadingAnnouncer = () => {
  const fetching = useIsFetching();
  const announced = useRef(false);
  useEffect(() => {
    if (fetching > 0) {
      const t = window.setTimeout(() => {
        announced.current = true;
        announce("Caricamento dati in corso…");
      }, 700);
      return () => window.clearTimeout(t);
    }
    if (announced.current) {
      announced.current = false;
      announce("Dati caricati.");
    }
    return undefined;
  }, [fetching]);
  return null;
};

/** Titolo della scheda del browser; opzionalmente annuncia il cambio pagina. */
export function useDocumentTitle(title: string | null | undefined, opts?: { announce?: boolean }) {
  const doAnnounce = opts?.announce ?? false;
  useEffect(() => {
    if (!title) return;
    document.title = `${title} · ${APP_NAME}`;
    if (doAnnounce) announce(`Pagina: ${title}`);
  }, [title, doAnnounce]);
}
