import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // Declassato a warning: rimozione progressiva degli 'any' pianificata (Fase 3 tipizzazione).
      "@typescript-eslint/no-explicit-any": "warn",
      // Blinda l'architettura: il client Supabase si usa solo nei service.
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["@/integrations/supabase/client", "**/integrations/supabase/client"],
          message: "Non importare il client Supabase direttamente: usa un service in src/services.",
        }],
      }],
    },
  },
  {
    // Eccezioni consentite: service layer, integrazione Supabase e auth (in attesa di SSO).
    files: [
      "src/services/**/*.{ts,tsx}",
      "src/integrations/**/*.{ts,tsx}",
      "src/contexts/AuthContext.tsx",
      "src/pages/Login.tsx",
    ],
    rules: { "no-restricted-imports": "off" },
  },
);
