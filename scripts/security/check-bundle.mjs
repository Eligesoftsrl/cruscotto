#!/usr/bin/env node
/**
 * Controllo del pacchetto pubblicato (dist/): nel codice scaricato dal browser non devono
 * esserci segreti. Le chiavi JWT trovate vengono decodificate: è ammessa solo la chiave
 * pubblica «anon» (protetta dalle regole di accesso sulla base dati).
 * Uso: yarn build && node scripts/security/check-bundle.mjs
 */
import fs from "fs";
import path from "path";

const DIST = process.argv[2] || "dist";
const PATTERNS = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "chiave privata"],
  [/client_secret\s*[:=]\s*["'][^"']{8,}/i, "segreto client OAuth"],
  [/SUPABASE_JWT_SECRET|JWT_SECRET\s*[:=]/, "segreto di firma JWT"],
  [/service_role/, "riferimento alla chiave service_role"],
  [/postgres(ql)?:\/\/[^\s"']+:[^\s"']+@/i, "stringa di connessione al database con password"],
  [/AKIA[0-9A-Z]{16}/, "chiave AWS"],
];
const problems = [];
const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) return walk(p);
    if (p.endsWith(".map")) problems.push(`${p}: mappa dei sorgenti pubblicata (espone il codice originale)`);
    if (!/\.(js|html|json|css|txt)$/.test(p)) return;
    const s = fs.readFileSync(p, "utf8");
    for (const [re, label] of PATTERNS) if (re.test(s)) problems.push(`${p}: ${label}`);
    for (const m of s.matchAll(/eyJ[A-Za-z0-9_-]{10,}\.(eyJ[A-Za-z0-9_-]{10,})\.[A-Za-z0-9_-]{10,}/g)) {
      try {
        const claims = JSON.parse(Buffer.from(m[1], "base64url").toString());
        if (claims.role !== "anon") problems.push(`${p}: token JWT con ruolo «${claims.role}» (ammesso solo «anon»)`);
      } catch {
        problems.push(`${p}: token JWT non decodificabile`);
      }
    }
  });

if (!fs.existsSync(DIST)) {
  console.error(`Cartella ${DIST} assente: eseguire prima la build.`);
  process.exit(2);
}
walk(DIST);
if (problems.length) {
  console.log("✗ Pacchetto pubblicato:\n  " + problems.join("\n  "));
  process.exit(1);
}
console.log("✓ Pacchetto pubblicato: nessun segreto trovato");
