#!/usr/bin/env python3
"""Converte docs/VISTE_PRODOTTE.md in PDF (markdown -> HTML -> PDF, pure Python)."""
import sys, markdown
from xhtml2pdf import pisa

MD = "/app/docs/VISTE_PRODOTTE.md"
PDF = "/app/docs/VISTE_PRODOTTE.pdf"

CSS = """
@page { size: A4; margin: 1.6cm 1.4cm; }
body { font-family: Helvetica, Arial, sans-serif; font-size: 9.5pt; color:#1a1a1a; line-height:1.4; }
h1 { font-size: 18pt; color:#0b3d66; border-bottom:2px solid #0b3d66; padding-bottom:4px; }
h2 { font-size: 13pt; color:#0b3d66; margin-top:16px; border-bottom:1px solid #cbd5e1; padding-bottom:2px; }
h3 { font-size: 11pt; color:#134e7a; margin-top:12px; }
p, li { font-size: 9.5pt; }
code { font-family: Courier, monospace; background:#f1f5f9; padding:1px 3px; font-size:8.5pt; }
pre { background:#f1f5f9; padding:6px 8px; font-size:8pt; border-left:3px solid #0b3d66; }
blockquote { background:#eef4fb; border-left:4px solid #0b3d66; padding:6px 10px; color:#334155; }
table { border-collapse: collapse; width:100%; margin:8px 0; }
th { background:#0b3d66; color:#fff; font-size:8.2pt; padding:4px 5px; text-align:left; border:1px solid #0b3d66; }
td { font-size:8.2pt; padding:3px 5px; border:1px solid #cbd5e1; }
tr:nth-child(even) td { background:#f6f9fc; }
hr { border:0; border-top:1px solid #cbd5e1; margin:10px 0; }
strong { color:#0b3d66; }
"""

def main():
    md = open(MD, encoding="utf-8").read()
    html_body = markdown.markdown(md, extensions=["tables", "fenced_code", "sane_lists"])
    html = f"<html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{html_body}</body></html>"
    with open(PDF, "wb") as f:
        res = pisa.CreatePDF(src=html, dest=f, encoding="utf-8")
    if res.err:
        print("ERRORE conversione", res.err); sys.exit(1)
    print("OK ->", PDF)

if __name__ == "__main__":
    main()
