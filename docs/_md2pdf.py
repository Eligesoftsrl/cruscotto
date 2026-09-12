#!/usr/bin/env python3
"""Converte il documento tecnico Markdown in PDF (xhtml2pdf)."""
import markdown
from xhtml2pdf import pisa

SRC = "/app/docs/DOCUMENTAZIONE_TECNICA_SCHEDE_CONTO_ANNUALE.md"
OUT = "/app/docs/DOCUMENTAZIONE_TECNICA_SCHEDE_CONTO_ANNUALE.pdf"

with open(SRC, "r", encoding="utf-8") as f:
    md_text = f.read()

body = markdown.markdown(
    md_text,
    extensions=["tables", "fenced_code", "toc", "sane_lists"],
)

css = """
@page { size: A4; margin: 1.8cm 1.6cm; }
body { font-family: Helvetica, Arial, sans-serif; font-size: 10px; color: #1f2937; line-height: 1.45; }
h1 { font-size: 20px; color: #0b3d91; border-bottom: 2px solid #0b3d91; padding-bottom: 4px; margin-top: 6px; }
h2 { font-size: 15px; color: #0b3d91; margin-top: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; }
h3 { font-size: 12px; color: #1e40af; margin-top: 12px; }
h4 { font-size: 11px; color: #334155; margin-top: 10px; }
p, li { font-size: 10px; }
code { font-family: Courier, monospace; font-size: 8.5px; background: #f1f5f9; padding: 1px 2px; }
pre { background: #0f172a; color: #e2e8f0; font-family: Courier, monospace; font-size: 8px;
      padding: 8px; border-radius: 4px; line-height: 1.35; white-space: pre-wrap; }
pre code { background: transparent; color: #e2e8f0; padding: 0; }
table { border-collapse: collapse; width: 100%; margin: 6px 0; }
th, td { border: 1px solid #cbd5e1; padding: 3px 5px; font-size: 8.5px; text-align: left; vertical-align: top; }
th { background: #e2e8f0; color: #0b3d91; font-weight: bold; }
blockquote { border-left: 3px solid #0b3d91; background: #f8fafc; margin: 6px 0; padding: 4px 10px; color: #334155; }
hr { border: 0; border-top: 1px solid #cbd5e1; margin: 10px 0; }
"""

html = f"<html><head><meta charset='utf-8'><style>{css}</style></head><body>{body}</body></html>"

with open(OUT, "wb") as out:
    result = pisa.CreatePDF(html, dest=out, encoding="utf-8")

print("ERRORE" if result.err else f"OK -> {OUT}")
