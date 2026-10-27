"""Verifica strutturale PDF/UA (sottoinsieme dei controlli Matterhorn) con pikepdf.
Uso: python3 check_pdfua.py file.pdf"""
import sys
import pikepdf

pdf = pikepdf.open(sys.argv[1])
root = pdf.Root
errors = []
ok = lambda cond, msg: None if cond else errors.append(msg)

ok(root.get('/MarkInfo') is not None and bool(root.MarkInfo.get('/Marked')), 'MarkInfo/Marked mancante')
ok('/StructTreeRoot' in root, 'StructTreeRoot mancante')
ok(str(root.get('/Lang', '')) != '', 'Lingua del documento mancante')
ok(bool(root.get('/ViewerPreferences', {}).get('/DisplayDocTitle')), 'DisplayDocTitle mancante')
ok(str(pdf.docinfo.get('/Title', '')) != '', 'Titolo mancante')
meta = bytes(root.Metadata.read_bytes()).decode('utf8', 'ignore') if '/Metadata' in root else ''
ok('pdfuaid:part' in meta, 'Identificativo PDF/UA mancante nei metadati XMP')
ok('<dc:title>' in meta, 'dc:title mancante nei metadati XMP')

# font incorporati con ToUnicode
for pi, page in enumerate(pdf.pages):
    fonts = page.Resources.get('/Font', {})
    for name, f in fonts.items():
        desc = f.get('/DescendantFonts', [f])[0].get('/FontDescriptor') if '/DescendantFonts' in f else f.get('/FontDescriptor')
        embedded = desc is not None and any(k in desc for k in ('/FontFile', '/FontFile2', '/FontFile3'))
        ok(embedded, f'pagina {pi+1}: font {name} non incorporato')
        ok('/ToUnicode' in f, f'pagina {pi+1}: font {name} senza ToUnicode')
    ok('/StructParents' in page, f'pagina {pi+1}: StructParents mancante')
    ok(page.get('/Tabs') == pikepdf.Name('/S'), f'pagina {pi+1}: ordine di tabulazione non strutturale')

    # ogni testo e grafica dentro contenuto marcato (BDC/BMC ... EMC)
    depth = 0
    for operands, op in pikepdf.parse_content_stream(page):
        o = str(op)
        if o in ('BDC', 'BMC'):
            depth += 1
        elif o == 'EMC':
            depth -= 1
        elif o in ('Tj', 'TJ', "'", '"', 'f', 'F', 'f*', 'S', 's', 'B', 'b', 'Do') and depth == 0:
            errors.append(f'pagina {pi+1}: contenuto non marcato ({o})')
            break

# struttura: tipi presenti
types = set()
def walk(node, d=0):
    if d > 50:
        return
    if isinstance(node, pikepdf.Dictionary) and '/S' in node:
        types.add(str(node.S))
    kids = node.get('/K') if isinstance(node, pikepdf.Dictionary) else None
    if isinstance(kids, pikepdf.Array):
        for k in kids:
            walk(k, d + 1)
    elif isinstance(kids, pikepdf.Dictionary):
        walk(kids, d + 1)
walk(root.StructTreeRoot)
for t in ('/Document', '/H1', '/Table', '/TR', '/TH', '/TD'):
    ok(t in types, f'struttura: {t} mancante')

print('Tipi di struttura:', ' '.join(sorted(types)))
if errors:
    print('ERRORI:')
    for e in sorted(set(errors)):
        print(' -', e)
    sys.exit(1)
print('OK: nessun errore nei controlli PDF/UA eseguiti')
