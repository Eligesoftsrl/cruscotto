"""Unisce le righe «a capo morbido» dei paragrafi Markdown (per una conversione Word pulita).
Uso: python3 md_unwrap.py in.md out.md"""
import re
import sys

lines = open(sys.argv[1], encoding='utf8').read().split('\n')
out = []
in_code = False
block_start = re.compile(r'^\s*(#|\||[-*+] |\d+\. |>|```|---|$)')
for ln in lines:
    if ln.strip().startswith('```'):
        in_code = not in_code
        out.append(ln)
        continue
    if in_code or not out:
        out.append(ln)
        continue
    prev = out[-1]
    prev_ok = prev.strip() and not prev.strip().startswith(('|', '#', '```', '---'))
    if prev_ok and not block_start.match(ln):
        out[-1] = prev.rstrip() + ' ' + ln.strip()
    else:
        out.append(ln)
open(sys.argv[2], 'w', encoding='utf8').write('\n'.join(out))
