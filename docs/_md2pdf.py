#!/usr/bin/env python3
"""Converte un file .md in HTML stampabile (per export PDF via Chrome).
Uso: python3 _md2pdf.py <input.md>  -> produce <input>_print.html accanto al file.
"""
import re
import sys
from pathlib import Path
from markdown_it import MarkdownIt

src = Path(sys.argv[1])
md_text = src.read_text(encoding="utf-8")

md = MarkdownIt("commonmark", {"html": True, "linkify": True, "typographer": True}).enable("table")
body_html = md.render(md_text)

css = """
@page { size: A4; margin: 18mm 16mm; }
* { box-sizing: border-box; }
body { font-family: -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1f2937; line-height: 1.55; font-size: 11.5px; }
h1 { font-size: 24px; color: #0b3d91; border-bottom: 3px solid #0b3d91; padding-bottom: 8px; margin-top: 0; }
h2 { font-size: 17px; color: #0b3d91; margin-top: 24px; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; page-break-after: avoid; }
h3 { font-size: 13px; color: #1e40af; margin-top: 16px; page-break-after: avoid; }
p { margin: 8px 0; }
strong { color: #111827; }
a { color: #1d4ed8; text-decoration: none; }
hr { border: none; border-top: 1px solid #e5e7eb; margin: 18px 0; }
table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 10.5px; page-break-inside: avoid; }
th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
th { background: #eef2ff; color: #0b3d91; font-weight: 600; }
tr:nth-child(even) td { background: #f8fafc; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 10px; color: #b91c1c; }
pre { background: #0f172a; color: #e2e8f0; padding: 12px 14px; border-radius: 8px; overflow-x: auto; font-size: 9.5px; page-break-inside: avoid; }
pre code { background: transparent; color: inherit; padding: 0; }
ul, ol { margin: 8px 0; padding-left: 22px; }
li { margin: 3px 0; }
blockquote { border-left: 4px solid #93c5fd; background: #eff6ff; margin: 10px 0; padding: 6px 14px; color: #1e3a5f; }
h2, h3, table, pre, blockquote { break-inside: avoid; }
"""

html = f'<!DOCTYPE html><html lang="it"><head><meta charset="utf-8"><style>{css}</style></head><body>{body_html}</body></html>'
out = src.with_name(src.stem + "_print.html")
out.write_text(html, encoding="utf-8")
print(out)
