#!/usr/bin/env bash
# Verifiche di sicurezza (security by design) del Cruscotto HR — `yarn security`.
# Esegue: librerie vulnerabili, analisi statica (regole SonarJS = SonarQube JS/TS,
# Semgrep OWASP), segreti nello storico (Gitleaks), pacchetto pubblicato, test di sicurezza.
# Semgrep e Gitleaks sono facoltativi: se non installati il passo viene saltato.
set -u
cd "$(dirname "$0")/../.."
FAIL=0
step() { printf "\n== %s\n" "$1"; }
ko() { echo "✗ $1"; FAIL=1; }

step "1. Librerie con vulnerabilità note (dipendenze di produzione)"
OUT=$(yarn audit --groups dependencies --level high --summary 2>&1 | tail -n 2)
echo "$OUT"
yarn audit --groups dependencies --level high >/dev/null 2>&1 || ko "vulnerabilità alte/critiche nelle dipendenze"

step "2. Analisi statica · regole SonarJS (SonarQube JavaScript/TypeScript)"
# Bloccano solo le regole di sicurezza; le altre (manutenibilità) sono riportate.
npx eslint -c scripts/security/eslint.sonar.config.js src -f json -o .security-sonar.json >/dev/null 2>&1
node -e '
const r=require("./.security-sonar.json");const SEC=/(pseudo-random|super-linear-regex|hardcoded|no-ip|os-command|sql-queries|cookie|cors|csrf|xss|eval|insecure|weak|encryption|hashing|content-security|clear-text|unverified|disabled-|no-intrusive|session|file-permissions|publicly-writable|no-clear-text)/;
let sec=0,oth=0;for(const f of r)for(const m of f.messages){if(SEC.test(m.ruleId||"")){sec++;console.log("  ✗",f.filePath.replace(process.cwd()+"/","")+":"+m.line,m.ruleId,m.message)}else oth++}
console.log(`  sicurezza: ${sec} · manutenibilità (non bloccanti): ${oth}`);process.exit(sec?1:0)' || ko "problemi di sicurezza rilevati dalle regole SonarJS"
rm -f .security-sonar.json

step "3. Analisi statica · Semgrep (OWASP Top 10, React, segreti)"
if command -v semgrep >/dev/null 2>&1; then
  semgrep scan --quiet --error --config p/owasp-top-ten --config p/javascript --config p/typescript \
    --config p/react --config p/secrets --config p/python --exclude node_modules --exclude dist \
    src backend_proxy scripts index.html || ko "Semgrep ha trovato problemi"
else echo "  (semgrep non installato: passo saltato — pip install semgrep)"; fi

step "4. Segreti nello storico del repository (Gitleaks)"
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks detect --source . --redact --no-banner -c scripts/security/gitleaks.toml || ko "segreti trovati nello storico"
else echo "  (gitleaks non installato: passo saltato)"; fi

step "5. Pacchetto pubblicato (dist/)"
npx vite build --logLevel error >/dev/null 2>&1 && node scripts/security/check-bundle.mjs || ko "pacchetto pubblicato non conforme"

step "6. Test di sicurezza (autorizzazioni, perimetro ente, esportazioni, strato di protezione)"
npx vitest run src/test/security || ko "test di sicurezza del frontend falliti"
PY="${SECURITY_PYTHON:-python3}"   # interprete con pyjwt[crypto], fastapi, pytest
if "$PY" -c "import jwt, fastapi, pytest" >/dev/null 2>&1; then
  (cd backend_proxy && "$PY" -m pytest -q tests) || ko "test di sicurezza dello strato di protezione falliti"
else echo "  (pytest/pyjwt/fastapi non installati: test dello strato di protezione saltati)"; fi

step "7. Dati esposti con la chiave pubblica (anon) sull'API della base dati"
# Le tabelle con dati personali o registri non devono essere leggibili con la sola chiave
# pubblica inclusa nel browser. Usa VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.
if [ -f .env ]; then set -a; . ./.env; set +a; fi
if [ -n "${VITE_SUPABASE_URL:-}" ] && [ -n "${VITE_SUPABASE_PUBLISHABLE_KEY:-}" ]; then
  for t in login lh_utente lh_cms_fornitore log_accessi log_eventi log_errori; do
    BODY=$(curl -s -m 15 -H "apikey: $VITE_SUPABASE_PUBLISHABLE_KEY" \
      -H "Authorization: Bearer $VITE_SUPABASE_PUBLISHABLE_KEY" \
      "$VITE_SUPABASE_URL/rest/v1/$t?select=*&limit=1")
    case "$BODY" in
      \[\{*) ko "tabella «$t» leggibile con la chiave pubblica" ;;
      *) echo "  ✓ $t non leggibile" ;;
    esac
  done
else echo "  (variabili della base dati non impostate: passo saltato)"; fi

if [ "$FAIL" = 1 ]; then echo -e "\n✗ Verifiche di sicurezza NON superate"; exit 1; fi
echo -e "\n✓ Verifiche di sicurezza superate"
