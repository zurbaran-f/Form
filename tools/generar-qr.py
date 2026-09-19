#!/usr/bin/env python3
"""Genera el código QR que lleva al formulario.

Uso:
    python3 tools/generar-qr.py                       # usa la URL por defecto
    python3 tools/generar-qr.py https://otra-web.com  # usa otra URL

Requiere la librería segno:  pip install segno

Crea/actualiza:
    qr/qr-formulario.svg   para imprimir a cualquier tamaño sin perder calidad
    qr/qr-formulario.png   para pegar en redes, WhatsApp o documentos
    qr/cartel.html         cartel imprimible (actualiza la URL que muestra)
"""

import pathlib
import re
import sys

import segno

URL_POR_DEFECTO = "https://zurbaran-f.github.io/Form/"

RAIZ = pathlib.Path(__file__).resolve().parent.parent
CARPETA = RAIZ / "qr"


def main() -> int:
    url = sys.argv[1] if len(sys.argv) > 1 else URL_POR_DEFECTO

    if not url.startswith(("http://", "https://")):
        print(f"La URL debe empezar por http:// o https:// — recibido: {url}")
        return 1

    CARPETA.mkdir(exist_ok=True)

    # error="h": el QR sigue leyéndose aunque se manche o se tape hasta un 30 %.
    qr = segno.make(url, error="h")
    qr.save(CARPETA / "qr-formulario.svg", scale=10, border=4, dark="#16181d")
    qr.save(CARPETA / "qr-formulario.png", scale=12, border=4, dark="#16181d")

    # Mantiene el cartel en sintonía con la URL recién codificada.
    cartel = CARPETA / "cartel.html"
    if cartel.exists():
        html = cartel.read_text(encoding="utf-8")
        html = re.sub(r'(<span id="url">).*?(</span>)', r"\g<1>" + url + r"\g<2>", html)
        cartel.write_text(html, encoding="utf-8")

    print(f"QR generado para: {url}")
    print(f"  {CARPETA / 'qr-formulario.svg'}")
    print(f"  {CARPETA / 'qr-formulario.png'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
