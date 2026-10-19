// Codemod: aggiunge aria-hidden="true" alle icone lucide-react usate come JSX
// che non hanno già un attributo aria-* (icone decorative: il testo è nell'elemento padre).
import fs from "fs";
import path from "path";
const root = process.argv[2] || "src";
let files = 0, icons = 0;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) { if (e.name !== "ui") walk(p); }
  else if (p.endsWith(".tsx")) fix(p);
});
function fix(p) {
  let s = fs.readFileSync(p, "utf8");
  const imp = [...s.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']lucide-react["']/g)];
  if (!imp.length) return;
  const names = imp.flatMap((m) => m[1].split(",").map((x) => x.trim()).filter(Boolean)
    .filter((x) => !x.startsWith("type "))
    .map((x) => (x.includes(" as ") ? x.split(" as ")[1].trim() : x)));
  let changed = 0;
  for (const n of names) {
    const re = new RegExp(`<${n}(?=[\\s/>])`, "g");
    let out = "", last = 0, m;
    while ((m = re.exec(s))) {
      // trova fine tag rispettando le graffe
      let i = m.index + m[0].length, depth = 0;
      for (; i < s.length; i++) {
        const c = s[i];
        if (c === "{") depth++; else if (c === "}") depth--;
        else if (c === ">" && depth === 0) break;
      }
      const tag = s.slice(m.index, i);
      if (/aria-(hidden|label|labelledby)|role=/.test(tag)) continue;
      out += s.slice(last, m.index + m[0].length) + ' aria-hidden="true"';
      last = m.index + m[0].length; changed++;
    }
    s = out + s.slice(last);
  }
  if (changed) { fs.writeFileSync(p, s); files++; icons += changed; }
}
walk(root);
console.log(`file modificati: ${files}, icone: ${icons}`);
