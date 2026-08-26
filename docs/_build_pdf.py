#!/usr/bin/env python3
"""Converte docs/REPORT_REFACTORING.md in HTML stampabile per l'export PDF via Chrome."""
import re
from pathlib import Path
from markdown_it import MarkdownIt

DOCS = Path(__file__).parent
md_text = (DOCS / "REPORT_REFACTORING.md").read_text(encoding="utf-8")

md = (
    MarkdownIt("commonmark", {"html": True, "linkify": True, "typographer": True})
    .enable("table")
)
body_html = md.render(md_text)

css = """
@page { size: A4; margin: 18mm 16mm; }
* { box-sizing: border-box; }
body {
  font-family: -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #1f2937; line-height: 1.55; font-size: 11.5px; max-width: 100%;
}
h1 { font-size: 26px; color: #0b3d91; border-bottom: 3px solid #0b3d91; padding-bottom: 8px; margin-top: 0; }
h2 { font-size: 18px; color: #0b3d91; margin-top: 26px; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; page-break-after: avoid; }
h3 { font-size: 14px; color: #1e40af; margin-top: 18px; page-break-after: avoid; }
p { margin: 8px 0; }
strong { color: #111827; }
a { color: #1d4ed8; text-decoration: none; }
hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 10.5px; page-break-inside: avoid; }
th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
th { background: #eef2ff; color: #0b3d91; font-weight: 600; }
tr:nth-child(even) td { background: #f8fafc; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace; font-size: 10px; color: #b91c1c; }
pre { background: #0f172a; color: #e2e8f0; padding: 12px 14px; border-radius: 8px; overflow-x: auto; font-size: 9.5px; line-height: 1.45; page-break-inside: avoid; }
pre code { background: transparent; color: inherit; padding: 0; font-size: 9.5px; }
img { max-width: 100%; height: auto; border: 1px solid #e5e7eb; border-radius: 8px; margin: 10px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); page-break-inside: avoid; }
ul, ol { margin: 8px 0; padding-left: 22px; }
li { margin: 3px 0; }
blockquote { border-left: 4px solid #93c5fd; background: #eff6ff; margin: 10px 0; padding: 6px 14px; color: #1e3a5f; }
h2, h3, table, pre, img, blockquote { break-inside: avoid; }
"""

# diff highlighting inside code blocks: colora righe + e -
def highlight_diff(match):
    inner = match.group(1)
    lines = inner.split("\n")
    out = []
    for ln in lines:
        # ln is HTML-escaped already
        if ln.startswith("+") and not ln.startswith("+++"):
            out.append(f'<span style="color:#4ade80">{ln}</span>')
        elif ln.startswith("-") and not ln.startswith("---"):
            out.append(f'<span style="color:#f87171">{ln}</span>')
        else:
            out.append(ln)
    return "<pre><code>" + "\n".join(out) + "</code></pre>"

body_html = re.sub(r"<pre><code[^>]*>(.*?)</code></pre>", highlight_diff, body_html, flags=re.S)

html = f"""<!DOCTYPE html>
<html lang="it"><head><meta charset="utf-8"><style>{css}</style></head>
<body>{body_html}</body></html>"""

out = DOCS / "_report_print.html"
out.write_text(html, encoding="utf-8")
print("HTML scritto:", out)
