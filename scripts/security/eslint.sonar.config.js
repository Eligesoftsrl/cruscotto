// Analisi statica con le regole SonarJS (le stesse regole JavaScript/TypeScript di SonarQube),
// eseguita senza server: `yarn security:sast`. Separata dal lint quotidiano.
import tseslint from "typescript-eslint";
import sonarjs from "eslint-plugin-sonarjs";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "src/components/ui/**", "**/*.test.ts", "**/*.test.tsx"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { parser: tseslint.parser },
    plugins: { sonarjs },
    rules: { ...sonarjs.configs.recommended.rules },
  },
);
