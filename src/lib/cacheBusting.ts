/**
 * Cache-busting / versioning lato client.
 *
 * PROBLEMA: dopo una nuova build i chunk JS cambiano hash. I browser che hanno
 * l'`index.html` vecchio in cache (tipicamente Chrome/Edge con disk cache
 * aggressiva) provano a caricare chunk non più esistenti → gli import dinamici
 * (route lazy, componenti) falliscono e l'interfaccia si carica solo in parte
 * (filtri/dati mancanti). Firefox/Opera, che avevano una cache diversa/fresca,
 * non mostrano il problema.
 *
 * SOLUZIONE (difesa a più livelli):
 *  1) Ricarica automatica quando un import dinamico fallisce (evento Vite
 *     `vite:preloadError` + fallback su error/unhandledrejection).
 *  2) Alla prima apertura di una NUOVA build: svuota la Cache Storage e
 *     disiscrive eventuali service worker legacy.
 *  I meta http-equiv in index.html completano lato documento (no-cache).
 */

export const APP_BUILD_ID =
  typeof __APP_BUILD_ID__ !== "undefined" ? __APP_BUILD_ID__ : "dev";

const BUILD_KEY = "app_build_id";
const RELOAD_FLAG = "cache_bust_reloaded";

const CHUNK_ERR =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|ChunkLoadError|Unable to preload/i;

function reloadOnce() {
  try {
    // Evita loop: ricarica al massimo una volta per singola build.
    if (sessionStorage.getItem(RELOAD_FLAG) === APP_BUILD_ID) return;
    sessionStorage.setItem(RELOAD_FLAG, APP_BUILD_ID);
  } catch {
    /* storage non disponibile: procedo comunque */
  }
  // Cache-bust esplicito sull'URL per forzare il refetch dell'index.html.
  const url = new URL(window.location.href);
  url.searchParams.set("_", Date.now().toString(36));
  window.location.replace(url.toString());
}

export function initCacheBusting() {
  if (typeof window === "undefined") return;

  // 1) Meccanismo ufficiale Vite per il fallimento del preload dei moduli.
  window.addEventListener("vite:preloadError", (e) => {
    e.preventDefault?.();
    reloadOnce();
  });

  // 2) Fallback: import dinamico che fallisce come rejection non gestita.
  window.addEventListener("unhandledrejection", (e) => {
    const msg = String(e?.reason?.message ?? e?.reason ?? "");
    if (CHUNK_ERR.test(msg)) reloadOnce();
  });

  // 3) Fallback: errore di caricamento risorsa/script.
  window.addEventListener("error", (e) => {
    const msg = String((e as ErrorEvent)?.message ?? "");
    if (CHUNK_ERR.test(msg)) reloadOnce();
  });

  // 4) Prima apertura di una nuova build -> pulizia cache/service worker legacy.
  try {
    const stored = localStorage.getItem(BUILD_KEY);
    if (stored !== APP_BUILD_ID) {
      if ("caches" in window) {
        caches
          .keys()
          .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
          .catch(() => {});
      }
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then((rs) => rs.forEach((r) => r.unregister()))
          .catch(() => {});
      }
      localStorage.setItem(BUILD_KEY, APP_BUILD_ID);
      // Nuova build rilevata: azzero il flag di reload così il safety-net
      // resta disponibile per questa build.
      try {
        sessionStorage.removeItem(RELOAD_FLAG);
      } catch {
        /* noop */
      }
    }
  } catch {
    /* storage non disponibile */
  }
}
