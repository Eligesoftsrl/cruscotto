// Analisi statica con le regole SonarJS (le stesse regole JavaScript/TypeScript di SonarQube),
// eseguita senza server: `yarn security:sast`. Separata dal lint quotidiano.
import tseslint from "typescript-eslint";
import sonarjs from "eslint-plugin-sonarjs";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "src/components/ui/**", "**/*.test.ts", "**/*.test.tsx"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { parser: tseslint.parser },
    // I commenti "eslint-disable" del lint quotidiano (react-hooks, typescript-eslint)
    // devono essere riconosciuti anche qui: registriamo i plugin senza attivarne le regole.
    linterOptions: { reportUnusedDisableDirectives: "off" },
    plugins: { sonarjs, "react-hooks": reactHooks, "@typescript-eslint": tseslint.plugin },
    rules: { ...sonarjs.configs.recommended.rules },
  },
);
