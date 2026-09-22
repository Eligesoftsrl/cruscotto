import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/**
 * Plugin: espone /version.json (dev + preview) e lo emette nella build.
 * Serve al banner "Nuova versione disponibile" per rilevare un nuovo deploy.
 * Su preview imposta anche gli header di cache corretti
 * (index.html/SPA = no-cache; /assets/* con hash = cache lunga immutable).
 */
function versionJsonPlugin(buildId: string): Plugin {
  const payload = JSON.stringify({ buildId });
  const isVersion = (url = "") => url === "/version.json" || url.startsWith("/version.json?");
  return {
    name: "app-version-json",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (isVersion(req.url)) {
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.end(payload);
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || "";
        if (isVersion(url)) {
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.end(payload);
          return;
        }
        if (url.startsWith("/assets/")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (url === "/" || url.endsWith(".html") || !url.split("?")[0].includes(".")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "version.json", source: payload });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(() => {
  // In ambiente gestito (cloud/preview dietro proxy https) la variabile PORT viene
  // impostata dal supervisor. In locale PORT non e definita: si usa la 8080.
  const isManagedEnv = !!process.env.PORT;
  const port = Number(process.env.PORT) || 8080;
  // Build id univoco per questa build (condiviso tra define e version.json).
  const buildId = String(Date.now());

  return {
    server: {
      host: "0.0.0.0",
      port,
      // Porta fissa solo in ambiente gestito; in locale Vite ripiega su una porta libera.
      strictPort: isManagedEnv,
      // Config specifica per il proxy https dell'ambiente gestito.
      ...(isManagedEnv
        ? { allowedHosts: true as const, hmr: { overlay: false, clientPort: 443 } }
        : {}),
    },
    preview: {
      host: "0.0.0.0",
      port,
      strictPort: isManagedEnv,
      ...(isManagedEnv ? { allowedHosts: true as const } : {}),
    },
    plugins: [react(), versionJsonPlugin(buildId)],
    // Build id univoco per ogni build: usato per il cache-busting lato client.
    define: {
      __APP_BUILD_ID__: JSON.stringify(buildId),
    },
    build: {
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          // Separa le librerie pesanti in chunk dedicati (cache migliore, bundle iniziale piu leggero).
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-recharts": ["recharts"],
            "vendor-supabase": ["@supabase/supabase-js"],
            "vendor-query": ["@tanstack/react-query"],
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
