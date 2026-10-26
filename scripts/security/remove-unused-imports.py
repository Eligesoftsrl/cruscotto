"""Codemod: rimuove gli import inutilizzati segnalati da SonarJS (sonarjs/unused-import).
Uso: npx eslint -c scripts/security/eslint.sonar.config.js src -f json -o /tmp/sonar.json
     python3 scripts/security/remove-unused-imports.py /tmp/sonar.json"""
import json, re, sys, collections

rep = json.load(open(sys.argv[1]))
todo = collections.defaultdict(set)
for f in rep:
    for m in f["messages"]:
        if m.get("ruleId") == "sonarjs/unused-import":
            n = re.search(r"unused import of '([^']+)'", m["message"])
            if n: todo[f["filePath"]].add(n.group(1))

IMP = re.compile(r"import\s+(type\s+)?([^;]*?)\s+from\s+(['\"][^'\"]+['\"]);?", re.S)
tot = 0
for path, names in todo.items():
    s = open(path).read()
    def fix(m):
        global tot
        typ, clause, src = m.group(1) or "", m.group(2), m.group(3)
        default, named = None, None
        mm = re.match(r"^\s*([A-Za-z_$][\w$]*)?\s*,?\s*(\{.*\})?\s*$", clause, re.S)
        if not mm or clause.strip().startswith("*"): return m.group(0)
        default, named = mm.group(1), mm.group(2)
        keep_default = default if default and default not in names else None
        if default and not keep_default: tot += 1
        specs = []
        if named:
            for sp in [x.strip() for x in named.strip()[1:-1].split(",") if x.strip()]:
                local = sp.split(" as ")[-1].replace("type ", "").strip()
                if local in names: tot += 1
                else: specs.append(sp)
        if not keep_default and not specs:
            return ""
        parts = []
        if keep_default: parts.append(keep_default)
        if specs: parts.append("{ " + ", ".join(specs) + " }")
        return f"import {typ}{', '.join(parts)} from {src};"
    t = IMP.sub(fix, s)
    t = re.sub(r"\n{3,}", "\n\n", t)
    if t != s: open(path, "w").write(t)
print(f"rimossi {tot} import inutilizzati in {len(todo)} file")
