import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => {
  // In ambiente gestito (cloud/preview dietro proxy https) la variabile PORT viene
  // impostata dal supervisor. In locale PORT non e definita: si usa la 8080.
  const isManagedEnv = !!process.env.PORT;
  const port = Number(process.env.PORT) || 8080;

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
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
