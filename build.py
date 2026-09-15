#!/usr/bin/env python3
"""
Baut die eigenständige index.html aus index.template.html.

Warum: index.template.html verweist auf css/style.css und die Skripte in
js/ über relative Pfade. Das funktioniert nur, wenn die komplette
Ordnerstruktur zusammenbleibt. Wird nur index.html allein weitergegeben
(Download einer Einzeldatei, E-Mail-Anhang, Kopie ohne Unterordner),
laufen diese Anfragen ins Leere und der Browser zeigt ungestyltes HTML.

Dieses Skript bettet CSS und JavaScript (inklusive three.js und GSAP)
direkt in index.html ein. Damit reicht eine einzelne Datei.

Aufruf: python3 build.py
Quelle bleibt editierbar: index.template.html, css/style.css, js/main.js,
js/vendor/*.js. Nach jeder Änderung an einer dieser Dateien build.py
erneut laufen lassen, um index.html zu aktualisieren.
"""
import pathlib

ROOT = pathlib.Path(__file__).parent
TEMPLATE = ROOT / "index.template.html"
OUT = ROOT / "index.html"

CSS = ROOT / "css" / "style.css"
THREE = ROOT / "js" / "vendor" / "three.min.js"
GSAP = ROOT / "js" / "vendor" / "gsap.min.js"
SCROLLTRIGGER = ROOT / "js" / "vendor" / "ScrollTrigger.min.js"
MAIN = ROOT / "js" / "main.js"

LINK_TAG = '<link rel="stylesheet" href="css/style.css">'
SCRIPT_BLOCK = (
    '<script src="js/vendor/three.min.js"></script>\n'
    '<script src="js/vendor/gsap.min.js"></script>\n'
    '<script src="js/vendor/ScrollTrigger.min.js"></script>\n'
    '<script src="js/main.js"></script>'
)


def read(p):
    return p.read_text(encoding="utf-8")


def main():
    html = read(TEMPLATE)

    if LINK_TAG not in html:
        raise SystemExit(f"Erwarteten Link-Tag nicht gefunden: {LINK_TAG!r}")
    if SCRIPT_BLOCK not in html:
        raise SystemExit("Erwarteten Script-Block nicht gefunden — Reihenfolge/Pfade prüfen.")

    css = read(CSS)
    # </style> darf im eingebetteten CSS nicht vorkommen (kommt hier nicht vor, aber sicherheitshalber)
    if "</style" in css:
        raise SystemExit("css/style.css enthält '</style' — Einbettung würde brechen.")
    html = html.replace(LINK_TAG, f"<style>\n{css}\n</style>")

    parts = []
    for label, path in (("three.js", THREE), ("gsap.js", GSAP), ("ScrollTrigger.js", SCROLLTRIGGER), ("main.js", MAIN)):
        code = read(path)
        if "</script" in code:
            raise SystemExit(f"{label} enthält '</script' — Einbettung würde brechen.")
        parts.append(f"<script>\n{code}\n</script>")
    html = html.replace(SCRIPT_BLOCK, "\n".join(parts))

    OUT.write_text(html, encoding="utf-8")
    print(f"index.html geschrieben: {len(html):,} Zeichen ({OUT.stat().st_size:,} Bytes)")


if __name__ == "__main__":
    main()
